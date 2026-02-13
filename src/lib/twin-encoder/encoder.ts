/**
 * Twin Matrix Vector Encoder
 * 
 * Deterministic encoding from WizardState → 256D identity vector.
 * 
 * Rules:
 * 1. Vector initialized as zeros(256). Only spec-registry dims are written.
 * 2. NO whole-vector or per-layer normalization. Only slice-level L1 where spec requires.
 * 3. Density uses > 1e-6 threshold (not > 0).
 * 4. Soul bars: untouched (value === null) → both left/right dims stay 0.
 */

import type { WizardState, SoulBar } from '@/types/twin-matrix';
import { SPEC_REGISTRY, WRITABLE_DIMS, SLICE_NORMS } from './spec-registry';

// ─── Option maps for one-hot / ordinal encoding ─────────────

const FREQ_OPTIONS = ['1–2x / week', '3–4x / week', '5+ / week', 'Occasionally'];
const DURATION_OPTIONS = ['< 30 min', '30–60 min', '60–90 min', '90+ min'];
const STEP_OPTIONS = ['< 3,000', '3,000–7,000', '7,000–12,000', '12,000+'];

const SPORTS = [
  'Running', 'Cycling', 'Long-distance Swimming', 'Trail / Off-road Running',
  'Strength Training', 'Yoga & Pilates', 'Team Sports', 'Combat Sports',
  'Racquet Sports', 'Climbing', 'Golf',
];

const OUTFIT_STYLES = [
  'Minimal Functional', 'Streetwear Athletic', 'Pro Competition', 'Casual Comfort',
  'Premium Athletic', 'Retro Sports', 'Outdoor Technical', 'Tight Performance',
  'Vivid & Energetic', 'Brand Centric',
];

const BRANDS = ['Nike', 'Adidas', 'Under Armour', 'Lululemon', 'New Balance', 'ASICS', 'Puma', 'Reebok', 'On', 'Hoka'];

const HEIGHT_BINS = ['< 160', '160–170', '170–180', '180+'];
const WEIGHT_BINS = ['< 55', '55–70', '70–85', '85+'];
const AGE_BINS = ['18–24', '25–34', '35–44', '45+'];
const GENDER_OPTIONS = ['Male', 'Female', 'Non-binary', 'Prefer not to say'];
const EDUCATION_OPTIONS = ['High School', 'Bachelor', 'Master', 'Doctorate', 'Other'];
const INCOME_OPTIONS = ['< $30K', '$30K–$60K', '$60K–$100K', '$100K+'];
const MARITAL_OPTIONS = ['Single', 'Married', 'Divorced', 'Other'];
const OCCUPATION_OPTIONS = ['Student', 'Employee', 'Self-employed', 'Freelancer', 'Retired', 'Other'];
const LIVING_OPTIONS = ['Urban', 'Suburban', 'Rural'];

// ─── Validation ──────────────────────────────────────────────

export interface EncoderError {
  code: string;
  message: string;
}

export function validateBaseline(state: WizardState): EncoderError | null {
  const { frequency, duration, dailySteps } = state.sportSetup;
  if (!frequency || !duration || !dailySteps) {
    return {
      code: 'BASELINE_MISSING_FIELDS',
      message: `Missing sport baseline fields: ${[
        !frequency && 'frequency',
        !duration && 'duration',
        !dailySteps && 'daily_steps',
      ].filter(Boolean).join(', ')}`,
    };
  }
  return null;
}

// ─── Encoder ─────────────────────────────────────────────────

function ordinalScale(value: string, options: string[]): number {
  const idx = options.indexOf(value);
  if (idx < 0) return 0;
  if (options.length <= 1) return 255;
  return Math.round((idx / (options.length - 1)) * 255);
}

function oneHotWrite(vec: Float32Array, baseDim: number, value: string, options: string[]) {
  const idx = options.indexOf(value);
  if (idx >= 0) {
    vec[baseDim + idx] = 255;
  }
}

function applySliceL1(vec: Float32Array, start: number, end: number) {
  let sum = 0;
  for (let i = start; i <= end; i++) sum += vec[i];
  if (sum > 1e-6) {
    for (let i = start; i <= end; i++) {
      vec[i] = Math.round((vec[i] / sum) * 255);
    }
  }
}

/**
 * Encode WizardState into a 256D identity vector.
 * Returns null + error if validation fails.
 */
export function encodeIdentityVector(
  state: WizardState
): { signature: number[]; error: null } | { signature: null; error: EncoderError } {
  // ── Validate baseline ──
  const baselineErr = validateBaseline(state);
  if (baselineErr) return { signature: null, error: baselineErr };

  // ── Init strict zeros ──
  const vec = new Float32Array(256); // all zeros

  // ── Core Profile ──
  vec[0] = ordinalScale(state.profile.heightBin, HEIGHT_BINS);
  vec[1] = ordinalScale(state.profile.weightBin, WEIGHT_BINS);
  vec[2] = ordinalScale(state.profile.ageBin, AGE_BINS);
  oneHotWrite(vec, 3, state.profile.gender, GENDER_OPTIONS);
  vec[10] = ordinalScale(state.profile.education, EDUCATION_OPTIONS);
  vec[11] = ordinalScale(state.profile.income, INCOME_OPTIONS);
  oneHotWrite(vec, 12, state.profile.maritalStatus, MARITAL_OPTIONS);
  vec[16] = ordinalScale(state.profile.occupation, OCCUPATION_OPTIONS);
  vec[17] = ordinalScale(state.profile.livingType, LIVING_OPTIONS);

  // ── Daily Steps (one-hot) ──
  oneHotWrite(vec, 20, state.sportSetup.dailySteps, STEP_OPTIONS);

  // ── Sport Ranking (rank-weighted) ──
  const { sportRanking } = state.sportTwin;
  sportRanking.forEach((sport, rank) => {
    const sportIdx = SPORTS.indexOf(sport);
    if (sportIdx >= 0) {
      // Higher rank (lower index) → higher value
      const weight = Math.round(((sportRanking.length - rank) / sportRanking.length) * 255);
      vec[30 + sportIdx] = weight;
    }
  });

  // ── Outfit Style (multi-hot) ──
  state.sportTwin.outfitStyle.forEach(style => {
    const idx = OUTFIT_STYLES.indexOf(style);
    if (idx >= 0) vec[50 + idx] = 255;
  });

  // ── Brand Preferences (multi-hot, L1 normalized) ──
  state.sportTwin.brands.forEach(brand => {
    const idx = BRANDS.indexOf(brand);
    if (idx >= 0) vec[79 + idx] = 255;
  });

  // ── Activity Baseline (one-hot per sub-field, L1 normalized) ──
  oneHotWrite(vec, 192, state.sportSetup.frequency, FREQ_OPTIONS);
  oneHotWrite(vec, 196, state.sportSetup.duration, DURATION_OPTIONS);

  // ── Soul Layer (Change Set 4: untouched → both dims stay 0) ──
  const soulBars: SoulBar[] = state.soul.bars;
  const SOUL_DIM_MAP: Record<string, [number, number]> = {
    'BAR_OUTCOME_EXPERIENCE': [206, 207],
    'BAR_CONTROL_RELEASE': [208, 209],
    'BAR_SOLO_GROUP': [210, 211],
    'BAR_PASSIVE_ACTIVE': [212, 213],
  };

  soulBars.forEach(bar => {
    const pair = SOUL_DIM_MAP[bar.id];
    if (!pair) return;
    if (bar.value === null) {
      // Strategy A: untouched → both dims stay 0
      // vec[pair[0]] and vec[pair[1]] are already 0
      return;
    }
    // value is 0–100: left = 255 * (1 - v/100), right = 255 * (v/100)
    const t = bar.value / 100;
    vec[pair[0]] = Math.round(255 * (1 - t));
    vec[pair[1]] = Math.round(255 * t);
  });

  // ── Slice-level L1 normalization (ONLY normalization allowed) ──
  for (const norm of SLICE_NORMS) {
    applySliceL1(vec, norm.range[0], norm.range[1]);
  }

  // ── Validate: zero out any dim not in spec registry ──
  for (let i = 0; i < 256; i++) {
    if (!WRITABLE_DIMS.has(i)) {
      vec[i] = 0;
    }
  }

  // ── Convert to integer array (0–255) ──
  const signature = Array.from(vec, v => Math.min(255, Math.max(0, Math.round(v))));

  return { signature, error: null };
}

/**
 * Compute identity density using > 1e-6 threshold.
 */
export function computeDensity(signature: number[]): number {
  const nonZero = signature.filter(v => v > 1e-6).length;
  return Math.round((nonZero / 256) * 100);
}

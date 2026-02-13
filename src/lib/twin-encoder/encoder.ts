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
import { WRITABLE_DIMS, SLICE_NORMS } from './spec-registry';

// ─── Option maps (must match UI strings EXACTLY) ────────────

// IdentityStep UI options
const AGE_OPTIONS = ['18–24', '25–34', '35–44', '45–54', '55–64', '65+'];
const GENDER_OPTIONS = ['Male', 'Female', 'Non-binary']; // 'Prefer not to say' → all zeros
const WEIGHT_OPTIONS = ['< 50 kg', '50–65', '65–80', '> 80 kg'];  // no PFNTS in UI currently
const HEIGHT_OPTIONS = ['< 160 cm', '160–170', '170–180', '> 180 cm'];
const EDUCATION_OPTIONS = ['High School', "Bachelor's", "Master's", 'Doctorate', 'Other', 'Prefer not to say'];
const INCOME_OPTIONS = ['< $30k', '$30k–60k', '$60k–100k', '$100k+', 'Prefer not to say'];
const MARITAL_OPTIONS = ['Single', 'In a relationship', 'Married', 'N/A', 'Prefer not to say'];
const LIVING_OPTIONS = ['Urban', 'Suburban', 'Rural', 'Prefer not to say'];
const OCCUPATION_OPTIONS = ['Student', 'Employee', 'Self-employed', 'Freelancer', 'Other'];
// Note: 'Prefer not to say' for occupation not in UI; dim 154 stays 0

// SportSetup UI options
const FREQ_OPTIONS = ['1–2x / week', '3–4x / week', '5+ / week', 'Occasionally'];
const DURATION_OPTIONS = ['< 30 min', '30–60 min', '60–90 min', '90+ min'];
const STEP_OPTIONS = ['< 3,000', '3,000–7,000', '7,000–12,000', '12,000+'];

// SportTwin
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

// ─── Helpers ─────────────────────────────────────────────────

function oneHotWrite(vec: Float32Array, baseDim: number, value: string, options: string[]) {
  const idx = options.indexOf(value);
  if (idx >= 0) {
    vec[baseDim + idx] = 255;
  }
  // If value not found (including 'Prefer not to say' not in options list), all dims stay 0
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

// ─── Encoder ─────────────────────────────────────────────────

export function encodeIdentityVector(
  state: WizardState
): { signature: number[]; error: null } | { signature: null; error: EncoderError } {
  const baselineErr = validateBaseline(state);
  if (baselineErr) return { signature: null, error: baselineErr };

  const vec = new Float32Array(256); // strict zeros

  // ── Physical Layer (0–63) ──

  // Age one-hot → dims 0–5
  oneHotWrite(vec, 0, state.profile.ageBin, AGE_OPTIONS);

  // Gender one-hot → dims 7–9 (PFNTS = all zeros, no dim written)
  oneHotWrite(vec, 7, state.profile.gender, GENDER_OPTIONS);

  // Weight one-hot → dims 10–14 (14 = PFNTS, but UI has no PFNTS so stays 0)
  oneHotWrite(vec, 10, state.profile.weightBin, WEIGHT_OPTIONS);

  // Height one-hot → dims 15–19
  oneHotWrite(vec, 15, state.profile.heightBin, HEIGHT_OPTIONS);

  // Sport frequency one-hot → dims 20–23
  oneHotWrite(vec, 20, state.sportSetup.frequency, FREQ_OPTIONS);

  // Sport duration one-hot → dims 24–27
  oneHotWrite(vec, 24, state.sportSetup.duration, DURATION_OPTIONS);

  // Daily steps one-hot → dims 28–31
  oneHotWrite(vec, 28, state.sportSetup.dailySteps, STEP_OPTIONS);

  // Sport ranking → dims 32–42 (rank-weighted)
  const { sportRanking } = state.sportTwin;
  sportRanking.forEach((sport, rank) => {
    const sportIdx = SPORTS.indexOf(sport);
    if (sportIdx >= 0) {
      const weight = Math.round(((sportRanking.length - rank) / sportRanking.length) * 255);
      vec[32 + sportIdx] = weight;
    }
  });

  // Outfit style multi-hot → dims 50–59
  state.sportTwin.outfitStyle.forEach(style => {
    const idx = OUTFIT_STYLES.indexOf(style);
    if (idx >= 0) vec[50 + idx] = 255;
  });

  // ── Digital Layer (64–127) ──

  // Brand preferences multi-hot → dims 64–73 (L1 normalized)
  state.sportTwin.brands.forEach(brand => {
    const idx = BRANDS.indexOf(brand);
    if (idx >= 0) vec[64 + idx] = 255;
  });

  // ── Social Layer (128–191) ──

  // Education one-hot → dims 128–133
  oneHotWrite(vec, 128, state.profile.education, EDUCATION_OPTIONS);

  // Income one-hot → dims 134–138
  oneHotWrite(vec, 134, state.profile.income, INCOME_OPTIONS);

  // Marital status one-hot → dims 140–144 (dim 139 reserved = 0)
  oneHotWrite(vec, 140, state.profile.maritalStatus, MARITAL_OPTIONS);

  // Living one-hot → dims 145–148
  oneHotWrite(vec, 145, state.profile.livingType, LIVING_OPTIONS);

  // Occupation one-hot → dims 149–154
  oneHotWrite(vec, 149, state.profile.occupation, OCCUPATION_OPTIONS);

  // ── Soul Bars ──
  const soulBars: SoulBar[] = state.soul.bars;
  const SOUL_DIM_MAP: Record<string, [number, number]> = {
    'BAR_OUTCOME_EXPERIENCE': [206, 207],  // Spiritual
    'BAR_CONTROL_RELEASE': [208, 209],     // Spiritual
    'BAR_SOLO_GROUP': [155, 156],          // Social
    'BAR_PASSIVE_ACTIVE': [85, 86],        // Digital
  };

  soulBars.forEach(bar => {
    const pair = SOUL_DIM_MAP[bar.id];
    if (!pair) return;
    if (bar.value === null) {
      // Strategy A: untouched → both dims stay 0
      return;
    }
    const t = bar.value / 100;
    vec[pair[0]] = Math.round(255 * (1 - t));
    vec[pair[1]] = Math.round(255 * t);
  });

  // ── Slice-level L1 normalization ──
  for (const norm of SLICE_NORMS) {
    applySliceL1(vec, norm.range[0], norm.range[1]);
  }

  // ── Zero out any dim not in spec registry ──
  for (let i = 0; i < 256; i++) {
    if (!WRITABLE_DIMS.has(i)) {
      vec[i] = 0;
    }
  }

  // ── Convert to integer array (0–255) ──
  const signature = Array.from(vec, v => Math.min(255, Math.max(0, Math.round(v))));

  return { signature, error: null };
}

export function computeDensity(signature: number[]): number {
  const nonZero = signature.filter(v => v > 1e-6).length;
  return Math.round((nonZero / 256) * 100);
}

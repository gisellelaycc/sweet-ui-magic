/**
 * Twin Matrix Spec Registry
 * 
 * Defines every writable dimension in the 256D identity vector.
 * Only dim_ids listed here may be written; all others stay 0.
 */

export interface DimSpec {
  dim_id: number;
  label: string;
  layer: 'physical' | 'digital' | 'social' | 'spiritual';
  source: string;          // which wizard field populates this
  encoding: 'one-hot' | 'ordinal' | 'continuous' | 'multi-hot' | 'rank-weighted';
}

export interface SliceNorm {
  range: [number, number]; // inclusive
  type: 'L1';
}

// ─── Core Identity (Profile) ─────────────────────────────────
// Physical layer: dims 0–63
const CORE_PROFILE: DimSpec[] = [
  // Height bins → ordinal 0..3 → scaled to 0-255
  { dim_id: 0, label: 'height_bin', layer: 'physical', source: 'profile.heightBin', encoding: 'ordinal' },
  // Weight bins
  { dim_id: 1, label: 'weight_bin', layer: 'physical', source: 'profile.weightBin', encoding: 'ordinal' },
  // Age bins
  { dim_id: 2, label: 'age_bin', layer: 'physical', source: 'profile.ageBin', encoding: 'ordinal' },
  // Gender one-hot (dims 3–6)
  { dim_id: 3, label: 'gender_male', layer: 'physical', source: 'profile.gender', encoding: 'one-hot' },
  { dim_id: 4, label: 'gender_female', layer: 'physical', source: 'profile.gender', encoding: 'one-hot' },
  { dim_id: 5, label: 'gender_nonbinary', layer: 'physical', source: 'profile.gender', encoding: 'one-hot' },
  { dim_id: 6, label: 'gender_other', layer: 'physical', source: 'profile.gender', encoding: 'one-hot' },
  // Education ordinal
  { dim_id: 10, label: 'education', layer: 'social', source: 'profile.education', encoding: 'ordinal' },
  // Income ordinal
  { dim_id: 11, label: 'income', layer: 'social', source: 'profile.income', encoding: 'ordinal' },
  // Marital status one-hot (dims 12–15)
  { dim_id: 12, label: 'marital_single', layer: 'social', source: 'profile.maritalStatus', encoding: 'one-hot' },
  { dim_id: 13, label: 'marital_married', layer: 'social', source: 'profile.maritalStatus', encoding: 'one-hot' },
  { dim_id: 14, label: 'marital_divorced', layer: 'social', source: 'profile.maritalStatus', encoding: 'one-hot' },
  { dim_id: 15, label: 'marital_other', layer: 'social', source: 'profile.maritalStatus', encoding: 'one-hot' },
  // Occupation ordinal
  { dim_id: 16, label: 'occupation', layer: 'social', source: 'profile.occupation', encoding: 'ordinal' },
  // Living type ordinal
  { dim_id: 17, label: 'living_type', layer: 'social', source: 'profile.livingType', encoding: 'ordinal' },
];

// ─── Sport Setup (Activity Baseline) ─────────────────────────
// Activity slice: dims 192–199 (L1 normalized per spec)
const SPORT_SETUP: DimSpec[] = [
  { dim_id: 192, label: 'freq_light', layer: 'physical', source: 'sportSetup.frequency', encoding: 'one-hot' },
  { dim_id: 193, label: 'freq_moderate', layer: 'physical', source: 'sportSetup.frequency', encoding: 'one-hot' },
  { dim_id: 194, label: 'freq_high', layer: 'physical', source: 'sportSetup.frequency', encoding: 'one-hot' },
  { dim_id: 195, label: 'freq_casual', layer: 'physical', source: 'sportSetup.frequency', encoding: 'one-hot' },
  { dim_id: 196, label: 'duration_quick', layer: 'physical', source: 'sportSetup.duration', encoding: 'one-hot' },
  { dim_id: 197, label: 'duration_standard', layer: 'physical', source: 'sportSetup.duration', encoding: 'one-hot' },
  { dim_id: 198, label: 'duration_extended', layer: 'physical', source: 'sportSetup.duration', encoding: 'one-hot' },
  { dim_id: 199, label: 'duration_endurance', layer: 'physical', source: 'sportSetup.duration', encoding: 'one-hot' },
];

// Daily steps (separate from activity slice)
const DAILY_STEPS: DimSpec[] = [
  { dim_id: 20, label: 'steps_sedentary', layer: 'physical', source: 'sportSetup.dailySteps', encoding: 'one-hot' },
  { dim_id: 21, label: 'steps_light', layer: 'physical', source: 'sportSetup.dailySteps', encoding: 'one-hot' },
  { dim_id: 22, label: 'steps_active', layer: 'physical', source: 'sportSetup.dailySteps', encoding: 'one-hot' },
  { dim_id: 23, label: 'steps_highly_active', layer: 'physical', source: 'sportSetup.dailySteps', encoding: 'one-hot' },
];

// ─── Sport Twin (Skill & Style) ──────────────────────────────
// Sport ranking: dims 30–40 (rank-weighted)
const SPORT_RANKING: DimSpec[] = [
  { dim_id: 30, label: 'sport_running', layer: 'physical', source: 'sportTwin.sportRanking', encoding: 'rank-weighted' },
  { dim_id: 31, label: 'sport_cycling', layer: 'physical', source: 'sportTwin.sportRanking', encoding: 'rank-weighted' },
  { dim_id: 32, label: 'sport_swimming', layer: 'physical', source: 'sportTwin.sportRanking', encoding: 'rank-weighted' },
  { dim_id: 33, label: 'sport_trail', layer: 'physical', source: 'sportTwin.sportRanking', encoding: 'rank-weighted' },
  { dim_id: 34, label: 'sport_strength', layer: 'physical', source: 'sportTwin.sportRanking', encoding: 'rank-weighted' },
  { dim_id: 35, label: 'sport_yoga', layer: 'physical', source: 'sportTwin.sportRanking', encoding: 'rank-weighted' },
  { dim_id: 36, label: 'sport_team', layer: 'physical', source: 'sportTwin.sportRanking', encoding: 'rank-weighted' },
  { dim_id: 37, label: 'sport_combat', layer: 'physical', source: 'sportTwin.sportRanking', encoding: 'rank-weighted' },
  { dim_id: 38, label: 'sport_racquet', layer: 'physical', source: 'sportTwin.sportRanking', encoding: 'rank-weighted' },
  { dim_id: 39, label: 'sport_climbing', layer: 'physical', source: 'sportTwin.sportRanking', encoding: 'rank-weighted' },
  { dim_id: 40, label: 'sport_golf', layer: 'physical', source: 'sportTwin.sportRanking', encoding: 'rank-weighted' },
];

// Outfit style: dims 50–59 (multi-hot)
const OUTFIT_STYLE: DimSpec[] = [
  { dim_id: 50, label: 'style_minimal', layer: 'digital', source: 'sportTwin.outfitStyle', encoding: 'multi-hot' },
  { dim_id: 51, label: 'style_streetwear', layer: 'digital', source: 'sportTwin.outfitStyle', encoding: 'multi-hot' },
  { dim_id: 52, label: 'style_pro', layer: 'digital', source: 'sportTwin.outfitStyle', encoding: 'multi-hot' },
  { dim_id: 53, label: 'style_casual', layer: 'digital', source: 'sportTwin.outfitStyle', encoding: 'multi-hot' },
  { dim_id: 54, label: 'style_premium', layer: 'digital', source: 'sportTwin.outfitStyle', encoding: 'multi-hot' },
  { dim_id: 55, label: 'style_retro', layer: 'digital', source: 'sportTwin.outfitStyle', encoding: 'multi-hot' },
  { dim_id: 56, label: 'style_outdoor', layer: 'digital', source: 'sportTwin.outfitStyle', encoding: 'multi-hot' },
  { dim_id: 57, label: 'style_tight', layer: 'digital', source: 'sportTwin.outfitStyle', encoding: 'multi-hot' },
  { dim_id: 58, label: 'style_vivid', layer: 'digital', source: 'sportTwin.outfitStyle', encoding: 'multi-hot' },
  { dim_id: 59, label: 'style_brand_centric', layer: 'digital', source: 'sportTwin.outfitStyle', encoding: 'multi-hot' },
];

// Brand archetype: dims 79–84 (multi-hot, L1 normalized per spec)
const BRAND_PREF: DimSpec[] = [
  { dim_id: 79, label: 'brand_nike', layer: 'digital', source: 'sportTwin.brands', encoding: 'multi-hot' },
  { dim_id: 80, label: 'brand_adidas', layer: 'digital', source: 'sportTwin.brands', encoding: 'multi-hot' },
  { dim_id: 81, label: 'brand_under_armour', layer: 'digital', source: 'sportTwin.brands', encoding: 'multi-hot' },
  { dim_id: 82, label: 'brand_lululemon', layer: 'digital', source: 'sportTwin.brands', encoding: 'multi-hot' },
  { dim_id: 83, label: 'brand_new_balance', layer: 'digital', source: 'sportTwin.brands', encoding: 'multi-hot' },
  { dim_id: 84, label: 'brand_asics', layer: 'digital', source: 'sportTwin.brands', encoding: 'multi-hot' },
  { dim_id: 85, label: 'brand_puma', layer: 'digital', source: 'sportTwin.brands', encoding: 'multi-hot' },
  { dim_id: 86, label: 'brand_reebok', layer: 'digital', source: 'sportTwin.brands', encoding: 'multi-hot' },
  { dim_id: 87, label: 'brand_on', layer: 'digital', source: 'sportTwin.brands', encoding: 'multi-hot' },
  { dim_id: 88, label: 'brand_hoka', layer: 'digital', source: 'sportTwin.brands', encoding: 'multi-hot' },
];

// ─── Soul Layer ──────────────────────────────────────────────
// Each bar has left/right dims (pair). Untouched → both stay 0.
const SOUL: DimSpec[] = [
  { dim_id: 206, label: 'soul_outcome', layer: 'spiritual', source: 'soul.BAR_OUTCOME_EXPERIENCE.left', encoding: 'continuous' },
  { dim_id: 207, label: 'soul_experience', layer: 'spiritual', source: 'soul.BAR_OUTCOME_EXPERIENCE.right', encoding: 'continuous' },
  { dim_id: 208, label: 'soul_control', layer: 'spiritual', source: 'soul.BAR_CONTROL_RELEASE.left', encoding: 'continuous' },
  { dim_id: 209, label: 'soul_release', layer: 'spiritual', source: 'soul.BAR_CONTROL_RELEASE.right', encoding: 'continuous' },
  { dim_id: 210, label: 'soul_solo', layer: 'spiritual', source: 'soul.BAR_SOLO_GROUP.left', encoding: 'continuous' },
  { dim_id: 211, label: 'soul_group', layer: 'spiritual', source: 'soul.BAR_SOLO_GROUP.right', encoding: 'continuous' },
  { dim_id: 212, label: 'soul_passive', layer: 'spiritual', source: 'soul.BAR_PASSIVE_ACTIVE.left', encoding: 'continuous' },
  { dim_id: 213, label: 'soul_active', layer: 'spiritual', source: 'soul.BAR_PASSIVE_ACTIVE.right', encoding: 'continuous' },
];

// ─── All specs ───────────────────────────────────────────────
export const SPEC_REGISTRY: DimSpec[] = [
  ...CORE_PROFILE,
  ...SPORT_SETUP,
  ...DAILY_STEPS,
  ...SPORT_RANKING,
  ...OUTFIT_STYLE,
  ...BRAND_PREF,
  ...SOUL,
];

// Only these dim_ids may be written
export const WRITABLE_DIMS = new Set(SPEC_REGISTRY.map(s => s.dim_id));

// Slice-level L1 normalizations (the ONLY normalization allowed)
export const SLICE_NORMS: SliceNorm[] = [
  { range: [192, 199], type: 'L1' },  // activity baseline
  { range: [79, 88], type: 'L1' },    // brand archetype (expanded to cover all brands)
];

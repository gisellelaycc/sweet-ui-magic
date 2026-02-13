/**
 * Twin Matrix Spec Registry
 * 
 * Defines every writable dimension in the 256D identity vector.
 * Only dim_ids listed here may be written; all others stay 0.
 * 
 * Quadrant layout:
 *   Physical  0–63    (TL)
 *   Digital   64–127  (TR)
 *   Social    128–191 (BL)
 *   Spiritual 192–255 (BR)
 */

export interface DimSpec {
  dim_id: number;
  label: string;
  layer: 'physical' | 'digital' | 'social' | 'spiritual';
  source: string;
  encoding: 'one-hot' | 'ordinal' | 'continuous' | 'multi-hot' | 'rank-weighted';
}

export interface SliceNorm {
  range: [number, number];
  type: 'L1';
}

// ─── Physical Layer (dims 0–63) ──────────────────────────────
const PHYSICAL: DimSpec[] = [
  // Age one-hot (dims 0–5)
  { dim_id: 0, label: 'age_18_24', layer: 'physical', source: 'profile.ageBin', encoding: 'one-hot' },
  { dim_id: 1, label: 'age_25_34', layer: 'physical', source: 'profile.ageBin', encoding: 'one-hot' },
  { dim_id: 2, label: 'age_35_44', layer: 'physical', source: 'profile.ageBin', encoding: 'one-hot' },
  { dim_id: 3, label: 'age_45_54', layer: 'physical', source: 'profile.ageBin', encoding: 'one-hot' },
  { dim_id: 4, label: 'age_55_64', layer: 'physical', source: 'profile.ageBin', encoding: 'one-hot' },
  { dim_id: 5, label: 'age_65_plus', layer: 'physical', source: 'profile.ageBin', encoding: 'one-hot' },
  // Gender one-hot (dims 7–9; PFNTS = all zeros)
  { dim_id: 7, label: 'gender_male', layer: 'physical', source: 'profile.gender', encoding: 'one-hot' },
  { dim_id: 8, label: 'gender_female', layer: 'physical', source: 'profile.gender', encoding: 'one-hot' },
  { dim_id: 9, label: 'gender_nonbinary', layer: 'physical', source: 'profile.gender', encoding: 'one-hot' },
  // Weight one-hot (dims 10–14)
  { dim_id: 10, label: 'weight_lt_50', layer: 'physical', source: 'profile.weightBin', encoding: 'one-hot' },
  { dim_id: 11, label: 'weight_50_65', layer: 'physical', source: 'profile.weightBin', encoding: 'one-hot' },
  { dim_id: 12, label: 'weight_65_80', layer: 'physical', source: 'profile.weightBin', encoding: 'one-hot' },
  { dim_id: 13, label: 'weight_gt_80', layer: 'physical', source: 'profile.weightBin', encoding: 'one-hot' },
  { dim_id: 14, label: 'weight_pfnts', layer: 'physical', source: 'profile.weightBin', encoding: 'one-hot' },
  // Height one-hot (dims 15–19)
  { dim_id: 15, label: 'height_lt_160', layer: 'physical', source: 'profile.heightBin', encoding: 'one-hot' },
  { dim_id: 16, label: 'height_160_170', layer: 'physical', source: 'profile.heightBin', encoding: 'one-hot' },
  { dim_id: 17, label: 'height_170_180', layer: 'physical', source: 'profile.heightBin', encoding: 'one-hot' },
  { dim_id: 18, label: 'height_gt_180', layer: 'physical', source: 'profile.heightBin', encoding: 'one-hot' },
  { dim_id: 19, label: 'height_pfnts', layer: 'physical', source: 'profile.heightBin', encoding: 'one-hot' },
  // Sport frequency one-hot (dims 20–23)
  { dim_id: 20, label: 'freq_1_2', layer: 'physical', source: 'sportSetup.frequency', encoding: 'one-hot' },
  { dim_id: 21, label: 'freq_3_4', layer: 'physical', source: 'sportSetup.frequency', encoding: 'one-hot' },
  { dim_id: 22, label: 'freq_5_plus', layer: 'physical', source: 'sportSetup.frequency', encoding: 'one-hot' },
  { dim_id: 23, label: 'freq_occasional', layer: 'physical', source: 'sportSetup.frequency', encoding: 'one-hot' },
  // Sport duration one-hot (dims 24–27)
  { dim_id: 24, label: 'dur_lt_30', layer: 'physical', source: 'sportSetup.duration', encoding: 'one-hot' },
  { dim_id: 25, label: 'dur_30_60', layer: 'physical', source: 'sportSetup.duration', encoding: 'one-hot' },
  { dim_id: 26, label: 'dur_60_90', layer: 'physical', source: 'sportSetup.duration', encoding: 'one-hot' },
  { dim_id: 27, label: 'dur_90_plus', layer: 'physical', source: 'sportSetup.duration', encoding: 'one-hot' },
  // Daily steps one-hot (dims 28–31)
  { dim_id: 28, label: 'steps_lt_3k', layer: 'physical', source: 'sportSetup.dailySteps', encoding: 'one-hot' },
  { dim_id: 29, label: 'steps_3k_7k', layer: 'physical', source: 'sportSetup.dailySteps', encoding: 'one-hot' },
  { dim_id: 30, label: 'steps_7k_12k', layer: 'physical', source: 'sportSetup.dailySteps', encoding: 'one-hot' },
  { dim_id: 31, label: 'steps_12k_plus', layer: 'physical', source: 'sportSetup.dailySteps', encoding: 'one-hot' },
  // Sport ranking (dims 32–42, rank-weighted)
  { dim_id: 32, label: 'sport_running', layer: 'physical', source: 'sportTwin.sportRanking', encoding: 'rank-weighted' },
  { dim_id: 33, label: 'sport_cycling', layer: 'physical', source: 'sportTwin.sportRanking', encoding: 'rank-weighted' },
  { dim_id: 34, label: 'sport_swimming', layer: 'physical', source: 'sportTwin.sportRanking', encoding: 'rank-weighted' },
  { dim_id: 35, label: 'sport_trail', layer: 'physical', source: 'sportTwin.sportRanking', encoding: 'rank-weighted' },
  { dim_id: 36, label: 'sport_strength', layer: 'physical', source: 'sportTwin.sportRanking', encoding: 'rank-weighted' },
  { dim_id: 37, label: 'sport_yoga', layer: 'physical', source: 'sportTwin.sportRanking', encoding: 'rank-weighted' },
  { dim_id: 38, label: 'sport_team', layer: 'physical', source: 'sportTwin.sportRanking', encoding: 'rank-weighted' },
  { dim_id: 39, label: 'sport_combat', layer: 'physical', source: 'sportTwin.sportRanking', encoding: 'rank-weighted' },
  { dim_id: 40, label: 'sport_racquet', layer: 'physical', source: 'sportTwin.sportRanking', encoding: 'rank-weighted' },
  { dim_id: 41, label: 'sport_climbing', layer: 'physical', source: 'sportTwin.sportRanking', encoding: 'rank-weighted' },
  { dim_id: 42, label: 'sport_golf', layer: 'physical', source: 'sportTwin.sportRanking', encoding: 'rank-weighted' },
  // Outfit style (dims 50–59, multi-hot) — kept in Physical for now
  { dim_id: 50, label: 'style_minimal', layer: 'physical', source: 'sportTwin.outfitStyle', encoding: 'multi-hot' },
  { dim_id: 51, label: 'style_streetwear', layer: 'physical', source: 'sportTwin.outfitStyle', encoding: 'multi-hot' },
  { dim_id: 52, label: 'style_pro', layer: 'physical', source: 'sportTwin.outfitStyle', encoding: 'multi-hot' },
  { dim_id: 53, label: 'style_casual', layer: 'physical', source: 'sportTwin.outfitStyle', encoding: 'multi-hot' },
  { dim_id: 54, label: 'style_premium', layer: 'physical', source: 'sportTwin.outfitStyle', encoding: 'multi-hot' },
  { dim_id: 55, label: 'style_retro', layer: 'physical', source: 'sportTwin.outfitStyle', encoding: 'multi-hot' },
  { dim_id: 56, label: 'style_outdoor', layer: 'physical', source: 'sportTwin.outfitStyle', encoding: 'multi-hot' },
  { dim_id: 57, label: 'style_tight', layer: 'physical', source: 'sportTwin.outfitStyle', encoding: 'multi-hot' },
  { dim_id: 58, label: 'style_vivid', layer: 'physical', source: 'sportTwin.outfitStyle', encoding: 'multi-hot' },
  { dim_id: 59, label: 'style_brand_centric', layer: 'physical', source: 'sportTwin.outfitStyle', encoding: 'multi-hot' },
];

// ─── Digital Layer (dims 64–127) ─────────────────────────────
const DIGITAL: DimSpec[] = [
  // Brand preferences (dims 64–73, multi-hot, L1 normalized)
  { dim_id: 64, label: 'brand_nike', layer: 'digital', source: 'sportTwin.brands', encoding: 'multi-hot' },
  { dim_id: 65, label: 'brand_adidas', layer: 'digital', source: 'sportTwin.brands', encoding: 'multi-hot' },
  { dim_id: 66, label: 'brand_under_armour', layer: 'digital', source: 'sportTwin.brands', encoding: 'multi-hot' },
  { dim_id: 67, label: 'brand_lululemon', layer: 'digital', source: 'sportTwin.brands', encoding: 'multi-hot' },
  { dim_id: 68, label: 'brand_new_balance', layer: 'digital', source: 'sportTwin.brands', encoding: 'multi-hot' },
  { dim_id: 69, label: 'brand_asics', layer: 'digital', source: 'sportTwin.brands', encoding: 'multi-hot' },
  { dim_id: 70, label: 'brand_puma', layer: 'digital', source: 'sportTwin.brands', encoding: 'multi-hot' },
  { dim_id: 71, label: 'brand_reebok', layer: 'digital', source: 'sportTwin.brands', encoding: 'multi-hot' },
  { dim_id: 72, label: 'brand_on', layer: 'digital', source: 'sportTwin.brands', encoding: 'multi-hot' },
  { dim_id: 73, label: 'brand_hoka', layer: 'digital', source: 'sportTwin.brands', encoding: 'multi-hot' },
  // BAR_PASSIVE_ACTIVE (dims 85–86)
  { dim_id: 85, label: 'dg_passive', layer: 'digital', source: 'soul.BAR_PASSIVE_ACTIVE.left', encoding: 'continuous' },
  { dim_id: 86, label: 'dg_active', layer: 'digital', source: 'soul.BAR_PASSIVE_ACTIVE.right', encoding: 'continuous' },
];

// ─── Social Layer (dims 128–191) ─────────────────────────────
const SOCIAL: DimSpec[] = [
  // Education one-hot (dims 128–133)
  { dim_id: 128, label: 'edu_high_school', layer: 'social', source: 'profile.education', encoding: 'one-hot' },
  { dim_id: 129, label: 'edu_bachelors', layer: 'social', source: 'profile.education', encoding: 'one-hot' },
  { dim_id: 130, label: 'edu_masters', layer: 'social', source: 'profile.education', encoding: 'one-hot' },
  { dim_id: 131, label: 'edu_doctorate', layer: 'social', source: 'profile.education', encoding: 'one-hot' },
  { dim_id: 132, label: 'edu_other', layer: 'social', source: 'profile.education', encoding: 'one-hot' },
  { dim_id: 133, label: 'edu_pfnts', layer: 'social', source: 'profile.education', encoding: 'one-hot' },
  // Income one-hot (dims 134–138)
  { dim_id: 134, label: 'inc_lt_30k', layer: 'social', source: 'profile.income', encoding: 'one-hot' },
  { dim_id: 135, label: 'inc_30k_60k', layer: 'social', source: 'profile.income', encoding: 'one-hot' },
  { dim_id: 136, label: 'inc_60k_100k', layer: 'social', source: 'profile.income', encoding: 'one-hot' },
  { dim_id: 137, label: 'inc_100k_plus', layer: 'social', source: 'profile.income', encoding: 'one-hot' },
  { dim_id: 138, label: 'inc_pfnts', layer: 'social', source: 'profile.income', encoding: 'one-hot' },
  // dim 139 RESERVED (must be 0)
  // Marital status one-hot (dims 140–144)
  { dim_id: 140, label: 'rel_single', layer: 'social', source: 'profile.maritalStatus', encoding: 'one-hot' },
  { dim_id: 141, label: 'rel_in_relationship', layer: 'social', source: 'profile.maritalStatus', encoding: 'one-hot' },
  { dim_id: 142, label: 'rel_married', layer: 'social', source: 'profile.maritalStatus', encoding: 'one-hot' },
  { dim_id: 143, label: 'rel_other', layer: 'social', source: 'profile.maritalStatus', encoding: 'one-hot' },
  { dim_id: 144, label: 'rel_pfnts', layer: 'social', source: 'profile.maritalStatus', encoding: 'one-hot' },
  // Living one-hot (dims 145–148)
  { dim_id: 145, label: 'living_urban', layer: 'social', source: 'profile.livingType', encoding: 'one-hot' },
  { dim_id: 146, label: 'living_suburban', layer: 'social', source: 'profile.livingType', encoding: 'one-hot' },
  { dim_id: 147, label: 'living_rural', layer: 'social', source: 'profile.livingType', encoding: 'one-hot' },
  { dim_id: 148, label: 'living_pfnts', layer: 'social', source: 'profile.livingType', encoding: 'one-hot' },
  // Occupation one-hot (dims 149–154)
  { dim_id: 149, label: 'occ_student', layer: 'social', source: 'profile.occupation', encoding: 'one-hot' },
  { dim_id: 150, label: 'occ_employee', layer: 'social', source: 'profile.occupation', encoding: 'one-hot' },
  { dim_id: 151, label: 'occ_self_employed', layer: 'social', source: 'profile.occupation', encoding: 'one-hot' },
  { dim_id: 152, label: 'occ_freelancer', layer: 'social', source: 'profile.occupation', encoding: 'one-hot' },
  { dim_id: 153, label: 'occ_other', layer: 'social', source: 'profile.occupation', encoding: 'one-hot' },
  { dim_id: 154, label: 'occ_pfnts', layer: 'social', source: 'profile.occupation', encoding: 'one-hot' },
  // BAR_SOLO_GROUP (dims 155–156)
  { dim_id: 155, label: 'soc_solo', layer: 'social', source: 'soul.BAR_SOLO_GROUP.left', encoding: 'continuous' },
  { dim_id: 156, label: 'soc_group', layer: 'social', source: 'soul.BAR_SOLO_GROUP.right', encoding: 'continuous' },
];

// ─── Spiritual Layer (dims 192–255) ──────────────────────────
const SPIRITUAL: DimSpec[] = [
  // BAR_OUTCOME_EXPERIENCE (dims 206–207)
  { dim_id: 206, label: 'soul_outcome', layer: 'spiritual', source: 'soul.BAR_OUTCOME_EXPERIENCE.left', encoding: 'continuous' },
  { dim_id: 207, label: 'soul_experience', layer: 'spiritual', source: 'soul.BAR_OUTCOME_EXPERIENCE.right', encoding: 'continuous' },
  // BAR_CONTROL_RELEASE (dims 208–209)
  { dim_id: 208, label: 'soul_control', layer: 'spiritual', source: 'soul.BAR_CONTROL_RELEASE.left', encoding: 'continuous' },
  { dim_id: 209, label: 'soul_release', layer: 'spiritual', source: 'soul.BAR_CONTROL_RELEASE.right', encoding: 'continuous' },
];

// ─── All specs ───────────────────────────────────────────────
export const SPEC_REGISTRY: DimSpec[] = [
  ...PHYSICAL,
  ...DIGITAL,
  ...SOCIAL,
  ...SPIRITUAL,
];

// Only these dim_ids may be written
export const WRITABLE_DIMS = new Set(SPEC_REGISTRY.map(s => s.dim_id));

// Slice-level L1 normalizations (the ONLY normalization allowed)
export const SLICE_NORMS: SliceNorm[] = [
  { range: [64, 73], type: 'L1' },  // brand archetype
];

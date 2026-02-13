import { describe, it, expect } from 'vitest';
import { encodeIdentityVector, validateBaseline, computeDensity } from '@/lib/twin-encoder';
import type { WizardState } from '@/types/twin-matrix';

const baseState: WizardState = {
  step: 6,
  profile: {
    username: 'test',
    heightBin: '170–180',
    weightBin: '70–85',
    ageBin: '25–34',
    gender: 'Male',
    education: 'Bachelor',
    income: '$30K–$60K',
    maritalStatus: 'Single',
    occupation: 'Employee',
    livingType: 'Urban',
  },
  activeModules: ['sport'],
  sportSetup: { frequency: '3–4x / week', duration: '30–60 min', dailySteps: '7,000–12,000' },
  sportTwin: {
    sportRanking: ['Running', 'Cycling'],
    outfitStyle: ['Minimal Functional'],
    brands: ['Nike', 'Adidas'],
  },
  soul: {
    bars: [
      { id: 'BAR_OUTCOME_EXPERIENCE', label: '', left: '', right: '', value: 30 },
      { id: 'BAR_CONTROL_RELEASE', label: '', left: '', right: '', value: null },
      { id: 'BAR_SOLO_GROUP', label: '', left: '', right: '', value: 70 },
      { id: 'BAR_PASSIVE_ACTIVE', label: '', left: '', right: '', value: null },
    ],
    confirmed: true,
  },
  signature: [],
  agentSetup: {
    agent: { name: '', taskTypes: [], matchingStrategy: [], behaviorMode: 'Active search' },
    permission: {
      identityScope: 'Core', tradingAuthority: 'Manual Only',
      authorizationDuration: '', customDurationDays: '',
      maxPerTask: '', dailyCap: '', weeklyCap: '',
      spendResetPolicy: [], taskTypeBound: false, brandRestriction: false,
    },
  },
};

describe('Twin Encoder', () => {
  it('produces a 256-length integer array', () => {
    const result = encodeIdentityVector(baseState);
    expect(result.error).toBeNull();
    expect(result.signature).toHaveLength(256);
    result.signature!.forEach(v => {
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(255);
      expect(Number.isInteger(v)).toBe(true);
    });
  });

  it('keeps non-registry dims at 0', () => {
    const result = encodeIdentityVector(baseState);
    // dim 100 is not in registry
    expect(result.signature![100]).toBe(0);
    expect(result.signature![150]).toBe(0);
    expect(result.signature![250]).toBe(0);
  });

  it('rejects missing baseline fields (BASELINE_MISSING_FIELDS)', () => {
    const bad = { ...baseState, sportSetup: { frequency: '', duration: '30–60 min', dailySteps: '' } };
    const result = encodeIdentityVector(bad);
    expect(result.error).not.toBeNull();
    expect(result.error!.code).toBe('BASELINE_MISSING_FIELDS');
  });

  it('untouched soul bars leave both dims at 0', () => {
    const result = encodeIdentityVector(baseState);
    // BAR_CONTROL_RELEASE is null → dims 208, 209 should be 0
    expect(result.signature![208]).toBe(0);
    expect(result.signature![209]).toBe(0);
    // BAR_PASSIVE_ACTIVE is null → dims 212, 213 should be 0
    expect(result.signature![212]).toBe(0);
    expect(result.signature![213]).toBe(0);
  });

  it('touched soul bars write complementary values', () => {
    const result = encodeIdentityVector(baseState);
    // BAR_OUTCOME_EXPERIENCE value=30 → left=179, right=77 (approx)
    expect(result.signature![206]).toBeGreaterThan(0);
    expect(result.signature![207]).toBeGreaterThan(0);
    expect(result.signature![206]! + result.signature![207]!).toBeGreaterThanOrEqual(254);
    expect(result.signature![206]! + result.signature![207]!).toBeLessThanOrEqual(256);
  });

  it('sport ranking uses rank-weighted encoding', () => {
    const result = encodeIdentityVector(baseState);
    // Running (rank 0) > Cycling (rank 1)
    expect(result.signature![30]).toBeGreaterThan(result.signature![31]);
    // Unselected sports = 0
    expect(result.signature![34]).toBe(0);
  });

  it('applies L1 normalization only on specified slices', () => {
    const result = encodeIdentityVector(baseState);
    // Activity slice 192–199: sum should be 255 (after L1)
    const activitySlice = result.signature!.slice(192, 200);
    const activitySum = activitySlice.reduce((a, b) => a + b, 0);
    expect(activitySum).toBeGreaterThanOrEqual(254);
    expect(activitySum).toBeLessThanOrEqual(256);

    // Brand slice 79–88: sum should be 255 (after L1)
    const brandSlice = result.signature!.slice(79, 89);
    const brandSum = brandSlice.reduce((a, b) => a + b, 0);
    expect(brandSum).toBeGreaterThanOrEqual(254);
    expect(brandSum).toBeLessThanOrEqual(256);
  });

  it('computeDensity uses >1e-6 threshold', () => {
    expect(computeDensity([0, 0, 0, 0])).toBe(0);
    // Integer 1 > 1e-6, so density = 1/4 of the input length, scaled to 256
    const density = computeDensity(new Array(256).fill(0));
    expect(density).toBe(0);
    // 10 non-zero values out of 256 → ~4%
    const sig = new Array(256).fill(0);
    for (let i = 0; i < 10; i++) sig[i] = 100;
    expect(computeDensity(sig)).toBe(4);
  });

  it('no whole-vector normalization (raw values preserved outside L1 slices)', () => {
    const result = encodeIdentityVector(baseState);
    // Gender Male → dim 3 should be 255 (raw one-hot, not normalized)
    expect(result.signature![3]).toBe(255);
    // Outfit Minimal Functional → dim 50 should be 255
    expect(result.signature![50]).toBe(255);
  });
});

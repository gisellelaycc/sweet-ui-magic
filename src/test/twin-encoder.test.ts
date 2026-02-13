import { describe, it, expect } from 'vitest';
import { encodeIdentityVector, validateBaseline, computeDensity } from '@/lib/twin-encoder';
import type { WizardState } from '@/types/twin-matrix';

const baseState: WizardState = {
  step: 6,
  profile: {
    username: 'test',
    heightBin: '170–180',
    weightBin: '65–80',
    ageBin: '25–34',
    gender: 'Male',
    education: "Master's",
    income: '< $30k',
    maritalStatus: 'In a relationship',
    occupation: 'Student',
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
    expect(result.signature![100]).toBe(0);
    expect(result.signature![200]).toBe(0);
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
    // BAR_CONTROL_RELEASE is null → dims 208, 209 = 0
    expect(result.signature![208]).toBe(0);
    expect(result.signature![209]).toBe(0);
    // BAR_PASSIVE_ACTIVE is null → dims 85, 86 = 0
    expect(result.signature![85]).toBe(0);
    expect(result.signature![86]).toBe(0);
  });

  it('touched soul bars write complementary values', () => {
    const result = encodeIdentityVector(baseState);
    // BAR_OUTCOME_EXPERIENCE value=30 → 206 + 207 ≈ 255
    expect(result.signature![206]).toBeGreaterThan(0);
    expect(result.signature![207]).toBeGreaterThan(0);
    expect(result.signature![206]! + result.signature![207]!).toBeGreaterThanOrEqual(254);
    expect(result.signature![206]! + result.signature![207]!).toBeLessThanOrEqual(256);
  });

  it('BAR_SOLO_GROUP writes to social dims 155-156', () => {
    const result = encodeIdentityVector(baseState);
    // value=70 → solo=77, group=179 (approx)
    expect(result.signature![155]).toBeGreaterThan(0);
    expect(result.signature![156]).toBeGreaterThan(0);
    expect(result.signature![155]! + result.signature![156]!).toBeGreaterThanOrEqual(254);
  });

  it('social fields map to dims 128–191', () => {
    const result = encodeIdentityVector(baseState);
    // Education "Master's" → dim 130 = 255
    expect(result.signature![130]).toBe(255);
    // Income "< $30k" → dim 134 = 255
    expect(result.signature![134]).toBe(255);
    // Marital "In a relationship" → dim 141 = 255
    expect(result.signature![141]).toBe(255);
    // Occupation "Student" → dim 149 = 255
    expect(result.signature![149]).toBe(255);
    // Living "Urban" → dim 145 = 255
    expect(result.signature![145]).toBe(255);
  });

  it('physical layer uses one-hot for age/gender/weight/height', () => {
    const result = encodeIdentityVector(baseState);
    // Age 25–34 → dim 1 = 255
    expect(result.signature![1]).toBe(255);
    // Gender Male → dim 7 = 255
    expect(result.signature![7]).toBe(255);
    // Weight 65–80 → dim 12 = 255
    expect(result.signature![12]).toBe(255);
    // Height 170–180 → dim 17 = 255
    expect(result.signature![17]).toBe(255);
  });

  it('sport ranking uses rank-weighted encoding at dims 32+', () => {
    const result = encodeIdentityVector(baseState);
    // Running (rank 0) > Cycling (rank 1)
    expect(result.signature![32]).toBeGreaterThan(result.signature![33]);
    // Unselected sport = 0
    expect(result.signature![36]).toBe(0);
  });

  it('brands map to digital layer dims 64–73 with L1', () => {
    const result = encodeIdentityVector(baseState);
    const brandSlice = result.signature!.slice(64, 74);
    const brandSum = brandSlice.reduce((a, b) => a + b, 0);
    // L1 normalized → sum ≈ 255
    expect(brandSum).toBeGreaterThanOrEqual(254);
    expect(brandSum).toBeLessThanOrEqual(256);
  });

  it('sport freq/dur/steps at dims 20-31', () => {
    const result = encodeIdentityVector(baseState);
    // freq "3–4x / week" → dim 21 = 255
    expect(result.signature![21]).toBe(255);
    // duration "30–60 min" → dim 25 = 255
    expect(result.signature![25]).toBe(255);
    // steps "7,000–12,000" → dim 30 = 255
    expect(result.signature![30]).toBe(255);
  });

  it('computeDensity uses >1e-6 threshold', () => {
    expect(computeDensity([0, 0, 0, 0])).toBe(0);
    const sig = new Array(256).fill(0);
    for (let i = 0; i < 10; i++) sig[i] = 100;
    expect(computeDensity(sig)).toBe(4);
  });

  it('social layer has significant density with core profile filled', () => {
    const result = encodeIdentityVector(baseState);
    // Count non-zero dims in social range 128–191
    const socialDims = result.signature!.slice(128, 192);
    const socialNonZero = socialDims.filter(v => v > 0).length;
    // Student + In a relationship + Master's + <$30k + Urban + BAR_SOLO_GROUP(2) = 7 dims
    expect(socialNonZero).toBeGreaterThanOrEqual(5);
  });
});

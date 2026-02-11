export interface UserProfile {
  username: string;
  heightBin: string;
  weightBin: string;
  ageBin: string;
}

export interface SportSetup {
  frequency: string;
  duration: string;
}

export interface SportTwin {
  sportRanking: string[];
  outfitStyle: string;
  brands: string[];
}

export interface SoulData {
  sentence: string;
  tags: string[];
}

export interface WizardState {
  step: number;
  profile: UserProfile;
  sportSetup: SportSetup;
  sportTwin: SportTwin;
  soul: SoulData;
  signature: string[];
}

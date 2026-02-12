export interface UserProfile {
  username: string;
  heightBin: string;
  weightBin: string;
  ageBin: string;
  gender: string;
  education: string;
  income: string;
  maritalStatus: string;
  occupation: string;
  livingType: string;
  ethnicity: string;
}

export interface SportSetup {
  frequency: string;
  duration: string;
  dailySteps: string;
}

export interface SportTwin {
  sportRanking: string[];
  outfitStyle: string[];
  brands: string[];
}

export interface SoulData {
  sentence: string;
  tags: string[];
  confirmed: boolean;
}

export interface IdentityModule {
  id: string;
  icon: string;
  label: string;
  description: string;
  active: boolean;
}

export interface AuthSetup {
  scope: string;
  duration: string;
  usageLimit: string;
}

export interface WizardState {
  step: number;
  profile: UserProfile;
  activeModules: string[];
  sportSetup: SportSetup;
  sportTwin: SportTwin;
  soul: SoulData;
  signature: string[];
  authSetup: AuthSetup;
}

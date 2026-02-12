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
  spectrum: {
    achievementFreedom: number;   // 0=Achievement, 100=Freedom
    healthSocial: number;         // 0=Health, 100=Social
    disciplineRelease: number;    // 0=Discipline, 100=Release
  };
  weights: {
    achievement: number;
    exploration: number;
    discipline: number;
    social: number;
    emotional: number;
  };
  confirmed: boolean;
}

export interface IdentityModule {
  id: string;
  icon: string;
  label: string;
  description: string;
  active: boolean;
}

export interface AgentDefinition {
  name: string;
  taskTypes: string[];
  matchingStrategy: string[];
  behaviorMode: string;
  capabilities?: Record<string, string[]>;
}

export interface AgentPermission {
  identityScope: string;
  identityScopes?: string[];
  tradingAuthority: string;
  maxPerTask: string;
  dailyCap: string;
  weeklyCap: string;
  spendResetPolicy: string[];
  taskTypeBound: boolean;
  brandRestriction: boolean;
}

export interface AgentSetup {
  agent: AgentDefinition;
  permission: AgentPermission;
}

export interface WizardState {
  step: number;
  profile: UserProfile;
  activeModules: string[];
  sportSetup: SportSetup;
  sportTwin: SportTwin;
  soul: SoulData;
  signature: number[];  // 256 dimensions, 0-255 each
  agentSetup: AgentSetup;
}

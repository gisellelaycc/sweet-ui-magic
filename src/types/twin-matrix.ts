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

export interface SoulBar {
  id: string;
  label: string;
  left: string;
  right: string;
  value: number | null; // null = not touched
}

export interface SoulData {
  bars: SoulBar[];
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
  authorizationDuration: string;
  customDurationDays: string;
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

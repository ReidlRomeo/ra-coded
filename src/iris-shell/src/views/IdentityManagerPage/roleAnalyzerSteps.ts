import type { StepperStepItem } from '../../components/Stepper/Stepper.js';

/** Shared step list for the Role Analyzer wizard (`#/identity/role-analysis/**`). */
export const ROLE_ANALYZER_STEPS: StepperStepItem[] = [
  { id: 'identity-population', label: 'Identity Population' },
  { id: 'entitlement-scope', label: 'Entitlement Scope' },
  { id: 'run-analysis', label: 'Run Analysis' },
  { id: 'review-new-roles', label: 'Review New Roles' },
  { id: 'review-role-changes', label: 'Review Role Changes' },
  { id: 'simulation', label: 'Simulation' },
];

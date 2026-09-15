import { useState } from 'react';
import { AppShell } from '../AppShell/AppShell.js';
import { IDENTITY_ROLE_ANALYSIS_ROUTE } from '../../lib/identityNav.js';
import { Card } from '../../components/Card/Card.js';
import { Button } from '../../components/Button/Button.js';
import { Stepper, type StepperStepItem } from '../../components/Stepper/Stepper.js';
import { Tabs, type TabItem } from '../../components/Tabs/Tabs.js';
import styles from './RoleAnalysisPage.module.css';

const STEPS: StepperStepItem[] = [
  { id: 'identity-population', label: 'Identity Population' },
  { id: 'entitlement-scope', label: 'Entitlement Scope' },
  { id: 'run-analysis', label: 'Run Analysis' },
  { id: 'review-new-roles', label: 'Review New Roles' },
  { id: 'review-role-changes', label: 'Review Role Changes' },
  { id: 'simulation', label: 'Simulation' },
];

const FILTER_TABS: TabItem[] = [
  { value: 'filter', label: 'Filter', icon: 'FunnelSimple' },
  { value: 'query', label: 'Query', icon: 'BracketsCurly' },
  { value: 'ask-ai', label: 'Ask AI', icon: 'Sparkle' },
];

/**
 * RoleAnalysisPage — step 1 of the Role Analyzer wizard (`#/identity/role-analysis`).
 * Lets the user scope the identity population an analysis run will cover.
 */
export function RoleAnalysisPage() {
  const [filterTab, setFilterTab] = useState('filter');

  return (
    <AppShell
      breadcrumb={[{ label: 'Role Analysis' }]}
      activeGlobalItem={IDENTITY_ROLE_ANALYSIS_ROUTE}
      showSecondarySidebar={false}
    >
      <div className={styles.page}>
        <div className={styles.header}>
          <h1 className={styles.title}>Role Analyzer</h1>
          <p className={styles.subtitle}>Select the identity population for analysis</p>
        </div>

        <Stepper steps={STEPS} activeIndex={0} ariaLabel="Role Analyzer steps" />

        <Card
          title="Filter identities for analysis"
          helper="Smaller, well-defined populations produce clearer role recommendations."
        >
          <Tabs items={FILTER_TABS} value={filterTab} onChange={setFilterTab} ariaLabel="Filter mode" />
          <div className={styles.filterPanel}>
            <Button variant="ghost" size="s" iconLead="Plus">
              Add filter
            </Button>
          </div>
        </Card>

        <Card
          title="Select identities to exclude"
          helper="Remove identities that should never be included in this role analysis."
        >
          <div className={styles.excludePanel}>
            <Button variant="ghost" size="s" iconLead="Minus">
              Exclude
            </Button>
          </div>
        </Card>

        <p className={styles.count}>
          Identities selected for analysis: <span className={styles.countValue}>3,291</span>
        </p>

        <div className={styles.footer}>
          <span className={styles.stepLabel}>Step 1 of 6</span>
          <Button variant="primary" iconTrail="ArrowRight">
            Continue
          </Button>
        </div>
      </div>
    </AppShell>
  );
}

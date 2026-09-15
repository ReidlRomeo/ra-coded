import { useState, type Ref, type ReactNode } from 'react';
import { AppShell } from '../AppShell/AppShell.js';
import { navigate } from '../../lib/router.js';
import { IDENTITY_ROLE_ANALYSIS_ROUTE } from '../../lib/identityNav.js';
import { Card } from '../../components/Card/Card.js';
import { Button } from '../../components/Button/Button.js';
import { Icon } from '../../components/Icon/Icon.js';
import { Badge } from '../../components/Badge/Badge.js';
import { Checkbox } from '../../components/Checkbox/Checkbox.js';
import { Menu } from '../../components/Menu/Menu.js';
import { Stepper } from '../../components/Stepper/Stepper.js';
import { ROLE_ANALYZER_STEPS } from './roleAnalyzerSteps.js';
import styles from './EntitlementScopePage.module.css';

/** Mock catalog — a real integration would source this from connected target systems. */
const AVAILABLE_TARGET_SYSTEMS = [
  'Active Directory',
  'SAP ERP',
  'ServiceNow',
  'Workday',
  'Salesforce',
  'Azure AD',
  'Oracle EBS',
  'Okta',
];

const MAX_TARGET_SYSTEMS = 5;
const STEP_INDEX = 1;

/** Only the completed "Identity Population" step can be clicked back to. */
const STEPS = ROLE_ANALYZER_STEPS.map((step, index) => ({ ...step, disabled: index >= STEP_INDEX }));

type AnalysisFocus = 'business-relevant' | 'all';

/**
 * EntitlementScopePage — step 2 of the Role Analyzer wizard
 * (`#/identity/role-analysis/entitlement-scope`). Lets the user pick target
 * systems and scope which entitlements the analysis considers.
 */
export function EntitlementScopePage() {
  const [selectedSystems, setSelectedSystems] = useState<string[]>([]);
  const [analysisFocus, setAnalysisFocus] = useState<AnalysisFocus>('business-relevant');
  const [excludeInherited, setExcludeInherited] = useState(true);

  const canAddMore = selectedSystems.length < MAX_TARGET_SYSTEMS;
  const canContinue = selectedSystems.length > 0;

  const addSystem = (system: string) => setSelectedSystems((prev) => [...prev, system]);
  const removeSystem = (system: string) =>
    setSelectedSystems((prev) => prev.filter((s) => s !== system));

  const menuItems = AVAILABLE_TARGET_SYSTEMS.filter((s) => !selectedSystems.includes(s)).map(
    (system) => ({
      kind: 'item' as const,
      label: system,
      onSelect: () => addSystem(system),
    }),
  );

  return (
    <AppShell
      breadcrumb={[{ label: 'Role Analysis' }]}
      activeGlobalItem={IDENTITY_ROLE_ANALYSIS_ROUTE}
      showSecondarySidebar={false}
    >
      <div className={styles.page}>
        <div className={styles.header}>
          <h1 className={styles.title}>Role Analyzer</h1>
          <p className={styles.subtitle}>Select entitlement scope for analysis</p>
        </div>

        <Stepper
          steps={STEPS}
          activeIndex={STEP_INDEX}
          interactive
          onStepSelect={(index) => {
            if (index === 0) navigate('#/identity/role-analysis');
          }}
          ariaLabel="Role Analyzer steps"
        />

        <Card
          title="Target systems (Required)"
          helper="Please select up to 5 systems to include in the analysis."
        >
          <div className={styles.targetSystemsPanel}>
            {selectedSystems.map((system) => (
              <span key={system} className={styles.chip}>
                {system}
                <button
                  type="button"
                  className={styles.chipRemove}
                  aria-label={`Remove ${system}`}
                  onClick={() => removeSystem(system)}
                >
                  <Icon name="X" size="12px" />
                </button>
              </span>
            ))}
            <Menu
              ariaLabel="Add target system"
              align="start"
              items={menuItems}
              trigger={({ ref, onClick, expanded }) => (
                <Button
                  ref={ref as Ref<HTMLButtonElement>}
                  variant="ghost"
                  size="s"
                  iconLead="Plus"
                  disabled={!canAddMore}
                  aria-haspopup="menu"
                  aria-expanded={expanded}
                  onClick={onClick}
                >
                  Add
                </Button>
              )}
            />
          </div>
        </Card>

        <Card title="Analysis focus" helper="Choose which entitlements to include and how inherited access should be handled.">
          <div className={styles.radioGroup}>
            <RadioOption
              name="analysis-focus"
              label="Business-relevant entitlements"
              helper="Focus on entitlements that help identify business roles and job-based access patterns."
              checked={analysisFocus === 'business-relevant'}
              onSelect={() => setAnalysisFocus('business-relevant')}
              badge={<Badge tone="info">Default</Badge>}
            />
            <RadioOption
              name="analysis-focus"
              label="All entitlements"
              helper="Include all entitlements from the selected target systems."
              checked={analysisFocus === 'all'}
              onSelect={() => setAnalysisFocus('all')}
            />
          </div>
        </Card>

        <Card title="Analysis refinements">
          <label className={styles.checkboxRow}>
            <Checkbox checked={excludeInherited} onChange={setExcludeInherited} />
            <span className={styles.checkboxText}>
              <span className={styles.checkboxLabel}>Exclude automatically inherited entitlements</span>
              <span className={styles.checkboxHelper}>
                Ignore entitlements users receive automatically through organizational memberships
                (such as departments, locations, or cost centers) or dynamic assignments.
              </span>
            </span>
          </label>
        </Card>

        <div className={styles.footer}>
          <Button variant="secondary" iconLead="ArrowLeft" onClick={() => navigate('#/identity/role-analysis')}>
            Go back
          </Button>
          <div className={styles.footerEnd}>
            <span className={styles.stepLabel}>Step 2 of 6</span>
            <Button
              variant="primary"
              iconTrail="ArrowRight"
              disabled={!canContinue}
            >
              Continue
            </Button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

interface RadioOptionProps {
  name: string;
  label: string;
  helper: string;
  checked: boolean;
  onSelect: () => void;
  badge?: ReactNode;
}

function RadioOption({ name, label, helper, checked, onSelect, badge }: RadioOptionProps) {
  return (
    <div className={styles.radioOption}>
      <label className={styles.radioRow}>
        <input
          type="radio"
          name={name}
          checked={checked}
          onChange={onSelect}
          className={styles.radioInput}
        />
        <span className={styles.radioDot} aria-hidden="true" />
        <span className={styles.radioLabel}>{label}</span>
        {badge}
      </label>
      <p className={styles.radioHelper}>{helper}</p>
    </div>
  );
}

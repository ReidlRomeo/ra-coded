import { useMemo, useState, type Ref } from 'react';
import { AppShell } from '../AppShell/AppShell.js';
import { navigate } from '../../lib/router.js';
import { IDENTITY_ROLE_ANALYSIS_ROUTE } from '../../lib/identityNav.js';
import { Card } from '../../components/Card/Card.js';
import { Button } from '../../components/Button/Button.js';
import { Icon } from '../../components/Icon/Icon.js';
import { Link } from '../../components/Link/Link.js';
import { Menu } from '../../components/Menu/Menu.js';
import { Stepper } from '../../components/Stepper/Stepper.js';
import { Tabs, type TabItem } from '../../components/Tabs/Tabs.js';
import { ROLE_ANALYZER_STEPS } from './roleAnalyzerSteps.js';
import { PopulationAlertModal } from './PopulationAlertModal.js';
import { IdentitiesPreviewModal } from './IdentitiesPreviewModal.js';
import styles from './RoleAnalysisPage.module.css';

/** Populations larger than this take too long to analyze reliably. */
const LARGE_POPULATION_THRESHOLD = 800;
const BASE_IDENTITIES_COUNT = 3291;

const FILTER_TABS: TabItem[] = [
  { value: 'filter', label: 'Filter', icon: 'FunnelSimple' },
  { value: 'query', label: 'Query', icon: 'BracketsCurly' },
  { value: 'ask-ai', label: 'Ask AI', icon: 'Sparkle' },
];

/** Mock filter conditions — each narrows the population by its own factor. */
const FILTER_OPTIONS = [
  { id: 'department', label: 'Department', factor: 0.72 },
  { id: 'location', label: 'Location', factor: 0.8 },
  { id: 'job-title', label: 'Job title', factor: 0.65 },
  { id: 'employee-type', label: 'Employee type', factor: 0.85 },
];

/** Mock excludable groups — each removes a fixed count from the population. */
const EXCLUDE_OPTIONS = [
  { id: 'contractors', label: 'Contractors', count: 210 },
  { id: 'service-accounts', label: 'Service accounts', count: 340 },
  { id: 'terminated', label: 'Terminated employees', count: 45 },
  { id: 'external-auditors', label: 'External auditors', count: 12 },
];

/**
 * RoleAnalysisPage — step 1 of the Role Analyzer wizard (`#/identity/role-analysis`).
 * Lets the user scope the identity population an analysis run will cover.
 */
export function RoleAnalysisPage() {
  const [filterTab, setFilterTab] = useState('filter');
  const [alertOpen, setAlertOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState<string[]>([]);
  const [excludedGroups, setExcludedGroups] = useState<string[]>([]);

  const identitiesCount = useMemo(() => {
    let n = BASE_IDENTITIES_COUNT;
    for (const id of appliedFilters) {
      const filter = FILTER_OPTIONS.find((o) => o.id === id);
      if (filter) n = Math.round(n * filter.factor);
    }
    for (const id of excludedGroups) {
      const exclude = EXCLUDE_OPTIONS.find((o) => o.id === id);
      if (exclude) n = Math.max(0, n - exclude.count);
    }
    return n;
  }, [appliedFilters, excludedGroups]);

  const filterMenuItems = FILTER_OPTIONS.filter((o) => !appliedFilters.includes(o.id)).map((o) => ({
    kind: 'item' as const,
    label: o.label,
    onSelect: () => setAppliedFilters((prev) => [...prev, o.id]),
  }));

  const excludeMenuItems = EXCLUDE_OPTIONS.filter((o) => !excludedGroups.includes(o.id)).map((o) => ({
    kind: 'item' as const,
    label: o.label,
    onSelect: () => setExcludedGroups((prev) => [...prev, o.id]),
  }));

  const goToStep2 = () => navigate('#/identity/role-analysis/entitlement-scope');

  const handleContinue = () => {
    if (identitiesCount > LARGE_POPULATION_THRESHOLD) {
      setAlertOpen(true);
      return;
    }
    goToStep2();
  };

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

        <Stepper steps={ROLE_ANALYZER_STEPS} activeIndex={0} ariaLabel="Role Analyzer steps" />

        <Card
          title="Filter identities for analysis"
          helper="Smaller, well-defined populations produce clearer role recommendations."
        >
          <Tabs items={FILTER_TABS} value={filterTab} onChange={setFilterTab} ariaLabel="Filter mode" />
          <div className={styles.filterPanel}>
            {appliedFilters.map((id) => {
              const filter = FILTER_OPTIONS.find((o) => o.id === id);
              if (!filter) return null;
              return (
                <span key={id} className={styles.chip}>
                  {filter.label}
                  <button
                    type="button"
                    className={styles.chipRemove}
                    aria-label={`Remove ${filter.label} filter`}
                    onClick={() => setAppliedFilters((prev) => prev.filter((f) => f !== id))}
                  >
                    <Icon name="X" size="12px" />
                  </button>
                </span>
              );
            })}
            <Menu
              ariaLabel="Add filter"
              align="start"
              items={filterMenuItems}
              trigger={({ ref, onClick, expanded }) => (
                <Button
                  ref={ref as Ref<HTMLButtonElement>}
                  variant="ghost"
                  size="s"
                  iconLead="Plus"
                  disabled={filterMenuItems.length === 0}
                  aria-haspopup="menu"
                  aria-expanded={expanded}
                  onClick={onClick}
                >
                  Add filter
                </Button>
              )}
            />
          </div>
        </Card>

        <Card
          title="Select identities to exclude"
          helper="Remove identities that should never be included in this role analysis."
        >
          <div className={styles.excludePanel}>
            {excludedGroups.map((id) => {
              const exclude = EXCLUDE_OPTIONS.find((o) => o.id === id);
              if (!exclude) return null;
              return (
                <span key={id} className={styles.chip}>
                  {exclude.label}
                  <button
                    type="button"
                    className={styles.chipRemove}
                    aria-label={`Remove ${exclude.label} exclusion`}
                    onClick={() => setExcludedGroups((prev) => prev.filter((e) => e !== id))}
                  >
                    <Icon name="X" size="12px" />
                  </button>
                </span>
              );
            })}
            <Menu
              ariaLabel="Exclude identities"
              align="start"
              items={excludeMenuItems}
              trigger={({ ref, onClick, expanded }) => (
                <Button
                  ref={ref as Ref<HTMLButtonElement>}
                  variant="ghost"
                  size="s"
                  iconLead="Minus"
                  disabled={excludeMenuItems.length === 0}
                  aria-haspopup="menu"
                  aria-expanded={expanded}
                  onClick={onClick}
                >
                  Exclude
                </Button>
              )}
            />
          </div>
        </Card>

        <p className={styles.count}>
          Identities selected for analysis:{' '}
          <Link
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setPreviewOpen(true);
            }}
          >
            {identitiesCount.toLocaleString()}
          </Link>
        </p>

        <div className={styles.footer}>
          <span className={styles.stepLabel}>Step 1 of 6</span>
          <Button variant="primary" iconTrail="ArrowRight" onClick={handleContinue}>
            Continue
          </Button>
        </div>
      </div>

      <PopulationAlertModal
        open={alertOpen}
        onClose={() => setAlertOpen(false)}
        onContinue={() => {
          setAlertOpen(false);
          goToStep2();
        }}
      />

      <IdentitiesPreviewModal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        count={identitiesCount}
      />
    </AppShell>
  );
}

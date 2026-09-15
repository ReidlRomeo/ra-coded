import { useMemo, useState, type Ref } from 'react';
import { Modal } from '../../components/Modal/Modal.js';
import { TextInput } from '../../components/TextInput/TextInput.js';
import { IconButton } from '../../components/IconButton/IconButton.js';
import { Link } from '../../components/Link/Link.js';
import { Menu, type MenuEntry } from '../../components/Menu/Menu.js';
import { DataTable, type DataTableColumn } from '../../components/DataTable/DataTable.js';
import { Pagination } from '../../components/Pagination/Pagination.js';
import { MOCK_IDENTITIES, type MockIdentity } from './mockIdentities.js';
import styles from './IdentitiesPreviewModal.module.css';

const PAGE_SIZE_OPTIONS = [20, 50, 100];

/** "Settings Menu main table IRIS" — column/view management for the table. */
const SETTINGS_MENU_ITEMS: MenuEntry[] = [
  { kind: 'item', label: 'Manage columns', icon: 'Columns' },
  { kind: 'divider' },
  { kind: 'item', label: 'Save current view', icon: 'Plus' },
  {
    kind: 'submenu',
    label: 'Saved views',
    icon: 'Eye',
    items: [{ kind: 'item', label: 'No saved views', disabled: true }],
  },
  { kind: 'item', label: 'Reset view', icon: 'ArrowCounterClockwise' },
];

export interface IdentitiesPreviewModalProps {
  open: boolean;
  onClose: () => void;
  /** Total identities selected for analysis (drives the modal title count). */
  count: number;
}

/**
 * IdentitiesPreviewModal — read-only preview of the identity population an
 * analysis run will cover (Figma: "Identities preview modal IRIS"). The
 * sample rows are illustrative only; they do not reflect the actual `count`.
 */
export function IdentitiesPreviewModal({ open, onClose, count }: IdentitiesPreviewModalProps) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return MOCK_IDENTITIES;
    return MOCK_IDENTITIES.filter(
      (row) => row.name.toLowerCase().includes(q) || row.email.toLowerCase().includes(q),
    );
  }, [search]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, pageCount);
  const pageRows = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  const columns: DataTableColumn<MockIdentity>[] = [
    { key: 'name', header: 'Name', icon: 'ArrowUp', grow: 1, minWidth: '260px', cell: (row) => <span className={styles.nameCell}>{row.name}</span> },
    {
      key: 'email',
      header: 'E-mail',
      grow: 1,
      minWidth: '240px',
      cell: (row) => (
        <Link href={`mailto:${row.email}`} onClick={(e) => e.preventDefault()}>
          {row.email}
        </Link>
      ),
    },
    { key: 'department', header: 'Primary department', grow: 1, minWidth: '220px', cell: (row) => row.department },
  ];

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="l"
      className={styles.modal}
      title={`Selected population to analyze (${count.toLocaleString()})`}
      leadingIcon="Users"
      footer={
        <div className={styles.paginationRow}>
          <Pagination
            page={safePage}
            pageCount={pageCount}
            onPageChange={setPage}
            pageSize={pageSize}
            pageSizeOptions={PAGE_SIZE_OPTIONS}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setPage(1);
            }}
            ariaLabel="Identities preview pages"
          />
        </div>
      }
    >
      <div className={styles.toolbar}>
        <TextInput
          iconLead="MagnifyingGlass"
          placeholder="Search identities"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className={styles.search}
        />
        <Menu
          ariaLabel="Table settings"
          align="end"
          items={SETTINGS_MENU_ITEMS}
          trigger={({ ref, onClick, expanded }) => (
            <IconButton
              ref={ref as Ref<HTMLButtonElement>}
              icon="SlidersHorizontal"
              ariaLabel="Table settings"
              variant="secondary"
              aria-haspopup="menu"
              aria-expanded={expanded}
              onClick={onClick}
            />
          )}
        />
      </div>

      <DataTable
        rows={pageRows}
        columns={columns}
        showActions={false}
        className={styles.table}
        ariaLabel="Selected identities"
      />
    </Modal>
  );
}

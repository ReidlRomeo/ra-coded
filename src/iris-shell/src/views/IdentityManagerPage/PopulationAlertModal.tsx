import { Button } from '../../components/Button/Button.js';
import { Icon } from '../../components/Icon/Icon.js';
import { Modal } from '../../components/Modal/Modal.js';
import styles from './PopulationAlertModal.module.css';

export interface PopulationAlertModalProps {
  open: boolean;
  /** "Revise" — closes the modal so the user can adjust filters. */
  onClose: () => void;
  /** "Continue with this identity population" — proceeds to the next step. */
  onContinue: () => void;
}

/**
 * PopulationAlertModal — shown when the selected identity population exceeds
 * the size that produces reliable role recommendations (Figma: "Population
 * alert modal IRIS").
 */
export function PopulationAlertModal({ open, onClose, onContinue }: PopulationAlertModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Identity Population Too Large for Accurate Analysis"
      leadingIcon={<WarningBadge />}
      iconPlacement="top"
      footer={
        <>
          <Button variant="secondary" onClick={onContinue}>
            Continue with this identity population
          </Button>
          <Button variant="primary" onClick={onClose}>
            Revise
          </Button>
        </>
      }
    >
      <p className={styles.body}>
        Analyzing this identity set will take significantly longer than expected and may result in
        unclear or low-quality recommendations. To improve performance and recommendation quality,
        please apply initial identity filters.
      </p>
    </Modal>
  );
}

function WarningBadge() {
  return (
    <span className={styles.warningBadge} aria-hidden="true">
      <Icon name="WarningCircle" size="20px" />
    </span>
  );
}

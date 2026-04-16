import type { ReactNode } from 'react';
import type { ScenarioPreview } from '../../model/types';
import s from './ScenarioCard.module.css';

interface Props {
  scenario: ScenarioPreview;
  onClick?: () => void;
  actions?: ReactNode;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function ScenarioCard({ scenario, onClick, actions }: Props) {
  return (
    <div className={s.card} onClick={onClick}>
      <div>
        <div className={s.title}>{scenario.title}</div>
        <div className={s.date}>{formatDate(scenario.updatedAt)}</div>
      </div>
      {actions && <div className={s.actions}>{actions}</div>}
    </div>
  );
}

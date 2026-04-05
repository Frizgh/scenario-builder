import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { nanoid } from 'nanoid';
import { fetchScenarios, createScenario, deleteScenario } from '../../api/scenarios';
import { useAsync } from '../../hooks/useAsync';
import type { Scenario, ScenarioPreview } from '../../types';
import Button from '../UI/Button';
import Spinner from '../UI/Spinner';
import s from './ScenarioList.module.css';

export default function ScenarioList() {
  const navigate = useNavigate();
  const { data: list, loading, error, run } = useAsync<ScenarioPreview[]>();

  const loadList = () => run(fetchScenarios());

  useEffect(() => {
    loadList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreate = async () => {
    const newScenario: Scenario = {
      id: nanoid(8),
      title: `Сценарий ${(list?.length ?? 0) + 1}`,
      updatedAt: new Date().toISOString(),
      nodes: [],
      edges: [],
    };
    await createScenario(newScenario);
    navigate(`/editor/${newScenario.id}`);
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm('Удалить сценарий?')) return;
    await deleteScenario(id);
    loadList();
  };

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className={s.page}>
      <div className={s.header}>
        <h1 className={s.title}>Сценарии</h1>
        <Button onClick={handleCreate}>+ Создать новый</Button>
      </div>

      {loading && <Spinner />}
      {error && <p className={s.error}>{error}</p>}

      {!loading && !error && list && (
        <>
          {list.length === 0 ? (
            <p className={s.empty}>Пока нет сценариев. Создайте первый!</p>
          ) : (
            <div className={s.list}>
              {list.map((item) => (
                <div
                  key={item.id}
                  className={s.card}
                  onClick={() => navigate(`/editor/${item.id}`)}
                >
                  <div>
                    <div className={s.cardTitle}>{item.title}</div>
                    <div className={s.cardDate}>{formatDate(item.updatedAt)}</div>
                  </div>
                  <div className={s.actions}>
                    <Button variant="danger" onClick={(e) => handleDelete(e, item.id)}>
                      Удалить
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

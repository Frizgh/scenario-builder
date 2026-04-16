import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { nanoid } from 'nanoid';
import {
  fetchScenarios,
  createScenario,
  deleteScenario,
  ScenarioCard,
  type Scenario,
  type ScenarioPreview,
} from '@/entities/scenario';
import { useAsync } from '@/shared/lib';
import { Button, Spinner } from '@/shared/ui';
import s from './ScenarioListPage.module.css';

export default function ScenarioListPage() {
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
                <ScenarioCard
                  key={item.id}
                  scenario={item}
                  onClick={() => navigate(`/editor/${item.id}`)}
                  actions={
                    <Button variant="danger" onClick={(e) => handleDelete(e, item.id)}>
                      Удалить
                    </Button>
                  }
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

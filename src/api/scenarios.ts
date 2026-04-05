import type { Scenario, ScenarioPreview } from '../types';

const STORAGE_KEY = 'scenarios';

function delay(ms = 350): Promise<void> {
  return new Promise((res) => setTimeout(res, ms));
}

function readStorage(): Scenario[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeStorage(data: Scenario[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

/** Получить список сценариев (превью) */
export async function fetchScenarios(): Promise<ScenarioPreview[]> {
  await delay();
  const all = readStorage();
  return all.map(({ id, title, updatedAt }) => ({ id, title, updatedAt }));
}

/** Получить один сценарий по id */
export async function fetchScenario(id: string): Promise<Scenario | null> {
  await delay(400);
  const all = readStorage();
  return all.find((s) => s.id === id) ?? null;
}

/** Создать новый сценарий */
export async function createScenario(scenario: Scenario): Promise<Scenario> {
  await delay(300);
  const all = readStorage();
  all.push(scenario);
  writeStorage(all);
  return scenario;
}

/** Сохранить (обновить) существующий сценарий */
export async function saveScenario(scenario: Scenario): Promise<Scenario> {
  await delay(400);
  const all = readStorage();
  const idx = all.findIndex((s) => s.id === scenario.id);
  if (idx === -1) {
    throw new Error('Сценарий не найден');
  }
  all[idx] = { ...scenario, updatedAt: new Date().toISOString() };
  writeStorage(all);
  return all[idx];
}

/** Удалить сценарий */
export async function deleteScenario(id: string): Promise<void> {
  await delay(300);
  const all = readStorage();
  writeStorage(all.filter((s) => s.id !== id));
}

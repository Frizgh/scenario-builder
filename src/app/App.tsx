import { Routes, Route } from 'react-router-dom';
import { ScenarioListPage } from '@/pages/scenario-list';
import { ScenarioEditorPage } from '@/pages/scenario-editor';
import { RouterProvider } from './providers';

export default function App() {
  return (
    <RouterProvider>
      <Routes>
        <Route path="/" element={<ScenarioListPage />} />
        <Route path="/editor/:id" element={<ScenarioEditorPage />} />
      </Routes>
    </RouterProvider>
  );
}

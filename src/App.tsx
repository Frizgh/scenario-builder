import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ScenarioList from './components/ScenarioList/ScenarioList';
import FlowEditor from './components/FlowEditor/FlowEditor';

export default function App() {
  return (
    <BrowserRouter basename="/scenario-builder">
      <Routes>
        <Route path="/" element={<ScenarioList />} />
        <Route path="/editor/:id" element={<FlowEditor />} />
      </Routes>
    </BrowserRouter>
  );
}

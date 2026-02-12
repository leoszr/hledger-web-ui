import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Reports from './pages/Reports';
import Investments from './pages/Investments';
import Projections from './pages/Projections';
import Journal from './pages/Journal';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="reports" element={<Reports />} />
          <Route path="investments" element={<Investments />} />
          <Route path="projections" element={<Projections />} />
          <Route path="journal" element={<Journal />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

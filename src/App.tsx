import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HomePage, DashboardPage } from './pages';
import { Notifications } from './components';

function App() {
  return (
    <BrowserRouter>
      <Notifications />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

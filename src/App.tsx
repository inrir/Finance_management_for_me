import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import Dashboard from '@/pages/Dashboard';
import AssetList from '@/pages/AssetList';
import AssetNew from '@/pages/AssetNew';
import AssetDetail from '@/pages/AssetDetail';
import Transactions from '@/pages/Transactions';
import Portfolio from '@/pages/Portfolio';
import History from '@/pages/History';
import Settings from '@/pages/Settings';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="assets" element={<AssetList />} />
          <Route path="assets/new" element={<AssetNew />} />
          <Route path="assets/:id" element={<AssetDetail />} />
          <Route path="transactions" element={<Transactions />} />
          <Route path="portfolio" element={<Portfolio />} />
          <Route path="history" element={<History />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

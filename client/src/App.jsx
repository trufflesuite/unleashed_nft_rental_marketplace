import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { EthProvider } from "./contexts/EthContext";
import { Layout } from "./layout";
import { Market } from "./market";
import { List } from "./list";

function App() {
  return (
    <EthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/market" replace />} />
            <Route path="market" element={<Market />} />
            <Route path="list" element={<List />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </EthProvider>
  );
}

export default App;

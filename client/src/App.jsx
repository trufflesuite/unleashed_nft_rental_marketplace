import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { InfuraProvider } from "./contexts/InfuraContext";
import { EthProvider } from "./contexts/EthContext";
import { MarketplaceProvider } from "./contexts/MarketplaceContext";
import { TimeProvider } from "./contexts/TimeContext";
import { Layout } from "./layout";
import { Market } from "./market";
import { Owned } from "./owned";
import { Rented } from "./rented";

function App() {
  return (
    <EthProvider>
      <InfuraProvider>
        <MarketplaceProvider>
          <TimeProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Layout />}>
                  <Route index element={<Navigate to="/market" replace />} />
                  <Route path="market" element={<Market />} />
                  <Route path="owned" element={<Owned />} />
                  <Route path="rented" element={<Rented />} />
                </Route>
              </Routes>
            </BrowserRouter>
          </TimeProvider>
        </MarketplaceProvider>
      </InfuraProvider>
    </EthProvider>
  );
}

export default App;

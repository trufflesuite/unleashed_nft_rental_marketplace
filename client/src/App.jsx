import { EthProvider } from "./contexts/EthContext";

function App() {
  return (
    <EthProvider>
      <div id="App" >
        <h1>unleashed</h1>
      </div>
    </EthProvider>
  );
}

export default App;

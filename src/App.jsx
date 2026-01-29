import { AppProvider } from "./contexts/AppContext";
import ForestScene from "./components/forestScene/ForestScene";

function App() {
  return (
    <AppProvider>
      <ForestScene />
    </AppProvider>
  );
}

export default App;

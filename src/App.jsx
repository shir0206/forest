import { AppProvider } from "./contexts/AppContext";
import ForestScene from "./components/3d/ForestScene/ForestScene";

function App() {
  return (
    <AppProvider>
      <ForestScene />
    </AppProvider>
  );
}

export default App;

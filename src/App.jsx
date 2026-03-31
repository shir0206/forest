import ForestScene from "./domains/scene/components/ForestScene/ForestScene";
import { AppProvider } from "./shared/contexts/AppContext";

function App() {
  return (
    <AppProvider>
      <ForestScene />
    </AppProvider>
  );
}

export default App;

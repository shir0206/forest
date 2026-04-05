import ForestScene from "./domains/scene/components/ForestScene/ForestScene";
import { AppProvider } from "./shared/context";

function App() {
  return (
    <AppProvider>
      <ForestScene />
    </AppProvider>
  );
}

export default App;

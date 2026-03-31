import { AppProvider } from "./domains/context";
import ForestScene from "./domains/scene/components/ForestScene/ForestScene";

function App() {
  return (
    <AppProvider>
      <ForestScene />
    </AppProvider>
  );
}

export default App;

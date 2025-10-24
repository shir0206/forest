import { useState } from "react";
import ForestScene from "./components/ForestScene";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <ForestScene />
    </>
  );
}

export default App;

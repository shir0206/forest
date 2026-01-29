import { useState } from "react";
import ForestScene from "./components/forestScene/ForestScene";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <h1>Shir</h1>
      <ForestScene />
    </>
  );
}

export default App;

import { useContextBridge } from "@react-three/drei";
import { AppContext } from "../contexts/AppContext";

export function ContextBridge({ children }: { children: React.ReactNode }) {
  const Bridge = useContextBridge(AppContext);
  return <Bridge>{children}</Bridge>;
}

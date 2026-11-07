import { createRoot } from "react-dom/client";
import { NucleusExplorer } from "../../src/components/learning/NucleusExplorer";
createRoot(document.getElementById("app")!).render(<><div style={{height: "65vh"}} /><NucleusExplorer /><div style={{height: "100vh"}} /></>);

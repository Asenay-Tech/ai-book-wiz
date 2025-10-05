// src/main.tsx
// import { createRoot } from "react-dom/client";
// import { BrowserRouter, Routes, Route } from "react-router-dom";
// import App from "./App";
// import ModuleTracker from "./pages/admin/debug/modules";
// import Upload from "./pages/Upload";
// import "./index.css";

// createRoot(document.getElementById("root")!).render(
//   <BrowserRouter>
//     <Routes>
//       <Route path="/" element={<App />} />
//       <Route path="/admin/debug/modules" element={<ModuleTracker />} />
//       <Route path="/upload" element={<Upload />} />
//     </Routes>
//   </BrowserRouter>
// );

// src/main.tsx
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);

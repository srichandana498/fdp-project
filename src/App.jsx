import React from "react";
import { HashRouter, Routes, Route } from "react-router-dom";

// Pages
import Navigation from "./pages/Navigation";
import Home from "./pages/Home";
import AttendancePage from "./pages/AttendancePage";
import AddClassPage from "./pages/AddClassPage";
import ViewAttendancePage from "./pages/ViewAttendancePage";

// Fallback for unknown routes
function NotFound() {
  return (
    <div style={{ padding: 24 }}>
      <h2>404 — Page not found</h2>
      <p>Check the URL or use the menu above to navigate.</p>
    </div>
  );
}

export default function App() {
  return (
    <HashRouter>
      {/* Navbar will always be shown */}
      <Navigation />

      {/* Routes */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/attendance" element={<AttendancePage />} />
        <Route path="/add-class" element={<AddClassPage />} />
        <Route path="/view-attendance" element={<ViewAttendancePage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </HashRouter>
  );
}
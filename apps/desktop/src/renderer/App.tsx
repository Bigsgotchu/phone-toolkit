import { BrowserRouter, HashRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LoginPage } from "./pages/LoginPage";
import { DeviceConnectPage } from "./pages/DeviceConnectPage";
import { DashboardPage } from "./pages/DashboardPage";
import { FileBrowserPage } from "./pages/FileBrowserPage";
import { BackupPage } from "./pages/BackupPage";
import { RestorePage } from "./pages/RestorePage";
import { JobHistoryPage } from "./pages/JobHistoryPage";
import { SettingsPage } from "./pages/SettingsPage";
import { OwnershipVerificationPage } from "./pages/OwnershipVerificationPage";
import { LockRecoveryGuidancePage } from "./pages/LockRecoveryGuidancePage";
import { FRPBypassPage } from "./pages/FRPBypassPage";
import { AppManagerPage } from "./pages/AppManagerPage";
import { DeviceDashboardPage } from "./pages/DeviceDashboardPage";
import "./index.css";

const queryClient = new QueryClient();

export default function App() {
  const Router = window.location.protocol === "file:" ? HashRouter : BrowserRouter;

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/connect" element={<DeviceConnectPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/files" element={<FileBrowserPage />} />
          <Route path="/backup" element={<BackupPage />} />
          <Route path="/restore" element={<RestorePage />} />
          <Route path="/jobs" element={<JobHistoryPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/ownership" element={<OwnershipVerificationPage />} />
          <Route path="/lock-recovery" element={<LockRecoveryGuidancePage />} />
          <Route path="/bypass" element={<FRPBypassPage />} />
          <Route path="/apps" element={<AppManagerPage />} />
          <Route path="/device-dashboard" element={<DeviceDashboardPage />} />
          <Route path="/register" element={<LoginPage />} />
          <Route path="/" element={<LoginPage />} />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

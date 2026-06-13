import { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import logo from "../assets/logo.png";
import { Card } from "../components/Card";

export function DashboardPage() {
  const location = useLocation();
  const [device, setDevice] = useState<any>(null);
  const deviceSerial = location.state?.deviceSerial;
  const [loading, setLoading] = useState(Boolean(deviceSerial));
  const [ownershipVerified, setOwnershipVerified] = useState(false);

  useEffect(() => {
    if (deviceSerial) {
      loadDevice();
      checkOwnership();
    }
  }, [deviceSerial]);

  const loadDevice = async () => {
    try {
      setLoading(true);
      const deviceInfo = await window.phoneToolkit.devices.getInfo(deviceSerial);
      setDevice(deviceInfo);
    } catch (error) {
      console.error("Failed to load device:", error);
    } finally {
      setLoading(false);
    }
  };

  const checkOwnership = async () => {
    try {
      const verified = await window.phoneToolkit.ownership.verify(deviceSerial);
      setOwnershipVerified(verified);
    } catch {
      setOwnershipVerified(false);
    }
  };

  if (loading) {
    return <div className="app-background page-content">Loading...</div>;
  }

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <img className="sidebar-logo" src={logo} alt="RinaWarp logo" />
          <div>
            <p className="sidebar-title">RinaWarp</p>
            <p className="sidebar-subtitle">Phone Toolkit</p>
          </div>
        </div>
        <nav className="sidebar-nav" aria-label="Primary">
          <Link className="sidebar-link active" to="/dashboard">Dashboard</Link>
          <Link className="sidebar-link" to="/connect">Device Info</Link>
          <Link className="sidebar-link" to="/files">Data Explorer</Link>
          <Link className="sidebar-link" to="/apps" state={{ deviceSerial }}>App Manager</Link>
          <Link className="sidebar-link" to="/device-dashboard" state={{ deviceSerial }}>Device Monitor</Link>
          <Link className="sidebar-link" to="/backup">Backup & Restore</Link>
          <Link className="sidebar-link" to="/settings">Settings</Link>
        </nav>
      </aside>
      <main className="content-area">
        <div className="page-content">
        <div className="dashboard-header">
          <div>
            <p className="brand-kicker">Welcome back</p>
            <h1 className="page-title">Device Dashboard</h1>
          </div>
          <img className="brand-logo" src={logo} alt="RinaWarp logo" />
        </div>
        
        {/* Authorization Warning */}
        {!ownershipVerified && (
          <Card className="notice-card">
            <p>
              <strong>Warning:</strong> Ownership verification required for recovery operations.
              <Link to="/ownership" state={{ deviceSerial }} className="text-link">
                Verify ownership
              </Link>
            </p>
          </Card>
        )}
        
        {device ? (
          <Card>
            <div className="device-info-grid">
              <Card title="Device Information">
                <div>
                  <p><span>Model:</span> {device.model}</p>
                  <p><span>Manufacturer:</span> {device.manufacturer}</p>
                  <p><span>Android Version:</span> {device.androidVersion}</p>
                  <p><span>API Level:</span> {device.apiVersion}</p>
                </div>
              </Card>
              
              <Card title="Battery & Storage">
                <div>
                  <p><span>Battery:</span> {device.batteryLevel}%</p>
                  <p><span>Storage:</span> {Math.round(device.storageTotal / 1024 / 1024)} MB total</p>
                  <p><span>Available:</span> {Math.round(device.storageAvailable / 1024 / 1024)} MB</p>
                </div>
              </Card>
            </div>
            
            <div className="action-grid">
              <Link
                to="/files"
                state={{ deviceSerial }}
                className="ui-card action-card"
              >
                <h3 className="action-card-title">Browse Files</h3>
                <p className="action-card-copy">Export and import files</p>
              </Link>
              <Link
                to="/backup"
                state={{ deviceSerial }}
                className="ui-card action-card"
              >
                <h3 className="action-card-title">Backup</h3>
                <p className="action-card-copy">Create device backup</p>
              </Link>
              <Link
                to="/restore"
                className="ui-card action-card"
              >
                <h3 className="action-card-title">Restore</h3>
                <p className="action-card-copy">Restore from backup</p>
              </Link>
              <Link
                to="/jobs"
                className="ui-card action-card"
              >
                <h3 className="action-card-title">Job History</h3>
                <p className="action-card-copy">View past operations</p>
              </Link>
              <Link
                to="/bypass"
                state={{ deviceSerial }}
                className="ui-card action-card action-danger"
              >
                <h3 className="action-card-title">FRP Bypass</h3>
                <p className="action-card-copy">Bypass factory reset protection</p>
              </Link>
              <Link
                to="/lock-recovery"
                state={{ deviceSerial }}
                className="ui-card action-card"
              >
                <h3 className="action-card-title">Device Access Guidance</h3>
                <p className="action-card-copy">Lawful recovery options for locked devices</p>
              </Link>
            </div>
          </Card>
        ) : (
          <Card>
            <p>No device connected</p>
          </Card>
        )}
      </div>
      </main>
    </div>
  );
}

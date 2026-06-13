import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import { Button } from "../components/Button";
import { Card } from "../components/Card";

export function DeviceConnectPage() {
  const [devices, setDevices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    checkDevices();
    const interval = setInterval(checkDevices, 3000);
    return () => clearInterval(interval);
  }, []);

  const checkDevices = async () => {
    try {
      setLoading(true);
      const result = await window.phoneToolkit?.devices?.list?.() ?? [];
      setDevices(result);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to list devices");
    } finally {
      setLoading(false);
    }
  };

  const handleDeviceConnect = async (serial: string) => {
    const device = devices.find(d => d.serial === serial);
    if (device?.state === "device") {
      navigate("/dashboard", { state: { deviceSerial: serial } });
    } else if (device?.state !== "device") {
      // Device unauthorized - offer FRP bypass option
      if (confirm("Device not authorized. Try FRP bypass?")) {
        navigate("/bypass", { state: { deviceSerial: serial } });
      } else {
        alert("Please enable USB debugging on your device.");
      }
    } else {
      alert("Please enable USB debugging on your device.");
    }
  };

  return (
    <div className="app-background auth-layout">
      <Card className="connect-card">
        <div className="brand-row">
          <img className="brand-logo" src={logo} alt="RinaWarp logo" />
          <div>
            <p className="brand-kicker">Device Link</p>
            <h1 className="page-title">Connect Your Device</h1>
          </div>
        </div>
        
        {loading ? (
          <div className="device-loading">
            <div className="spinner" />
            <p className="body-copy">Searching for devices...</p>
          </div>
        ) : error ? (
          <Card>
            <p>{error}</p>
            <Button
              variant="secondary"
              onClick={checkDevices}
            >
              Try Again
            </Button>
          </Card>
        ) : devices.length === 0 ? (
          <div className="device-empty">
            <p>No devices found</p>
            <p className="body-copy">
              Please connect your Android device via USB and enable USB debugging.
            </p>
            <Card title="USB Debugging Instructions:" className="instruction-card">
              <ol>
                <li>1. Go to Settings → About Phone</li>
                <li>2. Tap "Build Number" 7 times</li>
                <li>3. Go back to Settings → Developer Options</li>
                <li>4. Enable "USB Debugging"</li>
                <li>5. Connect device to computer</li>
              </ol>
            </Card>
          </div>
        ) : (
          <div className="device-list">
            {devices.map((device) => (
              <div
                key={device.serial}
                onClick={() => handleDeviceConnect(device.serial)}
                className="ui-card device-row"
              >
                <div>
                  <div>
                    <h3>{device.displayName || device.serial}</h3>
                    <p className="body-copy">{device.serial}</p>
                  </div>
                  <div>
                    <span className={`status-pill ${
                      device.state === "device" 
                        ? "status-connected"
                        : "status-unauthorized"
                    }`}>
                      {device.state === "device" ? "Connected" : "Unauthorized"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <Button
          variant="secondary"
          onClick={() => navigate("/dashboard")}
        >
          Skip for now
        </Button>
      </Card>
    </div>
  );
}

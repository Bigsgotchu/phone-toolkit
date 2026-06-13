import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export function LockRecoveryGuidancePage() {
  const location = useLocation();
  const deviceSerial = location.state?.deviceSerial;
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkDeviceAuthorization();
  }, [deviceSerial]);

  const checkDeviceAuthorization = async () => {
    if (!deviceSerial) {
      setLoading(false);
      return;
    }

    try {
      const devices = await window.phoneToolkit.devices.list();
      const device = devices.find((d: any) => d.serial === deviceSerial);
      setIsAuthorized(device?.state === "device");
    } catch (error) {
      console.error("Failed to check device:", error);
      setIsAuthorized(false);
    } finally {
      setLoading(false);
    }
  };

  const handleProceedAuthorized = () => {
    navigate("/files", { state: { deviceSerial } });
  };

  const handleOwnershipVerification = () => {
    navigate("/ownership", { state: { deviceSerial } });
  };

  if (loading) {
    return <div className="p-8 text-center">Checking device status...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="mx-auto max-w-4xl p-8">
        <h1 className="mb-6 text-2xl font-bold text-gray-800">Device Access Guidance</h1>
        
        {isAuthorized ? (
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="text-lg font-medium text-green-800 mb-4">✓ Device Authorized</h2>
            <p className="text-gray-600 mb-4">
              Your device is authorized for ADB debugging. You can proceed with normal operations.
            </p>
            <button
              onClick={handleProceedAuthorized}
              className="rounded-md bg-blue-600 px-6 py-2 text-white hover:bg-blue-700"
            >
              Proceed with File Operations
            </button>
          </div>
        ) : (
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="text-lg font-medium text-yellow-800 mb-4">⚠ Device Not Authorized</h2>
            
            <div className="mb-6 rounded-md bg-yellow-50 p-4">
              <h3 className="font-medium text-yellow-800">Lawful Recovery Options:</h3>
              <ul className="mt-2 list-inside text-sm text-yellow-700 space-y-1">
                <li><strong>Option 1:</strong> Ask the device owner to unlock and enable USB debugging</li>
                <li><strong>Option 2:</strong> Use your organization's EMM/MDM console for managed devices</li>
                <li><strong>Option 3:</strong> Perform factory reset with proof of ownership (requires verification)</li>
                <li><strong>Option 4:</strong> Contact device OEM or carrier for assistance</li>
              </ul>
            </div>
            
            <div className="rounded-md bg-blue-50 p-4 mb-4">
              <h3 className="font-medium text-blue-800">Important Notes:</h3>
              <ul className="mt-2 list-inside text-sm text-blue-700 space-y-1">
                <li>This tool does NOT bypass lock screens or security features</li>
                <li>All operations require proper authorization</li>
                <li>FRP (Factory Reset Protection) remains active unless administratively removed</li>
                <li>Enterprise-managed devices should be deprovisioned through official MDM channels</li>
              </ul>
            </div>
            
            <button
              onClick={handleOwnershipVerification}
              className="rounded-md bg-blue-600 px-6 py-2 text-white hover:bg-blue-700"
            >
              Verify Ownership & Continue
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
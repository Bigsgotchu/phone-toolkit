import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export function OwnershipVerificationPage() {
  const location = useLocation();
  const deviceSerial = location.state?.deviceSerial;
  const [formData, setFormData] = useState({
    customerName: "",
    deviceSerial: deviceSerial || "",
    imei: "",
    proofOfOwnershipRef: "",
    technicianName: "",
    authorizationConfirmed: false,
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const recordId = await window.phoneToolkit.ownership.create(formData);
      localStorage.setItem("ownershipRecordId", recordId);
      alert("Ownership verified successfully");
      navigate("/dashboard", { state: { deviceSerial: formData.deviceSerial } });
    } catch (error) {
      console.error("Failed to verify ownership:", error);
      alert("Failed to verify ownership");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="mx-auto max-w-2xl p-8">
        <h1 className="mb-6 text-2xl font-bold text-gray-800">Device Ownership Verification</h1>
        
        <div className="rounded-lg bg-white p-6 shadow">
          <p className="mb-4 text-gray-600">
            Before proceeding with recovery or destructive operations, please verify device ownership.
          </p>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Customer/Business Name *</label>
              <input
                type="text"
                value={formData.customerName}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Device Serial Number *</label>
              <input
                type="text"
                value={formData.deviceSerial}
                onChange={(e) => setFormData({ ...formData, deviceSerial: e.target.value })}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">IMEI (if available)</label>
              <input
                type="text"
                value={formData.imei}
                onChange={(e) => setFormData({ ...formData, imei: e.target.value })}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Proof of Ownership Reference *</label>
              <input
                type="text"
                value={formData.proofOfOwnershipRef}
                onChange={(e) => setFormData({ ...formData, proofOfOwnershipRef: e.target.value })}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
                placeholder="Receipt number, invoice, or other reference"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Technician Name *</label>
              <input
                type="text"
                value={formData.technicianName}
                onChange={(e) => setFormData({ ...formData, technicianName: e.target.value })}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
                required
              />
            </div>
            
            <div className="flex items-start space-x-2">
              <input
                type="checkbox"
                id="authorization"
                checked={formData.authorizationConfirmed}
                onChange={(e) => setFormData({ ...formData, authorizationConfirmed: e.target.checked })}
                required
                className="mt-1"
              />
              <label htmlFor="authorization" className="text-sm text-gray-700">
                I confirm that I have authorization to perform recovery operations on this device.
              </label>
            </div>
            
            <button
              type="submit"
              disabled={loading || !formData.authorizationConfirmed}
              className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Verifying..." : "Verify Ownership"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
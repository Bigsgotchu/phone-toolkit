import { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";

interface AppInfo {
  package: string;
  name: string;
  version: string;
  isSystem: boolean;
  enabled: boolean;
}

interface BatchOperation {
  action: "uninstall" | "clear" | "forceStop";
  packages: string[];
}

const COMMON_PERMISSIONS = [
  "android.permission.CAMERA",
  "android.permission.RECORD_AUDIO",
  "android.permission.ACCESS_FINE_LOCATION",
  "android.permission.READ_CONTACTS",
  "android.permission.WRITE_CONTACTS",
  "android.permission.READ_EXTERNAL_STORAGE",
  "android.permission.WRITE_EXTERNAL_STORAGE",
];

export function AppManagerPage() {
  const location = useLocation();
  const deviceSerial = location.state?.deviceSerial;
  
  const [apps, setApps] = useState<AppInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSystem, setShowSystem] = useState(false);
  const [selectedApp, setSelectedApp] = useState<AppInfo | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedApps, setSelectedApps] = useState<Set<string>>(new Set());
  const [showBatchActions, setShowBatchActions] = useState(false);

  useEffect(() => {
    if (deviceSerial) {
      loadApps();
    }
  }, [deviceSerial, showSystem]);

  const loadApps = async () => {
    if (!deviceSerial) return;

    setLoading(true);
    setError(null);

    try {
      const apps = await window.phoneToolkit.apps.list(deviceSerial, showSystem, searchQuery || undefined);
      setApps(apps);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load apps");
    } finally {
      setLoading(false);
    }
  };

  const handleUninstall = async (pkg: string) => {
    if (!deviceSerial || !window.confirm("Are you sure you want to uninstall this app? This cannot be undone.")) {
      return;
    }

    setActionLoading(`uninstall:${pkg}`);
    try {
      const result = await window.phoneToolkit.apps.uninstall(deviceSerial, pkg);
      if (result.success) {
        setApps(apps.filter((a) => a.package !== pkg));
      } else {
        alert(`Failed: ${result.message}`);
      }
    } catch (err) {
      alert(`Error: ${err}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleClearData = async (pkg: string) => {
    if (!deviceSerial || !window.confirm("Are you sure you want to clear all data for this app?")) {
      return;
    }

    setActionLoading(`clear:${pkg}`);
    try {
      const result = await window.phoneToolkit.apps.clearData(deviceSerial, pkg);
      if (!result.success) {
        alert(`Failed: ${result.message}`);
      } else {
        alert("Data cleared successfully");
      }
    } catch (err) {
      alert(`Error: ${err}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleForceStop = async (pkg: string) => {
    if (!deviceSerial) return;

    setActionLoading(`stop:${pkg}`);
    try {
      const result = await window.phoneToolkit.apps.forceStop(deviceSerial, pkg);
      if (!result.success) {
        alert(`Failed: ${result.message}`);
      } else {
        alert("App stopped successfully");
      }
    } catch (err) {
      alert(`Error: ${err}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleGrantPermission = async (pkg: string, permission: string) => {
    if (!deviceSerial) return;

    setActionLoading(`grant:${pkg}:${permission}`);
    try {
      const result = await window.phoneToolkit.apps.grantPermission(deviceSerial, pkg, permission);
      if (!result.success) {
        alert(`Failed: ${result.message}`);
      } else {
        alert("Permission granted");
      }
    } catch (err) {
      alert(`Error: ${err}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRevokePermission = async (pkg: string, permission: string) => {
    if (!deviceSerial) return;

    setActionLoading(`revoke:${pkg}:${permission}`);
    try {
      const result = await window.phoneToolkit.apps.revokePermission(deviceSerial, pkg, permission);
      if (!result.success) {
        alert(`Failed: ${result.message}`);
      } else {
        alert("Permission revoked");
      }
    } catch (err) {
      alert(`Error: ${err}`);
    } finally {
      setActionLoading(null);
    }
  };

  // Batch operations
  const handleBatchUninstall = async () => {
    if (!deviceSerial || selectedApps.size === 0) return;
    if (!window.confirm(`Uninstall ${selectedApps.size} apps?`)) return;

    setActionLoading("batch-uninstall");
    const results = [];
    
    for (const pkg of selectedApps) {
      const result = await window.phoneToolkit.apps.uninstall(deviceSerial, pkg);
      results.push({ pkg, success: result.success });
    }

    setSelectedApps(new Set());
    setActionLoading(null);
    alert(`Completed: ${results.filter(r => r.success).length}/${results.length} uninstalled`);
    loadApps();
  };

  const handleBatchClearData = async () => {
    if (!deviceSerial || selectedApps.size === 0) return;

    setActionLoading("batch-clear");
    
    for (const pkg of selectedApps) {
      await window.phoneToolkit.apps.clearData(deviceSerial, pkg);
    }

    setSelectedApps(new Set());
    setActionLoading(null);
    alert("Data cleared for all selected apps");
    loadApps();
  };

  const handleSelectAll = () => {
    if (selectedApps.size === apps.length) {
      setSelectedApps(new Set());
    } else {
      setSelectedApps(new Set(apps.map(a => a.package)));
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="mx-auto max-w-6xl p-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">App Manager</h1>
            <p className="text-gray-600">Manage apps on your device</p>
          </div>
          <Link
            to="/dashboard"
            state={{ deviceSerial }}
            className="text-blue-600 hover:text-blue-800"
          >
            ← Back to Dashboard
          </Link>
        </div>

        {!deviceSerial ? (
          <div className="rounded-lg bg-white p-6 shadow">
            <p className="text-gray-600">No device connected. Please connect a device first.</p>
            <Link
              to="/connect"
              className="mt-4 inline-block rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              Connect Device
            </Link>
          </div>
        ) : (
          <>
            {/* Controls */}
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <input
                  type="text"
                  placeholder="Search apps..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={showSystem}
                    onChange={(e) => setShowSystem(e.target.checked)}
                  />
                  <span>Show system apps</span>
                </label>
                <button
                  onClick={loadApps}
                  className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                >
                  Refresh
                </button>
              </div>
              <div className="flex items-center space-x-2">
                {selectedApps.size > 0 && (
                  <>
                    <span className="text-sm text-gray-600">{selectedApps.size} selected</span>
                    <button
                      onClick={handleBatchClearData}
                      disabled={actionLoading?.startsWith("batch")}
                      className="rounded-md bg-yellow-600 px-3 py-1 text-white text-sm hover:bg-yellow-700 disabled:opacity-50"
                    >
                      Clear Data
                    </button>
                    <button
                      onClick={handleBatchUninstall}
                      disabled={actionLoading?.startsWith("batch")}
                      className="rounded-md bg-red-600 px-3 py-1 text-white text-sm hover:bg-red-700 disabled:opacity-50"
                    >
                      Uninstall
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-4 rounded-md bg-red-50 p-4 text-red-800">
                {error}
              </div>
            )}

            {/* Apps List */}
            {loading ? (
              <div className="rounded-lg bg-white p-8 text-center text-gray-600">
                Loading apps...
              </div>
            ) : apps.length === 0 ? (
              <div className="rounded-lg bg-white p-8 text-center text-gray-600">
                No apps found
              </div>
            ) : (
              <div className="rounded-lg bg-white shadow">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="p-3 text-left">
                        <input
                          type="checkbox"
                          checked={selectedApps.size === apps.length && apps.length > 0}
                          onChange={handleSelectAll}
                        />
                      </th>
                      <th className="p-3 text-left">App</th>
                      <th className="p-3 text-left">Package</th>
                      <th className="p-3 text-left">Version</th>
                      <th className="p-3 text-left">Type</th>
                      <th className="p-3 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {apps.map((app) => (
                      <tr key={app.package} className="border-b hover:bg-gray-50">
                        <td className="p-3">
                          <input
                            type="checkbox"
                            checked={selectedApps.has(app.package)}
                            onChange={(e) => {
                              const newSelected = new Set(selectedApps);
                              if (e.target.checked) {
                                newSelected.add(app.package);
                              } else {
                                newSelected.delete(app.package);
                              }
                              setSelectedApps(newSelected);
                            }}
                          />
                        </td>
                        <td className="p-3">
                          <div className="font-medium">{app.name}</div>
                          <div className="text-sm text-gray-600">{app.package}</div>
                        </td>
                        <td className="p-3 font-mono text-sm">{app.package}</td>
                        <td className="p-3">{app.version}</td>
                        <td className="p-3">
                          <span
                            className={`rounded-full px-2 py-1 text-xs font-medium ${
                              app.isSystem
                                ? "bg-purple-100 text-purple-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {app.isSystem ? "System" : "User"}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => setSelectedApp(app)}
                              className="rounded-md bg-gray-600 px-3 py-1 text-white text-sm hover:bg-gray-700"
                            >
                              More
                            </button>
                            {!app.isSystem && (
                              <>
                                <button
                                  onClick={() => handleUninstall(app.package)}
                                  disabled={actionLoading === `uninstall:${app.package}`}
                                  className="rounded-md bg-red-600 px-3 py-1 text-white text-sm hover:bg-red-700 disabled:opacity-50"
                                >
                                  {actionLoading === `uninstall:${app.package}` ? "..." : "Uninstall"}
                                </button>
                                <button
                                  onClick={() => handleClearData(app.package)}
                                  disabled={actionLoading === `clear:${app.package}`}
                                  className="rounded-md bg-yellow-600 px-3 py-1 text-white text-sm hover:bg-yellow-700 disabled:opacity-50"
                                >
                                  {actionLoading === `clear:${app.package}` ? "..." : "Clear Data"}
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => handleForceStop(app.package)}
                              disabled={actionLoading === `stop:${app.package}`}
                              className="rounded-md bg-gray-500 px-3 py-1 text-white text-sm hover:bg-gray-600 disabled:opacity-50"
                            >
                              {actionLoading === `stop:${app.package}` ? "..." : "Force Stop"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* App Detail Modal */}
            {selectedApp && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                <div className="rounded-lg bg-white p-6 w-full max-w-md">
                  <h3 className="text-lg font-medium mb-4">{selectedApp.name}</h3>
                  <p className="text-sm text-gray-600 mb-4">Package: {selectedApp.package}</p>
                  
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Quick Actions:</p>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => {
                          handleForceStop(selectedApp.package);
                          setSelectedApp(null);
                        }}
                        className="rounded-md bg-gray-600 px-3 py-1 text-white text-sm"
                      >
                        Force Stop
                      </button>
                      {!selectedApp.isSystem && (
                        <>
                          <button
                            onClick={() => {
                              handleClearData(selectedApp.package);
                              setSelectedApp(null);
                            }}
                            className="rounded-md bg-yellow-600 px-3 py-1 text-white text-sm"
                          >
                            Clear Data
                          </button>
                          <button
                            onClick={() => {
                              handleUninstall(selectedApp.package);
                              setSelectedApp(null);
                            }}
                            className="rounded-md bg-red-600 px-3 py-1 text-white text-sm"
                          >
                            Uninstall
                          </button>
                        </>
                      )}
                    </div>
                    
                    <p className="text-sm font-medium mt-4">Permissions:</p>
                    <div className="max-h-48 overflow-y-auto">
                      {COMMON_PERMISSIONS.map((perm) => (
                        <div key={perm} className="flex items-center justify-between py-1 text-sm">
                          <span className="truncate">{perm.split(".").pop()}</span>
                          <div className="flex space-x-1">
                            <button
                              onClick={() => handleGrantPermission(selectedApp.package, perm)}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              Grant
                            </button>
                            <button
                              onClick={() => handleRevokePermission(selectedApp.package, perm)}
                              className="text-gray-600 hover:text-gray-800"
                            >
                              Revoke
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <button
                    onClick={() => setSelectedApp(null)}
                    className="mt-4 w-full rounded-md bg-gray-300 py-2 text-gray-700 hover:bg-gray-400"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
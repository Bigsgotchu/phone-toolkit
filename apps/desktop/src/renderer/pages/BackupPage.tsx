import { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";

interface BackupProfile {
  id: string;
  name: string;
  type: "MEDIA_ONLY" | "DOCUMENTS" | "FULL_STORAGE" | "CUSTOM";
  includePaths: string[];
  excludePaths: string[];
  createdAt: string;
}

interface BackupHistory {
  id: string;
  profileId: string;
  deviceSerial: string;
  status: "completed" | "failed" | "in_progress";
  progress: number;
  createdAt: string;
  sizeBytes: number;
}

const DEFAULT_PROFILES: BackupProfile[] = [
  {
    id: "media",
    name: "Media Only",
    type: "MEDIA_ONLY",
    includePaths: ["/sdcard/DCIM", "/sdcard/Movies", "/sdcard/Music", "/sdcard/Pictures"],
    excludePaths: [],
    createdAt: new Date().toISOString(),
  },
  {
    id: "documents",
    name: "Documents",
    type: "DOCUMENTS",
    includePaths: ["/sdcard/Documents", "/sdcard/Download", "/sdcard/Notes"],
    excludePaths: [],
    createdAt: new Date().toISOString(),
  },
  {
    id: "full",
    name: "Full Storage",
    type: "FULL_STORAGE",
    includePaths: ["/sdcard"],
    excludePaths: [],
    createdAt: new Date().toISOString(),
  },
];

export function BackupPage() {
  const location = useLocation();
  const deviceSerial = location.state?.deviceSerial;
  
  const [selectedProfile, setSelectedProfile] = useState<BackupProfile>(DEFAULT_PROFILES[0]);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [jobId, setJobId] = useState<string | null>(null);
  const [backups, setBackups] = useState<BackupHistory[]>([]);
  const [deviceBackups, setDeviceBackups] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"create" | "history" | "device">("create");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newProfileName, setNewProfileName] = useState("");
  const [customPaths, setCustomPaths] = useState("");

  useEffect(() => {
    if (deviceSerial) {
      loadDeviceBackups();
      loadBackupHistory();
    }
  }, [deviceSerial]);

  const loadDeviceBackups = async () => {
    if (!deviceSerial) return;
    try {
      const backups = await window.phoneToolkit.backup.list(deviceSerial);
      setDeviceBackups(backups);
    } catch (error) {
      console.error("Failed to load device backups:", error);
    }
  };

  const loadBackupHistory = async () => {
    // Mock backup history - in real implementation, this would come from the backend
    const history: BackupHistory[] = [
      {
        id: "1",
        profileId: "media",
        deviceSerial: deviceSerial || "unknown",
        status: "completed",
        progress: 100,
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        sizeBytes: 2.5 * 1024 * 1024 * 1024, // 2.5 GB
      },
      {
        id: "2",
        profileId: "documents",
        deviceSerial: deviceSerial || "unknown",
        status: "completed",
        progress: 100,
        createdAt: new Date(Date.now() - 172800000).toISOString(),
        sizeBytes: 512 * 1024 * 1024, // 512 MB
      },
    ];
    setBackups(history);
  };

  const handleBackup = async () => {
    if (!deviceSerial) return;

    setIsRunning(true);
    setProgress(0);

    try {
      const newJobId = await window.phoneToolkit.backup.runBackup(
        deviceSerial,
        selectedProfile.id,
        "/tmp/backups"
      );
      setJobId(newJobId);

      const interval = setInterval(async () => {
        const jobs = await window.phoneToolkit.jobs.list();
        const job = jobs.find((j) => j.id === newJobId);
        if (job) {
          setProgress(job.progress);
          if (job.status === "COMPLETED" || job.status === "FAILED") {
            clearInterval(interval);
            setIsRunning(false);
            loadBackupHistory();
          }
        }
      }, 1000);
    } catch (error) {
      console.error("Backup failed:", error);
      setIsRunning(false);
    }
  };

  const handleRestore = async (backupPath: string) => {
    if (!deviceSerial || !window.confirm("This will restore the backup and may overwrite existing data. Continue?")) {
      return;
    }

    try {
      await window.phoneToolkit.backup.restore(deviceSerial, backupPath, "/sdcard");
      alert("Restore initiated. Check device for confirmation.");
    } catch (error) {
      console.error("Restore failed:", error);
      alert(`Restore failed: ${error}`);
    }
  };

  const handleCreateProfile = async () => {
    if (!newProfileName.trim()) return;

    const newProfile: BackupProfile = {
      id: `custom_${Date.now()}`,
      name: newProfileName,
      type: "CUSTOM",
      includePaths: customPaths.split(",").map((p) => p.trim()).filter(Boolean),
      excludePaths: [],
      createdAt: new Date().toISOString(),
    };

    setShowCreateForm(false);
    setNewProfileName("");
    setCustomPaths("");
    alert(`Profile "${newProfileName}" created successfully`);
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="mx-auto max-w-6xl p-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Backup & Restore</h1>
            <p className="text-gray-600">Manage device backups and recovery</p>
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
            {/* Tabs */}
            <div className="mb-6">
              <nav className="flex space-x-4" aria-label="Tabs">
                <button
                  onClick={() => setActiveTab("create")}
                  className={`rounded-md px-4 py-2 text-sm font-medium ${
                    activeTab === "create"
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  Create Backup
                </button>
                <button
                  onClick={() => setActiveTab("history")}
                  className={`rounded-md px-4 py-2 text-sm font-medium ${
                    activeTab === "history"
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  Backup History
                </button>
                <button
                  onClick={() => setActiveTab("device")}
                  className={`rounded-md px-4 py-2 text-sm font-medium ${
                    activeTab === "device"
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  Device Backups ({deviceBackups.length})
                </button>
              </nav>
            </div>

            {/* Create Backup Tab */}
            {activeTab === "create" && (
              <div className="rounded-lg bg-white p-6 shadow">
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-lg font-medium text-gray-800">Backup Profile</h2>
                  <button
                    onClick={() => setShowCreateForm(true)}
                    className="rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700"
                  >
                    + New Profile
                  </button>
                </div>

                {/* Create Profile Form */}
                {showCreateForm && (
                  <div className="mb-6 rounded-lg border border-gray-200 p-4">
                    <h3 className="mb-4 text-md font-medium">Create Custom Profile</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Profile Name</label>
                        <input
                          type="text"
                          value={newProfileName}
                          onChange={(e) => setNewProfileName(e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Paths (comma-separated)
                        </label>
                        <input
                          type="text"
                          value={customPaths}
                          onChange={(e) => setCustomPaths(e.target.value)}
                          placeholder="/sdcard/Documents, /sdcard/Download"
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={handleCreateProfile}
                          className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                        >
                          Create
                        </button>
                        <button
                          onClick={() => setShowCreateForm(false)}
                          className="rounded-md bg-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-400"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mb-6 space-y-4">
                  {DEFAULT_PROFILES.map((profile) => (
                    <label
                      key={profile.id}
                      className={`flex cursor-pointer items-center rounded-lg border p-4 ${
                        selectedProfile.id === profile.id
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="profile"
                        checked={selectedProfile.id === profile.id}
                        onChange={() => setSelectedProfile(profile)}
                      />
                      <div className="ml-3">
                        <p className="font-medium">{profile.name}</p>
                        <p className="text-sm text-gray-600">
                          {profile.type} - {profile.includePaths.length} path(s)
                        </p>
                      </div>
                    </label>
                  ))}
                </div>

                <button
                  onClick={handleBackup}
                  disabled={isRunning || !deviceSerial}
                  className="rounded-md bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {isRunning ? `Backing up... ${progress}%` : "Start Backup"}
                </button>

                {isRunning && (
                  <div className="mt-4">
                    <div className="h-2 w-full rounded-full bg-gray-200">
                      <div
                        className="h-2 rounded-full bg-blue-600"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* History Tab */}
            {activeTab === "history" && (
              <div className="rounded-lg bg-white p-6 shadow">
                <h2 className="mb-4 text-lg font-medium text-gray-800">Backup History</h2>
                <div className="space-y-4">
                  {backups.length === 0 ? (
                    <p className="text-gray-600">No backup history found.</p>
                  ) : (
                    backups.map((backup) => (
                      <div key={backup.id} className="flex items-center justify-between rounded-lg border p-4">
                        <div>
                          <p className="font-medium">
                            {DEFAULT_PROFILES.find((p) => p.id === backup.profileId)?.name || backup.profileId}
                          </p>
                          <p className="text-sm text-gray-600">
                            {new Date(backup.createdAt).toLocaleString()} • {formatBytes(backup.sizeBytes)}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span
                            className={`rounded-full px-2 py-1 text-xs font-medium ${
                              backup.status === "completed"
                                ? "bg-green-100 text-green-800"
                                : backup.status === "failed"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {backup.status}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Device Backups Tab */}
            {activeTab === "device" && (
              <div className="rounded-lg bg-white p-6 shadow">
                <h2 className="mb-4 text-lg font-medium text-gray-800">Device Backups</h2>
                <p className="mb-4 text-sm text-gray-600">
                  Backups stored on device: {deviceBackups.length}
                </p>
                <div className="space-y-4">
                  {deviceBackups.length === 0 ? (
                    <p className="text-gray-600">No backups found on device.</p>
                  ) : (
                    deviceBackups.map((backup, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between rounded-lg border p-4"
                      >
                        <div>
                          <p className="font-medium">{backup.name}</p>
                          <p className="text-sm text-gray-600">
                            {new Date(backup.modified).toLocaleString()} • {formatBytes(backup.size)}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleRestore(backup.path)}
                            className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                          >
                            Restore
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
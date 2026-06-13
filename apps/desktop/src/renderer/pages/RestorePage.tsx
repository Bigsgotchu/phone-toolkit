import { useState, useEffect } from "react";

export function RestorePage() {
  const [backups, setBackups] = useState<any[]>([]);
  const [selectedBackup, setSelectedBackup] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBackups();
  }, []);

  const loadBackups = async () => {
    try {
      setLoading(true);
      const backups = await window.phoneToolkit.backup.listBackups();
      setBackups(backups);
    } catch (error) {
      console.error("Failed to load backups:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async () => {
    if (!selectedBackup) return;
    alert(`Restoring backup ${selectedBackup}...`);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="mx-auto max-w-4xl p-8">
        <h1 className="mb-6 text-2xl font-bold text-gray-800">Restore</h1>
        
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-lg font-medium text-gray-800">Select Backup</h2>
          
          {loading ? (
            <div className="text-center py-8 text-gray-600">Loading...</div>
          ) : backups.length === 0 ? (
            <div className="text-center py-8 text-gray-600">No backups found</div>
          ) : (
            <div className="space-y-4">
              {backups.map((backup) => (
                <label key={backup.backupId} className="flex items-center space-x-3 border p-4 rounded hover:bg-gray-50">
                  <input
                    type="radio"
                    name="backup"
                    checked={selectedBackup === backup.backupId}
                    onChange={() => setSelectedBackup(backup.backupId)}
                  />
                  <div>
                    <p className="font-medium">{backup.deviceModel}</p>
                    <p className="text-sm text-gray-600">
                      Created: {new Date(backup.createdAt).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600">
                      Files: {backup.fileCount} ({Math.round(backup.totalBytes / 1024 / 1024)} MB)
                    </p>
                  </div>
                </label>
              ))}
            </div>
          )}
          
          <button
            onClick={handleRestore}
            disabled={!selectedBackup}
            className="mt-6 rounded-md bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            Restore
          </button>
        </div>
      </div>
    </div>
  );
}
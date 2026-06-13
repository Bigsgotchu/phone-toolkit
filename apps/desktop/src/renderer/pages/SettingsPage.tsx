import { useState } from "react";

export function SettingsPage() {
  const [settings, setSettings] = useState({
    theme: "system" as const,
    language: "en",
    autoUpdates: true,
    defaultBackupLocation: "/tmp/backups",
    showHiddenFiles: false,
  });

  const saveSettings = async () => {
    try {
      await window.phoneToolkit.settings.update(settings);
      alert("Settings saved");
    } catch (error) {
      console.error("Failed to save settings:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="mx-auto max-w-4xl p-8">
        <h1 className="mb-6 text-2xl font-bold text-gray-800">Settings</h1>
        
        <div className="rounded-lg bg-white p-6 shadow">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Theme</label>
              <select
                value={settings.theme}
                onChange={(e) => setSettings({ ...settings, theme: e.target.value as any })}
                className="rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="system">System</option>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
              <select
                value={settings.language}
                onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                className="rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="en">English</option>
              </select>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="autoUpdates"
                checked={settings.autoUpdates}
                onChange={(e) => setSettings({ ...settings, autoUpdates: e.target.checked })}
                className="rounded border-gray-300"
              />
              <label htmlFor="autoUpdates" className="text-gray-700">Enable auto updates</label>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Default Backup Location</label>
              <input
                type="text"
                value={settings.defaultBackupLocation}
                onChange={(e) => setSettings({ ...settings, defaultBackupLocation: e.target.value })}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="showHiddenFiles"
                checked={settings.showHiddenFiles}
                onChange={(e) => setSettings({ ...settings, showHiddenFiles: e.target.checked })}
                className="rounded border-gray-300"
              />
              <label htmlFor="showHiddenFiles" className="text-gray-700">Show hidden files</label>
            </div>
            
            <button
              onClick={saveSettings}
              className="rounded-md bg-blue-600 px-6 py-2 text-white hover:bg-blue-700"
            >
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
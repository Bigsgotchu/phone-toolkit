import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

export function FileBrowserPage() {
  const location = useLocation();
  const deviceSerial = location.state?.deviceSerial;
  const [files, setFiles] = useState<any[]>([]);
  const [currentPath, setCurrentPath] = useState("/sdcard/Download");
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (deviceSerial) {
      listFiles(currentPath);
    }
  }, [deviceSerial, currentPath]);

  const listFiles = async (path: string) => {
    try {
      setLoading(true);
      const result = await window.phoneToolkit.files.list(deviceSerial, path);
      setFiles(result);
    } catch (error) {
      console.error("Failed to list files:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    alert(`Exporting ${selectedFiles.size} files...`);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="mx-auto max-w-6xl p-8">
        <h1 className="mb-6 text-2xl font-bold text-gray-800">File Browser</h1>
        
        <div className="mb-4 flex items-center justify-between">
          <div className="text-gray-600">Path: {currentPath}</div>
          <div className="space-x-2">
            <button
              onClick={handleExport}
              disabled={selectedFiles.size === 0}
              className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              Export Selected
            </button>
          </div>
        </div>
        
        <div className="rounded-lg bg-white shadow">
          {loading ? (
            <div className="p-8 text-center text-gray-600">Loading...</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="p-2 text-left">Select</th>
                  <th className="p-2 text-left">Name</th>
                  <th className="p-2 text-right">Size</th>
                  <th className="p-2 text-left">Modified</th>
                </tr>
              </thead>
              <tbody>
                {files.map((file) => (
                  <tr key={file.path} className="border-b hover:bg-gray-50">
                    <td className="p-2">
                      <input
                        type="checkbox"
                        checked={selectedFiles.has(file.path)}
                        onChange={(e) => {
                          const newSelected = new Set(selectedFiles);
                          if (e.target.checked) {
                            newSelected.add(file.path);
                          } else {
                            newSelected.delete(file.path);
                          }
                          setSelectedFiles(newSelected);
                        }}
                      />
                    </td>
                    <td className="p-2">{file.name}</td>
                    <td className="p-2 text-right">{file.size}</td>
                    <td className="p-2">{file.modified}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
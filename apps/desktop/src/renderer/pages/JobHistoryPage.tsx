import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

export function JobHistoryPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadJobs();
    const interval = setInterval(loadJobs, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadJobs = async () => {
    try {
      setLoading(true);
      const jobs = await window.phoneToolkit.jobs.list();
      setJobs(jobs);
    } catch (error) {
      console.error("Failed to load jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED": return "bg-green-100 text-green-800";
      case "FAILED": return "bg-red-100 text-red-800";
      case "RUNNING": return "bg-blue-100 text-blue-800";
      case "CANCELED": return "bg-gray-100 text-gray-800";
      default: return "bg-yellow-100 text-yellow-800";
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="mx-auto max-w-6xl p-8">
        <h1 className="mb-6 text-2xl font-bold text-gray-800">Job History</h1>
        
        {loading ? (
          <div className="text-center py-8 text-gray-600">Loading...</div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-8 text-gray-600">No jobs found</div>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => (
              <div key={job.id} className="rounded-lg bg-white p-4 shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-800">{job.type}</h3>
                    <p className="text-sm text-gray-600">
                      Device: {job.deviceSerial}
                    </p>
                    <p className="text-sm text-gray-600">
                      Created: {new Date(job.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(job.status)}`}>
                      {job.status}
                    </span>
                    {job.errorMessage && (
                      <p className="mt-1 text-sm text-red-600">{job.errorMessage}</p>
                    )}
                  </div>
                </div>
                
                {job.status === "RUNNING" && (
                  <div className="mt-3">
                    <div className="h-2 w-full rounded-full bg-gray-200">
                      <div className="h-2 rounded-full bg-blue-600" style={{ width: `${job.progress}%` }}></div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
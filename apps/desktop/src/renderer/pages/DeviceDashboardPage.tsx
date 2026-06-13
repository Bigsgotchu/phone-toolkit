import { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";

interface DeviceMetrics {
  battery: {
    level: number;
    health: string;
    plugged: string;
    temperature: number;
    voltage: number;
    status: string;
  };
  memory: {
    totalRam: number;
    usedRam: number;
    freeRam: number;
    cachedRam: number;
    memUsagePercent: number;
  };
  health: {
    cpuUsage: number;
    gpuUsage: number;
    temperature: number;
    fps: number;
    healthScore: number;
  };
  network: Array<{
    interface: string;
    address: string;
    mask: string;
    gateway?: string;
    dns?: string;
  }>;
}

export function DeviceDashboardPage() {
  const location = useLocation();
  const deviceSerial = location.state?.deviceSerial;
  
  const [metrics, setMetrics] = useState<DeviceMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    if (deviceSerial) {
      loadMetrics();
      
      if (autoRefresh) {
        const interval = setInterval(loadMetrics, 5000);
        return () => clearInterval(interval);
      }
    }
  }, [deviceSerial, autoRefresh]);

  const loadMetrics = async () => {
    if (!deviceSerial) return;

    setRefreshing(true);
    setError(null);

    try {
      const data = await window.phoneToolkit.device.getMetrics(deviceSerial);
      setMetrics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load device metrics");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getBatteryColor = (level: number) => {
    if (level > 80) return "text-green-500";
    if (level > 40) return "text-yellow-500";
    return "text-red-500";
  };

  const getHealthColor = (score: number) => {
    if (score > 80) return "text-green-500";
    if (score > 50) return "text-yellow-500";
    return "text-red-500";
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="mx-auto max-w-6xl p-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Device Dashboard</h1>
            <p className="text-gray-600">Real-time device monitoring and health</p>
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
        ) : loading ? (
          <div className="rounded-lg bg-white p-8 text-center text-gray-600">
            Loading device metrics...
          </div>
        ) : error ? (
          <div className="rounded-lg bg-red-50 p-6 text-red-800">
            {error}
            <button
              onClick={loadMetrics}
              className="ml-4 rounded-md bg-red-600 px-4 py-2 text-white"
            >
              Retry
            </button>
          </div>
        ) : metrics ? (
          <>
            {/* Auto-refresh toggle */}
            <div className="mb-4 flex items-center space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                />
                <span>Auto-refresh (5s)</span>
              </label>
              <button
                onClick={loadMetrics}
                disabled={refreshing}
                className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {refreshing ? "Refreshing..." : "Refresh Now"}
              </button>
            </div>

            {/* Battery Card */}
            <div className="mb-6 rounded-lg bg-white p-6 shadow">
              <h2 className="mb-4 text-lg font-medium text-gray-800">Battery Status</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className={`text-3xl font-bold ${getBatteryColor(metrics.battery.level)}`}>
                    {metrics.battery.level}%
                  </p>
                  <p className="text-gray-600 text-sm">Level</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-medium">{metrics.battery.health}</p>
                  <p className="text-gray-600 text-sm">Health</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-medium">{metrics.battery.plugged}</p>
                  <p className="text-gray-600 text-sm">Charging</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-medium">{metrics.battery.temperature}°C</p>
                  <p className="text-gray-600 text-sm">Temperature</p>
                </div>
              </div>
            </div>

            {/* Memory Card */}
            <div className="mb-6 rounded-lg bg-white p-6 shadow">
              <h2 className="mb-4 text-lg font-medium text-gray-800">Memory & Storage</h2>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span>RAM Usage</span>
                    <span>{metrics.memory.memUsagePercent}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-gray-200">
                    <div
                      className="h-2 rounded-full bg-blue-600"
                      style={{ width: `${metrics.memory.memUsagePercent}%` }}
                    ></div>
                  </div>
                  <div className="mt-2 grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Total</p>
                      <p className="font-medium">{formatBytes(metrics.memory.totalRam)}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Used</p>
                      <p className="font-medium">{formatBytes(metrics.memory.usedRam)}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Free</p>
                      <p className="font-medium">{formatBytes(metrics.memory.freeRam)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Device Health Card */}
            <div className="mb-6 rounded-lg bg-white p-6 shadow">
              <h2 className="mb-4 text-lg font-medium text-gray-800">Device Health</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold">{metrics.health.cpuUsage}%</p>
                  <p className="text-gray-600 text-sm">CPU Usage</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{metrics.health.temperature}°C</p>
                  <p className="text-gray-600 text-sm">Temperature</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{metrics.health.fps}</p>
                  <p className="text-gray-600 text-sm">FPS</p>
                </div>
                <div className="text-center">
                  <p className={`text-2xl font-bold ${getHealthColor(metrics.health.healthScore)}`}>
                    {metrics.health.healthScore}
                  </p>
                  <p className="text-gray-600 text-sm">Health Score</p>
                </div>
              </div>
            </div>

            {/* Network Card */}
            <div className="rounded-lg bg-white p-6 shadow">
              <h2 className="mb-4 text-lg font-medium text-gray-800">Network Interfaces</h2>
              {metrics.network.length > 0 ? (
                <div className="space-y-2">
                  {metrics.network.map((net, i) => (
                    <div key={i} className="flex items-center justify-between rounded-md border p-3">
                      <div>
                        <p className="font-medium">{net.interface}</p>
                        <p className="text-sm text-gray-600">{net.address} / {net.mask}</p>
                      </div>
                      {net.gateway && (
                        <p className="text-sm">Gateway: {net.gateway}</p>
                      )}
                      {net.dns && (
                        <p className="text-sm">DNS: {net.dns}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">No network interfaces detected</p>
              )}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
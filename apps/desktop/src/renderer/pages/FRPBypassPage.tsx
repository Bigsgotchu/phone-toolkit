import { useState, useEffect } from "react";

type BypassMethod = {
  id: string;
  name: string;
  category: "adb" | "interface" | "system" | "hardware";
  supportedBrands: string[];
  supportedVersions: string;
  estimatedTime: string;
};

type AnalysisResult = {
  vulnerabilityScore: number;
  recommendedMethods: string[];
  securityAssessment: string;
};

export function FRPBypassPage() {
  const [deviceSerial, setDeviceSerial] = useState("");
  const [methods, setMethods] = useState<BypassMethod[]>([]);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [executing, setExecuting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState("");
  const [result, setResult] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = window.phoneToolkit.onBypassProgress?.((data) => {
      setProgress(data.progress);
      setCurrentStep(data.step);
    });
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const loadMethods = async () => {
    const bypassMethods = await window.phoneToolkit.bypass.methods();
    setMethods(bypassMethods);
  };

  const analyzeDevice = async () => {
    if (!deviceSerial) return;
    const analysisResult = await window.phoneToolkit.bypass.analyzeDevice(deviceSerial);
    setAnalysis(analysisResult);
  };

  const executeBypass = async () => {
    if (!deviceSerial || !selectedMethod) return;

    setExecuting(true);
    setProgress(0);
    setCurrentStep("Starting bypass...");

    try {
      const outcome = await window.phoneToolkit.bypass.execute(deviceSerial, selectedMethod);
      setProgress(100);
      setCurrentStep("Completed");
      setResult(outcome);
    } catch (error: any) {
      setResult(`Error: ${error.message}`);
    } finally {
      setExecuting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-6 text-2xl font-bold text-gray-800">FRP Bypass Toolkit</h1>

        <div className="mb-6 rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-lg font-medium">Device Connection</h2>
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Device Serial"
              value={deviceSerial}
              onChange={(e) => setDeviceSerial(e.target.value)}
              className="flex-1 rounded-md border p-2"
            />
            <button
              onClick={loadMethods}
              className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              Load Methods
            </button>
            <button
              onClick={analyzeDevice}
              className="rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700"
            >
              Analyze Device
            </button>
          </div>
        </div>

        {analysis && (
          <div className="mb-6 rounded-lg bg-blue-50 p-4">
            <h3 className="font-medium text-blue-800">Device Analysis</h3>
            <p className="text-sm text-blue-700">
              Vulnerability Score: {(analysis.vulnerabilityScore * 100).toFixed(0)}%
            </p>
            <p className="text-sm text-blue-700">
              Assessment: {analysis.securityAssessment}
            </p>
          </div>
        )}

        <div className="mb-6 rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-lg font-medium">Available Bypass Methods</h2>

          {methods.length === 0 && (
            <p className="text-gray-600">Click "Load Methods" to see available bypass methods.</p>
          )}

          <div className="space-y-3">
            {methods.map((method) => (
              <div
                key={method.id}
                className={`rounded-lg border p-4 cursor-pointer transition-all ${
                  selectedMethod === method.id ? "border-blue-500 bg-blue-50" : "border-gray-200"
                }`}
                onClick={() => setSelectedMethod(method.id)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{method.name}</h3>
                    <p className="text-sm text-gray-600">{method.category} exploit</p>
                    <p className="text-sm text-gray-500">
                      Android {method.supportedVersions}
                    </p>
                  </div>
                  <span className="text-xs bg-gray-200 px-2 py-1 rounded">{method.estimatedTime}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {selectedMethod && (
          <div className="mb-6 rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-lg font-medium">Execute Bypass</h2>

            {executing && (
              <div className="mb-4">
                <div className="mb-2 flex justify-between text-sm">
                  <span>{currentStep}</span>
                  <span>{progress}%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded">
                  <div
                    className="h-2 bg-blue-600 rounded transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {result && (
              <div className={`mb-4 rounded-md p-4 ${
                typeof result === "string" && result.includes("success") ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
              }`}>
                Result: {typeof result === "object" ? JSON.stringify(result) : result}
              </div>
            )}

            <button
              onClick={executeBypass}
              disabled={executing}
              className="rounded-md bg-red-600 px-6 py-2 text-white hover:bg-red-700 disabled:opacity-50"
            >
              {executing ? "Executing..." : "Start Bypass"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
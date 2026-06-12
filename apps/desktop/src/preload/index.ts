import { contextBridge, ipcRenderer } from "electron";

const phoneToolkitApi = {
  // Devices
  devices: {
    list: () => ipcRenderer.invoke("devices:list"),
    getInfo: (serial: string) => ipcRenderer.invoke("devices:get-info", serial),
  },
  
  // Files
  files: {
    list: (serial: string, path: string) => ipcRenderer.invoke("files:list", serial, path),
    pull: (serial: string, source: string, target: string) => ipcRenderer.invoke("files:pull", serial, source, target),
    push: (serial: string, source: string, target: string) => ipcRenderer.invoke("files:push", serial, source, target),
  },

  // Jobs
  jobs: {
    list: () => ipcRenderer.invoke("jobs:list"),
    get: (id: string) => ipcRenderer.invoke("jobs:get", id),
    start: (id: string) => ipcRenderer.invoke("jobs:start", id),
    cancel: (id: string) => ipcRenderer.invoke("jobs:cancel", id),
    retry: (id: string) => ipcRenderer.invoke("jobs:retry", id),
  },

// Backup
   backup: {
     createProfile: (profile: any) => ipcRenderer.invoke("backup:create-profile", profile),
     listProfiles: () => ipcRenderer.invoke("backup:list-profiles"),
     runBackup: (deviceSerial: string, profileId: string, outputDir: string, ownershipRecordId?: string) => 
       ipcRenderer.invoke("backup:run", deviceSerial, profileId, outputDir, ownershipRecordId),
     list: (serial: string) => ipcRenderer.invoke("backup:list", serial),
     create: (serial: string, profile: any) => ipcRenderer.invoke("backup:create", serial, profile),
     restore: (serial: string, backupPath: string, targetPath: string) => 
       ipcRenderer.invoke("backup:restore", serial, backupPath, targetPath),
     delete: (serial: string, backupPath: string) => ipcRenderer.invoke("backup:delete", serial, backupPath),
     getManifest: (serial: string, backupPath: string) => 
       ipcRenderer.invoke("backup:get-manifest", serial, backupPath),
     listBackups: (deviceSerial?: string) => ipcRenderer.invoke("backup:list-backups", deviceSerial),
   },

  // License
  license: {
    getStatus: () => ipcRenderer.invoke("license:get-status"),
    activate: () => ipcRenderer.invoke("license:activate"),
    deactivate: () => ipcRenderer.invoke("license:deactivate"),
  },

  // Ownership Verification
  ownership: {
    create: (record: any) => ipcRenderer.invoke("ownership:create", record),
    get: (deviceSerial: string) => ipcRenderer.invoke("ownership:get", deviceSerial),
    verify: (deviceSerial: string) => ipcRenderer.invoke("ownership:verify", deviceSerial),
  },

  // Audit Log
  audit: {
    log: (entry: any) => ipcRenderer.invoke("audit:log", entry),
    list: (deviceId?: string) => ipcRenderer.invoke("audit:list", deviceId),
    exportCsv: () => ipcRenderer.invoke("audit:export"),
  },

  // Settings
  settings: {
    get: () => ipcRenderer.invoke("settings:get"),
    update: (settings: any) => ipcRenderer.invoke("settings:update", settings),
  },

  // FRP Bypass
  bypass: {
    methods: () => ipcRenderer.invoke("bypass:methods"),
    execute: (serial: string, methodId: string) => ipcRenderer.invoke("bypass:execute", serial, methodId),
    analyzeDevice: (serial: string) => ipcRenderer.invoke("bypass:analyze-device", serial),
  },

  // App Management
  apps: {
    list: (serial: string, showSystem?: boolean, filter?: string) => 
      ipcRenderer.invoke("apps:list", serial, showSystem, filter),
    install: (serial: string, apkPath: string, replace?: boolean, grantPermissions?: boolean) =>
      ipcRenderer.invoke("apps:install", serial, apkPath, replace, grantPermissions),
    uninstall: (serial: string, packageName: string, keepData?: boolean) =>
      ipcRenderer.invoke("apps:uninstall", serial, packageName, keepData),
    clearData: (serial: string, packageName: string) =>
      ipcRenderer.invoke("apps:clear-data", serial, packageName),
    grantPermission: (serial: string, packageName: string, permission: string) =>
      ipcRenderer.invoke("apps:grant-permission", serial, packageName, permission),
    revokePermission: (serial: string, packageName: string, permission: string) =>
      ipcRenderer.invoke("apps:revoke-permission", serial, packageName, permission),
    forceStop: (serial: string, packageName: string) =>
      ipcRenderer.invoke("apps:force-stop", serial, packageName),
    start: (serial: string, packageName: string, activityName?: string) =>
      ipcRenderer.invoke("apps:start", serial, packageName, activityName),
  },

  // Device Monitoring
  device: {
    getMetrics: (serial: string) => ipcRenderer.invoke("device:metrics", serial),
    getMemory: (serial: string) => ipcRenderer.invoke("device:memory", serial),
    getBattery: (serial: string) => ipcRenderer.invoke("device:battery", serial),
    getNetwork: (serial: string) => ipcRenderer.invoke("device:network", serial),
    getHealth: (serial: string) => ipcRenderer.invoke("device:health", serial),
  },

  // ADB Logcat & Screenshot
  adb: {
    logcat: {
      start: (serial: string, filters?: string[]) => ipcRenderer.invoke("adb:logcat:start", serial, filters),
      clear: (serial: string) => ipcRenderer.invoke("adb:logcat:clear", serial),
    },
    screenshot: (serial: string, outputFile: string) => ipcRenderer.invoke("adb:screenshot", serial, outputFile),
    screenrecord: {
      start: (serial: string, outputFile: string, options?: any) => 
        ipcRenderer.invoke("adb:screenrecord:start", serial, outputFile, options),
    },
  },

  // Events
  onJobProgress: (callback: (progress: any) => void) =>
    ipcRenderer.on("job-progress", (_: any, progress: any) => callback(progress)),
  onJobCompleted: (callback: (jobId: string) => void) =>
    ipcRenderer.on("job-completed", (_: any, jobId: string) => callback(jobId)),
  onBypassProgress: (callback: (progress: { serial: string; methodId: string; step: string; progress: number }) => void) => {
    const listener = (_: any, progress: any) => callback(progress);
    ipcRenderer.on("bypass:progress", listener);
    return () => ipcRenderer.removeListener("bypass:progress", listener);
  },
};

contextBridge.exposeInMainWorld("phoneToolkit", {
  ...phoneToolkitApi,
  isDevelopment: (): Promise<boolean> =>
    ipcRenderer.invoke("app:is-development"),
});

export type PhoneToolkitAPI = typeof phoneToolkitApi;
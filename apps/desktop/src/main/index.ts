// Load electron - use require for compatibility with Electron binary
// The electron binary intercepts require('electron') calls
const electron: { app: any; BrowserWindow: any; ipcMain: any } = require("electron");
const { app, BrowserWindow, ipcMain } = electron;

import * as path from "path";

let mainWindow: InstanceType<typeof BrowserWindow> | null = null;

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 820,
    webPreferences: {
      preload: path.join(__dirname, "../preload/index.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  // Security: Set Content Security Policy before loading
  mainWindow.webContents.on("will-navigate", (event: any, navigationUrl: string) => {
    const csp = "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self' ws://localhost:* ws://127.0.0.1:*; frame-ancestors 'none';";
    mainWindow?.webContents.insertCSS(`meta[http-equiv="Content-Security-Policy"][content="${csp}"]`);
  });

  if (!app.isPackaged && process.env.PHONE_TOOLKIT_E2E !== "1") {
    mainWindow.loadURL("http://localhost:5173");
  } else {
    mainWindow.loadFile(path.join(__dirname, "../renderer/index.html"));
  }

  // Security: Disable devtools in production
  if (app.isPackaged) {
    mainWindow.webContents.on("devtools-opened", () => {
      mainWindow?.webContents.closeDevTools();
    });
  }
};

app.on("ready", () => {
  createWindow();
  registerIPCHandlers();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

function registerIPCHandlers() {
  // ============ DEVICE HANDLERS ============
  ipcMain.handle("devices:list", async () => {
    if (process.env.PHONE_TOOLKIT_E2E === "1") {
      return [];
    }

    const { AdbService } = require("./services/adb.service");
    const adb = new AdbService();
    return adb.listDevices();
  });

  ipcMain.handle("devices:get-info", async (_: any, serial: string) => {
    const { DeviceService } = require("./services/device.service");
    const ds = new DeviceService();
    const devices = await ds.listDevices();
    const device = devices.find((d: any) => d.serial === serial);
    if (device) return ds.getDeviceInfo(device);
    throw new Error("Device not found");
  });

  // ============ FILE HANDLERS ============
  ipcMain.handle("files:list", async (_: any, serial: string, dirPath: string) => {
    return [];
  });

  ipcMain.handle("files:pull", async (_: any, serial: string, source: string, target: string) => {
    const { TransferService } = require("./services/transfer.service");
    const ts = new TransferService();
    return ts.pull(serial, source, target);
  });

  ipcMain.handle("files:push", async (_: any, serial: string, source: string, target: string) => {
    const { TransferService } = require("./services/transfer.service");
    const ts = new TransferService();
    return ts.push(serial, source, target);
  });

  // ============ JOB HANDLERS ============
  ipcMain.handle("jobs:list", async () => {
    const { JobQueueService } = require("./services/job-queue.service");
    const jq = new JobQueueService();
    await jq.initialize();
    return jq.getAllJobs();
  });

  ipcMain.handle("jobs:cancel", async (_: any, jobId: string) => {
    const { JobQueueService } = require("./services/job-queue.service");
    const jq = new JobQueueService();
    await jq.initialize();
    return jq.cancel(jobId);
  });

  // ============ OWNERSHIP VERIFICATION HANDLERS ============
  ipcMain.handle("ownership:create", async (_: any, record: any) => {
    const { OwnershipService } = require("./services/ownership.service");
    const os = new OwnershipService();
    return os.createRecord(record);
  });

  ipcMain.handle("ownership:get", async (_: any, deviceSerial: string) => {
    const { OwnershipService } = require("./services/ownership.service");
    const os = new OwnershipService();
    return os.getRecord(deviceSerial);
  });

  ipcMain.handle("ownership:verify", async (_: any, deviceSerial: string) => {
    const { OwnershipService } = require("./services/ownership.service");
    const os = new OwnershipService();
    return os.verify(deviceSerial);
  });

  // ============ AUDIT LOG HANDLERS ============
  ipcMain.handle("audit:log", async (_: any, entry: any) => {
    const { AuditService } = require("./services/audit.service");
    const audit = new AuditService();
    return audit.log(entry.actionType, entry.deviceId, entry.technicianId, entry.result, entry.ownershipRecordId, entry.notes);
  });

  ipcMain.handle("audit:list", async (_: any, deviceId?: string) => {
    const { AuditService } = require("./services/audit.service");
    const audit = new AuditService();
    return deviceId ? audit.list(deviceId) : audit.list();
  });

  ipcMain.handle("audit:export", async () => {
    const { AuditService } = require("./services/audit.service");
    const audit = new AuditService();
    return audit.exportCsv();
  });

// ============ BACKUP HANDLERS ============
   ipcMain.handle("backup:run", async (_: any, deviceSerial: string, profileId: string, outputDir: string, ownershipRecordId?: string) => {
     const { JobQueueService } = require("./services/job-queue.service");
     const jq = new JobQueueService();
     await jq.initialize();
     return jq.enqueue({ deviceSerial, backupProfile: { id: profileId, name: profileId, type: "MEDIA_ONLY", includePaths: [], excludePaths: [] }, ownershipRecordId });
   });

   // Additional backup handlers
   ipcMain.handle("backup:list", async (_: any, serial: string) => {
     const { AdbService } = require("./services/adb.service");
     const adb = new AdbService();
     return adb.listBackups(serial);
   });

   ipcMain.handle("backup:create", async (_: any, serial: string, profile: any) => {
     const { AdbService } = require("./services/adb.service");
     const adb = new AdbService();
     return adb.createBackup(serial, profile);
   });

   ipcMain.handle("backup:restore", async (_: any, serial: string, backupPath: string, targetPath: string) => {
     const { AdbService } = require("./services/adb.service");
     const adb = new AdbService();
     return adb.restoreBackup(serial, backupPath, targetPath);
   });

   ipcMain.handle("backup:delete", async (_: any, serial: string, backupPath: string) => {
     const { AdbService } = require("./services/adb.service");
     const adb = new AdbService();
     return adb.deleteBackup(serial, backupPath);
   });

   ipcMain.handle("backup:get-manifest", async (_: any, serial: string, backupPath: string) => {
     const { AdbService } = require("./services/adb.service");
     const adb = new AdbService();
     return adb.getBackupManifest(serial, backupPath);
   });

  // ============ LICENSE HANDLERS ============
  ipcMain.handle("license:get-status", async () => {
    const { LicenseService } = require("./services/license.service");
    const ls = new LicenseService();
    return ls.getStatus();
  });

  // ============ FRP BYPASS HANDLERS ============
  ipcMain.handle("bypass:methods", async () => {
    const { AdbService } = require("./services/adb.service");
    const adb = new AdbService();
    return adb.getBypassMethods();
  });

  ipcMain.handle("bypass:execute", async (_: any, serial: string, methodId: string) => {
    const { AdbService } = require("./services/adb.service");
    const adb = new AdbService();

    const result = await adb.executeBypass(serial, methodId, (step: string, progress: number) => {
      mainWindow?.webContents.send("bypass:progress", { serial, methodId, step, progress });
    });

    return result;
  });

  ipcMain.handle("bypass:analyze-device", async (_: any, serial: string) => {
    const { AdbService } = require("./services/adb.service");
    const adb = new AdbService();
    const info = await adb.getModel(serial);
    const version = parseInt(info.apiLevel) || 0;
    const patch = await adb.getSecurityPatch(serial);

    const vulnerabilityScore = version <= 21 ? 0.8 : version <= 26 ? 0.7 : version <= 29 ? 0.5 : 0.3;
    const recommendedMethods = version >= 33
      ? ["adb_talkback_chrome"]
      : version >= 21
        ? ["adb_setup_wizard", "intent_manipulation"]
        : ["adb_setup_wizard"];

    return {
      vulnerabilityScore,
      recommendedMethods,
      securityAssessment: vulnerabilityScore > 0.5 ? "Moderate vulnerability" : "Higher security",
    };
  });

  // ============ APP MANAGEMENT HANDLERS ============
  ipcMain.handle("apps:list", async (_: any, serial: string, showSystem?: boolean, filter?: string) => {
    const { AdbService } = require("./services/adb.service");
    const adb = new AdbService();
    return adb.listApps(serial, { showSystem, filter });
  });

  ipcMain.handle("apps:install", async (_: any, serial: string, apkPath: string, replace?: boolean, grantPermissions?: boolean) => {
    const { AdbService } = require("./services/adb.service");
    const adb = new AdbService();
    return adb.installApp(serial, apkPath, { replace, grantPermissions });
  });

  ipcMain.handle("apps:uninstall", async (_: any, serial: string, packageName: string, keepData?: boolean) => {
    const { AdbService } = require("./services/adb.service");
    const adb = new AdbService();
    return adb.uninstallApp(serial, packageName, { keepData });
  });

  ipcMain.handle("apps:clear-data", async (_: any, serial: string, packageName: string) => {
    const { AdbService } = require("./services/adb.service");
    const adb = new AdbService();
    return adb.clearAppData(serial, packageName);
  });

  ipcMain.handle("apps:grant-permission", async (_: any, serial: string, packageName: string, permission: string) => {
    const { AdbService } = require("./services/adb.service");
    const adb = new AdbService();
    return adb.grantPermission(serial, packageName, permission);
  });

  ipcMain.handle("apps:revoke-permission", async (_: any, serial: string, packageName: string, permission: string) => {
    const { AdbService } = require("./services/adb.service");
    const adb = new AdbService();
    return adb.revokePermission(serial, packageName, permission);
  });

  ipcMain.handle("apps:force-stop", async (_: any, serial: string, packageName: string) => {
    const { AdbService } = require("./services/adb.service");
    const adb = new AdbService();
    return adb.forceStopApp(serial, packageName);
  });

  ipcMain.handle("apps:start", async (_: any, serial: string, packageName: string, activityName?: string) => {
    const { AdbService } = require("./services/adb.service");
    const adb = new AdbService();
    return adb.startApp(serial, packageName, activityName);
  });

  // ============ SETTINGS HANDLERS ============
  ipcMain.handle("settings:get", async () => {
    return { theme: "system", language: "en", autoUpdates: true, defaultBackupLocation: "", showHiddenFiles: false };
  });

  ipcMain.handle("settings:update", async (_: any, settings: any) => {
    return settings;
  });

  ipcMain.handle("app:is-development", () => !app.isPackaged);

  // ============ DEVICE MONITORING HANDLERS ============
  ipcMain.handle("device:metrics", async (_: any, serial: string) => {
    const { AdbService } = require("./services/adb.service");
    const adb = new AdbService();
    return adb.getDeviceMetrics(serial);
  });

  ipcMain.handle("device:memory", async (_: any, serial: string) => {
    const { AdbService } = require("./services/adb.service");
    const adb = new AdbService();
    return adb.getMemoryInfo(serial);
  });

  ipcMain.handle("device:battery", async (_: any, serial: string) => {
    const { AdbService } = require("./services/adb.service");
    const adb = new AdbService();
    return adb.getBatteryInfo(serial);
  });

  ipcMain.handle("device:network", async (_: any, serial: string) => {
    const { AdbService } = require("./services/adb.service");
    const adb = new AdbService();
    return adb.getNetworkInfo(serial);
  });

  ipcMain.handle("device:health", async (_: any, serial: string) => {
    const { AdbService } = require("./services/adb.service");
    const adb = new AdbService();
    return adb.getDeviceHealth(serial);
  });

  // ============ LOG CAT & SCREENSHOT HANDLERS ============
  ipcMain.handle("adb:logcat:start", async (_: any, serial: string, filters?: string[]) => {
    const { AdbService } = require("./services/adb.service");
    const adb = new AdbService();
    return adb.startLogcat(serial, filters);
  });

  ipcMain.handle("adb:logcat:clear", async (_: any, serial: string) => {
    const { AdbService } = require("./services/adb.service");
    const adb = new AdbService();
    return adb.clearLogcat(serial);
  });

  ipcMain.handle("adb:screenshot", async (_: any, serial: string, outputFile: string) => {
    const { AdbService } = require("./services/adb.service");
    const adb = new AdbService();
    return adb.captureScreenshot(serial, outputFile);
  });

  ipcMain.handle("adb:screenrecord:start", async (_: any, serial: string, outputFile: string, options?: any) => {
    const { AdbService } = require("./services/adb.service");
    const adb = new AdbService();
    return adb.startScreenRecording(serial, outputFile, options);
  });
}

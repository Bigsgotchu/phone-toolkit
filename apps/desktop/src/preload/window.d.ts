export {};

declare global {
  interface Window {
    phoneToolkit: {
      devices: {
        list: () => Promise<any>;
        getInfo: (serial: string) => Promise<any>;
      };
      files: {
        list: (serial: string, path: string) => Promise<any>;
        pull: (serial: string, source: string, target: string) => Promise<any>;
        push: (serial: string, source: string, target: string) => Promise<any>;
      };
      jobs: {
        list: () => Promise<any>;
        get: (id: string) => Promise<any>;
        start: (id: string) => Promise<any>;
        cancel: (id: string) => Promise<any>;
        retry: (id: string) => Promise<any>;
      };
      backup: {
        createProfile: (profile: any) => Promise<any>;
        listProfiles: () => Promise<any>;
        runBackup: (deviceSerial: string, profileId: string, outputDir: string, ownershipRecordId?: string) => Promise<any>;
        list: (serial: string) => Promise<any>;
        create: (serial: string, profile: any) => Promise<any>;
        restore: (serial: string, backupPath: string, targetPath: string) => Promise<any>;
        delete: (serial: string, backupPath: string) => Promise<any>;
        getManifest: (serial: string, backupPath: string) => Promise<any>;
        listBackups: (deviceSerial?: string) => Promise<any>;
      };
      license: {
        getStatus: () => Promise<any>;
        activate: () => Promise<any>;
        deactivate: () => Promise<any>;
      };
      ownership: {
        create: (record: any) => Promise<any>;
        get: (deviceSerial: string) => Promise<any>;
        verify: (deviceSerial: string) => Promise<any>;
      };
      audit: {
        log: (entry: any) => Promise<any>;
        list: (deviceId?: string) => Promise<any>;
        exportCsv: () => Promise<any>;
      };
      settings: {
        get: () => Promise<any>;
        update: (settings: any) => Promise<any>;
      };
      bypass: {
        methods: () => Promise<any>;
        execute: (serial: string, methodId: string) => Promise<any>;
        analyzeDevice: (serial: string) => Promise<any>;
      };
      apps: {
        list: (serial: string, showSystem?: boolean, filter?: string) => Promise<any>;
        install: (serial: string, apkPath: string, replace?: boolean, grantPermissions?: boolean) => Promise<any>;
        uninstall: (serial: string, packageName: string, keepData?: boolean) => Promise<any>;
        clearData: (serial: string, packageName: string) => Promise<any>;
        grantPermission: (serial: string, packageName: string, permission: string) => Promise<any>;
        revokePermission: (serial: string, packageName: string, permission: string) => Promise<any>;
        forceStop: (serial: string, packageName: string) => Promise<any>;
        start: (serial: string, packageName: string, activityName?: string) => Promise<any>;
      };
      device: {
        getMetrics: (serial: string) => Promise<any>;
        getMemory: (serial: string) => Promise<any>;
        getBattery: (serial: string) => Promise<any>;
        getNetwork: (serial: string) => Promise<any>;
        getHealth: (serial: string) => Promise<any>;
      };
      adb: {
        logcat: {
          start: (serial: string, filters?: string[]) => Promise<any>;
          clear: (serial: string) => Promise<any>;
        };
        screenshot: (serial: string, outputFile: string) => Promise<any>;
        screenrecord: {
          start: (serial: string, outputFile: string, options?: any) => Promise<any>;
        };
      };
      onJobProgress: (callback: (progress: any) => void) => void;
      onJobCompleted: (callback: (jobId: string) => void) => void;
      onBypassProgress: (callback: (progress: { serial: string; methodId: string; step: string; progress: number }) => void) => void;
      isDevelopment: () => Promise<boolean>;
    };
  }
}
export interface LicenseStatus {
  state: LicenseState;
  planCode: string;
  maxActivatedDesktops: number;
  activatedDesktopCount: number;
  trialEndsAt?: string;
}

export type LicenseState =
  | "INVALID"
  | "TRIAL_ACTIVE"
  | "ACTIVE"
  | "PAST_DUE"
  | "CANCELED"
  | "EXPIRED";
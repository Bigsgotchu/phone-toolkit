import { LicenseStatus, LicenseState } from "@phone-toolkit/shared-types";
import { SqliteService } from "./sqlite.service";

const API_BASE = process.env.API_BASE_URL || process.env.RINAWARP_API_URL || "http://localhost:3001";

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
}

export class LicenseService {
  private sqliteService: SqliteService;

  constructor() {
    this.sqliteService = new SqliteService();
  }

  async getStatus(): Promise<LicenseStatus> {
    const cached = await this.sqliteService.getLicenseCache();
    if (cached) {
      return cached;
    }

    return this.getInvalidLicenseStatus();
  }

  private getInvalidLicenseStatus(): LicenseStatus {
    return {
      state: "INVALID" as LicenseState,
      planCode: "",
      maxActivatedDesktops: 0,
      activatedDesktopCount: 0,
    };
  }

  async activate(): Promise<void> {
    const status: LicenseStatus = {
      state: "TRIAL_ACTIVE",
      planCode: "PRO_MONTHLY",
      maxActivatedDesktops: 3,
      activatedDesktopCount: 1,
      trialEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    };

    await this.sqliteService.saveLicenseCache(status);
  }

  async createCheckoutSession(priceId: string, successUrl: string, cancelUrl: string, token: string): Promise<{ sessionId: string; url: string }> {
    const response = await fetch(`${API_BASE}/license/create-checkout-session`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ priceId, successUrl, cancelUrl }),
    });

    if (!response.ok) {
      const error = (await response.json()) as { error?: string };
      throw new Error(error.error || "Failed to create checkout session");
    }

    const result = (await response.json()) as { sessionId: string; url: string };
    return result;
  }

  async refreshFromServer(token: string): Promise<void> {
    const response = await fetch(`${API_BASE}/license/status`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      const status = (await response.json()) as LicenseStatus;
      await this.sqliteService.saveLicenseCache(status);
    }
  }

  async deactivate(): Promise<void> {
    const status = await this.getStatus();
    const updated: LicenseStatus = {
      ...status,
      activatedDesktopCount: Math.max(0, (status.activatedDesktopCount || 1) - 1),
    };
    await this.sqliteService.saveLicenseCache(updated);
  }
}
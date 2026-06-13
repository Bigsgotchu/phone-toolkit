import { PhoneToolkitAPI } from "@phone-toolkit/shared-types";

declare global {
  interface Window {
    phoneToolkit: PhoneToolkitAPI;
  }
}

export {};
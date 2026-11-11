export interface ILoginLockStatus {
  locked: boolean;
  reason?: "IP" | "EMAIL";
  retryAfter?: number;
}

export interface IRegistrationRateStatus {
  allowed: boolean;
  remaining: number;
  retryAfter?: number;
}


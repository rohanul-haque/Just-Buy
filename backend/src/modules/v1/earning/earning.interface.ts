/**
 * @copyright 2026
 * @author Rohanul Haque Rohan - MERN Stack Developer
 * @license Apache-2.0
 */

/**
 * Application Modules
 */
import { UserRole } from "@/modules/v1/auth/auth.interface";

/**
 * Earning Response Interface
 */
export interface IEarningResponse {
  role: UserRole;
  totalEarnings: number;
}

export type IEarningsResponse = IEarningResponse;

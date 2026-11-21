import type { IAuthUser } from "@/middlewares/auth.middleware";
import type { IVendor } from "@/modules/v1/vendor/vendor.interface";

declare global {
  namespace Express {
    interface Request {
      user?: IAuthUser;
      vendor?: IVendor;
    }
  }
}


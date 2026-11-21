import db from "@/lib/db";
import { logger } from "@/lib/winston";
import Admin from "@/modules/v1/admin/admin.model";
import { AccountStatus, UserRole } from "@/modules/v1/user/user.constant";
import User from "@/modules/v1/user/user.model";
import Verification from "@/modules/v1/verification/verification.model";
import { hashPassword } from "@/utils/password";
import mongoose from "mongoose";
import readline from "readline";
import { z } from "zod";

/**
 * Validation schema for Admin Seeder input
 */
export const adminSeederSchema = z.object({
  name: z
    .string({
      message: "Name is required",
    })
    .trim()
    .min(2, { message: "Name must be at least 2 characters" })
    .max(100, { message: "Name cannot exceed 100 characters" }),

  email: z
    .string({
      message: "Email is required",
    })
    .trim()
    .toLowerCase()
    .email({ message: "Invalid email address" }),

  password: z
    .string({
      message: "Password is required",
    })
    .min(6, { message: "Password must be at least 6 characters" })
    .max(128, { message: "Password cannot exceed 128 characters" }),

  phoneNumber: z
    .string()
    .trim()
    .regex(/^[+0-9\s-]{7,20}$/, { message: "Invalid phone number format" })
    .optional()
    .or(z.literal("")),
});

export type TAdminSeederInput = z.infer<typeof adminSeederSchema>;

/**
 * Parse command line flags (--name, --email, --password, --phone, --help)
 */
export const parseCliArgs = (): {
  name?: string;
  email?: string;
  password?: string;
  phoneNumber?: string;
  help?: boolean;
} => {
  const args = process.argv.slice(2);
  const result: Record<string, string | boolean> = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--help" || arg === "-h") {
      result.help = true;
    } else if (arg === "--name" && i + 1 < args.length) {
      result.name = args[++i];
    } else if (arg === "--email" && i + 1 < args.length) {
      result.email = args[++i];
    } else if (arg === "--password" && i + 1 < args.length) {
      result.password = args[++i];
    } else if (arg === "--phone" && i + 1 < args.length) {
      result.phoneNumber = args[++i];
    }
  }

  return result;
};

/**
 * Ask a standard question via readline
 */
const askQuestion = (query: string): Promise<string> => {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question(query, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
};

/**
 * Ask a password securely without echoing plain-text characters
 */
const askHiddenQuestion = (query: string): Promise<string> => {
  return new Promise((resolve) => {
    if (!process.stdin.isTTY) {
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      rl.question(query, (answer) => {
        rl.close();
        resolve(answer.trim());
      });
      return;
    }

    process.stdout.write(query);
    let input = "";

    const onData = (buffer: Buffer) => {
      const char = buffer.toString("utf-8");
      for (const ch of char) {
        if (ch === "\r" || ch === "\n" || ch === "\u0004") {
          process.stdin.removeListener("data", onData);
          if (process.stdin.setRawMode) {
            process.stdin.setRawMode(false);
          }
          process.stdin.pause();
          process.stdout.write("\n");
          resolve(input.trim());
          return;
        } else if (ch === "\u0003") {
          // Ctrl + C handling
          process.stdout.write("\n");
          process.exit(130);
        } else if (ch === "\u0008" || ch === "\x7f") {
          // Backspace handling
          if (input.length > 0) {
            input = input.slice(0, -1);
          }
        } else {
          input += ch;
        }
      }
    };

    if (process.stdin.setRawMode) {
      process.stdin.setRawMode(true);
      process.stdin.resume();
      process.stdin.on("data", onData);
    } else {
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      rl.question("", (answer) => {
        rl.close();
        resolve(answer.trim());
      });
    }
  });
};

/**
 * Main Admin Seeder execution function
 */
export const seedAdmin = async (): Promise<void> => {
  const cliArgs = parseCliArgs();

  if (cliArgs.help) {
    console.log(`
Jus Buy - Admin Seeder CLI

Usage:
  npm run seed:admin [options]

Options:
  --name <name>         Admin full name
  --email <email>       Admin email address
  --password <password> Admin password (min 6 characters)
  --phone <phone>       Admin phone number (optional)
  --help, -h            Show this help message

Environment Variables (Alternative to prompts):
  ADMIN_NAME            Admin full name
  ADMIN_EMAIL           Admin email address
  ADMIN_PASSWORD        Admin password
  ADMIN_PHONE           Admin phone number
`);
    process.exit(0);
  }

  // Silence winston logger to prevent raw logs and connection metadata in CLI output
  logger.silent = true;

  // 1. Connect to MongoDB using existing configuration
  try {
    await db.connectToMongoDB();
  } catch (error) {
    console.error("Connecting to database...");
    console.error("Failed to connect to the database.");
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }

  // 2. Check whether an Admin already exists (Duplicate Prevention)
  const existingAdminProfile = await Admin.findOne().exec();
  const existingAdminUser = await User.findOne({
    role: UserRole.ADMIN,
  }).exec();

  if (existingAdminProfile || existingAdminUser) {
    console.log("Admin already exists.");
    console.log("No new Admin account was created.");
    await db.disconnectFromMongoDB();
    process.exit(0);
  }

  // Display connection progress once we confirm no admin exists
  console.log("Connecting to database...");
  console.log("Database connected successfully.\n");

  // 3. Collect Admin Credentials
  let name = cliArgs.name || process.env.ADMIN_NAME;
  let email = cliArgs.email || process.env.ADMIN_EMAIL;
  let password = cliArgs.password || process.env.ADMIN_PASSWORD;
  let phoneNumber = cliArgs.phoneNumber || process.env.ADMIN_PHONE;

  if (!name) {
    name = await askQuestion("Enter Admin Name: ");
  }
  if (!email) {
    email = await askQuestion("Enter Admin Email: ");
  }
  if (!password) {
    password = await askHiddenQuestion("Enter Admin Password: ");
  }
  if (phoneNumber === undefined && process.stdin.isTTY && !cliArgs.name) {
    phoneNumber = await askQuestion("Enter Admin Phone (optional): ");
  }

  // 4. Validate Admin information
  console.log("Validating Admin information...");

  const rawInput = {
    name,
    email,
    password,
    phoneNumber: phoneNumber || undefined,
  };

  const validationResult = adminSeederSchema.safeParse(rawInput);
  if (!validationResult.success) {
    console.error("\nValidation failed:");
    validationResult.error.issues.forEach((issue) => {
      const field = issue.path.join(".") || "field";
      console.error(`  - ${field}: ${issue.message}`);
    });
    await db.disconnectFromMongoDB();
    process.exit(1);
  }

  const validated = validationResult.data;

  // Check if email already exists in User collection
  const existingEmailUser = await User.findOne({ email: validated.email }).exec();
  if (existingEmailUser) {
    console.error(`\nError: A user with email "${validated.email}" already exists.`);
    await db.disconnectFromMongoDB();
    process.exit(1);
  }

  // 5. Hash password using existing utility
  let hashedPassword: string;
  try {
    hashedPassword = await hashPassword(validated.password);
  } catch (error) {
    console.error("\nPassword hashing failed:", error instanceof Error ? error.message : String(error));
    await db.disconnectFromMongoDB();
    process.exit(1);
  }

  // 6. Start MongoDB Session and Transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const userObjectId = new mongoose.Types.ObjectId();
    const verificationObjectId = new mongoose.Types.ObjectId();

    // Create Verification document (email verified by default for seeded admin)
    const [verificationDoc] = await Verification.create(
      [
        {
          _id: verificationObjectId,
          user: userObjectId,
          isEmailVerified: true,
          emailVerifiedAt: new Date(),
          attempts: 0,
        },
      ],
      { session },
    );

    // Create User document
    console.log("Creating Admin User...");
    const [userDoc] = await User.create(
      [
        {
          _id: userObjectId,
          name: validated.name,
          email: validated.email,
          password: hashedPassword,
          status: AccountStatus.ACTIVE,
          verification: verificationDoc._id,
          role: UserRole.ADMIN,
        },
      ],
      { session },
    );

    // Create Admin Profile document
    console.log("Creating Admin Profile...");
    await Admin.create(
      [
        {
          admin: userDoc._id,
          phoneNumber: validated.phoneNumber || "",
        },
      ],
      { session },
    );

    // 7. Commit Transaction
    await session.commitTransaction();
  } catch (error) {
    // Abort transaction on any failure
    await session.abortTransaction();
    console.error("\nTransaction aborted. Failed to create Admin account.");
    console.error(error instanceof Error ? error.message : String(error));
    await session.endSession();
    await db.disconnectFromMongoDB();
    process.exit(1);
  } finally {
    await session.endSession();
  }

  // 8. Close database connection
  await db.disconnectFromMongoDB();

  // 9. Display success output
  console.log("\nAdmin created successfully!\n");
  console.log("Role: admin");
  console.log(`Email: ${validated.email}\n`);
  console.log("Database connection closed.");

  process.exit(0);
};

// Allow direct execution
if (require.main === module) {
  seedAdmin().catch((err) => {
    console.error("Unhandled seeder error:", err);
    process.exit(1);
  });
}

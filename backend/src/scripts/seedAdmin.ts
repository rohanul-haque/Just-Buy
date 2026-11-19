import { seedAdmin } from "@/modules/v1/admin/admin.seeder";

seedAdmin().catch((error) => {
  console.error("Unhandled Admin Seeder error:", error);
  process.exit(1);
});

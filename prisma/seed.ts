import { ensureDemoData } from "../lib/demo-data";
import { prisma } from "../lib/prisma";

async function main() {
  await ensureDemoData();
  console.log("Seed complete. Sign in with kay@example.com / password123");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

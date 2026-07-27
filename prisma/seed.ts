// prisma/seed.ts

import bcrypt from "bcryptjs";
import {prisma} from "@/lib/prisma";


async function main() {
  const hashedPassword = await bcrypt.hash("password123", 10);

  // 1. Create Dispatcher Account
  const dispatcher = await prisma.user.upsert({
    where: { email: "dispatcher@logisticshub.com" },
    update: { password: hashedPassword },
    create: {
      name: "Main Dispatcher",
      email: "dispatcher@logisticshub.com",
      password: hashedPassword,
      role: "DISPATCHER",
    },
  });

  // 2. Create Driver Account
  const driver = await prisma.user.upsert({
    where: { email: "driver@logisticshub.com" },
    update: { password: hashedPassword },
    create: {
      name: "Test Driver",
      email: "driver@logisticshub.com",
      password: hashedPassword,
      role: "DRIVER",
      currentLat: 9.03,
      currentLng: 38.74,
    },
  });

  console.log("Database seeded successfully!");
  console.log(`Dispatcher Login: dispatcher@logisticshub.com / password123`);
  console.log(`Driver Login: driver@logisticshub.com / password123`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Upsert categories
  const sponsorPayment = await prisma.category.upsert({
    where: { name: "Sponsor Payment" },
    update: {},
    create: {
      name: "Sponsor Payment",
      type: "credit",
      color: "#6B8F71",
    },
  });

  const miscellaneous = await prisma.category.upsert({
    where: { name: "Miscellaneous" },
    update: {},
    create: {
      name: "Miscellaneous",
      type: "debit",
      color: "#B5725A",
    },
  });

  console.log("Created categories:", {
    sponsorPayment: sponsorPayment.name,
    miscellaneous: miscellaneous.name,
  });

  console.log("Seeding complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import "dotenv/config";
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./dev.db",
});

const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.transaction.deleteMany();
  await prisma.checkIn.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();
  await prisma.loginToken.deleteMany();
  await prisma.listener.deleteMany();
  await prisma.employer.deleteMany();

  const employer = await prisma.employer.create({
    data: { name: "Acme Co", slug: "acme-co", creditBalance: 20 },
  });

  await prisma.user.create({
    data: { email: "admin@acme.test", employerId: employer.id },
  });

  await prisma.listener.createMany({
    data: [
      { name: "Listener A", available: true },
      { name: "Listener B", available: true },
      { name: "Listener C", available: true },
    ],
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });

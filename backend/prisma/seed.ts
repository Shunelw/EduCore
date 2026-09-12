import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const adapter = new PrismaMariaDb({
    host: process.env.DB_HOST!,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER!,
    password: process.env.DB_PASSWORD!,
    database: process.env.DB_NAME!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
    console.log("Starting database seed...");

    const adminRole = await prisma.role.upsert({
        where: { roleName: "ADMIN" },
        update: {},
        create: { roleName: "ADMIN" },
    });

    const professorRole = await prisma.role.upsert({
        where: { roleName: "PROFESSOR" },
        update: {},
        create: { roleName: "PROFESSOR" },
    });

    const studentRole = await prisma.role.upsert({
        where: { roleName: "STUDENT" },
        update: {},
        create: { roleName: "STUDENT" },
    });

    await prisma.user.upsert({
        where: { email: "admin@educore.com" },
        update: {},
        create: {
            microsoftId: null,
            name: "EduCore Admin",
            email: "admin@educore.com",
            role: {
                connect: {
                    id: adminRole.id,
                },
            },
        },
    });

    await prisma.user.upsert({
        where: { email: "professor@educore.com" },
        update: {},
        create: {
            microsoftId: null,
            name: "EduCore Professor",
            email: "professor@educore.com",
            role: {
                connect: {
                    id: professorRole.id,
                },
            },
        },
    });

    await prisma.user.upsert({
        where: { email: "student@educore.com" },
        update: {},
        create: {
            microsoftId: null,
            name: "EduCore Student",
            email: "student@educore.com",
            role: {
                connect: {
                    id: studentRole.id,
                },
            },
        },
    });

    console.log("Roles created");
    console.log("Admin created");
    console.log("Professor created");
    console.log("Student created");
    console.log("Database seed completed!");
}

main()
    .catch((error) => {
        console.error("Seed failed:", error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
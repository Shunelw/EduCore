import { prisma } from "./config/prisma";

const REQUIRED_ROLES = ["STUDENT", "PROFESSOR", "ADMIN"] as const;

const bootstrap = async () => {
    console.log("Bootstrapping required application data...");

    for (const roleName of REQUIRED_ROLES) {
        await prisma.role.upsert({
            where: { roleName },
            update: {},
            create: { roleName },
        });
    }

    console.log("Required roles are ready");
};

bootstrap()
    .catch((error) => {
        console.error("Application bootstrap failed:", error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

import "dotenv/config";
import type { Express } from "express";
import { loadSecretsFromKeyVault } from "./config/keyVault";

declare function require(id: string): { default: Express };

const main = async () => {
    // Must happen before ./app (and its transitive imports, like
    // config/prisma.ts) is loaded, since those read process.env at
    // import time.
    await loadSecretsFromKeyVault();

    const app = require("./app").default;

    const PORT = process.env.PORT || 3000;

    app.listen(PORT, () => {
        console.log(`EduCore API running on port ${PORT}`);
    });
};

main();

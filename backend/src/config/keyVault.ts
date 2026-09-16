import { ClientSecretCredential } from "@azure/identity";
import { SecretClient } from "@azure/keyvault-secrets";

// Secret names as stored in Azure Key Vault (hyphenated — Key Vault
// doesn't allow underscores), mapped to the env vars the rest of the
// app already reads.
const secretMap: Record<string, string> = {
    "jwt-secret": "JWT_SECRET",
    "db-password": "DB_PASSWORD",
    "partner-api-key": "PARTNER_API_KEY",
};

// In production, secrets come from Azure Key Vault instead of .env.
// AZURE_CLIENT_SECRET is the one exception: it's the credential used to
// authenticate to the vault, so it can't itself live inside the vault.
export const loadSecretsFromKeyVault = async () => {
    if (process.env.NODE_ENV !== "production") {
        return;
    }

    const credential = new ClientSecretCredential(
        process.env.AZURE_TENANT_ID!,
        process.env.AZURE_CLIENT_ID!,
        process.env.AZURE_CLIENT_SECRET!
    );

    const client = new SecretClient(
        process.env.AZURE_KEY_VAULT_URL!,
        credential
    );

    await Promise.all(
        Object.entries(secretMap).map(async ([secretName, envVar]) => {
            const secret = await client.getSecret(secretName);

            if (secret.value) {
                process.env[envVar] = secret.value;
            }
        })
    );

    console.log("Loaded secrets from Azure Key Vault");
};

import { timingSafeEqual } from "node:crypto";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const parsePartnerEmail = (value: unknown): string | null => {
    if (typeof value !== "string") {
        return null;
    }

    const email = value.trim().toLowerCase();

    if (!EMAIL_PATTERN.test(email)) {
        return null;
    }

    return email;
};

export const isValidPartnerApiKey = (
    providedKey: unknown,
    expectedKey: string | undefined
): boolean => {
    if (
        typeof providedKey !== "string" ||
        !providedKey ||
        !expectedKey
    ) {
        return false;
    }

    const providedBuffer = Buffer.from(providedKey);
    const expectedBuffer = Buffer.from(expectedKey);

    return (
        providedBuffer.length === expectedBuffer.length &&
        timingSafeEqual(providedBuffer, expectedBuffer)
    );
};

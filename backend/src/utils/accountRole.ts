export const isAdminEmail = (email: string): boolean => {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
        return false;
    }

    const adminEmails = (process.env.ADMIN_EMAILS || "")
        .split(",")
        .map((adminEmail) => adminEmail.trim().toLowerCase())
        .filter(Boolean);

    return adminEmails.includes(normalizedEmail);
};

export const getInitialRole = (email: string): string | null => {
    const normalizedEmail = email.trim().toLowerCase();

    if (isAdminEmail(normalizedEmail)) {
        return "ADMIN";
    }

    const username = normalizedEmail.split("@")[0];

    if (!username) {
        return null;
    }

    // Student accounts: u6642001@au.edu
    if (/^u\d+$/.test(username)) {
        return "STUDENT";
    }

    // Any non-student account (e.g. kwankamol@au.edu) starts as PROFESSOR.
    return "PROFESSOR";
};

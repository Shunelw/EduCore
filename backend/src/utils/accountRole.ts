export const getInitialRole = (email: string): string | null => {
    const username = email.split("@")[0];

    if (!username) {
        return null;
    }

    // Student accounts: u6642001@au.edu
    if (/^u\d+$/.test(username)) {
        return "STUDENT";
    }

    // Any non-student account (e.g. kwankamol@au.edu) starts as PROFESSOR.
    // ADMIN is never auto-assigned here — promote a user to ADMIN manually
    // (directly in the database, or via an admin-only endpoint later).
    return "PROFESSOR";
};
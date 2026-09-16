const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export class ApiError extends Error {
    status: number;

    constructor(status: number, message: string) {
        super(message);
        this.status = status;
    }
}

const request = async <T>(
    path: string,
    options: RequestInit = {}
): Promise<T> => {
    const token = localStorage.getItem("educore_token");

    const response = await fetch(`${API_URL}${path}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...options.headers,
        },
    });

    const body = await response.json().catch(() => null);

    if (!response.ok) {
        throw new ApiError(
            response.status,
            body?.message || "Something went wrong"
        );
    }

    return body as T;
};

export const api = {
    get: <T>(path: string) => request<T>(path),
    post: <T>(path: string, data?: unknown) =>
        request<T>(path, {
            method: "POST",
            body: data ? JSON.stringify(data) : undefined,
        }),
    put: <T>(path: string, data?: unknown) =>
        request<T>(path, {
            method: "PUT",
            body: data ? JSON.stringify(data) : undefined,
        }),
    delete: <T>(path: string) =>
        request<T>(path, { method: "DELETE" }),
};

export const loginUrl = () => `${API_URL}/api/auth/login`;

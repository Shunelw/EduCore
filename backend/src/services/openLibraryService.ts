export interface TextbookInfo {
    title: string;
    authors: string[];
    publishYear: string | null;
    coverUrl: string | null;
    edition: string | null;
}

interface OpenLibrarySearchBook {
    title?: unknown;
    author_name?: unknown;
    first_publish_year?: unknown;
    cover_i?: unknown;
    edition_count?: unknown;
}

interface OpenLibrarySearchResponse {
    docs?: unknown;
}

const isString = (value: unknown): value is string =>
    typeof value === "string" && value.trim().length > 0;

const fetchOpenLibrary = async (url: string): Promise<Response> => {
    let lastError: unknown;

    for (let attempt = 0; attempt < 2; attempt += 1) {
        try {
            const response = await fetch(url, {
                headers: {
                    Accept: "application/json",
                    "User-Agent": "EduCore course registration project",
                },
                signal: AbortSignal.timeout(10000),
            });

            if (
                attempt === 0 &&
                (response.status === 429 || response.status >= 500)
            ) {
                continue;
            }

            return response;
        } catch (error) {
            lastError = error;
        }
    }

    throw lastError instanceof Error
        ? lastError
        : new Error("Open Library request failed");
};

export const normalizeIsbn = (value: string): string =>
    value.replace(/[\s-]/g, "").toUpperCase();

export const isValidIsbn = (value: string): boolean => {
    const isbn = normalizeIsbn(value);

    if (/^\d{9}[\dX]$/.test(isbn)) {
        const sum = [...isbn].reduce((total, character, index) => {
            const digit = character === "X" ? 10 : Number(character);
            return total + digit * (10 - index);
        }, 0);

        return sum % 11 === 0;
    }

    if (/^\d{13}$/.test(isbn)) {
        const sum = [...isbn].reduce(
            (total, character, index) =>
                total + Number(character) * (index % 2 === 0 ? 1 : 3),
            0
        );

        return sum % 10 === 0;
    }

    return false;
};

// Looks up a book by ISBN using the Open Library Search API.
// Returns null when the ISBN is invalid or not found. Connectivity and
// upstream API errors are thrown so callers can distinguish an unavailable
// service from a genuine "not found" result.
export const fetchTextbookInfo = async (
    isbn: string
): Promise<TextbookInfo | null> => {
    try {
        const normalizedIsbn = normalizeIsbn(isbn);

        if (!isValidIsbn(normalizedIsbn)) {
            return null;
        }

        const params = new URLSearchParams({
            isbn: normalizedIsbn,
            fields:
                "title,author_name,first_publish_year,cover_i,edition_count",
            limit: "1",
        });
        const url = `https://openlibrary.org/search.json?${params.toString()}`;

        const response = await fetchOpenLibrary(url);

        if (!response.ok) {
            throw new Error(
                `Open Library returned HTTP ${response.status}`
            );
        }

        const data = (await response.json()) as OpenLibrarySearchResponse;
        const book = Array.isArray(data.docs)
            ? (data.docs[0] as OpenLibrarySearchBook | undefined)
            : undefined;

        if (!book) {
            return null;
        }

        const authors = Array.isArray(book.author_name)
            ? book.author_name.filter(isString)
            : [];

        const coverUrl =
            typeof book.cover_i === "number"
                ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`
                : null;
        const editionCount =
            typeof book.edition_count === "number" && book.edition_count > 0
                ? book.edition_count
                : null;

        return {
            title: isString(book.title) ? book.title : "Unknown title",
            authors,
            publishYear:
                typeof book.first_publish_year === "number"
                    ? String(book.first_publish_year)
                    : isString(book.first_publish_year)
                      ? book.first_publish_year
                      : null,
            coverUrl,
            edition: editionCount
                ? `${editionCount} ${editionCount === 1 ? "edition" : "editions"}`
                : null,
        };
    } catch (error) {
        console.error("Open Library lookup failed:", error);
        throw error;
    }
};

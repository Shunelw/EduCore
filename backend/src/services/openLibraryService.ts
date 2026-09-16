export interface TextbookInfo {
    title: string;
    authors: string[];
    publishYear: string | null;
    coverUrl: string | null;
    edition: string | null;
}

// Looks up a book by ISBN using the Open Library Books API.
// Returns null if the ISBN is invalid, not found, or the API call fails,
// so a bad/unreachable lookup never blocks course creation.
export const fetchTextbookInfo = async (
    isbn: string
): Promise<TextbookInfo | null> => {
    try {
        const url = `https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`;

        const response = await fetch(url);

        if (!response.ok) {
            return null;
        }

        const data = await response.json();
        const book = data[`ISBN:${isbn}`];

        if (!book) {
            return null;
        }

        const authors = Array.isArray(book.authors)
            ? book.authors.map((author: { name: string }) => author.name)
            : [];

        return {
            title: book.title ?? "Unknown title",
            authors,
            publishYear: book.publish_date ?? null,
            coverUrl: book.cover?.medium ?? null,
            edition: book.edition_name ?? null,
        };
    } catch (error) {
        console.error("Open Library lookup failed:", error);
        return null;
    }
};

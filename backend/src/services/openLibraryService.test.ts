import assert from "node:assert/strict";
import test from "node:test";
import {
    fetchTextbookInfo,
    isValidIsbn,
    normalizeIsbn,
} from "./openLibraryService";

test("normalizeIsbn removes spaces and hyphens", () => {
    assert.equal(normalizeIsbn("978-0-262-03384-8"), "9780262033848");
});

test("isValidIsbn accepts valid ISBN-10 and ISBN-13 values", () => {
    assert.equal(isValidIsbn("0-13-235088-2"), true);
    assert.equal(isValidIsbn("9780262033848"), true);
    assert.equal(isValidIsbn("080442957X"), true);
});

test("isValidIsbn rejects malformed values and bad checksums", () => {
    assert.equal(isValidIsbn("9780262033847"), false);
    assert.equal(isValidIsbn("not-an-isbn"), false);
    assert.equal(isValidIsbn(""), false);
});

test("fetchTextbookInfo maps the Open Library response", async () => {
    const originalFetch = global.fetch;

    global.fetch = async () =>
        new Response(
            JSON.stringify({
                docs: [
                    {
                        title: "Introduction to Algorithms",
                        author_name: ["Thomas H. Cormen"],
                        first_publish_year: 2009,
                        edition_count: 4,
                        cover_i: 12345,
                    },
                ],
            }),
            { status: 200 }
        );

    try {
        assert.deepEqual(await fetchTextbookInfo("978-0-262-03384-8"), {
            title: "Introduction to Algorithms",
            authors: ["Thomas H. Cormen"],
            publishYear: "2009",
            coverUrl: "https://covers.openlibrary.org/b/id/12345-M.jpg",
            edition: "4 editions",
        });
    } finally {
        global.fetch = originalFetch;
    }
});

test("fetchTextbookInfo returns null when Open Library has no match", async () => {
    const originalFetch = global.fetch;
    global.fetch = async () =>
        new Response(JSON.stringify({ docs: [] }), { status: 200 });

    try {
        assert.equal(await fetchTextbookInfo("9780262033848"), null);
    } finally {
        global.fetch = originalFetch;
    }
});

test("fetchTextbookInfo retries a transient request failure", async () => {
    const originalFetch = global.fetch;
    let requestCount = 0;

    global.fetch = async () => {
        requestCount += 1;

        if (requestCount === 1) {
            throw new Error("Temporary network failure");
        }

        return new Response(
            JSON.stringify({
                docs: [
                    {
                        title: "The Algorithm Design Manual",
                        author_name: ["Steven S. Skiena"],
                        first_publish_year: 1998,
                        edition_count: 7,
                        cover_i: 245565,
                    },
                ],
            }),
            { status: 200 }
        );
    };

    try {
        const result = await fetchTextbookInfo("9781848000698");

        assert.equal(requestCount, 2);
        assert.equal(result?.title, "The Algorithm Design Manual");
    } finally {
        global.fetch = originalFetch;
    }
});

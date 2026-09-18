import assert from "node:assert/strict";
import test from "node:test";
import {
    isValidPartnerApiKey,
    parsePartnerEmail,
} from "./partnerRequest";

test("parsePartnerEmail normalizes a valid email", () => {
    assert.equal(
        parsePartnerEmail("  Student@EduCore.com  "),
        "student@educore.com"
    );
});

test("parsePartnerEmail rejects missing, malformed, and repeated values", () => {
    assert.equal(parsePartnerEmail(undefined), null);
    assert.equal(parsePartnerEmail("not-an-email"), null);
    assert.equal(parsePartnerEmail(["one@example.com", "two@example.com"]), null);
});

test("isValidPartnerApiKey accepts only the configured exact key", () => {
    assert.equal(isValidPartnerApiKey("correct-key", "correct-key"), true);
    assert.equal(isValidPartnerApiKey("wrong-key", "correct-key"), false);
    assert.equal(isValidPartnerApiKey(undefined, "correct-key"), false);
    assert.equal(isValidPartnerApiKey("correct-key", undefined), false);
    assert.equal(isValidPartnerApiKey(["correct-key"], "correct-key"), false);
});

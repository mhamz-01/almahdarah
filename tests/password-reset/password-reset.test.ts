import assert from "node:assert/strict";
import { describe, it } from "node:test";

process.env.STUDENT_SESSION_SECRET ??= "test-secret";

const {
  CODE_LENGTH,
  MAX_CODES_PER_EMAIL_PER_HOUR,
  MAX_REQUESTS_PER_IP_PER_HOUR,
  RESET_TOKEN_TTL_MS,
  codeMatches,
  generateCode,
  generateResetToken,
  hashCode,
  hashResetToken,
  isExpired,
  normalizeCode,
  rateLimitError,
  resetTokenExpired,
} = await import("@/lib/password-reset");
const { renderPasswordChanged, renderPasswordResetCode } = await import("@/lib/email/templates");

describe("codes", () => {
  it("are always 6 digits, zero-padded", () => {
    for (let i = 0; i < 500; i++) assert.match(generateCode(), new RegExp(`^\\d{${CODE_LENGTH}}$`));
  });

  it("match only the same email and code", () => {
    const stored = hashCode("a@x.com", "012345");
    assert.equal(codeMatches("a@x.com", "012345", stored), true);
    assert.equal(codeMatches("a@x.com", "012346", stored), false);
    assert.equal(codeMatches("b@x.com", "012345", stored), false);
    assert.equal(codeMatches("a@x.com", "012345", "deadbeef"), false);
  });

  it("are not stored in plain text", () => {
    assert.ok(!hashCode("a@x.com", "123456").includes("123456"));
  });

  it("normalize pasted input", () => {
    assert.equal(normalizeCode("123 456"), "123456");
    assert.equal(normalizeCode(" 123-456 "), "123456");
    assert.equal(normalizeCode("12345"), null);
    assert.equal(normalizeCode("1234567"), null);
    assert.equal(normalizeCode(123456), null);
    assert.equal(normalizeCode(undefined), null);
  });
});

describe("reset tokens", () => {
  it("are long, random and hashed", () => {
    const a = generateResetToken();
    assert.ok(a.length >= 43);
    assert.notEqual(a, generateResetToken());
    assert.match(hashResetToken(a), /^[0-9a-f]{64}$/);
  });

  it("expire 15 minutes after verification", () => {
    const verified = "2026-10-19T10:00:00Z";
    const t = new Date(verified).getTime();
    assert.equal(resetTokenExpired(verified, t + RESET_TOKEN_TTL_MS - 1), false);
    assert.equal(resetTokenExpired(verified, t + RESET_TOKEN_TTL_MS), true);
  });

  it("code expiry is inclusive", () => {
    const t = new Date("2026-10-19T10:10:00Z").getTime();
    assert.equal(isExpired("2026-10-19T10:10:00Z", t - 1), false);
    assert.equal(isExpired("2026-10-19T10:10:00Z", t), true);
  });
});

describe("rate limits", () => {
  const now = new Date("2026-10-19T10:00:00Z").getTime();
  const ago = (s: number) => new Date(now - s * 1000).toISOString();

  it("allow a first request", () => {
    assert.equal(rateLimitError({ emailLastAt: null, emailLastHour: 0, ipLastHour: 0 }, now), null);
  });

  it("enforce the one-minute resend cooldown", () => {
    assert.ok(rateLimitError({ emailLastAt: ago(30), emailLastHour: 1, ipLastHour: 1 }, now));
    assert.equal(rateLimitError({ emailLastAt: ago(61), emailLastHour: 1, ipLastHour: 1 }, now), null);
  });

  it("cap requests per email and per IP each hour", () => {
    assert.ok(rateLimitError({ emailLastAt: ago(600), emailLastHour: MAX_CODES_PER_EMAIL_PER_HOUR, ipLastHour: 0 }, now));
    assert.ok(rateLimitError({ emailLastAt: null, emailLastHour: 0, ipLastHour: MAX_REQUESTS_PER_IP_PER_HOUR }, now));
  });
});

describe("emails", () => {
  it("put the code in subject, html and text", () => {
    const m = renderPasswordResetCode("042517", 10, "https://example.test");
    assert.ok(m.subject.includes("042517"));
    assert.ok(m.html.includes("042517"));
    assert.ok(m.text.includes("042517"));
    assert.ok(!m.html.includes("Manage or turn off"), "security email must not offer an opt-out link");
  });

  it("escape the username in the confirmation", () => {
    const m = renderPasswordChanged("<b>x</b>", "https://example.test");
    assert.ok(!m.html.includes("<b>x</b>"));
    assert.ok(m.html.includes("&lt;b&gt;x&lt;/b&gt;"));
  });
});

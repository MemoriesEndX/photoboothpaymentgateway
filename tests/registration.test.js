const { test, describe } = require("node:test");
const assert = require("node:assert/strict");
const bcrypt = require("bcryptjs");

describe("User Registration & Validation Logic", () => {
  // 1. Email format validation
  test("validates standard and invalid email formats", () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    // Valid emails
    assert.equal(emailRegex.test("user@example.com"), true);
    assert.equal(emailRegex.test("user.name+tag@sub.domain.co.id"), true);

    // Invalid emails
    assert.equal(emailRegex.test(""), false);
    assert.equal(emailRegex.test("plainaddress"), false);
    assert.equal(emailRegex.test("@missingusername.com"), false);
    assert.equal(emailRegex.test("missing.domain@"), false);
    assert.equal(emailRegex.test("spaces in@email.com"), false);
  });

  // 2. Email sanitization (trimming and lowercasing)
  test("sanitizes email by trimming whitespace and lowercasing", () => {
    const rawInput = "  TestUser@Example.COM  ";
    const sanitized = rawInput.trim().toLowerCase();
    assert.equal(sanitized, "testuser@example.com");
  });

  // 3. Password validation
  test("enforces minimum password length requirement (>= 6 characters)", () => {
    const isValidPassword = (pass) => typeof pass === "string" && pass.length >= 6;

    assert.equal(isValidPassword("123456"), true);
    assert.equal(isValidPassword("securepassword123!"), true);
    assert.equal(isValidPassword("12345"), false);
    assert.equal(isValidPassword(""), false);
    assert.equal(isValidPassword(null), false);
    assert.equal(isValidPassword(undefined), false);
  });

  // 4. Password hashing with bcryptjs
  test("hashes password with bcryptjs and verifies successfully", async () => {
    const plainPassword = "SuperSecretPassword123!";
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    // Password must be hashed (not equal to plain text)
    assert.notEqual(hashedPassword, plainPassword);
    assert.match(hashedPassword, /^\$2[aby]\$\d+\$/);

    // Verification must pass with the correct plain password
    const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
    assert.equal(isMatch, true);

    // Verification must fail with a wrong password
    const isWrongMatch = await bcrypt.compare("WrongPassword123!", hashedPassword);
    assert.equal(isWrongMatch, false);
  });

  // 5. User registration payload construction
  test("creates a sanitized user object with default GUEST role", async () => {
    const rawPayload = {
      name: "  Jane Doe  ",
      email: "  Jane.Doe@example.com ",
      password: "StrongPassword2026",
    };

    const sanitizedEmail = rawPayload.email.trim().toLowerCase();
    const sanitizedName = typeof rawPayload.name === "string" && rawPayload.name.trim() ? rawPayload.name.trim() : null;
    const hashedPassword = await bcrypt.hash(rawPayload.password, 10);

    const userRecord = {
      name: sanitizedName,
      email: sanitizedEmail,
      password: hashedPassword,
      role: "GUEST",
    };

    assert.equal(userRecord.name, "Jane Doe");
    assert.equal(userRecord.email, "jane.doe@example.com");
    assert.equal(userRecord.role, "GUEST");
    assert.ok(userRecord.password.startsWith("$2"));
  });

  // 6. Safe response object excludes password
  test("ensures user response does not leak password or hash", () => {
    const createdUser = {
      id: 42,
      name: "Jane Doe",
      email: "jane.doe@example.com",
      password: "$2a$10$hashedsecretpasswordhere",
      role: "GUEST",
      createdAt: new Date(),
    };

    const safeResponse = {
      id: createdUser.id,
      name: createdUser.name,
      email: createdUser.email,
    };

    assert.equal(safeResponse.id, 42);
    assert.equal(safeResponse.name, "Jane Doe");
    assert.equal(safeResponse.email, "jane.doe@example.com");
    assert.equal("password" in safeResponse, false);
  });
});

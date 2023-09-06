const { assert } = require("chai");

const {
  getUserByEmail,
  checkEmailAndPassword,
  getUserById,
  isLoggedIn,
  urlsForUser,
  isShortURLExist,
} = require("../helpers.js");

const testUsers = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    // 'pass' is the password before hashed
    password: "$2b$10$2YCZMSaqizp4kc1STwSOvedWrOq36LRrEs/CqEV8ss1cRrAkzQ.ju",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    // 'pass2' is the password before hashed
    password: "$2b$10$2lLnqqe9isMgb4P6N892hu2.1CV1ZIHfKZh5aQyQscylPjV4bRObu",
  },
};

const urlDatabase = {
  b2xVn2: { userID: 1, longURL: "http://www.lighthouselabs.ca" },
  "9sm5xK": { userID: 1, longURL: "http://www.google.com" },
  d34565: { userID: 2, longURL: "http://www.google.com" },
};

describe("getUserByEmail", () => {
  it("should return a user with valid email", () => {
    const user = getUserByEmail("user@example.com", testUsers);
    const expectedOutput = "userRandomID";
    assert.strictEqual(user.id, expectedOutput);
  });

  it("should return undefined with invalid email", () => {
    const user = getUserByEmail("user3@example.com", testUsers);
    const expectedOutput = undefined;
    assert.strictEqual(user, expectedOutput);
  });
});

describe("checkEmailAndPassword", () => {
  it("should return true if Email & Password exist", () => {
    const email = testUsers["userRandomID"].email;
    const password = "pass";
    assert.equal(checkEmailAndPassword(email, password, testUsers), true);
  });

  it("should return false if Email & Password don't exist", () => {
    const password = "pass";
    assert.equal(checkEmailAndPassword("a@a.com", password, testUsers), false);
  });
});

describe("getUserById", () => {
  it("should return a user with valid id", () => {
    const user = getUserById("userRandomID", testUsers);
    const expectedOutput = "userRandomID";
    assert.strictEqual(user.id, expectedOutput);
  });

  it("should return a null with invalid id", () => {
    const user = getUserById("userRandomID3", testUsers);
    const expectedOutput = null;
    assert.strictEqual(user, expectedOutput);
  });

  it("should return a null with invalid input", () => {
    const user = getUserById();
    const expectedOutput = null;
    assert.strictEqual(user, expectedOutput);
  });
});

describe("isLoggedIn", () => {
  it("should return true if logged in", () => {
    const actualOutput = isLoggedIn("userRandomID", testUsers);
    const expectedOutput = true;
    assert.strictEqual(actualOutput, expectedOutput);
  });

  it("should return false if not logged in", () => {
    const actualOutput = isLoggedIn("4", testUsers);
    const expectedOutput = false;
    assert.strictEqual(actualOutput, expectedOutput);
  });
});

describe("urlsForUser", () => {
  it("should return true if user includes the id", () => {
    const actualOutput = urlsForUser("2", urlDatabase);
    const expectedOutput = { d34565: urlDatabase["d34565"] };
    assert.deepEqual(actualOutput, expectedOutput);
  });
});

describe("isShortURLExist", () => {
  it("should return false if user have access permission", () => {
    const actualOutput = isShortURLExist("b2xVn2", 2, urlDatabase);
    const expectedOutput = false;
    assert.strictEqual(actualOutput, expectedOutput);
  });

  it("should return true if user have access permission", () => {
    const actualOutput = isShortURLExist("b2xVn2", 1, urlDatabase);
    const expectedOutput = true;
    assert.strictEqual(actualOutput, expectedOutput);
  });
});

const bcrypt = require("bcrypt");

// Return a user object, search by email
const getUserByEmail = (email, database) => {
  if (!(email && database)) {
    return;
  }

  if (typeof email !== "string" || typeof database !== "object") {
    return;
  }

  for (const id in database) {
    if (database[id].email === email) {
      return database[id];
    }
  }
};

// Return true if email & password already exists in users object
const checkEmailAndPassword = (email, password, usersDB) => {
  for (const user in usersDB) {
    // hashed password stored in users
    const hashedPassword = usersDB[user].password;

    // Verify if the user's email and password is not empty
    // Also check if the password is the same with the hashPassword stored in users
    if (
      email &&
      password &&
      usersDB[user].email === email &&
      bcrypt.compareSync(password, hashedPassword)
    ) {
      return true;
    }
  }
  return false;
};

const getUserById = (id, database) => {
  if (!(id && database)) {
    return null;
  }

  if (typeof id !== "string" || typeof database !== "object") {
    return null;
  }

  for (const userID in database) {
    if (database[userID].id === id) {
      return database[userID];
    }
  }
  return null;
};

// check if login or not
const isLoggedIn = (cookieID, database) => {
  if (getUserById(cookieID, database)) {
    return true;
  }
  return false;
};

// filters and return only urlDabase that includes the specific userID
const urlsForUser = (id, urlDB) => {
  const usersURL = {};
  for (const url in urlDB) {
    if (urlDB[url].userID.toString() === id.toString()) {
      usersURL[url] = urlDB[url];
    }
  }
  return usersURL;
};

// cross check if the user have permission to access the shortURL
const isShortURLExist = (shortURL, id, urlDB) => {
  if (Object.keys(urlsForUser(id, urlDB)).includes(shortURL)) {
    return true;
  }
  return false;
};

// display error message if page not found
const pageNotFound = (req, res, usersDB) => {
  return res.status(404).render("urls_404", {
    error: "Page not found!",
    user: usersDB[req.session["user_id"]],
  });
};

// dispaly access denied for unauthorized user
const unauthorized = (req, res, usersDB, errorMessage) => {
  return res.status(403).render("urls_404", {
    error: !errorMessage ? "Access Denied!" : errorMessage,
    user: usersDB[req.session["user_id"]],
  });
};

// generate random alphanumeric numbers
const generateRandomString = () => {
  return Math.random().toString(36).substr(2, 6);
};

module.exports = {
  getUserByEmail,
  checkEmailAndPassword,
  getUserById,
  isLoggedIn,
  urlsForUser,
  isShortURLExist,
  pageNotFound,
  unauthorized,
  generateRandomString,
};

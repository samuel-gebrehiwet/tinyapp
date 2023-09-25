const express = require("express");
const morgan = require("morgan");
const cookieSession = require("cookie-session");
const bcrypt = require("bcrypt");

// External helper function
const {
  getUserByEmail,
  checkEmailAndPassword,
  isLoggedIn,
  urlsForUser,
  isShortURLExist,
  pageNotFound,
  unauthorized,
  generateRandomString,
} = require("./helpers");

const app = express();
const PORT = 8080; // Update with your desired port

app.use(express.urlencoded({ extended: true }));
// created tinyCookie secure session
app.use(
  cookieSession({
    name: "tinyCookie",
    keys: ["myPassword", "secondPassword"],
  })
);
app.use(morgan("dev"));
app.set("view engine", "ejs");

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};

const users = {
  aJ48lW: {
    id: "aJ48lW",
    email: "user@example.com",
    password: "$2b$10$Kb9gG8cE1D4sZ2WgC2M8WufMgjw9Zc18l1J/5w4d3PcMrcr5QPO8A6", // password: "password"
  },
};

// Middleware to check if the user is logged in
const requireLogin = (req, res, next) => {
  if (!req.session.user_id) {
    return res.redirect('/login');
  }
  next();
};

// HOME DIRECTORY
app.get("/", (req, res) => {
  // if logged in redirect to /urls
  if (isLoggedIn(req.session["user_id"], users)) {
    return res.redirect("/urls");
  }
  res.redirect("/login");
});

// DISPLAY ALL URLs LISTS
app.get("/urls", (req, res) => {
  const cookieUserID = req.session["user_id"];

  // redirect to urls_404 page if not logged in
  if (!users[cookieUserID]) {
    unauthorized(req, res, users, "Please login / Register to have access.");
    return;
  }

  const user = users[cookieUserID];
  const userURLs = urlsForUser(cookieUserID, urlDatabase);
  const templateVars = { urls: userURLs, user };
  res.render("urls_index", templateVars);
});

// NEW FORM TO CREATE SHORT URL
app.get("/urls/new", requireLogin, (req, res) => {
  const user = users[req.session["user_id"]];
  const templateVars = { user };
  res.render("urls_new", templateVars);
});

// CREATE NEW SHORT URL
app.post("/urls", requireLogin, (req, res) => {
  const { longURL } = req.body;
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = { userID: req.session["user_id"], longURL };
  res.redirect(`/urls/${shortURL}`);
});

// SHOW URL BY ID
app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const cookieUserID = req.session["user_id"];

  // Check if the user is not logged in
  if (!cookieUserID) {
    return res.status(403).send("You must be logged in to access this page.");
  }

  // Check if the URL does not exist
  if (!urlDatabase[shortURL]) {
    return res.status(404).send("Short URL not found.");
  }

  // Check if the URL does not belong to the logged-in user
  if (urlDatabase[shortURL].userID !== cookieUserID) {
    return res.status(403).send("You do not have permission to access this URL.");
  }

  const longURL = urlDatabase[shortURL].longURL;
  const user = users[cookieUserID];
  const templateVars = { shortURL, longURL, user };
  res.render("urls_show", templateVars);
});

// UPDATE URL BY ID
app.post("/urls/:shortURL", requireLogin, (req, res) => {
  const shortURL = req.params.shortURL;
  const cookieUserID = req.session["user_id"];

  // Check if the URL does not exist
  if (!urlDatabase[shortURL]) {
    return res.status(404).send("Short URL not found.");
  }

  // Check if the URL does not belong to the logged-in user
  if (urlDatabase[shortURL].userID !== cookieUserID) {
    return res.status(403).send("You do not have permission to edit this URL.");
  }

  // Update the URL here
  // ...

  res.redirect("/urls");
});

// DELETE URL BY ID
app.post("/urls/:shortURL/delete", requireLogin, (req, res) => {
  const shortURL = req.params.shortURL;
  const cookieUserID = req.session["user_id"];

  // Check if the URL does not exist
  if (!urlDatabase[shortURL]) {
    return res.status(404).send("Short URL not found.");
  }

  // Check if the URL does not belong to the logged-in user
  if (urlDatabase[shortURL].userID !== cookieUserID) {
    return res.status(403).send("You do not have permission to delete this URL.");
  }

  // Delete the URL here
  // ...

  res.redirect("/urls");
});

app.get("/u/:shortURL", (req, res) => {
  // checking if the shortURL does exist in urlDatabase
  if (urlDatabase[req.params.shortURL] === undefined) {
    return pageNotFound(req, res, users);
  }

  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

app.get("/login", (req, res) => {
  const user = users[req.session["user_id"]];
  const templateVars = { user };

  // if logged in redirect to /urls
  if (isLoggedIn(req.session["user_id"], users)) {
    return res.redirect("/urls");
  }

  res.render("urls_login", templateVars);
});

app.post("/login", (req, res) => {
  const email = req.body.email.trim();
  const password = req.body.password.trim();

  // checks if email exists in our object
  if (!checkEmailAndPassword(email, password, users)) {
    return res.status(403).render("urls_login", {
      error: "Email or Password is incorrect!",
    });
  }

  // finding the current object id using the email value
  const id = getUserByEmail(email, users).id;

  // send back encrypted cookie to client
  req.session["user_id"] = id;
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

// Define a route for the GET request to /register
app.get("/register", (req, res) => {
  res.render("registration"); // Render the "registration.ejs" template
});

app.post("/register", (req, res) => {
  const id = generateRandomString();
  const email = req.body.email.trim();
  const password = req.body.password.trim();

  // check if email or password are empty
  // and also checks if email already exists in users object
  if (
    email.length === 0 ||
    password.length === 0 ||
    getUserByEmail(email, users)
  ) {
    return res.status(400).render("urls_register", {
      error: "This email already exists or incorrect input!",
    });
  }

  // Password converted to hash value
  const hashedPassword = bcrypt.hashSync(password, 10);

  const newUser = {
    id,
    email,
    password: hashedPassword,
  };
  users[id] = newUser;
  // send back encrypted cookie to the client
  req.session["user_id"] = id;

  res.redirect("/urls");
});

app.get("*", (req, res) => {
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

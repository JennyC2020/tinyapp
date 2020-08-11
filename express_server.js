const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const PORT = 8080;

const { findUserByEmail, urlsForUser, generateRandomString } = require('./helper');

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ['key1', "key2"]
}));

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" },
  b6Utgg: { longURL: "https://www.tsn.ca", userID: "jennyc" },
  i3Bgrr: { longURL: "https://www.google.ca", userID: "jennyc" }
};

const userDatabase = {
  xnidg9:
  {
    id: 'xnidg9',
    email: 'jenny@canada.com',
    password:
      '$2b$10$dag07KP6ynxWmyM/XCxmAedNcReezbfOdj7g8s3pdC/xyd0iKqyia'
  }
};

//GET requests

app.get("/register", (req, res) => {
  const user = userDatabase[req.session.user_id];
  let templateVars = { user };
  res.render("register", templateVars);
});

app.get('/login', (req, res) => {
  const user = userDatabase[req.session.user_id];
  let templateVars = { user };
  res.render('login', templateVars);
});
// Issue to fix:  doesn't return a relevant error message when the id doesn't exist
//please review code.

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[req.params.shortURL].longURL;
  const user = userDatabase[req.session.user_id];
  if (user) {
    res.redirect(longURL);
  } else {
    res.send('User not found in database. Please register--> <a href="/register">REGISTER HERE</a>');
    res.redirect('/register');
  }
});

app.get("/urls/new", (req, res) => {
  const user = userDatabase[req.session.user_id];
  let templateVars = { user };
  if ((req.session.user_id === null) || (req.session.user_id === undefined)) {
    res.redirect('/login');
  } else {
    res.render("urls_new", templateVars);
  }
});

// Issue to fix -unauthorized users are able to view this page instead of being shown a relevant HTML message
//code modified. Please review

app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const urlRecord = urlDatabase[req.params.shortURL];
  const user = userDatabase[req.session.user_id];
  let templateVars = { user, shortURL, longURL: urlRecord.longURL };
  if (user) {
    res.render("urls_show", templateVars);
  } else {
    res.send('Please login to access this page--> <a href="/login">LOGIN HERE</a>');
    res.redirect('/login');
  }
});
// Issue to fix - users who are not logged in are able to access this page instead
// of being shown a relevant HTML message
//code modified. Please review

app.get("/urls", (req, res) => {
  const user = userDatabase[req.session.user_id];
  const userURLS = urlsForUser(req.session.user_id, urlDatabase);
  let templateVars = { user, urls: userURLS };

  if (user) {
    res.render("urls_index", templateVars);
  } else {
    res.send('Please login to access this page--> <a href="/login">LOGIN HERE</a>');
    res.redirect('/login');
  }
});


//Issue to fix-  if user is logged in: (Minor) redirect to /urls,
//if user is not logged in: (Minor) redirect to /login - the page just displays /urls instead
// of redirecting the user
//code modified. Please review

app.get("/", (req, res) => {
  const user = userDatabase[req.session.user_id];
  if (user) {
    res.redirect('/urls');
  } else {
    res.send('Please login to access this page--> <a href="/login">LOGIN HERE</a>');
    res.redirect('/login');
  }
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// POST requests

app.post("/register", (req, res) => {
  const password = req.body.password;
  const email = req.body.email;

  if (!email || !password) {
    res.statusCode = 400;
    res.send('400: email or password missing');
    return;
  }

  const user = findUserByEmail(userDatabase, email); // checking if user already registered if so, error
  if (user) {
    res.statusCode = 400;
    res.send('400: user already exists');
    return;
  }

  const id = generateRandomString();
  const hashedPassword = bcrypt.hashSync(password, 10);

  userDatabase[id] = { id, email, password: hashedPassword }; // new user obj
  req.session.user_id = id;
  res.redirect('/urls');

});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  if (!email || !password) {
    res.statusCode = 400;
    res.send('400: email or password missing');
    return;
  }

  const user = findUserByEmail(userDatabase, email);
  if (!user) {
    res.statusCode = 403;
    res.send('403: email address does not match any existing user. Please register--> <a href="/register">REGISTER HERE</a>');
    return;
  }

  if (!bcrypt.compareSync(password, user.password)) {

    res.statusCode = 403;
    res.send('403: password incorrect');

    return;
  }
  req.session.user_id = user.id;
  res.redirect('/urls');

});

app.post("/logout", (req, res) => {
  req.session.user_id = null;
  res.redirect('/login');
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  if (req.session.user_id && req.session.user_id === urlDatabase[shortURL].userID) {
    delete (urlDatabase[shortURL]);
    res.redirect('/urls');
  } else {
    res.statusCode = 401;
    req.session.user_id = null;
    res.send('401 Error. Unauthorized. --> <a href="/login">LOGIN HERE</a>');
  }
});

app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  if (!req.session.user_id) {
    res.statusCode = 401;
    req.session.user_id = null;
    res.send('401 Error. Unauthorized. --> <a href="/login">LOGIN HERE</a>');
    return;

  } else {
    urlDatabase[shortURL] = { longURL: req.body.longURL, userID: req.session["user_id"] };
    res.redirect('/urls/' + shortURL);
  }
});
//Issue to fix: unauthorized users are able to make changes to urls that don't belong to them.
//Code below not working
app.post("/urls/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  if (!req.session.user_id) {
    res.statusCode = 401;
    req.session.user_id = null;
    res.send('401 Error. Unauthorized. --> <a href="/login">LOGIN HERE</a>');
    return;

  } else {
    urlDatabase[shortURL].longURL = req.body.updateURL;
    res.redirect('/urls/' + shortURL);
  }
});

// LISTEN requests

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
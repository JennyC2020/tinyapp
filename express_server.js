const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const { response } = require('express');
//const { response } = require("express");
const PORT = 8080; // default port 8080

//set the view engine to ejs

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());


const findUserByEmail = (email) => {
  const foundKeys = Object.keys(users).filter((key) => users[key].email === email);
  return foundKeys.length > 0 ? foundKeys[0] : null;
};

function generateRandomString() {
  return Math.random().toString(36).substr(2, 6);
}

// const urlDatabase = {
//   "b2xVn2": "http://www.lighthouselabs.ca",
//   "9sm5xK": "http://www.google.com"
// };

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" },
  b6Utgg: { longURL: "https://www.tsn.ca", userID: "jennyc" },
  i3Bgrr: { longURL: "https://www.google.ca", userID: "jennyc" }
};

const users = {};

const urlsForUser = (id) => {
  let result = {};
  for (let user in urlDatabase) {
    if (urlDatabase[user].userID === id) {
      console.log(jennyc)
      result[user] = urlDatabase[user];
    }
  }
  return result;

};
//GET requests

app.get("/register", (req, res) => {
  const user = users[req.cookies.user_id];
  let templateVars = { user };
  res.render("register", templateVars);
});

app.get('/login', (req, res) => {
  const user = users[req.cookies.user_id];
  let templateVars = { user };
  res.render('login', templateVars);
});


app.get("/u/:shortURL", (req, res) => {
  res.redirect(urlDatabase[req.params.shortURL]);
});

app.get("/urls/new", (req, res) => {
  const user = users[req.cookies.user_id];
  let templateVars = { user };
  // console.log(req);  
  if ((req.cookies.user_id === null) || (req.cookies.user_id === undefined)) {
    res.redirect('/login')
  } else {
    res.render("urls_new", templateVars);
  }
});

app.get("/urls/:shortURL", (req, res) => {
  const user = users[req.cookies.user_id];
  let templateVars = { user, shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render("urls_show", templateVars);
});

app.get("/urls", (req, res) => {
  const user = users[req.cookies.user_id];
  let templateVars = { user, urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// POST requests

app.post("/register", (req, res) => {
  const password = req.body.password;
  const email = req.body.email;
  const id = generateRandomString();
  if (!email || !password) {
    res.statusCode = 400;
    res.send('400: invalid email or password');
  } else {
    users[id] = { id, email, password };
    res.cookie('user_id', id);
    res.redirect('/urls');
  }
});


app.post("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect('/urls');

});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = users[findUserByEmail(email)];
  if (!user) {
    res.statusCode = 403;
    res.send('403: email address does not match any existing user');
  } else if (password !== user.password) {
    res.statusCode = 403;
    res.send('403: password incorrect');
  } else {
    res.cookie('user_id', user.id);
    res.redirect('/urls');
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect('/urls/' + shortURL);
});

app.post("/urls/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  urlDatabase[shortURL] = req.body.newURL;
  res.redirect('/urls/' + shortURL);
});

// LISTEN requests

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
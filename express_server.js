const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const PORT = 8080; // default port 8080

//set the view engine to ejs

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());



function generateRandomString() {
  return Math.random().toString(36).substr(2, 6);
}

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//GET requests

app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase, username: req.cookies.username };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
  let templateVars = { urls: urlDatabase, username: req.cookies.username };
  res.render('urls_new', templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  let longURL = urlDatabase[req.params.shortURL];
  let templateVars = { shortURL, longURL };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});



// POST Request

app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
  app.get("/urls/:shortURL", (req, res) => {
    let shortURL = req.params.shortURL;
    let longURL = urlDatabase[req.params.shortURL];
    let templateVars = { shortURL, longURL, username: req.cookies.username };
    res.render("urls_show", templateVars);
  });
});

app.post('/urls/:shortURL/delete', (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls'); //redirect the client back to the url_index page
});

app.post('/urls/:shortURL', (req, res) => {
  res.redirect(`/urls/${req.params.shortURL}`);
});

app.post('/urls/:shortURL/edit', (req, res) => {
  const newURL = req.body.updateURL;
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL] = newURL;
  res.redirect('/urls');
});

app.post('/login', (req, res) => {
  const username = req.body.username;
  res.cookie('username', username);
  res.redirect('/urls');
});


// LISTEN requests

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
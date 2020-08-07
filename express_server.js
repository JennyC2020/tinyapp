const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const { response } = require('express');
const bcrypt = require('bcrypt');
//const { response } = require("express");
const PORT = 8080; // default port 8080

//set the view engine to ejs

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());


const findUserByEmail = (email) => {

  const keys = Object.keys(users)
  for (let id of keys) {
    const user = users[id];
    if (user.email === email) {
      return user;
    }
  }
};

function generateRandomString() {
  return Math.random().toString(36).substr(2, 6);
}

const urlsForUser = (id) => {
  let result = {};
  const keys = Object.keys(urlDatabase)
  for (let shortURL of keys) {
    if (urlDatabase[shortURL].userID === id) {
      result[shortURL] = urlDatabase[shortURL];
    }
  }
  return result;

};

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" },
  b6Utgg: { longURL: "https://www.tsn.ca", userID: "jennyc" },
  i3Bgrr: { longURL: "https://www.google.ca", userID: "jennyc" }
};

const users = {
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
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[req.params.shortURL];
  const user = users[req.cookies.user_id];
  let templateVars = { user, shortURL, longURL };
  res.render("urls_show", templateVars);
});

app.get("/urls", (req, res) => {
  const user = users[req.cookies.user_id];
  const userURLS = urlsForUser(req.cookies.user_id)
  //console.log("This is userURLS: ", userURLS);
  let templateVars = { user, urls: userURLS };
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

  if (!email || !password) {
    res.statusCode = 403;
    res.send('403: email or password missing');
    return;
  }
  console.log("Email is:", email);
  const user = findUserByEmail(email);
  if (user) {
    res.statusCode = 400;
    res.send('400: user already exists');
    return;
  }

  const id = generateRandomString();
  const hashedPassword = bcrypt.hashSync(password, 10);

  users[id] = { id, email, password: hashedPassword };
  res.cookie('user_id', id);
  res.redirect('/urls');
  console.log(users);
});


app.post("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect('/urls');

});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  if (!email || !password) {
    res.statusCode = 403;
    res.send('403: email or password missing');
    return;
  }

  const user = findUserByEmail(email);
  console.log(user);
  if (!user) {
    res.statusCode = 403;
    res.send('403: email address does not match any existing user');
    return;
  }

  if (!bcrypt.compareSync(password, user.password)) {
    res.statusCode = 403;
    res.send('403: password incorrect');
    return;
  }


  res.cookie('user_id', user.id);
  res.redirect('/urls');

});

app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});

app.post("/urls/:shortURL/delete", (req, res) => {
  if (req.cookies.user_id && req.cookies.user_id === urlDatabase[shortURL].userID) {
    delete (urlDatabase[shortURL]);
    res.redirect('/urls');
  } else {
    res.statusCode = 401;
    res.clearCookie('user_id');
    res.send("401 Error. Unauthorized. Please login.");
  }
});

app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = { longURL: req.body.longURL, userID: req.cookies["user_id"] };
  res.redirect('/urls/' + shortURL);
});

app.post("/urls/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  urlDatabase[shortURL].longURL = req.body.longURL;
  res.redirect('/urls/' + shortURL);
});

// LISTEN requests

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
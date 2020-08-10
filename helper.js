const findUserByEmail = (database, email) => {

  const keys = Object.keys(database);
  for (let id of keys) {
    const user = database[id];
    if (user.email === email) {
      return user;
    }
  }
};


const urlsForUser = (id, urlDatabase) => {
  let result = {};
  for (let shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === id) {
      result[shortURL] = urlDatabase[shortURL];
    }
  }
  return result;
};

function generateRandomString() {
  return Math.random().toString(36).substr(2, 6);
};


module.exports = {
  findUserByEmail,
  urlsForUser,
  generateRandomString
};
// findUserByEmail

const findUserByEmail = (database, email) => {

  const keys = Object.keys(database)
  for (let id of keys) {
    const user = database[id];
    if (user.email === email) {
      console.log(user)
      return user;
    }
  }
};


// urlsForUser
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

// generateRandomString
function generateRandomString() {
  return Math.random().toString(36).substr(2, 6);
}



module.exports = {
  findUserByEmail,
  urlsForUser,
  generateRandomString
};
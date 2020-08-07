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

module.exports = { findUserByEmail };
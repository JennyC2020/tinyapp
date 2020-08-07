const { assert } = require('chai');

const { findUserByEmail, generateRandomString } = require('../helper');

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "street-funk"
  },
  "user3RandomID": {
    id: "user3RandomID",
    email: "user3@example.com",
    password: "life-under-water"
  }
};



describe('findUserByEmail', () => {
  it('should return a user with valid email', () => {
    const user = findUserByEmail(testUsers, "user@example.com");
    const expectedOutput = "userRandomID";
    assert.equal(user.id, expectedOutput);
  });


  it('should return undefined if no user found with given email', () => {
    const user = findUserByEmail(testUsers, "no_a_user@example.com");
    assert.isUndefined(user);
  });
});



describe('generateRandomString', function() {
  it('should return a 6 letter string', function() {
    const urlId = generateRandomString()
    assert.equal(urlId.length, 6);
  });
});

const db = require("../config/db");

module.exports = {
  findUserByUsername: (username, callback) => {
    const query = "SELECT * FROM users WHERE username = ?";
    db.query(query, [username], callback);
  },

  createUser: (username, hashedPassword, callback) => {
    const query = "INSERT INTO users (username, password) VALUES (?, ?)";
    db.query(query, [username, hashedPassword], callback);
  },
};

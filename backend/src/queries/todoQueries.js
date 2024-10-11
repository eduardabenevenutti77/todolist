const db = require("../config/db");

module.exports = {
  getTodosByUserId: (userId, callback) => {
    const query = "SELECT * FROM todos WHERE userId = ?";
    db.query(query, [userId], callback);
  },

  createTodo: (userId, title, callback) => {
    const query = "INSERT INTO todos (userId, title) VALUES (?, ?)";
    db.query(query, [userId, title], callback);
  },

  updateTodo: (id, userId, updateFields, callback) => {
    const updates = [];
    const params = [];

    if (updateFields.title !== undefined) {
      updates.push("title = ?");
      params.push(updateFields.title);
    }

    if (updateFields.completed !== undefined) {
      updates.push("completed = ?");
      params.push(updateFields.completed);
    }

    if (updates.length === 0) {
      return callback(new Error("Nenhum campo para atualizar."), null);
    }

    params.push(id, userId);
    const query = `UPDATE todos SET ${updates.join(
      ", "
    )} WHERE id = ? AND userId = ?`;

    db.query(query, params, callback);
  },

  deleteTodo: (id, userId, callback) => {
    const query = "DELETE FROM todos WHERE id = ? AND userId = ?";
    db.query(query, [id, userId], callback);
  },
};

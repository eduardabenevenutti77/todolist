const todoQueries = require("../queries/todoQueries");

exports.getTodos = (req, res) => {
  const userId = req.userId;
  todoQueries.getTodosByUserId(userId, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
};

exports.createTodo = (req, res) => {
  const { title } = req.body;
  if (!title) {
    return res.status(400).json({ error: "O campo título é obrigatório." });
  }
  const userId = req.userId;
  todoQueries.createTodo(userId, title, (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ id: result.insertId, title, completed: false });
  });
};

exports.updateTodo = (req, res) => {
  const { id } = req.params;
  const { title, completed } = req.body;
  const userId = req.userId;

  const updateFields = {};
  if (title !== undefined) {
    updateFields.title = title;
  }
  if (completed !== undefined) {
    updateFields.completed = completed;
  }

  todoQueries.updateTodo(id, userId, updateFields, (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "To-Do não encontrado." });
    }
    res.json({ message: "To-Do atualizado com sucesso." });
  });
};

exports.deleteTodo = (req, res) => {
  const { id } = req.params;
  const userId = req.userId;

  todoQueries.deleteTodo(id, userId, (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "To-Do não encontrado." });
    }
    res.status(204).json({ message: "To-Do deletado com sucesso." });
  });
};

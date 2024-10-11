const mysql = require("mysql");

const db = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "todo_db",
});

db.connect((err) => {
  if (err) {
    console.error("Erro ao conectar ao banco de dados:", err);
  } else {
    console.log("Conectado ao banco de dados.");

    db.query(
      `
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) NOT NULL,
        password VARCHAR(255) NOT NULL
      )`,
      (err, result) => {
        if (err) {
          console.error("Erro ao criar tabela users:", err);
        } else {
          console.log("Tabela users verificada/criada.");
        }
      }
    );

    db.query(
      `
      CREATE TABLE IF NOT EXISTS todos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        userId INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        completed BOOLEAN DEFAULT false,
        FOREIGN KEY (userId) REFERENCES users(id)
      )`,
      (err, result) => {
        if (err) {
          console.error("Erro ao criar tabela todos:", err);
        } else {
          console.log("Tabela todos verificada/criada.");
        }
      }
    );
  }
});

module.exports = db;

const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const userQueries = require("../queries/userQueries");

// Função para validar o formato de nome de usuário
const validateUsername = (username) => {
  const re = /^[a-zA-Z0-9_]{3,20}$/; // Exemplo: deve ter entre 3 e 20 caracteres, apenas letras, números e underscores
  return re.test(username);
};

// Função para validar a senha
const validatePassword = (password) => {
  const re =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
  return re.test(password);
};

exports.login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ error: "Nome de usuário e senha são obrigatórios." });
  }

  if (!validateUsername(username)) {
    return res
      .status(400)
      .json({ error: "Formato de nome de usuário inválido." });
  }

  try {
    userQueries.findUserByUsername(username, async (err, results) => {
      // Alterado para findUserByUsername
      if (err) {
        return res.status(500).json({ error: "Erro ao buscar usuário." });
      }
      if (results.length === 0) {
        return res.status(400).json({ error: "Usuário não encontrado." });
      }

      const user = results[0];
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(400).json({ error: "Senha incorreta." });
      }

      const token = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET || "dev",
        {
          expiresIn: "1d",
        }
      );

      res.cookie("token", token, {
        httpOnly: true,
        maxAge: 3600000,
        secure: true,
        sameSite: "None",
      });

      res.status(200).send({ message: "Login efetuado com sucesso" });
    });
  } catch (error) {
    res.status(500).json({ error: "Erro no servidor. Tente novamente." });
  }
};

exports.logout = (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logout realizado com sucesso." });
};

exports.register = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ error: "Nome de usuário e senha são obrigatórios." });
  }

  if (!validateUsername(username)) {
    return res
      .status(400)
      .json({ error: "Formato de nome de usuário inválido." });
  }

  if (!validatePassword(password)) {
    return res.status(400).json({
      error:
        "A senha deve ter pelo menos 8 caracteres, incluindo uma letra maiúscula, uma letra minúscula, símbolos e um número.",
    });
  }

  try {
    userQueries.findUserByUsername(username, async (err, results) => {
      // Alterado para findUserByUsername
      if (err) {
        return res.status(500).json({ error: "Erro ao buscar usuário." });
      }
      if (results.length > 0) {
        return res.status(400).json({ error: "Usuário já existe." });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      userQueries.createUser(username, hashedPassword, (err) => {
        // Alterado para createUser com username
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.json({ message: "Usuário registrado com sucesso." });
      });
    });
  } catch (error) {
    res.status(500).json({ error: "Erro no servidor. Tente novamente." });
  }
};

exports.auth = (req, res) => {
  if (!req.userId) {
    return res
      .status(401)
      .json({ isAuthenticated: false, message: "Usuário não autenticado" });
  }
  return res.status(200).json({ isAuthenticated: true, userId: req.userId });
};

const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const userQueries = require("../queries/userQueries");
const speakeasy = require("speakeasy");
const qrcode = require("qrcode");

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

// Função para configurar o 2FA
const setupTwoFactorAuth = async (userId) => {
  const secret = speakeasy.generateSecret({ length: 20 });

  // Salvar o segredo no banco de dados associado ao usuário (você precisa adicionar isso na sua tabela de usuários)
  await userQueries.saveUserSecret(userId, secret.base32); // Exemplo, altere conforme seu banco de dados

  return secret;
};

// Função para verificar o código 2FA
const verifyTwoFactorAuth = (userId, token) => {
  return new Promise((resolve, reject) => {
    userQueries.getUserSecret(userId, (err, secret) => {
      if (err) return reject(err);

      const verified = speakeasy.totp.verify({
        secret: secret,
        encoding: "base32",
        token: token,
      });

      if (verified) {
        resolve(true);
      } else {
        reject(new Error("Código de autenticação inválido"));
      }
    });
  });
};

exports.login = async (req, res) => {
  const { username, password, token } = req.body;

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

      // Verifica se a 2FA está habilitada
      if (user.twoFactorEnabled) {
        // Se a 2FA estiver ativada, verifica o token
        try {
          await verifyTwoFactorAuth(user.id, token);
        } catch (error) {
          return res.status(400).json({ error: "Código de autenticação inválido." });
        }
      }

      const tokenJwt = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET || "dev",
        {
          expiresIn: "1d",
        }
      );

      res.cookie("token", tokenJwt, {
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

// Rota para configurar a 2FA (QR code)
exports.setupTwoFactor = async (req, res) => {
  const userId = req.userId; // Supondo que o userId esteja disponível no token JWT

  try {
    const secret = await setupTwoFactorAuth(userId);
    const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url);

    res.status(200).json({
      message: "2FA configurado com sucesso. Escaneie o QR code.",
      qrCodeUrl,
    });
  } catch (error) {
    res.status(500).json({ error: "Erro ao configurar a 2FA." });
  }
};

// Rota para desabilitar a 2FA
exports.disableTwoFactor = (req, res) => {
  const userId = req.userId; // Supondo que o userId esteja disponível no token JWT

  userQueries.removeUserSecret(userId, (err) => {
    if (err) {
      return res.status(500).json({ error: "Erro ao desabilitar a 2FA." });
    }
    res.status(200).json({ message: "2FA desabilitada com sucesso." });
  });
};

exports.auth = (req, res) => {
  if (!req.userId) {
    return res
      .status(401)
      .json({ isAuthenticated: false, message: "Usuário não autenticado" });
  }
  return res.status(200).json({ isAuthenticated: true, userId: req.userId });
};

exports.logout = (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logout realizado com sucesso." });
};
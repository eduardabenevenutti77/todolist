const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res
      .status(401)
      .json({ message: "Não autorizado. Nenhum token fornecido." });
  }

  try {
    const decoded = jwt.verify(token, "dev");
    req.userId = decoded.userId;
    next();
  } catch (err) {
    return res.status(403).json({ message: "Token inválido ou expirado." });
  }
};

module.exports = authMiddleware;

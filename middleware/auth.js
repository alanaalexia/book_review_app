const jwt = require("jsonwebtoken");
const SECRET = "supersecretkey";

function authenticateJWT(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Token requerido" });

  jwt.verify(token, SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Token inválido" });
    req.user = user;
    next();
  });
}

module.exports = { authenticateJWT, SECRET };

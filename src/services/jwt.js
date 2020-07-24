const jwt = require('jsonwebtoken');

const { JWT_SECRET } = process.env;

const createToken = (user) => {
  const token = jwt.sign(
    { id: user.id },
    JWT_SECRET,
    { expiresIn: 3000 },
  );
  return token;
};

const authenticateWithJsonWebToken = (req, res, next) => {
  if (req.headers.authorization !== undefined) {
    const token = req.headers.authorization.split(' ')[1];
    jwt.verify(token, JWT_SECRET, (err) => {
      if (err) {
        res.status(401).json({ errorMessage: "Vous n'êtes pas autorisé à accéder à ce contenu" });
      } else {
        next();
      }
    });
  } else {
    res.status(401).json({ errorMessage: "Vous n'êtes pas autorisé à accéder à ce contenu" });
  }
};

module.exports = {
  createToken,
  authenticateWithJsonWebToken,
};
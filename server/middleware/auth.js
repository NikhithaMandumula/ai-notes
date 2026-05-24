import jwt from 'jsonwebtoken';

function auth(req, res, next) {
  // Try httpOnly cookie first, then Authorization header as fallback
  let token = req.cookies?.token;

  if (!token) {
    const header = req.headers.authorization;
    if (header && header.startsWith('Bearer ')) {
      token = header.split(' ')[1];
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id };
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token is invalid or expired' });
  }
}

export default auth;

import jwt from 'jsonwebtoken';

const onlineUsers = new Map();

function parseCookies(cookieHeader) {
  const cookies = {};
  if (!cookieHeader) return cookies;
  cookieHeader.split(';').forEach((cookie) => {
    const [name, ...rest] = cookie.trim().split('=');
    if (name) cookies[name] = decodeURIComponent(rest.join('='));
  });
  return cookies;
}

export function setupSocket(io) {
  // Authenticate socket connections using JWT
  io.use((socket, next) => {
    // Try cookie first, then handshake auth token as fallback
    const cookies = parseCookies(socket.request.headers.cookie);
    const token = cookies.token || socket.handshake.auth?.token;

    if (!token) {
      return next(new Error('Authentication required'));
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      next();
    } catch {
      return next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.userId;

    // Join a personal room named after the userId
    socket.join(userId);

    // Track online users (supports multiple tabs)
    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, new Set());
    }
    onlineUsers.get(userId).add(socket.id);

    socket.on('disconnect', () => {
      const sockets = onlineUsers.get(userId);
      if (sockets) {
        sockets.delete(socket.id);
        if (sockets.size === 0) {
          onlineUsers.delete(userId);
        }
      }
    });
  });
}

export { onlineUsers };

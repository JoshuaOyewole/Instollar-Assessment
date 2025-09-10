const jwt = require("jsonwebtoken");
const { StatusCodes } = require("http-status-codes");

// Protect routes
exports.protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    // Set token from Bearer token in header
    token = req.headers.authorization.split(" ")[1];
  }

  // Make sure token exists
  if (!token) {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      status: false,
      message:
        "Access token is required. Please provide a valid Bearer token in the Authorization header",
    });
  }

  try {
    // Verify token
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    if (!payload || !payload.id) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        status: false,
        message: "Invalid Token: Missing required fields in token payload",
      });
    }
    //Attached user info from token payload to req.user
    req.user = {
      id: payload.id,
      _id: payload.id, // For backward compatibility
      role: payload.role,
      email: payload.email,
      name: payload.name,
    };
    next();
  } catch (err) {
    // Error message mapping for cleaner code
    const errorMessages = {
      JsonWebTokenError: "Invalid token format",
      TokenExpiredError: "Token has expired",
      NotBeforeError: "Token is not active yet",
      CastError: "Invalid user ID in token",
    };

    const message =
      errorMessages[err.name] || "Not authorized to access this route";

    return res.status(StatusCodes.UNAUTHORIZED).json({
      status: false,
      message: message,
    });
  }
};

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        status: false,
        message: "Authentication required. Please log in first",
      });
    }

    if (!roles.includes(req.user.role)) {
      const allowedRoles = roles.join(", ");
      return res.status(StatusCodes.FORBIDDEN).json({
        status: false,
        message: `Access forbidden. Required role(s): ${allowedRoles}. Your role: ${req.user.role}`,
      });
    }
    next();
  };
};

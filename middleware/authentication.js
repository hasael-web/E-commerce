const CustomErrors = require("../errors");
const { isTokenValid } = require("../utils");

const authenticateUser = async (req, res, next) => {
  const token = req.signedCookies.token;

  if (!token) {
    throw new CustomErrors.UnauthenticatedError("Authentication invalid");
  }
  try {
    const { userId, name, role } = isTokenValid({ token });
    req.user = { userId, name, role };
    next();
  } catch (error) {
    throw new CustomErrors.UnauthenticatedError("Authentication invalid");
  }
};

const authorizedPermission = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new CustomErrors.UnauthorizedError(
        "Unauthorized to access this route "
      );
    }
    next();
  };
};

module.exports = { authenticateUser, authorizedPermission };

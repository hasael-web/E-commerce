const CusstomErrors = require("../errors");

const checkPermmisions = (requestUser, resourceUserId) => {
  //   console.log(requestUser);
  //   console.log(resourceUserId);
  //   console.log(typeof resourceUserId);
  if (requestUser.role === "admin") {
    return;
  }
  if (requestUser.userId === resourceUserId.toString()) {
    return;
  }
  throw new CusstomErrors.UnauthenticatedError(
    "not authorized to access this route"
  );
};

module.exports = { checkPermmisions };

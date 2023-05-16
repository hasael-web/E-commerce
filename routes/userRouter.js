const express = require("express");

const router = express.Router();

const {
  getAllUsers,
  getSingleUser,
  showCurrentUser,
  updateUser,
  updateUserPassword,
} = require("../controllers/userControllers");
const {
  authenticateUser,
  authorizedPermission,
} = require("../middleware/authentication");

router
  .route("/")
  .get(authenticateUser, authorizedPermission("admin"), getAllUsers);

router.route("/showMe").get(authenticateUser, showCurrentUser);
router.route("/updateUser").patch(authenticateUser, updateUser);
router.route("/updateUserPassword").patch(authenticateUser, updateUserPassword);

router
  .route("/:id")
  .get(authenticateUser, authorizedPermission("admin"), getSingleUser);

module.exports = router;

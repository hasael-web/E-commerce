const express = require("express");

const routes = express.Router();

const {
  authenticateUser,
  authorizedPermission,
} = require("../middleware/authentication");

const {
  createProduct,
  getAllProducts,
  getSingleProduct,
  updateProduct,
  deleteProduct,
  uploadImage,
} = require("../controllers/productController");

const { getSingleProductReview } = require("../controllers/reviewController");

routes
  .route("/")
  .post([authenticateUser, authorizedPermission("admin")], createProduct)
  .get(getAllProducts);

routes
  .route("/:id")
  .get(getSingleProduct)
  .patch([authenticateUser, authorizedPermission("admin")], updateProduct)
  .delete([authenticateUser, authorizedPermission("admin")], deleteProduct);

routes
  .route("/uploadImage")
  .post([authenticateUser, authorizedPermission("admin")], uploadImage);

routes.route("/:id/review").get(getSingleProductReview);

module.exports = routes;

const Product = require("../models/Product");
const CusstomErrors = require("../errors");
const { StatusCodes } = require("http-status-codes");
const path = require("path");

const createProduct = async (req, res) => {
  req.body.user = req.user.userId;

  const product = await Product.create(req.body);
  res.status(StatusCodes.CREATED).json({ product });
};

const getAllProducts = async (req, res) => {
  const products = await Product.find({}).populate("reviews");

  res.status(StatusCodes.OK).json({ products, count: products.length });
};

const getSingleProduct = async (req, res) => {
  const { id: productId } = req.params;

  const product = await Product.findOne({ _id: productId }).populate("reviews");

  if (!product) {
    throw new CusstomErrors.BadRequestError(
      `Not products with user id ${req.params.id}`
    );
  }

  res.status(StatusCodes.OK).json({ product });
};

const updateProduct = async (req, res) => {
  const { id: productId } = req.params;

  const product = await Product.findByIdAndUpdate(
    { _id: productId },
    req.body,
    { new: true, runValidators: true }
  );

  if (!product) {
    throw new CusstomErrors.BadRequestError(
      `No products with user id ${req.params.id}`
    );
  }

  res.status(StatusCodes.OK).json({ product });
};

const deleteProduct = async (req, res) => {
  const { id: productId } = req.params;

  const product = await Product.findById({ _id: productId });
  if (!product) {
    throw new CusstomErrors.BadRequestError(
      `No products with user id ${req.params.id}`
    );
  }

  await product.remove();

  res
    .status(StatusCodes.OK)
    .json({ msg: `Success to delete product with user id ${req.params.id}` });
};

const uploadImage = async (req, res) => {
  if (!req.files) {
    throw new CusstomErrors.BadRequestError(" No files to upload ");
  }
  let productImage = req.files.image;
  if (!productImage) {
    throw new CusstomErrors.BadRequestError("No image to upload");
  }
  if (!productImage.mimetype.startsWith("image")) {
    throw new CusstomErrors.BadRequestError("please upload image");
  }
  const maxSize = 30 * 1024 * 1024;
  if (productImage.size > maxSize) {
    throw new CusstomErrors.BadRequestError(
      `image size smaller than ${maxSize} bytes`
    );
  }
  const imagePath = path.join(
    __dirname,
    "../public/uploads/" + `${productImage.name}`
  );
  await productImage.mv(imagePath);
  res.status(StatusCodes.OK).json({ msg: productImage.name });
};

module.exports = {
  createProduct,
  getAllProducts,
  getSingleProduct,
  updateProduct,
  deleteProduct,
  uploadImage,
};

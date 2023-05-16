const Order = require("../models/Order");
const Product = require("../models/Product");
const CusstomError = require("../errors");
const { StatusCodes } = require("http-status-codes");
const { checkPermmisions } = require("../utils");

const createOrder = async (req, res) => {
  const fakeStripeAPI = async ({ amount, currency }) => {
    const client_secret = "someRandomValue";
    return { client_secret, amount };
  };
  const { items: cartItems, tax, shippingFee } = req.body;

  if (!cartItems || cartItems.length < 1) {
    throw new CusstomError.BadRequestError("Please provide cart items");
  }
  if (!tax || !shippingFee) {
    throw new CusstomError.BadRequestError(
      "Please provide tax and shippingFee"
    );
  }

  let orderItems = [];
  let subtotal = 0;

  for (const item of cartItems) {
    const dbProduct = await Product.findOne({ _id: item.product });
    if (!dbProduct) {
      throw new CusstomError.NotFoundError(
        `Not product with id ${item.product}`
      );
    }
    const { name, price, image, _id } = dbProduct;
    const singleOrderItem = {
      amount: item.amount,
      name,
      price,
      image,
      product: _id,
    };
    // add product to cart items
    orderItems = [...orderItems, singleOrderItem];
    // caculate subtotal
    subtotal += item.amount * price;
  }

  // caculate total
  const total = tax + shippingFee + subtotal;
  // client secret
  const paymentIntent = await fakeStripeAPI({
    amount: total,
    currency: "usd",
  });

  // create to Order schema
  const order = await Order.create({
    orderItems,
    total,
    subtotal,
    tax,
    shippingFee,
    clientSecret: paymentIntent.client_secret,
    user: req.user.userId,
  });

  res
    .status(StatusCodes.CREATED)
    .json({ order, clientSecret: order.clientSecret });
};

const getAllOrders = async (req, res) => {
  const orders = await Order.find({});
  res.status(StatusCodes.OK).json({ orders, count: orders.length });
};

const getSingleOrder = async (req, res) => {
  const { id: orderId } = req.params;

  const order = await Order.findById({ _id: orderId });
  if (!order) {
    throw new CusstomError.NotFoundError(`Not order with id ${orderId}`);
  }
  checkPermmisions(req.user, order.user);
  res.status(StatusCodes.OK).json({ order });
};

const getCurrentUserOrders = async (req, res) => {
  const orders = await Order.find({ user: req.user.userId });
  res.status(StatusCodes.OK).json({ orders, count: orders.length });
};

const updateOrder = async (req, res) => {
  const { id: orderId } = req.params;
  const { paymentIntent } = req.body;

  const order = await Order.findById({ _id: orderId });
  if (!order) {
    throw new CusstomError.NotFoundError(`Not order with id ${orderId}`);
  }
  checkPermmisions(req.user, order.user);
  order.paymentIntent = paymentIntent;
  order.status = "paid";
  order.save();

  res.status(StatusCodes.OK).json({ order });
};

module.exports = {
  getAllOrders,
  getSingleOrder,
  getCurrentUserOrders,
  createOrder,
  updateOrder,
};

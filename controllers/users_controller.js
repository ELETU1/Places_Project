const { v4: uuidv4 } = require("uuid");
const Http_error = require("../models/http_error");
const { validationResult } = require("express-validator");
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const getUsers = async (req, res, next) => {
  let users;
  try {
    users = await User.find({}, "-password");
  } catch (err) {
    const error = new Http_error(
      "Fetching users failed, please try again",
      500
    );
    return next(error);
  }

  res.json({ users: users.map((d) => d.toObject({ getters: true })) });
};

const signUp = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new Http_error("Invalid inputs passed, please check your data", 422)
    );
  }

  const { name, email, password } = req.body;

  let existUser;
  try {
    existUser = await User.findOne({ email: email });
  } catch (err) {
    const error = new Http_error("Signup failed, please try again", 500);
    return next(error);
  }

  if (existUser) {
    const error = new Http_error("User exist already", 422);
    return next(error);
  }

  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(password, 12);
  } catch (err) {
    const error = new Http_error(
      "Could not create a user, please try again",
      5000
    );
    return next(error);
  }

  const createUser = new User({
    name,
    email,
    password: hashedPassword,
    image: req.file.path,
    places: [],
  });

  try {
    await createUser.save();
  } catch (err) {
    const error = new Http_error(
      "Failed to sign up user, please try again",
      500
    );
    return next(error);
  }

  let token;
  try {
    token = jwt.sign(
      { userId: createUser.id, email: createUser.email },
      process.env.JWT_KEY,
      { expiresIn: "1h" }
    );
  } catch (err) {
    const error = new Http_error(
      "Failed to sign up user, please try again",
      500
    );
    return next(error);
  }

  res
    .status(201)
    .json({ userId: createUser.id, email: createUser.email, token: token });
};

const login = async (req, res, next) => {
  const { email, password } = req.body;

  let identifiedUser;
  try {
    identifiedUser = await User.findOne({ email: email });
  } catch (err) {
    const error = new Http_error("Failed to login user, please try again", 500);
    return next(error);
  }

  if (!identifiedUser) {
    const error = new Http_error(
      "Invalid credentials, could not log you in",
      401
    );
    return next(error);
  }

  let isValidPassword = false;
  try {
    isValidPassword = await bcrypt.compare(password, identifiedUser.password);
  } catch (err) {
    const error = new Http_error(
      "Could not log you in, please check your credentials and try again",
      500
    );
    return next(error);
  }

  if (!isValidPassword) {
    const error = new Http_error(
      "Invalid credentials, could not log you in",
      401
    );
    return next(error);
  }

  let token;
  try {
    token = jwt.sign(
      { userId: identifiedUser.id, email: identifiedUser.email },
      process.env.JWT_KEY,
      { expiresIn: "1h" }
    );
  } catch (err) {
    const error = new Http_error(
      "Failed to log user in, please try again",
      500
    );
    return next(error);
  }

  res.json({
    userId: identifiedUser.id,
    email: identifiedUser.email,
    token: token,
  });
};

exports.getUsers = getUsers;
exports.signUp = signUp;
exports.login = login;

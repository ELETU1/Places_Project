const express = require("express");
const { check } = require("express-validator");

const userController = require("../controllers/users_controller");
const fileUpload = require("../middleware/File_Upload");

const routes = express.Router();

routes.get("/", userController.getUsers);

routes.post(
  "/signup",
  fileUpload.single("image"),
  [
    check("name").not().isEmpty(),
    check("email").normalizeEmail().isEmail(),
    check("password").isLength({ min: 6 }),
  ],
  userController.signUp
);

routes.post("/login", userController.login);

module.exports = routes;

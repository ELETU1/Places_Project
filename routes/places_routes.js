const { Router } = require("express");
const { check } = require("express-validator");

const placesController = require("../controllers/places_controller");
const fileUpload = require("../middleware/File_Upload");
const checkAuth = require("../middleware/Check_Auth");

const router = Router();

router.get("/:pid", placesController.getPlaceById);

router.get("/user/:uid", placesController.getPlacesByUserId);

router.use(checkAuth);

router.post(
  "/",
  fileUpload.single("image"),
  [
    check("title").not().isEmpty(),
    check("desc").isLength({ min: 5 }),
    check("addr").not().isEmpty(),
  ],
  placesController.createPlace
);

router.patch(
  "/:pid",
  [check("title").not().isEmpty(), check("desc").isLength({ min: 5 })],
  placesController.updatePlace
);

router.delete("/:pid", placesController.deletePlace);

module.exports = router;

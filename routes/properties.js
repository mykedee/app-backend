const express = require("express");
const {
  getProperties,
  getProperty,
  getSimilarProperties,
  createProperty,
  deleteProperty,
  getSearch,
  getOwnProperties,
  unpublishProperty,
  approvePost,
  bookMarkProperty,
  checkbookMarkProperty,
  getPropertyById,
} = require("../controllers/properties");
const { protect, authorize } = require("../middleware/auth");
const upload = require("../middleware/upload");

const router = express.Router();

router.post("/properties", upload.array("images"), protect, createProperty);
router.get("/properties", getProperties);
router.get("/properties/me", protect, getOwnProperties);
router.get("/properties/:slug", getProperty);
router.get("/properties/:propertyId", getPropertyById);

router.get("/properties/related/:slug", getSimilarProperties);
router.delete(
  "/properties/:id",
  protect,
  authorize("admin", "user"),
  deleteProperty
);
// router.patch(
//   "/properties/:id",
//   protect,
//   authorize("admin", "user"),
//   unpublishProperty
// );

router.patch(
  "/properties/:propertyId",
  protect,
  authorize("admin"),
  approvePost
);
router.get("/propertiess", getSearch);

module.exports = router;

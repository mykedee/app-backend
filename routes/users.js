const express = require("express");
const {
  getUsers,
  deleteUser,
  bookMarkProperty,
  checkbookMarkProperty,
  getMe,
  getBookmarks
} = require("../controllers/users");
const { protect, authorize } = require("../middleware/auth");


const router = express.Router();

router.delete('/users/:id', protect, authorize('admin'), deleteUser)
router.get("/users", protect, authorize("admin"),  getUsers);
router.get("/users/bookmarks", protect, getBookmarks);

router.post("/users/bookmark/:propertyId", protect, bookMarkProperty);
router.get("/users/bookmark/:propertyId", protect, checkbookMarkProperty);


router.get("/users/me", protect, getMe);

module.exports = router;

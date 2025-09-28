const express = require("express");
const {
  sendMessage,
  getMessages,
  readMessage,
  deleteMessage,
  markAsRead
} = require("../controllers/messages");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.post("/messages", protect, sendMessage);
router.get("/messages", protect, getMessages);
router.get("/messages/:id", protect, readMessage);
router.post("/messages/delete", protect, deleteMessage);
router.post("/messages/read", protect, markAsRead);


module.exports = router;

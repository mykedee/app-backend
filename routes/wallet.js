const express = require("express");
const {
  getWalletBalance,
} = require("../controllers/wallet");
const { protect, authorize } = require("../middleware/auth");


const router = express.Router();

router.get("/wallet/:id/balance", protect, getWalletBalance);

module.exports = router;

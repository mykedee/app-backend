const Wallet = require("../models/wallet");

exports.getWalletBalance = async (req, res) => {
    const { id } = req.user;
  try {
    const walletBalance = await Wallet.findOne({owner: id}).populate("owner", "_id")
    res.status(201).json({
      success: true,
      walletBalance,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

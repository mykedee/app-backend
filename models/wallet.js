const mongoose = require("mongoose");

const walletSchema = new mongoose.Schema(
  {
    balance: { type: Number, required: true, default: 0 },
    ownerID: {
      type: String,
      unique: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);


module.exports = mongoose.model("Wallet", walletSchema);

const mongoose = require("mongoose");

const walletSchema = new mongoose.Schema(
  {
    balance: { type: Number, required: true, default: 0 },
    ownerID: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
     },
  },  { timestamps: true }

);


module.exports = mongoose.model("Wallet", walletSchema);

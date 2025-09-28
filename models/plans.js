const mongoose = require("mongoose");

const planSchema = new Schema({
  listingName: {
    type: String,
    required: true,
  },
  autoboost: {
    type: Number,
    required: true,
  },
  viewRequest: { type: String, required: true },
  manualBoost: { type: Number, required: true },
  goldBoost: {
    type: Number,
    required: true,
  },
  frontpageLogo: {
    type: String,
    required: true,
  },
  banner: {
    type: String,
    required: true,
  },
  socialmediaPromo: { type: String, required: true },
});


module.exports = mongoose.model('Plan', planSchema)
const mongoose = require("mongoose");
const slugify = require("slugify");

const categorySchema = new mongoose.Schema({
  type: {
    type: String,
    required: [true, "name is required"],
    unique: true,
  },
  photo: {
    type: String,
  },
  slug: {
    type: String,
    slug: "type",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});



categorySchema.pre("save", function () {
  this.slug = slugify(this.type, { replacement: "-", lower: true });
});
module.exports = mongoose.model("Category", categorySchema);

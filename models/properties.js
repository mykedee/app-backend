const mongoose = require('mongoose');
const slugify = require('slugify');
const { nanoid } = require("nanoid");

const propertySchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      // required: true,
    },
    description: {
      type: String,
    },
    location: {
      street: {
        type: String,
      },
      city: {
        type: String,
      },
      state: {
        type: String,
      },
    },
    beds: {
      type: Number,
      // required: true,
    },
    baths: {
      type: Number,
      // required: true,
    },
    square_feet: {
      type: Number,
      // required: true,
    },
    amenities: [
      {
        type: String,
      },
    ],
    rates: {
      nightly: {
        type: Number,
      },
      weekly: {
        type: Number,
      },
      monthly: {
        type: Number,
      },
    },
    images: [
      {
        type: String,
      },
    ],
    postID: {
      type: String,
    },
    is_featured: {
      type: Boolean,
      default: false,
    },
    is_promoted: {
      type: Boolean,
      default: false,
    },
    slug: {
      type: String,
      slug: "name",
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "draft"],
      default: "pending",
    },
    moderationMessage: {
      type: String,
      default: null,
    },
    notification: {
      seen: {
        type: Boolean,
        default: false,
      },
      createdAt: {
        type: Date,
        default: Date.now,
            },
    },
  },
  {
    timestamps: true,
  }
);

propertySchema.pre("save", function () {
  this.postID = nanoid(10);
  this.slug = slugify(
    this.name.split(" ").join("-") + "-" + this.postID,
    { lower: true }
  );
});

module.exports = mongoose.model("Property", propertySchema);
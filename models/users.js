const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema(
  {
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false },
    agree_terms: { type: String, default: true },
    phone_number: { type: Number, required: true },
    role: {
      type: String,
      default: "user",
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    regToken: {
      type: String,
    },
    regTokenExpire: {
      type: Date,
    },
    resetPasswordToken: {
      type: String,
      default: undefined,
    },
    forgotPasswordTokenExpire: {
      type: Date,
    },
    // password: { type: String, required: true },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  // if (this.provider !== "credentials") {
  //   return next();
  // }
  // if (this.provider === "credentials" && !this.password) {
  //   return next(new Error("Password is required"));
  // }
  // if (this.provider === "credentials" && !this.isModified("password")) {
  //   return next();
  // }

  if (!this.isModified("password")) {
    next();
  }
  try {
    let salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.JWTSignToken = function () {
  return jwt.sign(
    {
      id: this._id,
      role: this.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );
};

module.exports = mongoose.model("User", userSchema);

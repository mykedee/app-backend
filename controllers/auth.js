const User = require("../models/users");
const crypto = require("crypto");
const Email = require("../utils/sendEmail");
const ErrorResponse = require("../utils/errorResponse");
const Wallet = require("../models/wallet");

// login
// forgotpassword
// resetpassword
// updatepassword
// logout
// sendtokenresponse
// verifyuser
// resendverificationcode

const copyRightDate = new Date().getFullYear();

exports.signup = async (req, res, next) => {
  try {
    const { firstname, lastname, email, password, phone_number } = req.body;
    if (!firstname || !lastname || !email || !password) {
      return res.status(400).json({ message: "All fields are required!" });
    }
    let userExist = await User.findOne({ email });
    if (userExist) {
      return next(new ErrorResponse("Email is already taken", 400));
    }
    const genToken = crypto.randomBytes(20).toString("hex");
    let regToken = crypto.createHash("sha256").update(genToken).digest("hex");

    console.log("gen Token here", genToken);
    console.log("reg Token here", regToken);

    const regTokenExpire = Date.now() + 15 * 60 * 1000;

    const Url = `${req.protocol}://${req.get("host")}/verify/${genToken}`;

    const walletID = crypto.randomBytes(12).toString("hex");
    const wallet = await Wallet.create({
      walletID,
      balance: 0,
    });

    const user = await User.create({
      firstname,
      lastname,
      email,
      phone_number,
      password,
      regToken,
      regTokenExpire,
      walletID: wallet._id,
    });

    wallet.owner = user._id;
    await wallet.save();

    await new Email({
      email: user.email,
      Url,
      firstname,
    }).sendWelcomeMessage();

    sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
};

exports.signin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required!",
      });
    }
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const isMatched = await user.comparePassword(password);
    if (!isMatched) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    sendTokenResponse(user, 200, res);
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

exports.verifyEmail = async (req, res, next) => {
  // const registerToken = crypto
  //   .createHash("sha256")
  //   .update(req.params.regToken)
  //   .digest("hex");

  try {
    // let registerToken = req.params.regToken;
    const Token = crypto
      .createHash("sha256")
      .update(req.params.genToken)
      .digest("hex");
    console.log(Token);

    let user = await User.findOne({
      regToken: Token,
      regTokenExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired link" });
    }

    user.regTokenExpire = undefined;
    user.regToken = undefined;
    user.isActive = true;
    console.log("user", user);
    await user.save();
    sendTokenResponse(user, 200, res);
  } catch (error) {
    res.json({ error: error.message });
  }
};

// exports.verifyEmail = async (req, res, next) => {
//   //get hash token
//   const Token = crypto.createHash("sha256").update(req.params.regToken).digest("hex");

//   let user = await User.findOne({
//     Token,
//     regTokenExpire: { $gt: Date.now() },
//   });
//   console.log(user)
//   if (!user) {
//     return res.status(400).json({message: "Invalid or expired token"});
//   }
//   //set new password
//   // user.regTokenExpire = undefined;
//   // user.regToken = undefined;
//   // user.isActive = true;

//   // await user.save();
//   // sendTokenResponse(user, 200, res);
// };

// exports.getUsers = async (req, res) => {
//   try {
//     const users = await User.find();
//     res.status(200).json({
//       success: true,
//       users,
//     });
//   } catch (error) {
//     res.status(400).json({
//       message: error.message,
//     });
//   }
// };

// exports.getUser = async (req, res) => {
//   try {
//     const user = await User.findById(req.params.id);
//     res.status(200).json({
//       success: true,
//       user,
//     });
//   } catch (error) {
//     res.status(400).json({
//       message: error.message,
//     });
//   }
// };

// exports.verifyEmail = async (req, res, next) => {
//   let { email } = req.body;
//   let user = await User.findOne({ email });
//   if (!user) {
//     return next(new ErrorResponse("User with that email does not exist", 404));
//   }

//   // get reset token
//   const resetToken = user.getResetPasswordToken();
//   await user.save({ validateBeforeSave: false });

//   //create reset URL
//   const Url = `${req.protocol}://${req.get(
//     "host"
//   )}/resetpassword/${resetToken}`;

//   try {
//     let username = user.username;

//     await new Email({
//       email: user.email,
//       Url,
//       username,
//       copyRightDate,
//     }).sendForgotPasswordMessage();

//     return res.status(200).json({
//       success: true,
//       message: "Reset password link successfully sent to your email",
//     });
//   } catch (error) {
//     user.resetPasswordToken = undefined;
//     user.resetPasswordExpire = undefined;
//     await user.save({ validateBeforeSave: false });
//     return res.status(500).json({
//       message: error.message,
//     });
//   }
// }

// //reset password
// exports.resetPassword = asyncHandler(async (req, res, next) => {
//   //get hash token
//   const resetPasswordToken = crypto
//     .createHash("sha256")
//     .update(req.params.resettoken)
//     .digest("hex");

//   let user = await User.findOne({
//     resetPasswordToken,
//     resetPasswordExpire: { $gt: Date.now() },
//   });
//   if (!user) {
//     return next(new ErrorResponse("Invalid or expired token", 400));
//   }
//   //set new password
//   user.password = req.body.password;
//   user.resetPasswordExpire = undefined;
//   user.resetPasswordToken = undefined;
//   await user.save();
//   sendTokenResponse(user, 200, res);
// });

// exports.resendToken = async (req, res) => {
//   try {
//     const { firstname, lastname, email, password, user_type, agree_terms } =
//       req.body;
//     if (!firstname || !lastname || !email || !password) {
//       return res.status(400).json({ message: "All fields are required!" });
//     }
//     let userExist = await User.findOne({ email });
//     if (userExist) {
//       return res.status(400).json({ message: "Email is already taken" });
//     }
//     const genToken = crypto.randomBytes(20).toString("hex");
//     let regToken = crypto.createHash("sha256").update(genToken).digest("hex");

//     console.log("gen Token here", genToken);
//     console.log("reg Token here", regToken);

//     const regTokenExpire = Date.now() + 15 * 60 * 1000;

//     // const Url = `${req.protocol}://${req.get(
//     //   "host"
//     // )}/verify/${genToken}`;

//     const user = await User.create({
//       firstname,
//       lastname,
//       email,
//       password,
//       user_type,
//       agree_terms,
//       regToken,
//       regTokenExpire,
//     });
//     sendTokenResponse(user, 200, res);
//   } catch (error) {
//     res.status(400).json({
//       message: error.message,
//     });
//   }
// };

// you disappointed me this evening , i was expecting you to say hey i'm busy just like the last time i called,

// How are you doing, about day.

// are you still at home,

// when will you be back to school,

// I just want to check on you, since you have chosen to act as if you didnt see the message I sent since morning.

exports.resendVerifyToken = async (req, res, next) => {
  const user = req.user;
  // console.log(user)

  if (user.isActive === true) {
    return res.status(400).json({ message: "Email is already verified" });
  }

  const genToken = crypto.randomBytes(20).toString("hex");
  let regToken = crypto.createHash("sha256").update(genToken).digest("hex");

  console.log("gen Token here", genToken);
  console.log("reg Token here", regToken);

  const regTokenExpire = Date.now() + 15 * 60 * 1000;

  user.regToken = regToken;
  user.regTokenExpire = regTokenExpire;

  const Url = `${req.protocol}://${req.get("host")}/verify/${genToken}`;

  await user.save({ validateBeforeSave: true });

  await new Email({
    email: user.email,
    Url,
    firstname: user.firstname,
  }).sendWelcomeMessage();

  res.status(201).json({
    success: true,
    message: "Verification email sent to your email successfully",
  });
};

//forgot password
exports.forgotPassword = async (req, res, next) => {
  let { email } = req.body;
  let user = await User.findOne({ email });
  if (!user) {
    return res.json({ message: "User with that email does not exist" });
  }
  const genForgotPasswordToken = crypto.randomBytes(20).toString("hex");
  let resetPasswordToken = crypto
    .createHash("sha256")
    .update(genForgotPasswordToken)
    .digest("hex");
  let forgotPasswordTokenExpire = Date.now() + 15 * 60 * 1000;

  console.log(genForgotPasswordToken);
  console.log(resetPasswordToken);
  // get reset token
  user.resetPasswordToken = resetPasswordToken;
  user.forgotPasswordTokenExpire = forgotPasswordTokenExpire;

  // create reset URL
  const Url = `${req.protocol}://${req.get(
    "host"
  )}/reset-password/${genForgotPasswordToken}`;

  await new Email({
    email: user.email,
    Url,
    username: user.firstname,
    copyRightDate,
  }).sendForgotPasswordMessage();

  await user.save({ validateBeforeSave: false });
  return res.status(200).json({
    success: true,
    message: "Reset password link successfully sent to your email",
  });
  //create reset URL
  // const Url = `${req.protocol}://${req.get(
  //   "host"
  // )}/reset-password/${genForgotPasswordToken}`;

  // try {
  //   let username = user.username;

  //   await new Email({
  //     email: user.email,
  //     Url,
  //     username,
  //     copyRightDate,
  //   }).sendForgotPasswordMessage();

  //   return res.status(200).json({
  //     success: true,
  //     message: "Reset password link successfully sent to your email",
  //   });
  // } catch (error) {
  //   user.resetPasswordToken = undefined;
  //   user.resetPasswordExpire = undefined;
  //   await user.save({ validateBeforeSave: false });
  //   return res.status(500).json({
  //     message: error.message,
  //   });
  // }
};

//reset password
exports.resetPassword = async (req, res, next) => {
  //get hash token
  const Token = crypto
    .createHash("sha256")
    .update(req.params.genForgotPasswordToken)
    .digest("hex");
  console.log(Token);

  let user = await User.findOne({
    resetPasswordToken: Token,
    forgotPasswordTokenExpire: { $gt: Date.now() },
  });
  if (!user) {
    return res.status(400).json({ message: "Invalid or expired link" });
  }

  // if (user.resetPasswordToken === undefined) {
  //   return res.status(400).json({ message: "Invalid or expired token" });
  // }

  let timeDiff = Date.now() - user.forgotPasswordTokenExpire;
  const durationMinutes = 15 * 60 * 1000;
  if (timeDiff >= durationMinutes) {
    return next(res.json({ message: "Verification token is expired" }));
  }

  //set new password
  try {
    user.password = req.body.password;
    user.forgotPasswordTokenExpire = undefined;
    user.resetPasswordToken = undefined;
    await user.save();
    sendTokenResponse(user, 200, res);
  } catch (error) {
    res.status(400).json({ message: "Invalid or expired link" });
  }
};

exports.logout = (req, res, next) => {
  res.cookie("token", "", {
    expires: new Date(0),
    httpOnly: true,
  });
  res.status(200).json({
    message: "Logged out successfully",
  });
};

const sendTokenResponse = (user, statusCode, res) => {
  let token = user.JWTSignToken();
  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV !== "development",
    sameSite: "strict",
    maxAge: process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000,
  };

  res
    .status(statusCode)
    .cookie("token", token, options)
    .json({
      success: true,
      token,
      user: {
        id: user._id,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
      },
    });
};

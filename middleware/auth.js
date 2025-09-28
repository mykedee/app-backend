const jwt = require("jsonwebtoken");
const User = require("../models/users");

// exports.protect = async (req, res, next) => {
//   token = req.cookies.token;
//   if (token) {
//     try {
//       const decoded = jwt.verify(token, process.env.JWT_SECRET);
//       req.user = await User.findById(decoded.id);
//       next();
//     } catch (error) {
//       return res.status(401).json({
//         message: "Not authorised to access this route",
//       });
//     }
//   } else {
//     return res.status(401).json({
//       message: "Not authorised to access this route",
//     });
//   }
// };

exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
    return res.status(403).json({
        error: "Not authorised to access this route",
      });
    }
    next();
  };
};



exports.protect = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1]; 
  }
  else if (req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({
      message: "Not authorised to access this route",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id); //
    next();
  } catch (error) {
    return res.status(401).json({
      message: "Not authorised to access this route",
    });
  }
};
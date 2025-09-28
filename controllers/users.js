const User = require("../models/users");
const Property = require("../models/properties");
const asyncHandler = require("../middleware/asyncHandler");
const ErrorResponse = require("../utils/errorResponse");

exports.getUsers = asyncHandler(async (req, res, next) => {
    const pageSize = process.env.pageSize;
    const page = Number(req.query.page) || 1;
    const keyword = req.query.keyword
      ? { title: { $regex: req.query.keyword, $options: "i" } }
      : {};
    const count = await User.countDocuments({ ...keyword });
    const users = await User.find({ ...keyword })
      .limit(pageSize)
      .skip(pageSize * (page - 1));

    res.status(200).json({
      success: true,
      count: users.length,
      users,
      pages: Math.ceil(count / pageSize),
      count,
      pageSize,
      keyword,
      page,
    });
});

exports.deleteUser =asyncHandler(async (req, res, next) => {
    await User.findByIdAndDelete(req.params.id);
    if (req.user.role !== "admin") {
return next(new ErrorResponse("You are not authorized to perform this action", 401))
    }
    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
});

// exports.bookMarkProperty = async (req, res) => {
//   try {
//     const { _id } = req.params;
//     const propertyId = await Property.findById(_id);
//     if (!propertyId) {
//       return res.status(404).json({ message: "Property not found" });
//     }
//     const user = await User.findById(req.user);
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }
//     let isBookmarked = user.bookmarks.includes(_id);
//     if (isBookmarked) {
//       user.bookmarks.pull(_id);
//       isBookmarked = false;
//       await user.save();
//       return res.status(201).json({
//         isBookmarked,
//         message: "Bookmark removed",
//       });
//     } else {
//       user.bookmarks.push(_id);
//       isBookmarked = true;
//       await user.save();
//       return res.status(201).json({
//         isBookmarked,
//         message: "Property bookmarked",
//       });
//     }
//   } catch (error) {
//     res.status(200).json({
//       error: error.message,
//     });
//   }
// };

// exports.checkbookMarkProperty = async (req, res) => {
//   try { 
    
//     if (!req.user || !req.user._id) {
//         return res
//           .status(401)
//           .json({ message: "Unauthorized. User not found." });
//       }
//     const { _id } = req.params;
//     const propertyId = await Property.findById(_id);
//     if (!propertyId) {
//       return res.status(404).json({ message: "Property not found" });
//     }

     
//     // const user = req.user._id.toString();
//     // console.log(user)
//     // if (!user) {
//     //   return res.status(404).json({ message: "User not found" });
//     // }

//     // const user = await User.findById(userId); // Ensure you fetch the full user
//     // if (!user) {
//     //   return res.status(404).json({ message: "User not found" });
//     // }

//     let isBookmarked = req.user.bookmarks.includes(_id);
    
//     console.log(isBookmarked)
//     return res.status(200).json({
//       isBookmarked,
//     });
//   } catch (error) {
//     res.status(400).json({
//       error: error.message,
//     });
//   }
// };

exports.getMe = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user.id).select(
      "firstname lastname email"
    );
    res.status(200).json({
      success: true,
      user,
    });
});

exports.getBookmarks = asyncHandler(async (req, res, next) => {
    const pageSize = Number(process.env.pageSize);
    const page = Number(req.query.page) || 1;
    const skip = (page - 1) * pageSize;

    const bookmarks = await User.findById(req.user.id)
      .populate("bookmarks")
      .select("bookmarks")
      .limit(pageSize)
      .skip(skip);;
    const count = bookmarks.bookmarks.length;

    res.status(200).json({
      pageSize,
      pages: Math.ceil(count / pageSize),
      page,
      count,
      success: true,
      bookmarks,
    });
  
});


exports.bookMarkProperty = asyncHandler(async (req, res, next) => {
    const { propertyId } = req.params;
    const property = await Property.findById(propertyId);
    if (!property) {
      return next( new ErrorResponse("Property not found", 400))
    }
    const user = req.user;
    // if (!user) {
    //   return res.status(404).json({ message: "User not found" });
    // }

    if (!req.user || !req.user._id) {
            return next(
              new ErrorResponse("Unauthorized. User not found.", 401)
            );
    }

    let isBookmarked = user.bookmarks.includes(propertyId);
    if (isBookmarked) {
      user.bookmarks.pull(propertyId);
      isBookmarked = false;
      await user.save();
      return res.status(201).json({
        isBookmarked,
        message: "Bookmark removed",
      });
    } else {
      user.bookmarks.push(propertyId);
      isBookmarked = true;
      await user.save();
      return res.status(201).json({
        isBookmarked,
        message: "Property bookmarked",
      });
    }  
});

exports.checkbookMarkProperty = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "Unauthorized. User not found." });
    }
    const { propertyId } = req.params;
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    // const user = req.user._id.toString();
    // console.log(user)
    // if (!user) {
    //   return res.status(404).json({ message: "User not found" });
    // }

    // const user = await User.findById(userId); // Ensure you fetch the full user
    // if (!user) {
    //   return res.status(404).json({ message: "User not found" });
    // }

    let isBookmarked = req.user.bookmarks.includes(propertyId);

    return res.status(200).json({
      isBookmarked,
    });
  } catch (error) {
    res.status(400).json({
      error: error.message,
    });
  }
};
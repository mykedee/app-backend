const qs = require("qs");
const ErrorResponse = require("../utils/errorResponse");
const Property = require("../models/properties");
const Category = require("../models/categories");
const User = require("../models/users");
const fs = require("fs");
const { Readable } = require("stream");
const path = require("path");
const postStatus = require("../utils/postStatus");
const users = require("../models/users");
const asyncHandler = require("../middleware/asyncHandler");
const cloudinary = require("cloudinary").v2;
cloudinary.config({
  cloud_name: "djpa4rbye",
  api_key: "262959894313486",
  api_secret: "n161pQqraTiMZu1VqLSAPq4vMCQ",
});

exports.getProperty = asyncHandler(async (req, res, next) => {
    const slug = req.params.slug;
    const property = await Property.findOne({ slug })
      .populate("category", "type")
      .populate("owner", "firstname lastname createdAt");
    if (!property) {
        return next(
        new ErrorResponse('Propertys not found', 400)
      );
    }
    res.status(200).json({
      success: true,
      property,
    });
});

exports.getPropertyById = asyncHandler(async (req, res, next) => {
    const { propertyId } = req.params;
    const property = await Property.findById(propertyId)
      .populate("category", "type")
      .populate("owner", "firstname lastname createdAt");
    if (!property) {
      return next(
        new ErrorResponse(`Propertys not fond with id of ${propertyId}`, 404)
      );
    }
    res.status(200).json({
      success: true,
      property,
    });
}) 

exports.getSimilarProperties = asyncHandler(async (req, res, next) => {
    const slug = req.params.slug;
    const property = await Property.findOne({ slug }).populate(
      "category",
      "type _id"
    );

    const categoryName = property.category._id;
    const related = await Property.find({
      _id: { $ne: property },
      category: categoryName,
    })
      .limit(4)
      .populate("category", "type _id")
      .exec();
    res.status(200).json({
      success: true,
      related,
    });
});

exports.deleteProperty = asyncHandler(async (req, res, next) => {
  let property = await Property.findById(req.params.id);
  if (!property) {
    return next(
      new ErrorResponse(`Property not found`, 404)
    );
  }

  if (property.owner.toString() !== req.user.id && req.user.role !== "admin") {
      return next(
        new ErrorResponse("User is not authorized to delete post", 404)
      );
  }
  // delete image from cloudinary
  const publicIds = property.images.map((imageUrl) => {
    const parts = imageUrl.split("/");
    return parts.at(-1).split(".").at(0);
  });

  if (publicIds.length > 0) {
    for (let publicId of publicIds) {
      await cloudinary.uploader.destroy("propertyFinder/" + publicId);
    }
  }
  await Property.findByIdAndDelete(req.params.id);
  await users.updateMany(
    { bookmarks: property }, // Find users who have this property bookmarked
    { $pull: { bookmarks: property } } // Remove property from their bookmarks list
  );

  res.status(200).json({
    success: true,
    message: " Property deleted successfully",
  });
});

exports.createProperty = asyncHandler(async (req, res) => {
    const { name, description, amenities, category, beds, baths, square_feet } =
      req.body;

    let imagesUrl = [];
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        message: "Property image is required",
      });
    }

    const uploadImg = await Promise.all(
      req.files.map((file) => {
        return new Promise((resolve, reject) => {
          // Create a readable stream from the file buffer
          const bufferStream = Readable.from(file.buffer);

          // Upload the buffer stream to Cloudinary
          const uploadStream = cloudinary.uploader.upload_stream(
            { folder: "propertyFinder" },
            (error, result) => {
              if (error) {
                console.error("Cloudinary upload error:", error);
                reject("Failed to upload image to Cloudinary");
              } else {
                // Successfully uploaded, resolve with the image URL
                resolve(result.secure_url);
              }
            }
          );
          bufferStream.pipe(uploadStream);
        });
      })
    );

    imagesUrl = uploadImg;

    const amenityArray =
      typeof amenities === "string"
        ? amenities.split(",").map((prop) => prop.trim())
        : amenities;

    // Build `rates` manually from the flat structure in req.body
    let rateData = {};
    if (req.body["rates.monthly"]) rateData.monthly = req.body["rates.monthly"];
    if (req.body["rates.weekly"]) rateData.weekly = req.body["rates.weekly"];
    if (req.body["rates.nightly"]) rateData.nightly = req.body["rates.nightly"];
    if (req.body["rates.yearly"]) rateData.nightly = req.body["rates.yearly"];

    let locationData = {
      street: req.body["location.street"],
      city: req.body["location.city"],
      state: req.body["location.state"],
    };

    if (!category) {
      return res.status(400).json({ message: "Category is required" });
    }

    let property = await Property.create({
      images: imagesUrl,
      category,
      name,
      description,
      beds,
      baths,
      square_feet,
      owner: req.user.id,
      amenities: amenityArray,
      rates: rateData,
      location: locationData,
    });
    res.status(201).json({
      property,
      success: true,
      message: "Product created successfully",
    });
  }
);

const handleCategoryFilter = async (key, value, filters) => {
  const field = key.split(".")[1];
  if (field === "type") {
    const category = await Category.findOne({
      type: { $regex: new RegExp("^" + value + "$", "i") },
    }).select("_id");

    if (category) {
      filters.push({ category: category._id });
    } else {
      filters.push({ category: null });
    }
  }
};

const handleLocationFilter = (key, value, filters) => {
  const field = key.split(".")[1];
  try {
    const regex = new RegExp(value, "i");
    filters.push({
      [`location.${field}`]: { $regex: regex },
    });
  } catch (error) {
    console.error("Error creating regex:", error);
  }
};

const handlePriceFilter = (minPrice, maxPrice, filters) => {
  const priceFilter = { $or: [] };

  if (minPrice) {
    priceFilter.$or.push({ "rates.nightly": { $gte: Number(minPrice) } });
    priceFilter.$or.push({ "rates.weekly": { $gte: Number(minPrice) } });
    priceFilter.$or.push({ "rates.monthly": { $gte: Number(minPrice) } });
  }

  if (maxPrice) {
    priceFilter.$or.push({ "rates.nightly": { $lte: Number(maxPrice) } });
    priceFilter.$or.push({ "rates.weekly": { $lte: Number(maxPrice) } });
    priceFilter.$or.push({ "rates.monthly": { $lte: Number(maxPrice) } });
  }

  if (priceFilter.$or.length) filters.push(priceFilter);
};

exports.getProperties = asyncHandler(async (req, res, next) => {
    const queryParams = req.query;
    const filters = [];
    const statusFilter = postStatus(queryParams.status);
    // filters.push(statusFilter);

    // Parse minPrice and maxPrice
    const minPrice = parseInt(queryParams.minPrice);
    const maxPrice = parseInt(queryParams.maxPrice);

    if (minPrice && maxPrice) {
      filters.push({
        $or: [
          { "rates.nightly": { $gte: minPrice, $lte: maxPrice } },
          { "rates.weekly": { $gte: minPrice, $lte: maxPrice } },
          { "rates.monthly": { $gte: minPrice, $lte: maxPrice } },
        ],
      });
    }

    // Process other filters
    const { type, beds, location, name, rates } = queryParams;

    if (type) filters.push({ "category.type": type });
    if (beds) filters.push({ beds: parseInt(beds) });
    if (location)
      filters.push({ "location.city": { $regex: new RegExp(location, "i") } });
    if (name) filters.push({ name: { $regex: new RegExp(name, "i") } });

    // Final query construction
    const query = filters.length ? { $and: filters } : {};
    // console.log("Final Query:", query);

    // MongoDB query
    const pageSize = Number(process.env.pageSize);
    const page = Number(req.query.page) || 1;
    const count = await Property.countDocuments(query);
    const skip = (page - 1) * pageSize;

    const properties = await Property.find(query)
      .populate("category", "type _id")
      .populate("owner", "firstname lastname createdAt")
      .limit(pageSize)
      .skip(skip);

    res.status(200).json({
      success: true,
      properties,
      pageSize,
      pages: Math.ceil(count / pageSize),
      page,
      count,
    })
});

exports.getOwnProperties = asyncHandler(async (req, res, next) => {
    const userId = req.user.id;
    const queryParams = req.query;
    const filters = [];
    filters.push({ owner: userId });

    // Parse minPrice and maxPrice
    const minPrice = parseInt(queryParams.minPrice);
    const maxPrice = parseInt(queryParams.maxPrice);

    if (minPrice && maxPrice) {
      filters.push({
        $or: [
          { "rates.nightly": { $gte: minPrice, $lte: maxPrice } },
          { "rates.weekly": { $gte: minPrice, $lte: maxPrice } },
          { "rates.monthly": { $gte: minPrice, $lte: maxPrice } },
        ],
      });
    }

    // Process other filters
    const { type, beds, location, name, rates } = queryParams;
    if (type) filters.push({ "category.type": type });
    if (beds) filters.push({ beds: parseInt(beds) });
    if (location)
      filters.push({ "location.city": { $regex: new RegExp(location, "i") } });
    if (name) filters.push({ name: { $regex: new RegExp(name, "i") } });

    // Final query construction
    const query = filters.length ? { $and: filters } : { owner: userId };

    // console.log("Final Query:", query);

    // MongoDB query
    const pageSize = Number(process.env.pageSize);
    const page = Number(req.query.page) || 1;
    const count = await Property.countDocuments(query);
    const skip = (page - 1) * pageSize;

    const properties = await Property.find(query)
      .populate("category", "type _id")
      .populate("owner", "firstname lastname createdAt")
      .limit(pageSize)
      .skip(skip);
if(!properties) {
    return next(
      new ErrorResponse(`Propertys not found`, 404)
    );
}
    res.status(200).json({
      success: true,
      properties,
      pageSize,
      pages: Math.ceil(count / pageSize),
      page,
      count,
    });
});

exports.getSearch = asyncHandler(async (req, res, next) => {
    const properties = await Property.find({});
    // .populate("category", "type _id ")
    // .populate("owner", "firstname lastname");
    res.status(200).json({
      count: properties.length,
      success: true,
      properties,
    });
});

exports.unpublishProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.json({
        message: "Property not found",
      });
    }
    if (
      property.owner.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res
        .status(401)
        .json({ message: "Unauthorised to perform this action" });
    }

    await Property.findByIdAndUpdate(
      req.params.id,
      { status: "draft" },
      {
        runValidators: true,
        new: true,
      }
    );

    res.status(200).json({
      success: true,
      message: "Unpublished successfully",
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

exports.approvePost = asyncHandler(async (req, res, next) => {
    const { propertyId } = req.params;

    const property = await Property.findById(propertyId);

    if (!property) {
       return next(
       new ErrorResponse('Property not found', 400)
     );
    }
    if (req.user.role !== "admin") {
     return next(
       new ErrorResponse('Unauthorised to perform this action', 401)
     );
      }
    let approveProperty = await Property.findByIdAndUpdate(
      propertyId,
      {
        status: "approved",
        moderationMessage: undefined,
        notification: {
          seen: false,
          createdAt: new Date(),
        },
      },
      {
        runValidators: true,
        new: true,
      }
    );
    res.status(200).json({
      approveProperty,
      success: true,
      message: "Ads approved successfully",
    });
});

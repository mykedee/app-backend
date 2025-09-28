const Category = require("../models/categories");
const Property = require("../models/properties");

exports.createCategory = async (req, res) => {
  try {
    const category = await Category.create(req.body);
    res.status(201).json({
      success: true,
      category,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find({});
    res.status(201).json({
      success: true,
      categories,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getCategory = async (req, res) => {
  try {
    const slug = req.params;
    const categories = await Category.findOne({ slug });
    res.status(201).json({
      success: true,
      categories,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getToLetCat = async (req, res) => {
  try {
    let toLetCat = await Category.find({ type: "To Let" });
    res.status(200).json(toLetCat);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getToLets = async (req, res, next) => {
  try {
    const pageSize = Number(process.env.pageSize);
    const page = Number(req.query.page) || 1;
    const skip = (page - 1) * pageSize;
    let categoryName = await Category.find({ type: "To Let" }).select("_id");
    let categoryIds = categoryName.map((cat) => cat._id);
    const count = await Property.countDocuments({
      category: { $in: categoryIds },
      status: "approved",
    });
    let tolets = await Property.find({
      category: { $in: categoryIds },
      status: "approved",
    })
      .populate("category", "type _id")
      .limit(pageSize)
      .skip(skip);

    res.status(200).json({
      tolets,
      pageSize,
      pages: Math.ceil(count / pageSize),
      page,
      count,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getShortletCat = async (req, res) => {
  try {
    let shortletCat = await Category.find({ type: "Shortlets" });
    res.status(200).json(shortletCat);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getShortlets = async (req, res, next) => {
  try {
    const pageSize = Number(process.env.pageSize);
    const page = Number(req.query.page) || 1;
    const skip = (page - 1) * pageSize;
    let categoryName = await Category.find({ type: "Shortlet" }).select("_id");
    const categoryIds = categoryName.map((cat) => cat._id);
    const count = await Property.countDocuments({
      category: { $in: categoryIds },
      status: "approved",
    });

    let shortlets = await Property.find({
      category: { $in: categoryIds },
      status: "approved",
    })
      .populate("category", "type _id")
      .limit(pageSize)
      .skip(skip);
    res.status(200).json({
      shortlets,
      pageSize,
      pages: Math.ceil(count / pageSize),
      page,
      count,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getForSaleCat = async (req, res) => {
  try {
    let forsaleCat = await Category.find({ type: "For Sale" });
    res.status(200).json(forsaleCat);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getforSale = async (req, res, next) => {
  try {
    const pageSize = Number(process.env.PageSize);
    const page = Number(req.query.page) || 1;
    const skip = (page - 1) * pageSize;
    let categoryName = await Category.find({ type: "For Sale" }).select("_id");
    const categoryIds = categoryName.map((cat) => cat._id);

    const count = await Property.countDocuments({
      category: { $in: categoryIds },
      status: "approved",
    });
    let forsale = await Property.find({
      category: { $in: categoryIds },
      status: "approved",
    })
      .populate("category", "type _id")
      .limit(pageSize)
      .skip(skip);
    res.status(200).json({
      forsale,
      count,
      pageSize,
      pages: Math.ceil(count / pageSize),
      page,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

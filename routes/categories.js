const express = require("express");
const { getCategories, getCategory, createCategory, getToLets, getToLetCat, getShortlets, getShortletCat, getforSale, getForSaleCat } = require("../controllers/categories");

const router = express.Router();

router.get("/categories", getCategories);
router.post("/categories", createCategory);
router.get("/categories/to-lets", getToLets);
router.get("/categories/to-let", getToLetCat);
router.get("/categories/shortlets", getShortlets);
router.get("/categories/shortlet", getShortletCat);
router.get("/categories/for-sale", getforSale);
router.get("/categories/forsale", getForSaleCat);

module.exports = router;

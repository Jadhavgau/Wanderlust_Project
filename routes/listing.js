const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const {isLoggedIn , isOwner, validateListing} = require("../middleware.js");
const listingController = require("../controllers/listing.js");
const multer = require("multer");
const {storage} = require("../cloudconfig.js");
const upload = multer({ storage});

router.get("/search", wrapAsync(listingController.searchListings));
router.get("/category/:category", wrapAsync(listingController.filterByCategory));

router
 .route("/")
 .get( wrapAsync(listingController.index))
 .post(isLoggedIn,upload.single(`listing[image][url]`),validateListing,
     wrapAsync(listingController.createListings));

router.get("/new",isLoggedIn, listingController.renderNewForm);

router
.route("/:id")
.get(wrapAsync(listingController.showListings))
.put(isLoggedIn,isOwner,
     upload.single(`listing[image][url]`),
    validateListing,
     wrapAsync(listingController.updateListings))
.delete(isLoggedIn,isOwner,
     wrapAsync(listingController.destroyListings));

// Edit Route
router.get("/:id/edit",isLoggedIn,isOwner,
     wrapAsync(listingController.renderEditForm));

module.exports = router;
const Listing = require("../models/listing");

module.exports.filterByCategory = async (req, res) => {
  const category = req.params.category;
  const listings = await Listing.find({ category });
  if (!listings || listings.length === 0) {
    return res.render("listings/index", { allListings: [], category, query: null });
  }

  res.render("listings/index", { allListings: listings, category, query: null });
};


module.exports.searchListings = async (req, res) => {
  const query = req.query.q;
  if (!query || query.trim() === "") {
    const listings = await Listing.find({});
    return res.render("listings/index", { allListings: listings, category: null, query });
  }

  const listings = await Listing.find({
    $or: [
      { title: { $regex: query, $options: "i" } },
      { location: { $regex: query, $options: "i" } },
      { category: { $regex: query, $options: "i" } }
    ]
  });

  res.render("listings/index", { listings, query, category: null });
};

module.exports.index = async(req, res) => {
   const allListings = await Listing.find({});
   res.render("./listings/index.ejs", {allListings});
};

module.exports.renderNewForm = (req, res) => {
    res.render("./listings/new.ejs");
};

module.exports.showListings = async(req, res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id)
    .populate({path : "reviews", populate : {
        path : "author",
    },
})
    .populate("owner");
    if(!listing){
        req.flash("error", "Listing you requested for doesn`t exist!");
        res.redirect("/listings");
    } 
    res.render("./listings/show.ejs", {listing});
};

module.exports.createListings = async(req, res,) => {
        let url = req.file.path;
        let filename = req.file.filename;
        const newListing = new Listing(req.body.listing);
        newListing.owner = req.user._id;
        newListing.image = {url, filename};
        await newListing.save();
        req.flash("success", "New listing created!");
        res.redirect("/listings");
};

module.exports.renderEditForm = async(req, res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id);
     if(!listing){
        req.flash("error", "Listing you requested for doesn`t exist!");
        res.redirect("/listings");
    } 
    
    let originalImageUrl = listing.image.url;
    res.render("./listings/edit.ejs", {listing, originalImageUrl});
};

module.exports.updateListings = async(req, res) => {
let {id} = req.params;
let listing = await Listing.findByIdAndUpdate(id, req.body.listing,{ new: true, runValidators: true });

if(typeof req.file !== "undefined") {
let url = req.file.path;
let filename = req.file.filename;
listing.image = {url, filename};
await listing.save();
}
req.flash("success", "Listing Updated!");
res.redirect(`/listings/${id}`);
};

module.exports.destroyListings = async(req, res) => {
    let {id} = req.params;
    const listing = await Listing.findByIdAndDelete(id);
    req.flash("success", "Listing deleted!");
    res.redirect("/listings");
};
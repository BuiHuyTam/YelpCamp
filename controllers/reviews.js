const Campground = require("../models/campground");
const Review = require("../models/review");

module.exports.createReview = async (req, res) => {
    //finding that campground
    const campground = await Campground.findById(req.params.id);
    //create new review by using mongoose
    const review = new Review(req.body.review);
    review.author = req.user._id;
    //push that review to campground document
    campground.reviews.push(review);
    //save both campground and review schema
    await review.save();
    await campground.save();
    req.flash('success', 'Successfully created a new review');
    //then redirect
    res.redirect(`/campgrounds/${campground._id}`);
}

module.exports.deleteReview = async (req, res) => {
    //Find campground's id
    //Find review's id
    //Delete both campground and review id
    //redirect to somewhere you want
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Successfully deleted review');
    res.redirect(`/campgrounds/${id}`);
}
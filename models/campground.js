const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Review = require('./review');

const ImageSchema = new Schema({
    url: String,
    filename: String
})

ImageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_200');
})

const opts = { toJSON: { virtuals: true } };

const CampGroundSchema = new Schema({
    title: String,
    images: [ImageSchema],
    geometry: { //GeojSON format used for geographic
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    price: Number,
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [{
        type: Schema.Types.ObjectId,
        ref: 'Review'
    }]
}, opts)

CampGroundSchema.virtual('properties.popUpMarkUp').get(function () {
    return `<strong><a href="/campgrounds/${this._id}" style="text-decoration: none">${this.title}</a></strong>
            <p>${this.description}</p>`;
})

// DELETE ALL ASSOCIATED PRODUCTS AFTER A FARM IS DELETED (Mongoose Middleware)

CampGroundSchema.post('findOneAndDelete', async function (campground) {
    if (campground) {
        const del = await Review.deleteMany({
            _id:
                { $in: campground.reviews }
        });
        console.log(del);
    }
})

const Campground = mongoose.model('Campground', CampGroundSchema);
module.exports = Campground;
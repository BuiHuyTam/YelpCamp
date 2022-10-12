const mongoose = require("mongoose");
const Campground = require("../models/campground");
const cities = require("./cities");
const { descriptors, places } = require("./seedHelpers");
const db = mongoose.connection;

const dbUrl = process.env.DB_URL || "mongodb://localhost:27017/yelp-camp";

mongoose.connect(dbUrl);
db.on("error", console.error.bind(console, "connection error"));
db.once("open", () => {
  console.log("Database connected");
});

const sample = (array) => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
  await Campground.deleteMany({});
  for (let i = 0; i < 500; i++) {
    const random = Math.floor(Math.random() * 1000);
    const price = Math.floor(Math.random() * 40) + 10;
    const camp = new Campground({
      author: '630dd0312ca6543e130f8b9e',
      title: `${cities[random].city} ${cities[random].state}`, 
      location: `${sample(descriptors)} ${sample(places)}`,
      description: "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Corrupti eos at necessitatibus voluptas voluptatum odit obcaecati, quisquam minima, totam natus nisi, officiis dicta numquam ab animi. Iure laborum aspernatur natus?",
      price: `${price}`,
      geometry: {
        type: 'Point', coordinates: [
          cities[random].longitude,
          cities[random].latitude
        ]
      },
      images: [
        {
          url: 'https://res.cloudinary.com/jjred/image/upload/v1663573868/YelpCamp/m4bl3fxonj0hj4vxzp5h.jpg',
          filename: 'YelpCamp/m4bl3fxonj0hj4vxzp5h'
        },
        {
          url: 'https://res.cloudinary.com/jjred/image/upload/v1663573871/YelpCamp/osxgzf6ziymxrwk7bweh.jpg',
          filename: 'YelpCamp/osxgzf6ziymxrwk7bweh'
        }
      ]
    });
    await camp.save();
  }
};

seedDB().then(() => {
  mongoose.connection.close();
});

const mongoose = require("mongoose");
require("dotenv").config();

const connectToDB = () => {
  mongoose.set("strictQuery", false);

  mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  const connection = mongoose.connection;

  connection.on("error", console.error.bind(console, "connection error:"));

  connection.once("open", () => {
    console.log("Connected to MongoDB");
  });
};

module.exports = connectToDB;
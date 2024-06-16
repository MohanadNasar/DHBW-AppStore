const mongoose = require("mongoose");

const connectToMongoDB = async () => {
  mongoose.set("strictQuery", false);
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    })
    console.log("Connected to MongoDB");
  } catch (error) {
    console.log(error);
  }
}

module.exports = connectToMongoDB;
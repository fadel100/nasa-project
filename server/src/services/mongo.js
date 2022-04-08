const mongoose = require("mongoose");

const MONGO_URL = process.env.MONGO_URL;

mongoose.connection.once("open", () => console.log("connected to mongo..."));
mongoose.connection.on("error", (err) => console.error(err));

async function connectMongo() {
  await mongoose.connect(MONGO_URL);
}

async function disconnectMongo() {
  await mongoose.disconnect(MONGO_URL);
}

module.exports = {
  connectMongo,
  disconnectMongo,
};

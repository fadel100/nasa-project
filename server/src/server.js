const http = require("http");

const app = require("./app.js");

require("dotenv").config();

const { connectMongo } = require("./services/mongo");

const { loadPlanets } = require("./models/planets.model");
const { loadLaunchData } = require("./models/launches.model");

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

async function startServer() {
  await connectMongo();
  await loadPlanets();
  await loadLaunchData();

  server.listen(PORT, () => {
    console.log(`Listening on port ${PORT}...`);
  });
}

startServer();

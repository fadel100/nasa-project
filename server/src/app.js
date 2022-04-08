const express = require("express");
const morgan = require("morgan");

const cors = require("cors");
const path = require("path");
// const { fileURLToPath } = require("url");

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

const app = express();

const api = require("./routes/api");

app.use(
  cors({
    origin: "http://localhost:3000",
  })
);
app.use(express.json());
app.use(morgan("combined"));
app.use(express.static(path.join(__dirname, "..", "public")));

app.use("/v1", api);

app.use("/*", (req, res) => {
  return res
    .status(200)
    .sendFile(path.join(__dirname, "..", "public", "index.html"));
});

module.exports = app;

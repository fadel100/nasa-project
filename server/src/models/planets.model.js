const { parse } = require("csv-parse");
const fs = require("fs");
const path = require("path");
// const { fileURLToPath } = require("url");
const planets = require("./planets.mongo");

// no __dirname in node esm
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

function loadPlanets() {
  return new Promise((resolve, reject) => {
    function isHabitablePlanet(planet) {
      return (
        planet["koi_disposition"] === "CONFIRMED" &&
        planet["koi_insol"] > 0.36 &&
        planet["koi_insol"] < 1.11 &&
        planet["koi_prad"] < 1.6
      );
    }

    fs.createReadStream(
      path.join(__dirname, "..", "..", "data", "kepler_data.csv")
    )
      .pipe(
        parse({
          comment: "#",
          columns: true,
        })
      )
      .on("data", async (data) => {
        if (isHabitablePlanet(data)) {
          savePlanet(data);
        }
      })
      .on("error", (err) => {
        console.log(err);
        reject();
      })
      .on("end", () => {
        resolve();
      });
  });
}

async function getAllPlanets() {
  return await planets.find({});
}

// because we run the server multiple times, and to avoid populating the same data again and again, we only add a planet thats not already in it
async function savePlanet(data) {
  try {
    await planets.updateOne(
      {
        keplerName: data.kepler_name,
      },
      {
        keplerName: data.kepler_name,
      },
      {
        upsert: true,
      }
    );
  } catch (err) {
    console.error(`couldn't save planet ${err}`);
  }
}

module.exports = { getAllPlanets, loadPlanets };

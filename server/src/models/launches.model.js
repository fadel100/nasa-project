const launchesDatabase = require("./launches.mongo");
const planets = require("./planets.mongo");

const axios = require("axios");
const { find } = require("./planets.mongo");

// let latestFlightNumber = 100;
const DEFAULT_FLIGHT_NUMBER = 100;

const launch = {
  flightNumber: 100,
  mission: "Kepler Exploration X",
  rocket: "Explorer IS1",
  launchDate: new Date("December 27, 2030"),
  target: "Kepler-442 b",
  customers: ["ZTM", "NASA"],
  upcoming: true,
  success: true,
};

async function saveLaunch(launch) {
  await launchesDatabase.updateOne(
    {
      flightNumber: launch.flightNumber,
    },
    launch,
    {
      upsert: true,
    }
  );
}

// saveLaunch(launch);

async function populateLaunches() {
  const response = await axios.post(
    "https://api.spacexdata.com/v4/launches/query",
    {
      query: {},
      options: {
        pagination: false,
        populate: [
          {
            path: "rocket",
            select: {
              name: 1,
            },
          },
          {
            path: "payloads",
            select: {
              customers: 1,
            },
          },
        ],
      },
    }
  );

  if (response.status !== 200) {
    console.log("Problem downloading launch data");
    throw new Error("Launch data download failed");
  }

  const launchDocs = response.data.docs;

  for (const launchDoc of launchDocs) {
    const payloads = launchDoc.payloads;
    const customers = payloads.flatMap((payload) => {
      return payload.customers;
    });

    const launch = {
      flightNumber: launchDoc.flight_number,
      mission: launchDoc.name,
      rocket: launchDoc.rocket.name,
      launchDate: launchDoc.date_local,
      customers: customers,
      upcoming: launchDoc.upcoming,
      success: launchDoc.success,
    };
    await saveLaunch(launch);
  }
}

async function loadLaunchData() {
  const firstLaunch = await findLaunch({
    flightNumber: 1,
    rocket: "Falcon 1",
    mission: "FalconSat",
  });
  if (firstLaunch) {
    console.log("Launch data already loaded!");
  } else {
    await populateLaunches();
  }
}

async function getLatestFlightNumber() {
  const latestLaunch = await launchesDatabase.findOne().sort("-flightNumber");

  if (!latestLaunch) {
    return DEFAULT_FLIGHT_NUMBER;
  }
  return latestLaunch.flightNumber;
}

async function scheduleLaunch(launch) {
  const planet = await planets.findOne({
    keplerName: launch.target,
  });
  console.log(launch.target);

  if (!planet) {
    throw new Error("planet doesnt exist");
  }
  const latestFlightNumber = await getLatestFlightNumber();

  Object.assign(launch, {
    customers: ["ZTM", "NASA"],
    upcoming: true,
    success: true,
    flightNumber: latestFlightNumber + 1,
  });

  await saveLaunch(launch);
}

// const launches = new Map();
// launches.set(launch.flightNumber, launch);

async function findLaunch(filter) {
  return await launchesDatabase.findOne(filter);
}

async function existsLaunchWithId(launchId) {
  return await findLaunch({ flightNumber: launchId });
}

async function getAllLaunches({ limit, skip }) {
  return await launchesDatabase
    .find({}, { _id: 0, __v: 0 })
    .sort("flightNumber")
    .skip(skip)
    .limit(limit);
}

// function addNewLaunch(launch) {
//   latestFlightNumber++;

//   launches.set(
//     latestFlightNumber,
//     Object.assign(launch, {
//       customers: ["ZTM", "NASA"],
//       upcoming: true,
//       success: true,
//       flightNumber: latestFlightNumber,
//     })
//   );
// }

async function abortLaunchById(launchid) {
  const aborted = await launchesDatabase.updateOne(
    { flightNumber: launchid },
    {
      upcoming: false,
      success: false,
    }
  );
  return aborted.modifiedCount === 1;
  // const launch = launches.get(launchid);
  // launch.upcoming = false;
  // launch.success = false;
  // return launch;
}

module.exports = {
  loadLaunchData,
  existsLaunchWithId,
  getAllLaunches,
  scheduleLaunch,
  abortLaunchById,
};

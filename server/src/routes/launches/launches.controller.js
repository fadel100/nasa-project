const {
  getAllLaunches,
  scheduleLaunch,
  existsLaunchWithId,
  abortLaunchById,
} = require("../../models/launches.model.js");

const { getPagination } = require("../../services/query");

async function httpGetAllLaunches(req, res) {
  const { limit, skip } = getPagination(req.query);
  return res.status(200).json(await getAllLaunches({ limit, skip }));
}

async function httpAddNewLaunch(req, res) {
  const launch = req.body;

  if (
    !launch.mission ||
    !launch.rocket ||
    !launch.launchDate ||
    !launch.target
  ) {
    return res.status(400).json({
      error: "missing required launch property",
    });
  }

  launch.launchDate = new Date(launch.launchDate);
  // if(launch.launchDate.toString() === 'Invalid Date') or
  if (isNaN(launch.launchDate)) {
    return res.status(400).json({
      error: "invalid launch date",
    });
  }

  await scheduleLaunch(launch);
  return res.status(201).json(launch);
}

async function httpAbortLaunch(req, res) {
  const launchId = Number(req.params.id);

  const exists = await existsLaunchWithId(launchId);

  if (!exists) {
    return res.status(400).json({
      error: "launch not found",
    });
  }

  const abortedLaunch = await abortLaunchById(launchId);
  if (!abortedLaunch) {
    return res.status(400).json({ error: "launch not aborted" });
  }
  return res.status(200).json(abortedLaunch.ok);
}

module.exports = { httpGetAllLaunches, httpAddNewLaunch, httpAbortLaunch };

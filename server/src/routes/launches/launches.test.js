require("dotenv").config();

const app = require("../../app");
const { connectMongo, disconnectMongo } = require("../../services/mongo");
const { loadPlanets } = require("../../models/planets.model");

const request = require("supertest");

describe("test nasa api", () => {
  beforeAll(async () => {
    await connectMongo();
    await loadPlanets();
  });

  afterAll(async () => {
    await disconnectMongo();
  });

  describe("test get /launches", () => {
    test("it should get 200 ok", async () => {
      const response = await request(app)
        .get("/v1/launches")
        .expect("Content-type", /json/)
        .expect(200);
    });
  });

  describe("test post /launches", () => {
    const completeLaunchData = {
      mission: "Kepler Exploration X",
      rocket: "Explorer IS1",
      launchDate: "December 27, 2030",
      target: "Kepler-442 b",
    };

    const launchWithoutDate = {
      mission: "Kepler Exploration X",
      rocket: "Explorer IS1",
      target: "Kepler-442 b",
    };

    const launchWithInvalidDate = {
      mission: "Kepler Exploration X",
      rocket: "Explorer IS1",
      launchDate: "eyy",
      target: "Kepler-442 b",
    };

    test("it should respond with 201 created", async () => {
      const response = await request(app)
        .post("/v1/launches")
        .send(completeLaunchData)
        .expect("Content-type", /json/)
        .expect(201);

      const requestDate = new Date(completeLaunchData.launchDate).valueOf();
      const responseDate = new Date(response.body.launchDate).valueOf();
      expect(requestDate).toBe(responseDate);

      expect(response.body).toMatchObject(launchWithoutDate);
    });

    test("it should catch missing property", async () => {
      const response = await request(app)
        .post("/v1/launches")
        .send(launchWithoutDate)
        .expect("Content-Type", /json/)
        .expect(400);

      expect(response.body).toStrictEqual({
        error: "missing required launch property",
      });
    });

    test("it should catch invalid date", async () => {
      const response = await request(app)
        .post("/v1/launches")
        .send(launchWithInvalidDate)
        .expect("Content-Type", /json/)
        .expect(400);

      expect(response.body).toStrictEqual({
        error: "invalid launch date",
      });
    });
  });
});

const ApMan = require("../index");
const express = require("express");
const http = require("http");
const json = require("./sample.json");

describe("ApMan Test Suite (Direct URL Usage)", () => {
  let api;
  let server;

  beforeAll((done) => {
    const app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // Simulated GET Endpoint: /user
    app.get("/user", (req, res) => {
      res.status(200).json({ id: 1, name: "John Doe" });
    });

    // Simulated POST Endpoint: /user
    app.post("/user", (req, res) => {
      const { username, email } = req.body;
      if (!username || !email) {
        return res
          .status(400)
          .json({ error: "Validation Error: username and email are required" });
      }
      res.status(201).json({ success: true, username, email });
    });

    // Start the server dynamically
    server = http.createServer(app);
    server.listen(2306);

    // Initialize ApMan without variables
    api = new ApMan(json, {
      base_url: "http://localhost:2306",
    });

    done();
  });

  afterAll((done) => {
    server.close(done);
  });

  test("should generate methods from Postman JSON", () => {
    expect(api.methods).toHaveProperty("userGetUser");
    expect(api.methods).toHaveProperty("userCreateUser");
  });

  test("should successfully perform a GET request (Get User)", async () => {
    const response = await api.call("userGetUser");
    expect(response).toEqual({ id: 1, name: "John Doe" });
  });

  test("should successfully perform a POST request (Create User)", async () => {
    const response = await api.call("userCreateUser", {
      body: {
        username: "JohnDoe",
        email: "j.doe@example.com",
      },
    });
    expect(response).toEqual({
      success: true,
      username: "JohnDoe",
      email: "j.doe@example.com",
    });
  });

  test("should throw validation error for missing input (Create User)", async () => {
    await expect(
      api.call("userCreateUser", {
        body: {
          username: "JohnDoe",
        },
      })
    ).rejects.toThrow('"body.email" is required');
  });
});

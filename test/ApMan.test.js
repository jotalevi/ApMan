const path = require("path");
const ApMan = require("../index");
const express = require("express");
const http = require("http");

const postmanJsonPath = path.join(__dirname, "../sample.json");

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
    const apmanInstance = new ApMan(postmanJsonPath, `http://localhost:2306`);
    api = apmanInstance.getMethods();

    done();
  });

  afterAll((done) => {
    server.close(done);
  });

  test("should generate methods from Postman JSON", () => {
    expect(api).toHaveProperty("userGetUser");
    expect(api).toHaveProperty("userCreateUser");
  });

  test("should successfully perform a GET request (Get User)", async () => {
    const response = await api.userGetUser();
    expect(response).toEqual({ id: 1, name: "John Doe" });
  });

  test("should successfully perform a POST request (Create User)", async () => {
    const response = await api.userCreateUser({
      username: "JohnDoe",
      email: "j.doe@example.com",
    });
    expect(response).toEqual({
      success: true,
      username: "JohnDoe",
      email: "j.doe@example.com",
    });
  });

  test("should throw validation error for missing input (Create User)", async () => {
    await expect(api.userCreateUser({ username: "JohnDoe" })).rejects.toThrow(
      'Validation Error: "email" is required'
    );
  });
});

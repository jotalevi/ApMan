const path = require("path");
const ApMan = require("..");
const express = require("express");
const http = require("http");

const postmanJsonPath = path.join(__dirname, "../sample.json");

describe("ApMan Test Suite (with Updated Postman Schema)", () => {
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
    const variables = { base_url: "http://localhost:2306" };
    const apmanInstance = new ApMan(postmanJsonPath, variables);
    api = apmanInstance.getMethods();

    done();
  });

  afterAll((done) => {
    server.close(done);
  });

  test();

  test("should successfully perform a GET request (Get User)", async () => {
    const response = await api.userGetUser();
    expect(response).toEqual({ id: 1, name: "John Doe" });
  });
});

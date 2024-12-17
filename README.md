# ApMan

**ApMan** (API Manager) is a dynamic API client generator based on **Postman Collections**. It automatically creates methods for API requests, handles input validation using **Joi**, and integrates seamlessly with **Axios** for HTTP requests.

---

## **Features**

- 🚀 **Automatic API Method Generation**: Generates methods dynamically based on Postman folder and request names.
- ⚙️ **Input Validation**: Ensures valid input using **Joi** before sending requests.
- 🌐 **Customizable Base URL**: Allows setting a global base URL and placeholder variables for your API.
- 📄 **Supports All Body Modes**:
  - `formdata` (key-value pairs)
  - `urlencoded` (application/x-www-form-urlencoded)
  - `raw` (JSON bodies)
- 🔄 **Real-Time Placeholder Replacement**: Replace Postman placeholders like `{{base_url}}` dynamically with your own values.
- ✅ **Easy Integration**: Designed for effortless integration into Node.js projects.

---

## **Installation**

Install `ApMan` using **npm**, **Yarn**, or **Bun**:

### npm

```bash
npm install apman
```

### Yarn

```bash
yarn add apman
```

### Bun

```bash
bun add apman
```

---

## **Setup**

To use `ApMan`, export your Postman collection as a JSON file:

1. Open Postman.
2. Select your collection.
3. Click "Export" > "Collection v2.1".

---

## **Usage**

### Importing and Initializing ApMan

```javascript
const ApMan = require("apman");

// Create an instance of ApMan
const apiInstance = new ApMan("./sample.json", "https://api.example.com", {
  base_url: "https://api.example.com", // Custom placeholder variable
  token: "your_access_token", // Other placeholders from Postman
});

// Get the generated methods
const api = apiInstance.getMethods();

// Example: Call a GET request
(async () => {
  try {
    const userData = await api.userGetUser();
    console.log("User Data:", userData);

    // Example: Call a POST request with validation
    const newUser = await api.userCreateUser({
      username: "JohnDoe",
      email: "j.doe@example.com",
    });
    console.log("New User:", newUser);
  } catch (error) {
    console.error("API Error:", error.message);
  }
})();
```

---

## **Variable Placeholders**

You can replace placeholders defined in your Postman collection dynamically using the `variables` parameter. For example, `{{base_url}}` in the Postman collection will be replaced at runtime:

```javascript
const apiInstance = new ApMan("./sample.json", "https://api.example.com", {
  base_url: "https://api.example.com",
  token: "your_access_token",
});
```

### Example Placeholder Usage

**Postman Collection**:

```json
"url": "{{base_url}}/user"
```

**Final Resolved URL**:

```
https://api.example.com/user
```

---

## **Supported Body Modes**

ApMan supports multiple body modes from Postman:

- **formdata**:

  ```javascript
  await api.userCreateUser({
    username: "JohnDoe",
    email: "j.doe@example.com",
  });
  ```

- **urlencoded**:
  Automatically parses key-value pairs from Postman JSON.

- **raw (JSON)**:
  Handles raw JSON bodies and validates the fields.

---

## **Input Validation**

ApMan uses **Joi** for input validation. It ensures that required parameters are passed to API methods before making the request.

For example:

```javascript
await api.userCreateUser({ username: "JohnDoe" });
// Throws: "Validation Error: "email" is required"
```

---

## **API Reference**

### Constructor

```javascript
const apiInstance = new ApMan(postmanJsonPath, baseUrl, variables);
```

- **`postmanJsonPath`** (string): Path to your Postman collection JSON file.
- **`baseUrl`** (string): Global base URL for API requests.
- **`variables`** (object): Placeholder key-value pairs to resolve Postman variables.

### `getMethods()`

Returns an object containing all dynamically generated API methods.

Example:

```javascript
const api = apiInstance.getMethods();
api.userGetUser(); // Calls the 'Get User' endpoint
```

---

## **Error Handling**

ApMan throws detailed errors for:

1. **Input Validation Errors**:
   - Example: Missing required fields in `POST` requests.
2. **Request Failures**:
   - Handles network issues or non-2xx HTTP responses.

Example:

```javascript
try {
  await api.userCreateUser({ username: "JohnDoe" });
} catch (error) {
  console.error("API Error:", error.message);
}
```

---

## **Testing**

To test your ApMan instance:

1. Use tools like **Jest** for testing.
2. Mock endpoints with tools like **Express** to simulate real API responses.

Example Test:

```javascript
test("should perform a POST request", async () => {
  const response = await api.userCreateUser({
    username: "JohnDoe",
    email: "j.doe@example.com",
  });
  expect(response).toEqual({ success: true });
});
```

---

## **License**

[MIT](LICENSE)

---

## **Contributing**

Feel free to open issues or submit pull requests for improvements and bug fixes.

---

## **Contact**

For any questions or support, reach out to:

- **Author**: Eros Talevi
- **Email**: talevineto@gmail.com
- **GitHub**: [jotalevi](https://github.com/jotalevi)

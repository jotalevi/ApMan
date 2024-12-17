# ApMan

**ApMan** (API Manager) is a dynamic API client generator based on **Postman Collections**. It automatically creates methods for API requests, handles input validation using **Joi**, and integrates seamlessly with **Axios** for HTTP requests.

This version builds requests directly from the **`url` field** in the Postman JSON file. No need for placeholder variables!

---

## **Features**

- 🚀 **Automatic API Method Generation**: Generates methods dynamically based on Postman folder and request names.
- 🌐 **Base URL Support**: Easily set a global base URL for all requests.
- 📄 **Supports `formdata` and `urlencoded`**: Automatically parses request body inputs.
- ✅ **Input Validation**: Ensures valid input using **Joi** before sending requests.
- 🔗 **Direct URL Usage**: Uses the `url.raw` value directly from the Postman collection.

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
const apiInstance = new ApMan("./sample.json", "https://api.example.com");

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

## **How It Works**

1. **Base URL**:

   - Set a global `baseUrl` during initialization.
   - All requests will use this as the prefix for their paths.

   Example:

   ```javascript
   const apiInstance = new ApMan("./sample.json", "https://api.example.com");
   ```

2. **Dynamic Methods**:

   - Methods are generated based on the **folder** and **request names** in the Postman JSON.
   - Names are converted to **camelCase** for easy use.

   **Postman Example**:

   - Folder: `User`
   - Request: `Get User`
   - **Generated Method**: `userGetUser`

3. **Input Validation**:

   - For `POST` requests, ApMan automatically validates required inputs (e.g., `formdata` keys) using **Joi**.

   Example Validation:

   ```javascript
   await api.userCreateUser({ username: "JohnDoe" });
   // Throws: "Validation Error: "email" is required"
   ```

---

## **API Reference**

### Constructor

```javascript
const apiInstance = new ApMan(postmanJsonPath, baseUrl);
```

- **`postmanJsonPath`** (string): Path to your Postman collection JSON file.
- **`baseUrl`** (string): Global base URL for API requests.

### `getMethods()`

Returns an object containing all dynamically generated API methods.

Example:

```javascript
const api = apiInstance.getMethods();
api.userGetUser(); // Calls the 'Get User' endpoint
```

---

## **Example JSON**

Here is an example of the Postman JSON input:

```json
{
  "name": "User",
  "item": [
    {
      "name": "Get User",
      "request": {
        "method": "GET",
        "url": {
          "raw": "/user"
        }
      }
    },
    {
      "name": "Create User",
      "request": {
        "method": "POST",
        "body": {
          "mode": "formdata",
          "formdata": [
            { "key": "username", "value": "JohnDoe", "type": "text" },
            { "key": "email", "value": "j.doe@example.com", "type": "text" }
          ]
        },
        "url": {
          "raw": "/user"
        }
      }
    }
  ]
}
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

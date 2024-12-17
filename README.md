# ApMan

**ApMan** (API Manager) is a dynamic API client generator based on **Postman Collections**. It automatically creates methods for API requests, handles input validation using **Joi**, and integrates seamlessly with **Axios** for HTTP requests.

---

## Features

- 🚀 **Automatic API Method Generation**: Generates methods dynamically based on Postman folder and request names.
- ⚙️ **Input Validation**: Ensures valid input using **Joi** before sending requests.
- 🌐 **Customizable Base URL**: Allows setting a global base URL for all requests.
- ✅ **Easy Integration**: Designed for effortless integration in Node.js projects.
- 🔄 **Supports Multiple Postman Files**: Use the class with different Postman collections and configurations.

---

## Installation

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

## Setup

To use `ApMan`, export your Postman collection as a JSON file:

1. Open Postman.
2. Select your collection.
3. Click "Export" > "Collection v2.1".

---

## Usage

### Importing and Initializing ApMan

```javascript
const ApMan = require("apman");

// Create an instance of ApMan
const apiInstance = new ApMan(
  "./postman-collection.json",
  "https://api.example.com"
);

// Get the generated methods
const api = apiInstance.getMethods();

// Example: Call a GET request
(async () => {
  try {
    const userData = await api.userGetUser();
    console.log("User Data:", userData);

    // Example: Call a POST request with validation
    const newUser = await api.userCreateUser({
      username: "john_doe",
      email: "john@example.com",
    });
    console.log("New User:", newUser);
  } catch (error) {
    console.error("API Error:", error.message);
  }
})();
```

---

## Example Postman Collection

### Folder Structure:

- **Folder**: `User`
  - **Request**: `Get User` (GET `/user`)
  - **Request**: `Create User` (POST `/user` with body params)

### Generated Methods:

| Method Name      | HTTP Method | Description     |
| ---------------- | ----------- | --------------- |
| `userGetUser`    | GET         | Fetch user data |
| `userCreateUser` | POST        | Create a user   |

---

## API Reference

### Constructor

```javascript
const apiInstance = new ApMan(postmanJsonPath, baseUrl);
```

- **`postmanJsonPath`** (string): Path to your Postman collection JSON file.
- **`baseUrl`** (string): Optional base URL to prepend to all request URLs.

### `getMethods()`

Returns an object with dynamically generated methods based on the Postman collection.

Example:

```javascript
const api = apiInstance.getMethods();
api.userGetUser(); // Example method
```

---

## Input Validation

ApMan uses **Joi** for input validation. If a request requires parameters, they will be validated automatically.

Example validation:

```javascript
const newUser = await api.userCreateUser({
  username: "john_doe", // Required
  email: "john@example.com", // Required
});
```

If you omit a required field, an error will be thrown:

```
Validation Error: "email" is required
```

---

## Error Handling

ApMan ensures robust error handling for both input validation errors and HTTP request failures.

### Validation Errors

Validation errors are thrown if required input parameters are missing:

```javascript
Validation Error: "username" is required
```

### Request Errors

Errors during HTTP requests (e.g., network issues or non-200 status codes) are also handled:

```javascript
Request failed: Request failed with status code 404
```

---

## License

[MIT](LICENSE)

---

## Contributing

Feel free to open issues or submit pull requests for improvements and bug fixes.

---

## Contact

For any questions or support, reach out to:

- **Author**: Eros Talevi
- **Email**: talevineto@gmail.com
- **GitHub**: [Your GitHub Profile](https://github.com/jotalevi)

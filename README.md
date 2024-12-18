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
// Import ApMan
const ApMan = require("./index");

// Import your json from postman
const json = require("./test/sample.json");

const api = new ApMan(json, {
  base_url: "example.com",
});

// List Available methods
console.log(apMan.methods);

// Example: Login, then use token to list all users
api
  .call("iamAuthLogin", {
    body: { rut: "25535866", password: "ut56gcmqk1btnjuu" },
  })
  .then((res) => {
    //Set Headers
    api.addHeader("Authorization", `Bearer ${res.accessToken}`);
    api.call("iamUserListAll", {}).then((res) => {
      console.log(res);
    });
  });

// You can use direct method calls too:
api.iamAuthLogin({ body: { rut: "25535866", password: "ut56gcmqk1btnjuu" } headers: {} });

// but don't forget to pass the headers when calling methods this way
api.iamUserListAll({ headers: api._headers });

// If you want to clear your headers you can use:
api.clearHeaders();
```

---

## **How It Works**

1. **Base URL**:

   - Set a global `baseUrl` during initialization.
   - All requests will use this as the prefix for their paths.

   Example:

   ```javascript
   const api = new ApMan(json, {
     base_url: "miurl.com",
   });
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
   api.call("userCreateUser", { body: { username: "JohnDoe" } });
   // Throws: "Validation Error: "email" is required"
   ```

---

## **Example JSON**

There is a sample.json file inside the /test folder.
You can import it with:

```javascript
const json = require("apman/test/sample.json");
```

## **License**

[MIT](LICENSE)

## **Contributing**

Feel free to open issues or submit pull requests for improvements and bug fixes.

## **Contact**

For any questions or support, reach out to:

- **Author**: Eros Talevi
- **Email**: talevineto@gmail.com
- **GitHub**: [jotalevi](https://github.com/jotalevi)

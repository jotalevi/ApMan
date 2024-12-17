const fs = require("fs");
const axios = require("axios");
const Joi = require("joi");

class ApMan {
  constructor(postmanJsonPath, baseUrl = "") {
    if (!postmanJsonPath) {
      throw new Error("The 'postmanJsonPath' parameter is required.");
    }

    this.baseUrl = baseUrl;
    this.methods = {};
    this._loadPostmanFile(postmanJsonPath);
  }

  /**
   * Load and parse the Postman JSON file
   * @param {string} postmanJsonPath
   */
  _loadPostmanFile(postmanJsonPath) {
    const postmanData = JSON.parse(fs.readFileSync(postmanJsonPath, "utf8"));

    postmanData.item.forEach((folder) => {
      if (folder.item) {
        folder.item.forEach((request) => {
          const methodName = this._toCamelCase(folder.name, request.name);
          const schema = this._getValidationSchema(request);
          const { method, url } = this._getRequestDetails(request);

          // Define the method dynamically
          this.methods[methodName] = async (data = {}) => {
            const { error } = schema.validate(data);
            if (error) {
              throw new Error(`Validation Error: ${error.message}`);
            }

            try {
              const response = await axios({
                method: method.toLowerCase(),
                url,
                data,
              });
              return response.data;
            } catch (err) {
              throw new Error(`Request failed: ${err.message}`);
            }
          };
        });
      }
    });
  }

  /**
   * Get the generated API methods
   * @returns {Object} - API methods
   */
  getMethods() {
    return this.methods;
  }

  /**
   * Convert folder and request names to camelCase
   */
  _toCamelCase(folderName, requestName) {
    const combinedName = `${folderName} ${requestName}`;
    return combinedName.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, (match, index) => {
      if (+match === 0) return ""; // Ignore spaces
      return index === 0 ? match.toLowerCase() : match.toUpperCase();
    });
  }

  /**
   * Generate Validation Schema
   */
  _getValidationSchema(request) {
    const schemaKeys = {};
    request.request.body?.formdata?.forEach((param) => {
      schemaKeys[param.key] = Joi.string().required();
    });
    return Joi.object(schemaKeys);
  }

  /**
   * Extract URL and append base URL if provided
   */
  _getRequestDetails(request) {
    const method = request.request.method || "GET";
    const url = `${this.baseUrl}${request.request.url.raw || ""}`;
    return { method, url };
  }
}

module.exports = ApMan;

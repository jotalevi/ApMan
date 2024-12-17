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
          const { method, path } = this._getRequestDetails(request);

          // Define dynamic API method
          this.methods[methodName] = async (data = {}) => {
            const { error } = schema.validate(data);
            if (error) {
              throw new Error(`Validation Error: ${error.message}`);
            }

            try {
              const finalUrl = this.baseUrl + "/" + path;
              const response = await axios({
                method: method.toLowerCase(),
                url: finalUrl,
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
   * Extract request details from Postman JSON
   */
  _getRequestDetails(request) {
    const method = request.request.method || "GET";
    const path = request.request.url.path.join("/");
    return { method, path };
  }

  /**
   * Generate validation schema
   */
  _getValidationSchema(request) {
    const schemaKeys = {};
    if (request.request.body) {
      const body = request.request.body;

      if (body.mode === "formdata" && Array.isArray(body.formdata)) {
        body.formdata.forEach((param) => {
          if (param.key && !param.disabled) {
            schemaKeys[param.key] = Joi.string().required();
          }
        });
      }
    }
    return Joi.object(schemaKeys);
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

  getMethods() {
    return this.methods;
  }
}

module.exports = ApMan;

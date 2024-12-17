const fs = require("fs");
const axios = require("axios");
const Joi = require("joi");

class ApMan {
  constructor(postmanJsonPath, baseUrl = "", variables = {}) {
    if (!postmanJsonPath) {
      throw new Error("The 'postmanJsonPath' parameter is required.");
    }

    this.baseUrl = baseUrl;
    this.variables = variables; // Object to resolve placeholders
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

          this.methods[methodName] = async (data = {}) => {
            const { error } = schema.validate(data);
            if (error) {
              throw new Error(`Validation Error: ${error.message}`);
            }

            try {
              const finalUrl = this._resolvePlaceholders(url);
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
   * Resolve placeholders in URLs
   * @param {string} url
   */
  _resolvePlaceholders(url) {
    let resolvedUrl = url;
    Object.keys(this.variables).forEach((key) => {
      const regex = new RegExp(`{{${key}}}`, "g");
      resolvedUrl = resolvedUrl.replace(regex, this.variables[key]);
    });

    // Append base URL if necessary
    if (!resolvedUrl.startsWith("http")) {
      resolvedUrl = `${this.baseUrl}${resolvedUrl}`;
    }
    return resolvedUrl;
  }

  /**
   * Generate Validation Schema
   */
  _getValidationSchema(request) {
    const schemaKeys = {};
    request.request.body?.urlencoded?.forEach((param) => {
      if (!param.disabled) {
        schemaKeys[param.key] = Joi.string().required();
      }
    });
    return Joi.object(schemaKeys);
  }

  /**
   * Extract request details
   */
  _getRequestDetails(request) {
    const method = request.request.method || "GET";
    const url = request.request.url.raw || "";
    return { method, url };
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

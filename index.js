const axios = require("axios");
const Joi = require("joi");

class ApMan {
  constructor(object, variables) {
    this.methods = {};
    this._requiredData = {};
    this._schema = {};
    this._headers = {};

    this.info = object.info;
    delete this.info._exporter_id;
    delete this.info._postman_id;
    delete this.info.schema;

    this.variables = this._buildVariables(object.variable);
    this.methods = this._buildMethods(object.item);

    let varErrors = [];

    Object.keys(this.variables).forEach((key) => {
      if (!variables || !variables[key]) {
        varErrors.push('Variable "' + key + '" is required.');
      } else {
        this.setVariable(key, variables[key]);
      }
    });

    if (varErrors.length > 0) {
      Object.keys(this.variables).forEach((key) => {
        varErrors.push(key + " => " + this.variables[key]);
      });
      throw new Error(varErrors.join("\n"));
    }
  }

  call(action, data = {}) {
    data.headers = this._headers;
    return this.methods[action](data);
  }

  addHeader(name, value) {
    this._headers[name] = value;
  }

  clearHeaders() {
    this._headers = {};
  }

  setVariable(name, value) {
    this.variables[name] = value;
  }

  requiredData(action) {
    return this._requiredData[action];
  }

  _buildMethods(items, sufix = null) {
    let methods = {};

    items.forEach((item) => {
      if (item.request) {
        methods[
          this._toCamelCase(sufix ? sufix + " " + item.name : item.name)
        ] = this._buildMethod(
          item,
          this._toCamelCase(sufix ? sufix + " " + item.name : item.name)
        );
      } else {
        methods = {
          ...methods,
          ...this._buildMethods(
            item.item,
            sufix ? sufix + " " + item.name : item.name
          ),
        };
      }
    });

    return methods;
  }

  _buildMethod(item, name) {
    let requiredData = {};

    if (item.request.body) {
      if (item.request.body.mode == "raw") {
        requiredData.body = JSON.parse(item.request.body.raw);
      } else {
        requiredData.body = {};
        item.request.body[item.request.body.mode].forEach((element) => {
          requiredData.body[element.key] = element.value ?? "";
        });
      }
    }

    if (item.request.url.query) {
      requiredData.query = {};
      item.request.url.query.forEach((element) => {
        requiredData.query[element.key] = element.value ?? "";
      });
    }

    if (item.request.url.variable) {
      requiredData.variable = {};
      item.request.url.variable.forEach((element) => {
        requiredData.variable[element.key] = element.value ?? "";
      });
    }

    this._requiredData[name] = requiredData;
    this._schema[name] = this._buildJoiSchema(requiredData);
    return async (data = {}) => {
      const { error } = this._schema[name].validate(data, {
        allowUnknown: true,
      });
      if (error) throw new Error(error.message);

      try {
        let url = this._interpolateVariables(
          [item.request.url.host, ...item.request.url.path].join("/")
        );

        //add https at start of url if not present
        if (!url.startsWith("http")) {
          url = "https://" + url;
        }
        url.replace("http://", "https://");

        if (requiredData.variable) {
          Object.keys(requiredData.variable).forEach((key) => {
            url = url.replace(":" + key, data.variable[key]);
          });
        }

        if (requiredData.query) {
          url += "?";
          Object.keys(requiredData.query).forEach((key) => {
            url += `${key}=${data.query[key]}&`;
          });
        }

        const opts = {
          method: item.request.method.toLowerCase(),
          url: url,
          data: data.body,
          headers: data.headers,
        };
        if (!data.headers) delete opts.headers;

        const response = await axios(opts);
        return response.data;
      } catch (err) {
        throw new Error(`Request failed: ${err.message}`);
      }
    };
  }

  _buildJoiSchema(template) {
    const schema = {};
    for (const key in template) {
      if (template.hasOwnProperty(key)) {
        const value = template[key];
        if (
          typeof value === "object" &&
          value !== null &&
          !Array.isArray(value)
        ) {
          // Recursively create schema for nested objects
          schema[key] = this._buildJoiSchema(value).required();
        } else {
          // Assume all fields are required, and infer types
          schema[key] = Joi.any().required();
        }
      }
    }
    return Joi.object(schema);
  }

  _interpolateVariables(string) {
    const regex = new RegExp(
      Object.keys(this.variables)
        .map((key) => "{{" + key + "}}")
        .join("|"),
      "g"
    );
    return string.replace(
      regex,
      (match) => this.variables[match.replace(/{{|}}/g, "")]
    );
  }

  _buildVariables(variables) {
    let vars = {};

    if (!variables) return vars;

    variables.forEach((variable) => {
      if (!variable.disabled) {
        vars[variable.key.replace("{{", "").replace("}}", "")] = variable.value;
      }
    });

    return vars;
  }

  _toCamelCase(input) {
    return input
      .replace(/[^a-zA-Z0-9_\s]/g, "") // Remove non-alphanumeric, non-underscore, and non-space characters
      .trim() // Remove leading and trailing whitespace
      .replace(/^[^a-zA-Z]+/, "") // Ensure it starts with a letter
      .toLowerCase()
      .replace(/[_\s]+(.)?/g, (_, char) => (char ? char.toUpperCase() : ""));
  }
}

module.exports = ApMan;

const fs = require("fs");

module.exports = {
  async saveToJson(filePath, JSON) {
    return new Promise((resolve, reject) => {
      fs.writeFile(filePath, JSON, "utf-8", (err) => {
        if (err)
          reject(`error writing to JSON: ${filePath} \n error:\n ${err}`);
        else resolve(`successfully wrote JSON: ${filePath}`);
      });
    });
  },
};

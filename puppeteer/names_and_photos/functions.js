const { nameSubs, specificSenSubs } = require("./constants");

module.exports = {
  async getHandleFromSelector(selector, page) {
    await page.waitForSelector(selector);
    const handle = await page.$(selector);
    return handle;
  },

  async getHandlesFromSelector(selector, page) {
    await page.waitForSelector(selector);
    const handle = await page.$$(selector);
    return handle;
  },

  async getTextFromHandle(handle) {
    const text = await handle.evaluate((node) => node.innerText);
    return text;
  },

  checkSenNamesAndSubstitute(senArray) {
    senArray.forEach((senObj) => {
      // filter out nicknames, suffixes
      const nameArr = senObj.name
        .replace(/,.*/g, "") // anything after comma (i.e. suffixes)
        .replace(/'.*'\s/, "") // anything in single quotes (and the single space afterwards) (i.e. nicknames)
        .replace(/".*"\s/, "") // anything in double quotes (and the single space afterwards) (i.e. nicknames)
        .split(" ")
        .map((name) => name.trim().toLowerCase())
        .filter((name) => {
          // filter out I's that got through (suffixes)
          const isOnlyIs = /^(i)+$/.exec(name); // will be null unless name is only I's
          return !isOnlyIs;
        });

      // last name then first name, only first and last
      let lastNameFirstNameArr = [];
      switch (nameArr.length) {
        case 1:
          lastNameFirstNameArr.push(nameArr[0]);
          break;
        case 2:
          lastNameFirstNameArr.push(nameArr[1]);
          lastNameFirstNameArr.push(nameArr[0]);
          break;
        case 3:
          // assuming the third name is a middle name!!
          lastNameFirstNameArr.push(nameArr[2]);
          lastNameFirstNameArr.push(nameArr[0]);
      }

      // replace common shortened names with their full versions
      lastNameFirstNameArr.forEach((name, i) => {
        if (nameSubs[name]) lastNameFirstNameArr[i] = nameSubs[name];
      });

      // replace more specific shortened/nick names with full versions
      let stringSen = lastNameFirstNameArr.toString().replace(",", " ");
      lastNameFirstNameArr = specificSenSubs[stringSen]
        ? specificSenSubs[stringSen].split(" ")
        : lastNameFirstNameArr;

      senObj.searchName = lastNameFirstNameArr;
    });

    return senArray;
  },
};

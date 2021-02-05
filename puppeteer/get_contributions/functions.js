const { SELECTORS } = require("./constants");

module.exports = {
  async getHandleFromSelector(selector, page) {
    await page.waitForSelector(selector);
    let handle = await page.$(selector);
    return handle;
  },

  async getHandlesFromSelector(selector, page) {
    await page.waitForSelector(selector);
    let handle = await page.$$(selector);
    return handle;
  },

  async getTextFromHandle(handle) {
    let text = await handle.evaluate((node) => node.innerText);
    return text;
  },

  /*
   * filter out original and amended reports
   *
   * type contributionTag {
   *     type: string,
   *     year: string,
   *     report: string,
   *     url: string,
   * }
   *
   * type contributionTags: contributionTag[]
   */
  filterReports(contributionTags) {
    const firstFilterContributionsReports = [];

    for (let i = 0; i < contributionTags.length; i++) {
      if (contributionTags[i].type === "Amended") {
        firstFilterContributionsReports.push(contributionTags[i]);
        continue;
      }
      let isAmended = false;
      if (contributionTags[i].type === "Original") {
        for (let k = 0; k < contributionTags.length; k++) {
          if (contributionTags[i] === contributionTags[k]) continue;
          else if (
            contributionTags[i].year === contributionTags[k].year &&
            contributionTags[i].report === contributionTags[k].report
          ) {
            firstFilterContributionsReports.push(contributionTags[k]);
            isAmended = true;
          }
        }
      }
      if (!isAmended) firstFilterContributionsReports.push(contributionTags[i]);
    }

    const secondFilterContributionsReports = Array.from(
      new Set(firstFilterContributionsReports)
    );

    const thirdFilterContributionsReports = [];

    for (let i = 0; i < secondFilterContributionsReports.length; i++) {
      const cdrRe = /(?<=CDRID=)\d+/;
      if (secondFilterContributionsReports[i].type === "Original")
        thirdFilterContributionsReports.push(
          secondFilterContributionsReports[i]
        );
      if (secondFilterContributionsReports[i].type === "Amended") {
        const iCdr = cdrRe.exec(secondFilterContributionsReports[i].url)[0];
        let amendedAgain = false;
        for (let k = 0; k < secondFilterContributionsReports.length; k++) {
          if (
            secondFilterContributionsReports[i] ===
            firstFilterContributionsReports[k]
          )
            continue;
          else if (
            secondFilterContributionsReports[i].year ===
              secondFilterContributionsReports[k].year &&
            secondFilterContributionsReports[i].report ===
              secondFilterContributionsReports[k].report
          ) {
            const kCdr = cdrRe.exec(secondFilterContributionsReports[k].url)[0];
            if (kCdr > iCdr) amendedAgain = true;
          }
        }
        if (!amendedAgain)
          thirdFilterContributionsReports.push(
            secondFilterContributionsReports[i]
          );
      }
    }

    return thirdFilterContributionsReports;
  },
};

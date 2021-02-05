const puppeteer = require("puppeteer");
const fs = require("fs");
const {
  getHandleFromSelector,
  getHandlesFromSelector,
  getTextFromHandle,
  filterReports,
} = require("./functions");
const { SELECTORS } = require("./constants");

async function getSenContributions(senator) {
  // INTERFACE: takes the 'senator' object, which has the following structure:
  // {
  // 	"name": "Albers, John",
  // 	"fileName": "AlbersJohn",
  // 	"displayName": "John Albers",
  // 	"district": "56",
  // 	"city": "Roswell",
  // 	"party": "Republican",
  // 	"searchName": ["albers", "john"]
  // }

  /// TESTING ///
  // if it is crashing on one particular name, or have already got data json for some sens, check the sen to see if it already has a json, if so, skip.
  try {
    const test = JSON.parse(
      fs.readFileSync(
        `${__dirname}/../../json/raw_contributions/${senator.fileName}.json`,
        "utf-8"
      )
    );
    // retry the errors
    if (test.note !== "Puppeteer Error") {
      console.log(`skipping ${senator.name}`);
      return senator;
    }
  } catch (err) {}

  // grab the search names
  let fname = senator.searchName[1],
    lname = senator.searchName[0],
    fileName = senator.fileName;

  const browser = await puppeteer.launch({
    // headless: false,
    // slowMo: 30,
  });

  try {
    const page = await browser.newPage();
    // page.setDefaultTimeout(7000);

    // handle vacant seat ~~DEPRECATED~~
    if (fname === "vacant") {
      await browser.close;
      return "VACANT";
    }

    await page.goto(SELECTORS.mainPageUrl);

    // enter name and search
    await page.click(SELECTORS.firstNameInput);
    await page.keyboard.type(fname);
    await page.click(SELECTORS.lastNameInput);
    await page.keyboard.type(lname);
    await page.keyboard.press("Enter");

    // handle no results: go back and search by last name only
    const noResults = await getTextFromHandle(
      await getHandleFromSelector(SELECTORS.noSearchResults, page)
    );

    if (noResults === "Search Returned No Results.") {
      await page.goBack();
      const fnameText = await page.$eval(
        SELECTORS.firstNameInput,
        (node) => node.value
      );
      await page.click(SELECTORS.firstNameInput);
      await page.keyboard.down("Shift");
      for (let i = 0; i < fnameText.length; i++) {
        await page.keyboard.press("ArrowLeft");
      }
      await page.keyboard.up("Shift");
      await page.keyboard.press("Backspace");
      await page.keyboard.press("Enter");
    }

    // handle multiple results: iterating through each result and exiting on the first that is a state senator
    const viewButtons = await getHandlesFromSelector(
      SELECTORS.viewButtons,
      page
    );
    const numViewButtons = viewButtons.length;
    const url = page.url();

    for (let i = 0; i < numViewButtons; i++) {
      await page.goto(url);

      const viewButtons = await getHandlesFromSelector(
        SELECTORS.viewButtons,
        page
      );
      const button = viewButtons[i];

      const buttonContainerHandle = await page.evaluateHandle(
        (node) => node.parentNode,
        button
      );
      const candidateOrCommitteeNameHandle = await page.evaluateHandle(
        (node) => node.nextElementSibling,
        buttonContainerHandle
      );
      const registrationNumHandle = await page.evaluateHandle(
        (node) => node.nextElementSibling,
        candidateOrCommitteeNameHandle
      );
      const registrationNum = await getTextFromHandle(registrationNumHandle);

      // handle if there are '0 registraton' for a 'view' that ends up being a senator... see Brandon Beach
      if (registrationNum === "0") continue;

      await button.click();
      await page.waitForNavigation();

      const gridItemsHandles = await getHandlesFromSelector(
        SELECTORS.gridItems,
        page
      );

      let textFields = "";

      for (let item of gridItemsHandles) {
        const innerSpan = await item.$("span");
        if (innerSpan) {
          const text = await getTextFromHandle(innerSpan);
          textFields += text;
        }
      }

      const hasSenate = textFields.includes("State Senate");

      // handle if not a senator
      if (!hasSenate) continue;
      // if senator, break
      else break;
    }

    // click senate 'click here to view' button
    const gridItemsHandles = await getHandlesFromSelector(
      SELECTORS.gridItems,
      page
    );
    for (let item of gridItemsHandles) {
      const innerSpan = await item.$("span");
      if (innerSpan) {
        const text = await getTextFromHandle(innerSpan);
        if (text.includes("State Senate")) {
          const next = await page.evaluateHandle(
            (node) => node.nextElementSibling,
            item
          );
          const senateClickHereButton = await next.$("a");
          await senateClickHereButton.click();
          await page.waitForNavigation();
          break;
        }
      }
    }

    // get official name they filed under
    const candidateName = await getTextFromHandle(
      await getHandleFromSelector(SELECTORS.candidateName, page)
    );

    // get number of links to be looped through
    const viewContReportsButtons = await getHandlesFromSelector(
      SELECTORS.viewReportButtons,
      page
    );

    const contributionsUrls = [];
    const campaignRepsPageUrl = await page.url();

    // loop through reports and get urls, push to array
    for (let i = 0; i < viewContReportsButtons.length; i++) {
      await page.goto(campaignRepsPageUrl);

      const campaignRepsDrpdwnButton = await getHandleFromSelector(
        SELECTORS.campaignRepsDrpdwnButton,
        page
      );
      await campaignRepsDrpdwnButton.click();

      const viewReportButtons = await getHandlesFromSelector(
        SELECTORS.viewReportButtons,
        page
      );
      const viewReportButtonHref = await viewReportButtons[i].evaluate(
        (node) => node.href
      );

      // click / go to 'View Report' link
      try {
        // this may seem hacky but it's the best solution. the only other way this works is using page.waitFor(xxx) before clicking the button which is slow asf and opens the door for flakiness. Page.goto can go to the __doPostBack href, but it won't fire a navigation event so will always return a rejected promise. putting in this try / catch block means we can still visit the page, but don't have to worry about the promise.
        await page.goto(viewReportButtonHref, { timeout: 100 }); // can make timeout 1ms, but risk crashing the site (has happened)
      } catch {}

      const year = await getTextFromHandle(
        await getHandleFromSelector(SELECTORS.reportYear, page)
      );
      const type = await getTextFromHandle(
        await getHandleFromSelector(SELECTORS.reportType, page)
      );
      const report = await getTextFromHandle(
        await getHandleFromSelector(SELECTORS.reportReport, page)
      );

      const viewContributionsButton = await getHandleFromSelector(
        SELECTORS.viewContributionsButton,
        page
      );
      await viewContributionsButton.click();
      await page.waitForNavigation();

      contributionsUrls.push({
        type: type,
        year: year,
        report: report,
        url: page.url(),
      });
    }

    // filter reports (amended reports, others)
    const filteredReportTags = filterReports(contributionsUrls);

    // looping through reports, scraping individual contributions
    const senatorContributions = {
      lastUpdated: Date(Date.now()),
      info: senator,
      data: [],
    };

    for (let i = 0; i < filteredReportTags.length; i++) {
      const longReport = filteredReportTags[i].report;
      const condensedReport = /\w*[ ]\d*/.exec(longReport)[0].replace(" ", "");
      const reportTag =
        filteredReportTags[i].year +
        condensedReport +
        filteredReportTags[i].type;

      await page.goto(filteredReportTags[i].url);

      // create individual 'report' object for each report
      const report = {
        report: reportTag,
        url: filteredReportTags[i].url,
        data: [],
      };

      // handle reports with no contributions
      const noContributions = await getTextFromHandle(
        await getHandleFromSelector(SELECTORS.noContributions, page)
      );

      if (noContributions === "No Contributions Reported.") {
        report["note"] = "No contributions reported.";
        senatorContributions.data.push(report);
        continue;
      }

      // iterate through each row (1 row = 1 contribution)
      const contributionRowsHandle = await getHandlesFromSelector(
        SELECTORS.contributionRow,
        page
      );

      for (let k = 0; k < contributionRowsHandle.length; k++) {
        // select the row cells (tds)
        const entryTds = await contributionRowsHandle[k].$$("td");

        // create individual 'entry' object for each row/entry
        const entry = {
          candidateName: candidateName,
        };

        // label and push each of 6 cells in the row to 'entry' object
        for (let l = 0; l < 6; l++) {
          switch (l) {
            case 0:
              entry["contribName"] = await getTextFromHandle(entryTds[l]);
              break;
            case 1:
              entry["PACOccupationEmployer"] = await getTextFromHandle(
                entryTds[l]
              );
              break;
            case 2:
              entry["receivedTypeElection"] = await getTextFromHandle(
                entryTds[l]
              );
              break;
            case 3:
              entry["inKindDescription"] = await getTextFromHandle(entryTds[l]);
              break;
            case 4:
              entry["inKindAmount"] = await getTextFromHandle(entryTds[l]);
              break;
            case 5:
              entry["cashAmount"] = await getTextFromHandle(entryTds[l]);
              break;
          }
        }

        // push each 'entry' to report object 'report'
        report.data.push(entry);
      }

      // push each report to total contr array
      senatorContributions.data.push(report);
    }

    // write to .json file
    try {
      const senatorJSONString = JSON.stringify(senatorContributions);
      fs.writeFileSync(
        `${__dirname}/../../json/raw_contributions/${fileName}.json`,
        senatorJSONString
      );
      console.log("successfully wrote " + fileName + ".json to local drive");
    } catch (err) {
      console.log("error writing " + fileName + ".json to local drive");
      console.log(err);
    }

    // close chromium
    await browser.close();

    return senator;
  } catch (err) {
    console.log(senator.name, "PUPPETEER ERROR\n", err);

    // check if there's an existing file with good data
    function isThereAlreadyAJSONFile(fileName) {
      try {
        const senJson = fs.readFileSync(
          `./app-output/${fileName}.json`,
          "utf-8"
        );
        return true;
      } catch (err) {
        return false;
      }
    }

    let isThereJSON = isThereAlreadyAJSONFile(fileName);

    // if there isn't, write a .json error file with the same structure, but with empty dataset and a note
    if (!isThereJSON) {
      fs.writeFileSync(
        `${__dirname}/../../json/raw_contributions/${fileName}.json`,
        JSON.stringify({
          lastUpdated: Date(Date.now()),
          info: senator,
          data: [],
          note: "Puppeteer Error",
          error: err,
        })
      );
      console.log(
        "wrote new error file for " + senator.name + " to local drive"
      );
    } else {
      console.log(
        senator.name +
          `already has valid data, not updating ${fileName},json in local drive`
      );
    }

    // close chromium
    await browser.close();

    // pass the interface on
    return senator;
  }
}

exports.getSenContributions = getSenContributions;

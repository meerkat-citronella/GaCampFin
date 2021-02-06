const puppeteer = require("puppeteer");
const {
  getHandleFromSelector,
  getHandlesFromSelector,
  getTextFromHandle,
  checkSenNamesAndSubstitute,
} = require("./functions");
const { selectors } = require("./constants");

async function getSenNamesAndPhotos() {
  const browser = await puppeteer.launch({
    // headless: false,
  });
  const page = await browser.newPage();

  await page.goto(selectors.url);

  // all sen rows
  const senRows = await getHandlesFromSelector(selectors.rows, page);

  const senArray = [];

  // iterate through each senator's page
  for (let i = 0; i < senRows.length; i++) {
    try {
      await page.goto(selectors.url);
      const row = (await getHandlesFromSelector(selectors.rows, page))[i];
      const senHref = await (await row.$(selectors.link)).evaluate(
        (node) => node.href
      );

      // get basic info from the row: name, party, district, city
      const senName = (
        await getTextFromHandle(await row.$(selectors.name))
      ).trim();
      const senParty = (
        await getTextFromHandle(await row.$(selectors.party))
      ).trim();
      const fileName = senName.replace(/[ ,()''.]/gi, ""); // sanitize the name
      const district = (
        await getTextFromHandle(await row.$(selectors.district))
      ).trim();
      const city = (
        await getTextFromHandle(await row.$(selectors.city))
      ).trim();
      const senDisplayName = senName; // JUST FOR NOW... had been running under the assumption that the name would come (last, first) but it's now just (fist last).

      // visit sen page to get image
      await page.setViewport({
        width: 640, // set dimensions to tablet / mobile size. because of the dom breakpoints they have set on their site, this actually makes the sen image larger and better quality. can always change if they make changes to their site so this isn't the case
        height: 480,
        deviceScaleFactor: 1.3, // sets higher pixel resolution so we get a crisper picture
      });
      await page.goto(senHref, {
        waitUntil: "networkidle0", // wait for img to load
      });

      // get senator's image
      try {
        const senImageHandle = await getHandleFromSelector(
          selectors.image,
          page
        );

        await senImageHandle.screenshot({
          path: `${__dirname}/../../pics/${fileName}.jpg`,
        });

        console.log(`saved senator photo to pics/${fileName}.jpg`);
      } catch (err) {
        console.log(`ERROR getting photo for ${senName}\n`, err);
      }

      // create senObj: this obj is passed between the rest of the app
      let senData = {
        name: senName,
        fileName: fileName,
        displayName: senDisplayName,
        district: district,
        city: city,
        party: senParty,
      };

      senArray.push(senData);
    } catch (err) {
      console.log(`error getting senator at row ${i}\n:`, err);

      senArray.push({
        name: "ERROR",
        note: `ERROR getting senator at row ${i}`,
      });
    }
  }

  await browser.close();

  // add .searchName property to sen object ([lastName, firstName]), replacing common nicknames, suffixes, and specific known nicknames
  const cleanedSenArray = checkSenNamesAndSubstitute(senArray);

  return cleanedSenArray;
}

exports.getSenNamesAndPhotos = getSenNamesAndPhotos;

const fs = require("fs");
const { saveToJson } = require("./miscellaneous_js/functions");
const { getSenNamesAndPhotos } = require("./puppeteer/names_and_photos/index");
const {
  getSenContributions,
} = require("./puppeteer/get_contributions/index.js");
const {
  parseContributions,
  getTop500Contributors,
} = require("./puppeteer/parse_contributions/index");
const {
  pushSenStatsAndPhotosToFirestoreAndCloudStorage,
  readMetaSTATSandPushToFirestore,
} = require("./firebase/index");

const getSenatorsAndIDs = async () => {
  // NOTE: reassigning const senArray between states for testing purposes so can work on small parts. comment out to run entire app.
  ///////////////// STAGE 1 /////////////////
  // get all senator data and photos; save array to senatorArray.json, save photos to /pics
  const senArray = await getSenNamesAndPhotos();
  await saveToJson(`./json/senArray.json`, JSON.stringify(senArray));
  ///////////////// STAGE 2 /////////////////
  // get all contributions for each senator
  // const senArray = JSON.parse(fs.readFileSync("./json/senArray.json", "utf-8"));
  for (let sen of senArray) {
    await getSenContributions(sen);
  }
  ////////////////// STAGE 3 //////////////////
  // parse contributions, getting top contributors, buckets
  // const senArray = JSON.parse(fs.readFileSync("./json/senArray.json", "utf-8"));
  for (let sen of senArray) {
    await parseContributions(sen);
  }
  ////////////////// STAGE 4 //////////////////
  // push individual senatorSTATS files and photos to firestore
  // const senArray = JSON.parse(fs.readFileSync("./json/senArray.json", "utf-8"));
  for (let sen of senArray) {
    pushSenStatsAndPhotosToFirestoreAndCloudStorage(sen);
  }
  ////////////////// STAGE 5 //////////////////
  // create meta (aggregate) file for top 500 contributors and push to firestore
  // const senArray = JSON.parse(fs.readFileSync("./json/senArray.json", "utf-8"));
  getTop500Contributors(senArray); // writes metaSTATSpartial to ./json
  readMetaSTATSandPushToFirestore();
};

getSenatorsAndIDs();

const fs = require("fs");
const { saveToJson } = require("./miscellaneous_js/functions");
const { getSenNamesAndPhotos } = require("./puppeteer/names_and_photos/index");
const {
  getSenContributions,
} = require("./puppeteer/get_contributions/index.js");
const { parseContributions } = require("./puppeteer/parse_contributions/index");
// const readFileAndPushToFirestore = require("./firebase.js");

const getSenatorsAndIDs = async () => {
  ///////////////// STAGE 1 /////////////////
  // get all senator data and photos; save array to senatorArray.json, save photos to /pics
  // const senArray = await getSenNamesAndPhotos();
  // await saveToJson(`./json/senArray.json`, JSON.stringify(senArray));

  ///////////////// STAGE 2 /////////////////
  // get all contributions for each senator
  // const senArray = JSON.parse(fs.readFileSync("./json/senArray.json", "utf-8"));
  // for (let sen of senArray) {
  //   await getSenContributions(sen);
  // }

  ////////////////// STAGE 3 //////////////////
  // parse contributions, getting top contributors, buckets
  // const senArray = JSON.parse(fs.readFileSync("./json/senArray.json", "utf-8"));
  // for (let sen of senArray) {
  //   await parseContributions(sen);
  // }

  ////////////////// STAGE 4 //////////////////
  // push to firestore
  const senArray = JSON.parse(fs.readFileSync("./json/senArray.json", "utf-8"));
  for (let sen of senArray) {
    const threeSen = await readFileAndPushToFirestore(sen);
  }

  ////////////////// STAGE 4 //////////////////
  // call parseContributions.js/top500contribs to update metaSTATSpartial, then
  // call firebase.js/pushPhotos and readMetaSTATSpartial to push to firestore
};

getSenatorsAndIDs();

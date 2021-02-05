const fs = require("fs");
const { saveToJson } = require("./miscellaneous_js/functions");
const { getSenNamesAndPhotos } = require("./puppeteer/names_and_photos/index");
const {
  getSenContributions,
} = require("./puppeteer/get_contributions/index.js");
// const parseContributions = require("./parseContributions.js")
//   .parseContributions;
// const readFileAndPushToFirestore = require("./firebase.js");

const getSenatorsAndIDs = async () => {
  ///////////////// STAGE 1 /////////////////
  // get all senator data and photos; save array to senatorArray.json, save photos to /pics
  // const senArray = await getSenNamesAndPhotos();
  // await saveToJson(`./json/senArray.json`, JSON.stringify(senArray));

  ///////////////// STAGE 2 /////////////////
  // get all contributions for each senator
  const senArray = JSON.parse(fs.readFileSync("./json/senArray.json", "utf-8"));
  for (let sen of senArray) {
    await getSenContributions(sen);
  }

  ////////////////// STAGE 3 //////////////////
  // for (let sen of senArray) {
  //  let twoSen = await parseContributions(sen);
  //  let threeSen = await readFileAndPushToFirestore(twoSen);
  // }

  ////////////////// STAGE 3 //////////////////
  // call parseContributions.js/top500contribs to update metaSTATSpartial, then
  // call firebase.js/pushPhotos and readMetaSTATSpartial to push to firestore
};

getSenatorsAndIDs();

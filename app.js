const fs = require("fs");
const { getSenNamesAndPhotos } = require("./puppeteer/names_and_photos/index");
// const getSenContributions = require("./getSenContributions.js");
// const parseContributions = require("./parseContributions.js")
//   .parseContributions;
// const readFileAndPushToFirestore = require("./firebase.js");

const getSenatorsAndIDs = async () => {
  // NOTE: stages should be done in chunks. comment out the 2nd, run the first, then reverse. app.js will otherwise throw a SyntaxError for redeclaration of cleanedArray.
  ///////////////// STAGE 1 /////////////////
  // get all senator data and photos; save array to senatorArray.json, save photos to /pics
  const senArray = await getSenNamesAndPhotos();

  // write the array to a file
  fs.writeFile(
    "./senatorArray.json",
    JSON.stringify(senArray),
    "utf-8",
    (err) => {
      if (err) console.log(err);
      console.log("wrote senator array in JSON format to senatorArray.json");
    }
  );

  // ///////////////// STAGE 2 /////////////////
  // // read the file
  // const senArray = JSON.parse(
  // 	fs.readFileSync("./senatorArray.json", "utf-8")
  // );

  // // get contributions, parse STATS, write STATS to firestore
  // for (let sen of senArray) {
  // 	let oneSen = await getSenContributions(sen);
  // 	let twoSen = await parseContributions(oneSen);
  // 	let threeSen = await readFileAndPushToFirestore(twoSen);
  // }

  ////////////////// STAGE 3 //////////////////
  // call parseContributions.js/top500contribs to update metaSTATSpartial, then
  // call firebase.js/pushPhotos and readMetaSTATSpartial to push to firestore
};

getSenatorsAndIDs();

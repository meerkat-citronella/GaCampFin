const fs = require("fs");
const { pushToFirestore, pushPhotoToCloudStorage } = require("./functions");

function pushSenStatsAndPhotosToFirestoreAndCloudStorage(senator) {
  let statsFileName;
  try {
    statsFileName = senator.fileName + "STATS"; // only want to write STATS file to firebase
  } catch (err) {
    console.log(`invalid argument for function readFilandPushtoFirestore\n`);
    console.log(err);
  }

  const filePath = `${__dirname}/../json/stats_files/${statsFileName}.json`;

  // reading from .json file, push to firestore
  fs.readFile(filePath, "utf-8", (err, jsonString) => {
    if (err) {
      console.log(`no file at ${filePath}`);
      console.log(err);
      return;
    }
    try {
      senatorJSONData = JSON.parse(jsonString);
      console.log("successfully read " + statsFileName);
      // push to firestore
      pushToFirestore(senatorJSONData, statsFileName, "senatorSTATS");
    } catch (err) {
      console.log("error reading file\n\n", err);
    }
  });

  // push photo to cloud storage
  pushPhotoToCloudStorage(senator);
}

function readMetaSTATSandPushToFirestore() {
  fs.readFile(
    `${__dirname}/../json/metaSTATSpartial.json`,
    "utf-8",
    (err, jsonString) => {
      if (err) console.log("error reading metaSTATSpartial.json");
      else {
        pushToFirestore(
          JSON.parse(jsonString),
          "metaSTATSpartial",
          "metaSTATS"
        );
      }
    }
  );
}

module.exports = {
  pushSenStatsAndPhotosToFirestoreAndCloudStorage,
  readMetaSTATSandPushToFirestore,
};

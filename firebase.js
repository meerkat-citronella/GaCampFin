const fs = require("fs");
const admin = require("firebase-admin");
const serviceAccount = require("./credentials/GaCampFinServiceAccountKey.json");

admin.initializeApp({
	credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
const storage = admin.storage();

function readFileandPushtoFirestore(senator) {
	let fileName;
	try {
		fileName = senator.fileName + "STATS"; // only want to write STATS file to firebase
	} catch (err) {
		console.log(`invalid argument for function readFilandPushtoFirestore\n`);
		console.log(err);
	}

	let filePath = "./app-output/" + fileName + ".json";

	// reading from .json file
	fs.readFile(filePath, "utf-8", (err, jsonString) => {
		if (err) {
			console.log(`no file at ${filePath}`);
			console.log(err);
			return;
		}
		try {
			senatorJSONData = JSON.parse(jsonString);
			console.log("successfully read " + fileName);
			// push to firestore
			pushToFirestore(senatorJSONData, fileName, "senatorSTATS");
		} catch (err) {
			console.log("error reading file\n\n", err);
		}
	});
}

function pushToFirestore(JSONData, fileName, collection) {
	try {
		db.collection(collection)
			.doc(fileName)
			.set(JSONData)
			.then(() => {
				console.log(
					"successfully wrote " +
						fileName +
						" to firestore database " +
						collection
				);
			});
	} catch (err) {
		console.log(
			"error writing " +
				fileName +
				"to firestore database  " +
				collection +
				"\n",
			err
		);
	}
}

// readFileandPushtoFirestore({
// 	name: "Albers, John",
// 	fileName: "AlbersJohn",
// 	displayName: "John Albers",
// 	district: "56",
// 	party: "Republican",
// 	searchName: ["albers", "john"],
// 	filingName: "Albers, John Edward",
// });

module.exports = readFileandPushtoFirestore;

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// call this part after done all of app.js; this will push the photos and metaSTATS page to firestore

function readMetaSTATSandPushToFirestore() {
	fs.readFile(
		"./app-output/metaSTATSpartial.json",
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

readMetaSTATSandPushToFirestore();

let senatorArray = JSON.parse(fs.readFileSync("./senatorArray.json", "utf-8"));

function pushPhotosToCloudStorage(senatorArray) {
	let gcBucket = storage.bucket("gs://ga-camp-fin.appspot.com");

	senatorArray.forEach((senObj) => {
		gcBucket
			.upload("./pics/" + senObj.fileName + ".jpg")
			.then((res) =>
				console.log(`uploaded ${senObj.fileName}.jpg to Cloud bucket`)
			);
	});
}

pushPhotosToCloudStorage(senatorArray);

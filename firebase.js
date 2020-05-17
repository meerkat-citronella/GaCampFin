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

// readMetaSTATSandPushToFirestore();

let senatorArray = JSON.parse(fs.readFileSync("./senatorArray.json", "utf-8"));

senatorArray = [
	{
		"name": "Hufstetler, Chuck",
		"fileName": "HufstetlerChuck",
		"displayName": "Chuck Hufstetler",
		"district": "52",
		"city": "Rome",
		"party": "Republican",
		"searchName": ["hufstetler", "charles"],
	},
];

// function pushPhotosToCloudStorage(senatorArray) {
// 	let storageRef = storage.ref();
// 	let picsRef = storageRef.child("pics");

// 	senatorArray.forEach((senObj) => {
// 		let senPicRef = storageRef.child("pics/" + senObj.fileName + ".jpg");
// 		console.log(senPicRef);
// 	});
// }

// pushPhotosToCloudStorage(senatorArray);

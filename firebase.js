const fs = require("fs");
const admin = require("firebase-admin");
const serviceAccount = require("./credentials/GaCampFinServiceAccountKey.json");

admin.initializeApp({
	credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

function readFileandPushtoFirestore(senator) {
	let fileName = senator.fileName + "STATS"; // only want to write STATS file to firebase
	let filePath = "./app-output/" + fileName + ".json";

	// reading from .json file
	fs.readFile(filePath, "utf-8", (err, jsonString) => {
		if (err) {
			console.log(err);
			return;
		}
		try {
			senatorJSONData = JSON.parse(jsonString);
			console.log("successfully read " + fileName);
			// push to firestore
			pushToFirestore(senatorJSONData, fileName);
		} catch (err) {
			console.log("error reading file\n\n", err);
		}
	});
}

function pushToFirestore(senatorJSONData, fileName) {
	try {
		db.collection("senatorSTATS")
			.doc(fileName)
			.set(senatorJSONData)
			.then(() => {
				console.log(
					"successfully wrote " + fileName + " to firestore database"
				);
			});
	} catch (err) {
		console.log("error writing " + fileName + "to firestore database\n", err);
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

//  testing to make sure firebase hooked up right
const fs = require("fs");
const admin = require("firebase-admin");
const serviceAccount = require("./credentials/GaCampFinServiceAccountKey.json");

admin.initializeApp({
	credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

///////////////////////////////////////////////////////////////////////////////////////////////////////////////
// dummy app
// const getSenatorsAndIDs = async () => {
// 	let fileNameArray = ["StoneJesseCSTATS", "LucasSrDavidESTATS"]; // getId() will return the file name of the written file, and push to fileNameArray

// 	for (let fileName of fileNameArray) {
// 		readFileandPushtoFirestore(fileName);
// 	}
// };

// getSenatorsAndIDs();

function readFileandPushtoFirestore(fileName) {
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

module.exports = readFileandPushtoFirestore;

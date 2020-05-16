const fs = require("fs");
const getSenNamesAndPhotos = require("./getSenNamesAndPhotos");
const checkSenNamesAndSubstitute = require("./checkSenNamesAndSubstitute");
const getSenContributions = require("./getSenContributions.js");
const parseContributions = require("./parseContributions.js")
	.parseContributions;
const readFileAndPushToFirestore = require("./firebase.js");

const getSenatorsAndIDs = async () => {
	// NOTE: stages should be done in chunks. comment out the 2nd, run the first, then reverse. app.js will otherwise throw a SyntaxError for redeclaration of cleanedArray.
	///////////////// STAGE 1 /////////////////
	// get an array of sens, clean it, save photos to ../GaCampFinClient/pics
	const senArray = await getSenNamesAndPhotos();
	const cleanedArray = checkSenNamesAndSubstitute(senArray);

	// write the array to a file
	fs.writeFile(
		"./senatorArray.json",
		JSON.stringify(cleanedArray),
		"utf-8",
		(err) => {
			if (err) console.log(err);
			console.log("wrote senator array in JSON format to senatorArray.json");
		}
	);

	///////////////// STAGE 2 /////////////////
	// read the file
	const cleanedArray = JSON.parse(
		fs.readFileSync("./senatorArray.json", "utf-8")
	);

	// get contributions, parse STATS, write STATS to firestore
	for (let sen of cleanedArray) {
		// let oneSen = await getSenContributions(sen);
		let twoSen = await parseContributions(sen);
		let threeSen = await readFileAndPushToFirestore(twoSen);
	}
};

getSenatorsAndIDs();

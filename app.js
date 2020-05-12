const fs = require("fs");
const getSenNamesAndPhotos = require("./getSenNamesAndPhotos");
const checkSenNamesAndSubstitute = require("./checkSenNamesAndSubstitute");
const getSenContributions = require("./getSenContributions.js");
const parseContributions = require("./parseContributions.js");
const readFileAndPushToFirestore = require("./firebase.js");

const getSenatorsAndIDs = async () => {
	// get an array of sens, clearn it, save photos to ../GaCampFinClient/pics
	const senArray = await getSenNamesAndPhotos();
	const cleanedArray = checkSenNamesAndSubstitute(senArray);

	// write the array to a file
	fs.writeFile(
		"./senatorArray.json",
		JSON.stringify(cleanedArray),
		"utf-8",
		(err) => {
			if (err) console.log(err);
			console.log("wrote senator array in JSON format to senatorArray.js");
		}
	);

	// read the file
	// NOTE: these should be accomplished in chunks, and then commented out to continue below.
	const cleanedArray = JSON.parse(
		fs.readFileSync("./senatorArray.json", "utf-8")
	);

	// get contributions, parse STATS, write STATS to firestore
	for (let sen of cleanedArray) {
		let oneSen = await getSenContributions(sen);
		let twoSen = await parseContributions(oneSen);
		let threeSen = await readFileAndPushToFirestore(twoSen);
	}
};

getSenatorsAndIDs();

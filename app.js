const puppeteer = require("puppeteer");
const axios = require("axios").default; // 'default' to provide autocomplete and param typings
const fs = require("fs");

const getSenContributions = require("./getSenContributions.js");
const wikimedia = require("./wikimedia.js");
const parseContributions = require("./parseContributions.js");
const readFileAndPushToFirestore = require("./firebase.js");
const getSenNamesAndPhotos = require("./getSenNamesAndPhotos");
const checkSenNamesAndSubstitute = require("./checkSenNamesAndSubstitute");

const getSenatorsAndIDs = async () => {
	const senArray = await getSenNamesAndPhotos();
	const cleanedArray = checkSenNamesAndSubstitute(senArray);

	fs.writeFile(
		"./senatorArray.js",
		JSON.stringify(cleanedArray),
		"utf-8",
		(err) => console.log(err)
	);

	// const cleanedArray = require("./senatorArray.js");

	for (let sen of cleanedArray) {
		let oneSen = await getSenContributions(sen);
		let twoSen = await parseContributions(oneSen);
		let threeSen = await readFileAndPushToFirestore(twoSen);
	}
};

getSenatorsAndIDs();

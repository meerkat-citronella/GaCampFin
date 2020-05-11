const puppeteer = require("puppeteer");
const axios = require("axios").default; // 'default' to provide autocomplete and param typings
const fs = require("fs");

const getSenContributions = require("./getSenContributions.js");
const wikimedia = require("./wikimedia.js");
const processData = require("./processData.js");
const readFileAndPushToFirestore = require("./firebase.js");

const getSenatorsAndIDs = async () => {
	// const response = await axios.get(wikimedia.url); // GET request to wikimedia API, which returns a string with all the sens names
	// let senators = wikimedia.parseSenators(response); // parses the res to get array of sens
	// console.log(senators);
	senators = [
		// ["larry", "walker"], // no reports/media ethics error
		// ["jesse", "stone"], // WORKS
		// ["lee", "anderson"], // for() error
		// ["harold", "jones"], // WORKS
		// ["burt", "jones"],
		// ["david", "lucas"],
		// ["greg", "dolezal"],
		// ["matt", "brass"],
		// ["brandon", "beach"],
		["john", "wilkinson"], // unknown error
	];
	for (let sen of senators) {
		let fileName = await getSenContributions(sen); //
		let statsFileName = await processData(fileName);
		await readFileAndPushToFirestore(statsFileName);
	}
};

getSenatorsAndIDs();

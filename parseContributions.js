const fs = require("fs");

// let fileName = "RAHMANSHEIKHMCHAD";
// let fileName = "JonesIIHaroldVernon";
// let fileName = "ThompsonBruceAnthony"

function parseContributions(senator) {
	let fileName = senator.fileName;
	try {
		if (fileName === "VACANT") {
			console.log("seat is vacant");
			return;
		}

		let senJSON = JSON.parse(
			fs.readFileSync(`./app-output/${fileName}.json`, "utf-8")
		);
		console.log("successfully read " + fileName + ".json");

		// get total itemized cash contributions from each report for a given senator's JSON data
		function parseContributionsByReport(senJSON) {
			let reportTotals = [];
			for (let report of senJSON.data) {
				let data = report.data;
				let reportName = report.report;
				let url = report.url;
				let totalContributions = 0;
				for (let entry of data) {
					// check for accounting negative, i.e. ($someNumber)
					let cashEntry = entry.cashAmount;
					let inKindEntry = entry.inKindAmount;
					cashAmount = parseFloat(cashEntry.replace(/[$,()]/gi, ""));
					inKindAmount = parseFloat(inKindEntry.replace(/[$,()]/gi, ""));
					if (cashEntry.includes("(")) cashAmount = -cashAmount;
					if (inKindEntry.includes("(")) inKindAmount = -inKindAmount;
					totalContributions += cashAmount + inKindAmount;
				}
				reportTotals.push({
					"reportName": reportName,
					"totalContributions": totalContributions,
					"url": url,
				});
			}
			return reportTotals;
		}

		// get totals for all unique contributors (cashAmount + inKindAmount) and sort
		function parseUniqueContributionsAndSortByHighest(senJSON) {
			let contributors = {};

			for (let report of senJSON.data) {
				let data = report.data;
				for (let entry of data) {
					let contributor = /.+/.exec(entry.contribName)[0];
					let cashEntry = entry.cashAmount;
					let inKindEntry = entry.inKindAmount;
					cashAmount = parseFloat(cashEntry.replace(/[$,()]/gi, ""));
					inKindAmount = parseFloat(inKindEntry.replace(/[$,()]/gi, ""));
					if (cashEntry.includes("(")) cashAmount = -cashAmount;
					if (inKindEntry.includes("(")) inKindAmount = -inKindAmount;

					if (contributor in contributors) {
						let prevTotalContrib = contributors[contributor];
						let newTotalContrib = prevTotalContrib + cashAmount + inKindAmount;
						contributors[contributor] = newTotalContrib;
					} else if (!(contributor in contributors)) {
						contributors[contributor] = cashAmount + inKindAmount;
					}
				}
			}

			let contributorsArray = turnContribObjIntoArrayAndSort(contributors);

			return contributorsArray;
		}

		/////////// checking that the totals match ///////////
		let contributionsByReport = parseContributionsByReport(senJSON);
		let uniqueContributors = parseUniqueContributionsAndSortByHighest(senJSON);

		let contributionsTotal = 0,
			uniqueContributionsTotal = 0;

		contributionsByReport.forEach((report) => {
			let contributionAmount = report.totalContributions;
			contributionsTotal += contributionAmount;
		});

		uniqueContributors.forEach((contributor) => {
			let contributionAmount = contributor.totalContributions;
			uniqueContributionsTotal += contributionAmount;
		});

		// console.log("contributionsTotal\n", contributionsTotal);
		// console.log("uniqueContributionsTotal\n", uniqueContributionsTotal);

		// console.log(fileName, parseContributionsByReport(senJSON));
		// console.log(fileName, parseUniqueContributionsAndSortByHighest(senJSON));

		// write STATS file
		let stats = {
			"lastUpdated": senJSON.lastUpdated,
			"info": senJSON.info,
			"contributionsByReport": {
				"totalContributions": contributionsTotal,
				"data": contributionsByReport,
			},
			"uniqueContributors": {
				"totalContributions": uniqueContributionsTotal,
				"data": uniqueContributors,
			},
		};

		fs.writeFileSync(
			`./app-output/${fileName}STATS.json`,
			JSON.stringify(stats)
		);
		console.log("successfully wrote " + fileName + "STATS.json to local drive");

		return senator;
	} catch (err) {
		console.log(fileName, "PARSE ERROR\n", err);
		return senator;
	}
}

function turnContribObjIntoArrayAndSort(contributorsObj) {
	let contributorsArray = [];

	for (let contributor in contributorsObj) {
		contributorsArray.push({
			"contributor": contributor,
			"totalContributions": contributorsObj[contributor],
		});
	}

	contributorsArray.sort((a, b) => b.totalContributions - a.totalContributions);

	return contributorsArray;
}

// parseContributions({
// 	name: "Albers, John",
// 	fileName: "AlbersJohn",
// 	displayName: "John Albers",
// 	district: "56",
// 	party: "Republican",
// 	searchName: ["albers", "john"],
// 	filingName: "Albers, John Edward",
// });

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const senatorArray = require("./senatorArray.json");

// get top contributors across ALL stats files
function getTopContributors(senatorArray) {
	// let totalRaisedCash = 0;
	let allUniqueContributorsArray = [];
	senatorArray.forEach((senObject) => {
		let senSTATSdata = JSON.parse(
			fs.readFileSync(`./app-output/${senObject.fileName}STATS.json`)
		);
		let senUniqueContributorsArray = senSTATSdata.uniqueContributors.data;
		// let senTotalRaised = senSTATSdata.uniqueContributors.totalContributions;
		// totalRaisedCash += senTotalRaised;
		senUniqueContributorsArray.forEach((uniqueContributor) => {
			allUniqueContributorsArray.push(uniqueContributor);
		});
	});

	let contributors = {};

	allUniqueContributorsArray.forEach((uniqueContributor) => {
		let contributorName = uniqueContributor.contributor;
		if (contributorName in contributors) {
			let prevTotalContrib = contributors[contributorName];
			let newTotalContrib =
				prevTotalContrib + uniqueContributor.totalContributions;
			contributors[contributorName] = newTotalContrib;
		} else if (!(contributorName in contributors)) {
			contributors[contributorName] = uniqueContributor.totalContributions;
		}
	});

	let topContributorsArray = turnContribObjIntoArrayAndSort(contributors);

	// let totalCashRaisedCheck = 0;

	// topContributorsArray.forEach((contributor) => {
	// 	totalCashRaisedCheck += contributor.totalContributions;
	// });

	// console.log(totalRaisedCash, totalCashRaisedCheck);

	fs.writeFileSync(
		"./app-output/metaSTATS.json",
		JSON.stringify({
			data: topContributorsArray,
		})
	);

	console.log("successfully wrote metaSTATS file to local drive");
}

// top 500 contributors... firebase only allows file size < 1mb
function getTop500Contributors(senatorArray) {
	// let totalRaisedCash = 0;
	let allUniqueContributorsArray = [];
	senatorArray.forEach((senObject) => {
		let senSTATSdata = JSON.parse(
			fs.readFileSync(`./app-output/${senObject.fileName}STATS.json`)
		);
		let senUniqueContributorsArray = senSTATSdata.uniqueContributors.data;
		// let senTotalRaised = senSTATSdata.uniqueContributors.totalContributions;
		// totalRaisedCash += senTotalRaised;
		senUniqueContributorsArray.forEach((uniqueContributor) => {
			allUniqueContributorsArray.push(uniqueContributor);
		});
	});

	let contributors = {};

	allUniqueContributorsArray.forEach((uniqueContributor) => {
		let contributorName = uniqueContributor.contributor;
		if (contributorName in contributors) {
			let prevTotalContrib = contributors[contributorName];
			let newTotalContrib =
				prevTotalContrib + uniqueContributor.totalContributions;
			contributors[contributorName] = newTotalContrib;
		} else if (!(contributorName in contributors)) {
			contributors[contributorName] = uniqueContributor.totalContributions;
		}
	});

	let topContributorsArray = turnContribObjIntoArrayAndSort(contributors);

	let topFiveHundredContribArray = topContributorsArray.slice(0, 500);

	// let totalCashRaisedCheck = 0;

	// topContributorsArray.forEach((contributor) => {
	// 	totalCashRaisedCheck += contributor.totalContributions;
	// });

	// console.log(totalRaisedCash, totalCashRaisedCheck);

	fs.writeFileSync(
		"./app-output/metaSTATSpartial.json",
		JSON.stringify({
			data: topFiveHundredContribArray,
		})
	);

	console.log("successfully wrote metaSTATSpartial file to local drive");
}

// getTopContributors(senatorArray);
getTop500Contributors(senatorArray);

module.exports = {
	parseContributions: parseContributions,
	getTopContributors: getTopContributors,
};

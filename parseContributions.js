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
				let totalContributions = 0;
				for (let entry of data) {
					let cashAmount = parseFloat(entry.cashAmount.replace(/[$,]/gi, ""));
					let inKindAmount = parseFloat(
						entry.inKindAmount.replace(/[$,]/gi, "")
					);
					totalContributions += cashAmount + inKindAmount;
				}
				reportTotals.push({
					"reportName": reportName,
					"totalContributions": totalContributions,
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
					let cashAmount = parseFloat(entry.cashAmount.replace(/[$,]/gi, ""));
					let inKindAmount = parseFloat(
						entry.inKindAmount.replace(/[$,]/gi, "")
					);
					if (contributor in contributors) {
						let prevTotalContrib = contributors[contributor];
						let newTotalContrib = prevTotalContrib + cashAmount + inKindAmount;
						contributors[contributor] = newTotalContrib;
					} else if (!(contributor in contributors)) {
						contributors[contributor] = cashAmount + inKindAmount;
					}
				}
			}

			let contributorsArray = [];

			for (let contributor in contributors) {
				contributorsArray.push({
					"contributor": contributor,
					"totalContributions": contributors[contributor],
				});
			}

			contributorsArray.sort(
				(a, b) => b.totalContributions - a.totalContributions
			);

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

// parseContributions({
// 	name: "Albers, John",
// 	fileName: "AlbersJohn",
// 	displayName: "John Albers",
// 	district: "56",
// 	party: "Republican",
// 	searchName: ["albers", "john"],
// 	filingName: "Albers, John Edward",
// });

module.exports = parseContributions;

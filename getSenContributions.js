const puppeteer = require("puppeteer");
const fs = require("fs");

async function getSenContributions(senator) {
	let fname = senator.searchName[1],
		lname = senator.searchName[0],
		fileName = senator.fileName;

	const browser = await puppeteer.launch({
		// headless: false,
		// slowMo: 30,
	});

	try {
		const page = await browser.newPage();

		//////////////////////////////////////////////////////////
		// helper functions... have to be here because need page to already be activated
		async function getHandleFromSelector(selector) {
			await page.waitForSelector(selector);
			let handle = await page.$(selector);
			return handle;
		}

		async function getHandlesFromSelector(selector) {
			await page.waitForSelector(selector);
			let handle = await page.$$(selector);
			return handle;
		}

		async function getTextFromHandle(handle) {
			let text = await handle.evaluate((node) => node.innerText);
			return text;
		}
		//////////////////////////////////////////////////////////

		let urlPrepend =
			"http://media.ethics.ga.gov/search/Campaign/Campaign_ByName.aspx";

		// handle vacant seat
		if (fname === "vacant") {
			await browser.close;
			return "VACANT";
		}

		await page.goto(urlPrepend);

		// enter name and search
		let FNAME_SELECTOR = "#ctl00_ContentPlaceHolder1_txtFirst";
		await page.click(FNAME_SELECTOR);
		await page.keyboard.type(fname);
		let LNAME_SELECTOR = "#ctl00_ContentPlaceHolder1_txtLast";
		await page.click(LNAME_SELECTOR);
		await page.keyboard.type(lname);
		await page.keyboard.press("Enter");

		// handle 'no results'
		let noResults = await getTextFromHandle(
			await getHandleFromSelector("#ctl00_ContentPlaceHolder1_lblMessage")
		);

		if (noResults === "Search Returned No Results.") {
			await page.goBack();
			let fnameText = await page.$eval(FNAME_SELECTOR, (node) => node.value);
			await page.click(FNAME_SELECTOR);
			await page.keyboard.down("Shift");
			for (let i = 0; i < fnameText.length; i++) {
				await page.keyboard.press("ArrowLeft");
			}
			await page.keyboard.up("Shift");
			await page.keyboard.press("Backspace");
			await page.keyboard.press("Enter");
		}

		// loop through results 'view' buttons
		let viewButtons = await getHandlesFromSelector(
			"#ctl00_ContentPlaceHolder1_Search_List > tbody > tr > td > a"
		);

		let numViewButtons = viewButtons.length;

		let url = page.url();

		for (let i = 0; i < numViewButtons; i++) {
			await page.goto(url);

			let viewButtons = await getHandlesFromSelector(
				"#ctl00_ContentPlaceHolder1_Search_List > tbody > tr > td > a"
			);
			let button = viewButtons[i];

			await button.click();
			await page.waitForNavigation();

			let gridItemsHandles = await getHandlesFromSelector("tbody .lblentry");

			let textFields = "";

			for (let item of gridItemsHandles) {
				let innerSpan = await item.$("span");
				if (innerSpan) {
					let text = await getTextFromHandle(innerSpan);
					textFields += text;
				}
			}

			let hasSenate = textFields.includes("State Senate");

			if (!hasSenate) continue;

			if (hasSenate) {
				break;
			}
		}

		// click senate 'click here to view' button
		let gridItemsHandles = await getHandlesFromSelector("tbody .lblentry");
		for (let item of gridItemsHandles) {
			let innerSpan = await item.$("span");
			if (innerSpan) {
				let text = await getTextFromHandle(innerSpan);
				if (text.includes("State Senate")) {
					let next = await page.evaluateHandle(
						(node) => node.nextElementSibling,
						item
					);
					let senateClickHereButton = await next.$("a");
					await senateClickHereButton.click();
					await page.waitForNavigation();
					break;
				}
			}
		}

		let candidateName = await getTextFromHandle(
			await getHandleFromSelector(
				"#ctl00_ContentPlaceHolder1_NameInfo1_lblName"
			)
		);
		senator.nameFiledUnder = candidateName;

		// click the dropdown
		let campaignRepsDrpdwnButton = await getHandleFromSelector(
			"#ctl00_ContentPlaceHolder1_Name_Reports1_TabContainer1_TabPanel1_Panel8"
		);
		await campaignRepsDrpdwnButton.click();

		let viewContReportsButtons = await getHandlesFromSelector(
			"#ctl00_ContentPlaceHolder1_Name_Reports1_TabContainer1_TabPanel1_dgReports .gridviewrow td a, #ctl00_ContentPlaceHolder1_Name_Reports1_TabContainer1_TabPanel1_dgReports .gridviewalterrow td a"
		);
		await page.waitFor(700);

		let contributionsUrls = [];
		let campaignRepsPageUrl = await page.url();

		// loop through reports and get urls
		for (let i = 0; i < viewContReportsButtons.length; i++) {
			await page.goto(campaignRepsPageUrl);

			let campaignRepsDrpdwnButton = await getHandleFromSelector(
				"#ctl00_ContentPlaceHolder1_Name_Reports1_TabContainer1_TabPanel1_Panel8"
			);
			await campaignRepsDrpdwnButton.click();

			let viewContReportsButtons = await getHandlesFromSelector(
				"#ctl00_ContentPlaceHolder1_Name_Reports1_TabContainer1_TabPanel1_dgReports .gridviewrow td a, #ctl00_ContentPlaceHolder1_Name_Reports1_TabContainer1_TabPanel1_dgReports .gridviewalterrow td a"
			);
			await page.waitFor(700);

			await viewContReportsButtons[i].click();
			await page.waitForNavigation();

			let year = await getTextFromHandle(
				await getHandleFromSelector(
					"#ctl00_ContentPlaceHolder1_Name_Reports1_dgReports > tbody:nth-child(1) > tr:nth-child(2) > td:nth-child(2)"
				)
			);
			let type = await getTextFromHandle(
				await getHandleFromSelector(
					"#ctl00_ContentPlaceHolder1_Name_Reports1_dgReports > tbody:nth-child(1) > tr:nth-child(2) > td:nth-child(3)"
				)
			);
			let report = await getTextFromHandle(
				await getHandleFromSelector("td.lblentry:nth-child(4)")
			);

			let viewContributionsButton = await getHandleFromSelector(
				"#ctl00_ContentPlaceHolder1_Name_Reports1_dgReports_ctl02_ViewCont"
			);
			await viewContributionsButton.click();
			await page.waitForNavigation();

			contributionsUrls.push({
				type: type,
				year: year,
				report: report,
				url: page.url(),
			});
		}

		// filtering out originals and amended reports
		let firstFilterContributionsReports = [];

		for (let i = 0; i < contributionsUrls.length; i++) {
			if (contributionsUrls[i].type === "Amended") {
				firstFilterContributionsReports.push(contributionsUrls[i]);
				continue;
			}
			let isAmended = false;
			if (contributionsUrls[i].type === "Original") {
				for (let k = 0; k < contributionsUrls.length; k++) {
					if (contributionsUrls[i] === contributionsUrls[k]) continue;
					else if (
						contributionsUrls[i].year === contributionsUrls[k].year &&
						contributionsUrls[i].report === contributionsUrls[k].report
					) {
						firstFilterContributionsReports.push(contributionsUrls[k]);
						isAmended = true;
					}
				}
			}
			if (!isAmended)
				firstFilterContributionsReports.push(contributionsUrls[i]);
		}

		let secondFilterContributionsReports = Array.from(
			new Set(firstFilterContributionsReports)
		);

		let thirdFilterContributionsReports = [];

		for (let i = 0; i < secondFilterContributionsReports.length; i++) {
			let cdrRe = /(?<=CDRID=)\d+/;
			if (secondFilterContributionsReports[i].type === "Original")
				thirdFilterContributionsReports.push(
					secondFilterContributionsReports[i]
				);
			if (secondFilterContributionsReports[i].type === "Amended") {
				let iCdr = cdrRe.exec(secondFilterContributionsReports[i].url)[0];
				let amendedAgain = false;
				for (let k = 0; k < secondFilterContributionsReports.length; k++) {
					if (
						secondFilterContributionsReports[i] ===
						firstFilterContributionsReports[k]
					)
						continue;
					else if (
						secondFilterContributionsReports[i].year ===
							secondFilterContributionsReports[k].year &&
						secondFilterContributionsReports[i].report ===
							secondFilterContributionsReports[k].report
					) {
						let kCdr = cdrRe.exec(secondFilterContributionsReports[k].url)[0];
						if (kCdr > iCdr) amendedAgain = true;
					}
				}
				if (!amendedAgain)
					thirdFilterContributionsReports.push(
						secondFilterContributionsReports[i]
					);
			}
		}

		// looping through reports, scraping individual contributions
		let senatorContributions = {
			"lastUpdated": Date(Date.now()),
			"info": senator,
			"data": [],
		};

		for (let i = 0; i < thirdFilterContributionsReports.length; i++) {
			let longReport = thirdFilterContributionsReports[i].report;
			let condensedReport = /\w*[ ]\d*/.exec(longReport)[0].replace(" ", "");
			let reportTag =
				thirdFilterContributionsReports[i].year +
				condensedReport +
				thirdFilterContributionsReports[i].type;

			await page.goto(thirdFilterContributionsReports[i].url);

			let entries = {
				"report": reportTag,
				"data": [],
			};

			const noContributions = await getTextFromHandle(
				await getHandleFromSelector("#ctl00_ContentPlaceHolder1_Messagelabel")
			);

			if (noContributions === "No Contributions Reported.") {
				entries["note"] = "No contributions reported.";
				senatorContributions.data.push(entries);
				continue;
			}

			let contributionRowsHandle = await getHandlesFromSelector(
				"#ctl00_ContentPlaceHolder1_Campaign_ByContributions_RFResults2_dgContSummary tbody tr.gridviewrow, #ctl00_ContentPlaceHolder1_Campaign_ByContributions_RFResults2_dgContSummary tbody tr.gridviewalterrow"
			);

			for (let k = 0; k < contributionRowsHandle.length; k++) {
				let entryTds = await contributionRowsHandle[k].$$("td");
				let entry = {
					"candidateName": candidateName,
				};

				for (let l = 0; l < 6; l++) {
					switch (l) {
						case 0:
							entry["contribName"] = await getTextFromHandle(entryTds[l]);
							break;
						case 1:
							entry["PACOccupationEmployer"] = await getTextFromHandle(
								entryTds[l]
							);
							break;
						case 2:
							entry["receivedTypeElection"] = await getTextFromHandle(
								entryTds[l]
							);
							break;
						case 3:
							entry["inKindDescription"] = await getTextFromHandle(entryTds[l]);
							break;
						case 4:
							entry["inKindAmount"] = await getTextFromHandle(entryTds[l]);
							break;
						case 5:
							entry["cashAmount"] = await getTextFromHandle(entryTds[l]);
							break;
					}
				}
				entries.data.push(entry);
			}
			senatorContributions.data.push(entries);
		}
		// console.log(senatorContributions);

		browser.close();

		let senatorJSONString = JSON.stringify(senatorContributions);

		fs.writeFileSync(`./app-output/${fileName}.json`, senatorJSONString);

		console.log("successfully wrote " + fileName + ".json to local drive");

		await browser.close();

		return senator;
	} catch (err) {
		console.log(senator.name, "PUPPETEER ERROR\n", err);

		// check if there's an existing file with good data, if not, writing new error file
		function isThereAlreadyAJSONFile(fileName) {
			try {
				let test = fs.readFileSync(`./app-output/${fileName}.json`, "utf-8");
				return true;
			} catch (err) {
				return false;
			}
		}

		let isThereJSON = isThereAlreadyAJSONFile(fileName);

		if (!isThereJSON) {
			fs.writeFileSync(
				`./app-output/${fileName}.json`,
				JSON.stringify({
					"lastUpdated": Date(Date.now()),
					"info": senator,
					"data": [],
					"note": "Puppeteer Error",
					"error": err,
				})
			);
			console.log(
				"wrote new error file for " + senator.name + " to local drive"
			);
		} else {
			console.log(
				senator.name +
					`already has valid data, not updating ${fileName},json in local drive`
			);
		}

		await browser.close();
		return senator;
	}
}

// getSenContributions(["ben", "watson"]);
// getSenContributions(["greg", "dolezal"]);
// getSenContributions(['tonya', 'anderson'])
// getSenContributions(['randy', 'robertson'])
// getSenContributions(['freddie', 'sims'])
// getSenContributions(["jen", "jordan"]);
// getSenContributions(["larry", "walker"]);

// let senArray = [
// 	["larry", "walker"],
// 	["greg", "dolezal"],
// ];

// for (let sen of senArray) {
// 	getSenContributions(sen);
// }

module.exports = getSenContributions;

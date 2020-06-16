const puppeteer = require("puppeteer");

const gaSenPageUrl =
	"http://www.senate.ga.gov/senators/en-US/SenateMembersList.aspx";

async function getSenNamesAndPhotos() {
	const browser = await puppeteer.launch({
		headless: false,
	});
	const page = await browser.newPage();

	await page.goto(gaSenPageUrl);

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

	let senRows = await getHandlesFromSelector(
		"#ctl00_SPWebPartManager1_g_24f52fbe_c82b_4244_9c5a_498e53ec571e > div > table > tbody tr"
	);

	let senArray = [];

	// iterate through each senator's page
	for (let i = 1; i < senRows.length; i++) {
		try {
			await page.goto(gaSenPageUrl);

			let senRows = await getHandlesFromSelector(
				"#ctl00_SPWebPartManager1_g_24f52fbe_c82b_4244_9c5a_498e53ec571e > div > table > tbody tr"
			);

			let senLinkHandle = await senRows[i].$("td:nth-child(1) a");
			let senText = await getTextFromHandle(senLinkHandle);
			let senName = /.+\(/.exec(senText)[0].replace("(", "").trim();
			let senParty = /\(\b.+\b\)/.exec(senText)[0].replace(/[()]/gi, "");
			let fileName = senName.replace(/[ ,()''.]/gi, "");
			let district = await getTextFromHandle(
				await senRows[i].$("td:nth-child(2)")
			);
			let city = (
				await getTextFromHandle(await senRows[i].$("td:nth-child(3)"))
			).trim();

			await senLinkHandle.click();
			await page.waitForNavigation();

			let senDisplayName = await getTextFromHandle(
				await getHandleFromSelector("div.senateh3:nth-child(3)")
			);

			try {
				let senImageHandle = await getHandleFromSelector(
					"#ctl00_SPWebPartManager1_g_e900f330_6fed_480d_98c4_28aec83b80c1 > div:nth-child(3) > div:nth-child(1) > div:nth-child(1) > img:nth-child(1)"
				);

				await senImageHandle.screenshot({
					path: `./pics/${fileName}.jpg`,
				});

				console.log(`saved senator photo to ./pics/${fileName}.jpg`);
			} catch (err) {
				console.log(`ERROR getting photo for ${senName}\n`, err);
			}

			let senData = {
				name: senName,
				fileName: fileName,
				displayName: senDisplayName,
				district: district,
				city: city,
				party: senParty,
			};

			senArray.push(senData);
		} catch (err) {
			console.log(
				`error getting senator at position ${i} (where 1 is the first row)\n`
			);
			console.log(err);

			senArray.push({
				name: "ERROR",
				note: `ERROR getting senator at position ${i} (where 1 is the first row)`,
			});
		}
	}

	await browser.close();

	// console.log(senArray);

	return senArray;
}

// getSenNamesAndPhotos().then((arr) => console.log(arr));

module.exports = getSenNamesAndPhotos;

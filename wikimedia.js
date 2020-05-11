// Get the contents of a page, using method 2, from: https://www.mediawiki.org/wiki/API:Get_the_contents_of_a_page
// remember format=json; origin=*
let endpoint = "http://en.wikipedia.org/w/api.php";
let action = "action=parse";
let format = "format=json";
let page = "page=Georgia_State_Senate";
let prop = "prop=wikitext";
let section = "section=3";

let url =
	endpoint +
	"?origin=*&" +
	action +
	"&" +
	format +
	"&" +
	page +
	"&" +
	prop +
	"&" +
	section;

function parseSenators(res) {
	// interface: takes in the res from wikimedia API GET, processes and returns array of Senators
	const re = /((\[\[)([a-zA-Z.]+ ?)+)|(('')[a-zA-Z]+)/; // firefox does not allow lookaheads (?<=)

	let senatorsRawList = res.data.parse.wikitext["*"].split("District");
	let senatorsFiltered = senatorsRawList.filter((rawSen) => re.test(rawSen));
	let senators = senatorsFiltered.map((rawSen) => {
		let almostSen = re.exec(rawSen)[0];
		let fullSen = "";
		for (let char of almostSen) {
			if (char === "[" || char === "'") continue;
			fullSen += char;
		}
		let sen = fullSen.toLowerCase().trim().split(" ");
		let senLength = sen.length;
		let finalSen = [];
		switch (senLength) {
			case 1:
				finalSen.push(sen[0]);
				break;
			case 2:
				finalSen.push(sen[0]);
				finalSen.push(sen[1]);
				break;
			case 3: //case 3 and 4 are the same, so can stack like this
			case 4:
				finalSen.push(sen[0]);
				finalSen.push(sen[2]);
				break;
		}

		const nameSubs = {
			"randy": "randall",
			"mike": "michael",
			"bill": "william",
			"steve": "stephen",
			"chuck": "charles",
			"marty": "maurice",
			"ben": "benjamin",
		};

		for (let i = 0; i < finalSen.length; i++) {
			if (nameSubs[finalSen[i]]) finalSen[i] = nameSubs[finalSen[i]];
		}

		const specificSenSubs = {
			// for specific sens that aren't handled above
			"p. martin": "peter martin",
			"larry iii": "larry walker",
			"butch miller": "cecil miller",
			"brian strickland": "robert strickland",
			"burt jones": "william jones",
		};

		let stringSen = finalSen.toString().replace(",", " ");
		if (specificSenSubs[stringSen]) stringSen = specificSenSubs[stringSen];
		finalSen = stringSen.split(" ");

		return finalSen;
	});

	// console.log(senators)
	return senators;
}

// GET for testing purpses
// const axios = require('axios')
// axios.get(url)
//     .then( res => parseSenators(res))

exports.parseSenators = parseSenators;
exports.url = url;

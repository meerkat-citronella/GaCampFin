let str1 = "The Home Depot Inc. PAC";
let str2 = "Cancer Treatment Centers of America Global Inc.";
let str3 = "Orkin & Associates, LLC";
let str4 = "Chattahoochee Physicians Laboratory Services LLC";
let str5 = "Bethe for Senate llc";
let str6 = "Civil Justice PAC Inc.";
let str7 = "Georgia Bankers Assoc. PAC";
let str8 = "Georgia Bankers    Association PAC";
let str9 = "United Health Services of Georgia  Inc.";

let contributor = str8
	.replace(/[,]/gi, "")
	.replace(/(  |   )/gi, " ")
	.replace(/(  )/gi, " ")
	.replace(/(  )/gi, " ")
	.replace(/(LLC)/g, "")
	.replace(/(LLP)/g, "")
	.replace(/\b(Inc\.|INC\.|INC)/g, "")
	.replace(/The /g, "")
	.replace(/to/gi, "to")
	.replace(/of/gi, "of")
	.replace(/(Assoc\.|Assn.)/g, "Association")
	.replace(/(Comm\.)/g, "Community")
	.replace(/Political Action Committee/gi, "PAC")
	.replace(/\bPAC\b/g, "")
	.replace(/\b(GA|Ga)\b/g, "Georgia")
	.replace(/\b(hosPAC|HosPAC|HOS|Hos)\b/g, "HOSPAC")
	.trim();

// console.log(contributor);

// with all replacements:
// let civilAll = {
// 	"contributor": "Civil Justice PAC of the Georgia Trial Lawyers Association",
// 	"totalContributions": 372145,
// };

// let partialCivilArr = [
// 	{ "contributor": "Civil Justice", "totalContributions": 223245 },
// 	{
// 		"contributor": "Civil Justice of the Georgia Trial Lawyers Association",
// 		"totalContributions": 113400,
// 	},
// 	{
// 		"contributor": "Civil Justice of the Georgia Trial Lawy",
// 		"totalContributions": 15000,
// 	},
// 	{
// 		"contributor": "Civil Justice of Georgia Trial Lawyers Association",
// 		"totalContributions": 12000,
// 	},
// 	{
// 		"contributor": "Civil Justice Georgia Trial Lawyers Association",
// 		"totalContributions": 8500,
// 	},
// ];

// let fullCivilArr = [
// 	{ "contributor": "Civil Justice PAC", "totalContributions": 76445 },
// 	{ "contributor": "Civil Justice PAC, Inc.", "totalContributions": 65700 },
// 	{ "contributor": "Civil Justice PAC Inc.", "totalContributions": 26500 },
// 	{ "contributor": "Civil Justice PAC, Inc", "totalContributions": 21400 },
// 	{
// 		"contributor": "Civil Justice PAC Inc of the GA Trial Lawyers Association",
// 		"totalContributions": 17000,
// 	},
// 	{
// 		"contributor": "Civil Justice PAC, Inc., of the Georgia Trial Lawy",
// 		"totalContributions": 15000,
// 	},
// 	{
// 		"contributor": "Civil Justice PAC Inc. of the GA Trial Lawyers Association",
// 		"totalContributions": 14000,
// 	},
// 	{ "contributor": "Civil Justice PAC, INC.", "totalContributions": 13000 },
// 	{
// 		"contributor":
// 			"Civil Justice PAC Inc of the Georgia Trial Lawyers Association",
// 		"totalContributions": 11000,
// 	},
// 	{
// 		"contributor": "Civil Justice PAC, Inc of the GA Trial Lawyers Assoc",
// 		"totalContributions": 8800,
// 	},
// 	{
// 		"contributor": "Civil Justice PAC of the GA Trial Lawyers Association",
// 		"totalContributions": 8500,
// 	},
// ];

// let civilTot = 0;
// partialCivilArr.forEach((contrObj) => {
// 	civilTot += contrObj.totalContributions;
// });

// console.log(civilTot);

const fs = require("fs");

const metaSTATS = JSON.parse(
	fs.readFileSync("./app-output/metaSTATS.json", "utf-8")
).data;

let civilPartialArr = metaSTATS.filter((contrObj) =>
	contrObj.contributor.includes("civil")
);
console.log(civilPartialArr);
// console.log(civilPartialArr.length);

let civilTot = 0;
civilPartialArr.forEach((contrObj) => {
	civilTot += contrObj.totalContributions;
});

// console.log(civilTot);

let civilParCapitalized = civilPartialArr.map((contrObj) => {
	let contributor = contrObj.contributor.split("");
	for (let i = 0; i < contributor.length; i++) {
		if (i - 1 < 0) {
			let upperCaseLetter = contributor[i].toUpperCase();
			contributor[i] = upperCaseLetter;
		} else if (
			contributor[i - 1] === " " &&
			contributor[i] === "o" &&
			contributor[i + 1] === "f" &&
			contributor[i + 2] === " "
		) {
			continue;
		} else if (
			contributor[i - 1] === " " &&
			contributor[i] === "t" &&
			contributor[i + 1] === "h" &&
			contributor[i + 2] === "e" &&
			contributor[i + 3] === " "
		) {
			continue;
		} else if (contributor[i - 1] === " ") {
			let upperCaseLetter = contributor[i].toUpperCase();
			contributor[i] = upperCaseLetter;
		}
	}

	let contributorStr = contributor.join().replace(/,/gi, "");
	return contributorStr;
});

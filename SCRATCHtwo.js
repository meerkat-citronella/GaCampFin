// const fs = require("fs");

// function isThereAlreadyAJSONFile(fileName) {
// 	try {
// 		let test = fs.readFileSync(`./app-output/${fileName}.json`, "utf-8");
// 		return true;
// 	} catch (err) {
// 		return false;
// 	}
// }

// let fileName = "JonesIIHaroldVernon";

// console.log(isThereAlreadyJSON(fileName));

// let senName = "RhettMichael'Doc'";
// let senName = "MartinIVP.K.";
// let senName = "some(other)sen.name, thatisproblematic.";

// let fileName = senName.replace(/[ ,().]/gi, "");

// console.log(fileName);

let senatorArray = fs.readFileSync("./senatorArray.json", "utf-8");
console.log(senatorArray);

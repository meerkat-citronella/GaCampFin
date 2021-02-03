// let senArray = require("./senatorArray.js");

// console.log(senArray);

function checkSenNamesAndSubstitute(senArray) {
  const nameSubs = {
    randy: "randall",
    mike: "michael",
    bill: "william",
    steve: "stephen",
    chuck: "charles",
    marty: "maurice",
    ben: "benjamin",
  };
  const specificSenSubs = {
    // for specific sens that aren't handled above
    "martin p.": "martin peter",
    "miller butch": "miller cecil",
    "strickland brian": "strickland robert",
    "jones burt": "jones william",
  };

  senArray.forEach((senObj) => {
    let nameArr = senObj.name
      .split(",")
      .map((name) => name.trim().toLowerCase())
      .map((name) => {
        return /\S+/.exec(name)[0];
      });

    // console.log(nameArr);
    let twoNameOnlyArr = [];
    switch (nameArr.length) {
      case 1:
        twoNameOnlyArr.push(nameArr[0]);
        break;
      case 2:
        twoNameOnlyArr.push(nameArr[0]);
        twoNameOnlyArr.push(nameArr[1]);
        break;
      case 3: //case 3 and 4 are the same, so can stack like this
      case 4:
        twoNameOnlyArr.push(nameArr[0]);
        twoNameOnlyArr.push(nameArr[2]);
        break;
    }

    for (let i = 0; i < twoNameOnlyArr.length; i++) {
      if (nameSubs[twoNameOnlyArr[i]])
        twoNameOnlyArr[i] = nameSubs[twoNameOnlyArr[i]];
    }

    let stringSen = twoNameOnlyArr.toString().replace(",", " ");
    if (specificSenSubs[stringSen]) stringSen = specificSenSubs[stringSen];
    twoNameOnlyArr = stringSen.split(" ");

    senObj.searchName = twoNameOnlyArr;

    // console.log(senObj);
  });

  return senArray;
}

// checkSenNamesAndSubstitute(senArray);

module.exports = checkSenNamesAndSubstitute;

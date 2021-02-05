const fs = require("fs");
const {
  turnContribObjIntoArrayAndSort,
  parseContributionsByReport,
  parseUniqueContributionsAndSortByHighest,
  getBuckets,
} = require("./functions");

// INTERFACE: senator of senatorArray, i.e.:
// parseContributions({
// 	"name": "Anderson, Lee",
// 	"fileName": "AndersonLee",
// 	"displayName": "Lee Anderson",
// 	"district": "24",
// 	"city": "Grovetown",
// 	"party": "Republican",
// 	"searchName": ["anderson", "lee"],
// });

function parseContributions(senator) {
  const fileName = senator.fileName;

  try {
    if (fileName === "VACANT") {
      console.log("seat is vacant");
      return;
    }

    const senJSON = JSON.parse(
      fs.readFileSync(
        `${__dirname}/../../json/raw_contributions/${fileName}.json`,
        "utf-8"
      )
    );
    console.log("successfully read " + fileName + ".json");

    // calling functions
    const contributionsByReport = parseContributionsByReport(senJSON);
    const uniqueContributors = parseUniqueContributionsAndSortByHighest(
      senJSON
    );
    const buckets = getBuckets(senJSON);

    // getting totals for each
    let contributionsTotal = 0,
      uniqueContributionsTotal = 0;

    contributionsByReport.forEach((report) => {
      const contributionAmount = report.totalContributions;
      contributionsTotal += contributionAmount;
    });

    uniqueContributors.forEach((contributor) => {
      const contributionAmount = contributor.totalContributions;
      uniqueContributionsTotal += contributionAmount;
    });

    // use these to check if the parsing by unique contributors gives same total number
    // console.log("contributionsTotal\n", contributionsTotal);
    // console.log("uniqueContributionsTotal\n", uniqueContributionsTotal);

    // write STATS file
    const stats = {
      lastUpdated: senJSON.lastUpdated,
      info: senJSON.info,
      contributionsByReport: {
        totalContributions: contributionsTotal,
        data: contributionsByReport,
      },
      uniqueContributors: {
        totalContributions: uniqueContributionsTotal,
        data: uniqueContributors,
      },
      buckets: buckets,
    };

    fs.writeFileSync(
      `${__dirname}/../../json/stats_files/${fileName}STATS.json`,
      JSON.stringify(stats)
    );
    console.log("successfully wrote " + fileName + "STATS.json to local drive");

    return senator;
  } catch (err) {
    console.log(fileName, "PARSE ERROR\n", err);
    return senator;
  }
}

/////// HELPER FUNCTIONS ///////

// INTERFACE: senatorArray

// const senatorArray = require("./senatorArray.json");

// // get top contributors across ALL stats files
// function getTopContributors(senatorArray) {
//   // let totalRaisedCash = 0;
//   let allUniqueContributorsArray = [];
//   senatorArray.forEach((senObject) => {
//     let senSTATSdata = JSON.parse(
//       fs.readFileSync(`./app-output/${senObject.fileName}STATS.json`)
//     );
//     let senUniqueContributorsArray = senSTATSdata.uniqueContributors.data;
//     // let senTotalRaised = senSTATSdata.uniqueContributors.totalContributions;
//     // totalRaisedCash += senTotalRaised;
//     senUniqueContributorsArray.forEach((uniqueContributor) => {
//       allUniqueContributorsArray.push(uniqueContributor);
//     });
//   });

//   let contributors = {};

//   allUniqueContributorsArray.forEach((uniqueContributor) => {
//     let contributorName = uniqueContributor.contributor;
//     if (contributorName in contributors) {
//       let prevTotalContrib = contributors[contributorName];
//       let newTotalContrib =
//         prevTotalContrib + uniqueContributor.totalContributions;
//       contributors[contributorName] = newTotalContrib;
//     } else if (!(contributorName in contributors)) {
//       contributors[contributorName] = uniqueContributor.totalContributions;
//     }
//   });

//   let topContributorsArray = turnContribObjIntoArrayAndSort(contributors);

//   // let totalCashRaisedCheck = 0;

//   // topContributorsArray.forEach((contributor) => {
//   // 	totalCashRaisedCheck += contributor.totalContributions;
//   // });

//   // console.log(totalRaisedCash, totalCashRaisedCheck);

//   fs.writeFileSync(
//     "./app-output/metaSTATS.json",
//     JSON.stringify({
//       data: topContributorsArray,
//     })
//   );

//   console.log("successfully wrote metaSTATS file to local drive");
// }

// // top 500 contributors... firebase only allows file size < 1mb
// function getTop500Contributors(senatorArray) {
//   // let totalRaisedCash = 0;
//   let allUniqueContributorsArray = [];
//   senatorArray.forEach((senObject) => {
//     let senSTATSdata = JSON.parse(
//       fs.readFileSync(`./app-output/${senObject.fileName}STATS.json`)
//     );
//     let senUniqueContributorsArray = senSTATSdata.uniqueContributors.data;
//     // let senTotalRaised = senSTATSdata.uniqueContributors.totalContributions;
//     // totalRaisedCash += senTotalRaised;
//     senUniqueContributorsArray.forEach((uniqueContributor) => {
//       allUniqueContributorsArray.push(uniqueContributor);
//     });
//   });

//   let contributors = {};

//   allUniqueContributorsArray.forEach((uniqueContributor) => {
//     let contributorName = uniqueContributor.contributor;
//     if (contributorName in contributors) {
//       let prevTotalContrib = contributors[contributorName];
//       let newTotalContrib =
//         prevTotalContrib + uniqueContributor.totalContributions;
//       contributors[contributorName] = newTotalContrib;
//     } else if (!(contributorName in contributors)) {
//       contributors[contributorName] = uniqueContributor.totalContributions;
//     }
//   });

//   let topContributorsArray = turnContribObjIntoArrayAndSort(contributors);
//   // console.log("num unique contributors: ", topContributorsArray.length);

//   let topFiveHundredContribArray = topContributorsArray.slice(0, 500);

//   // let totalCashRaisedCheck = 0;

//   // topContributorsArray.forEach((contributor) => {
//   // 	totalCashRaisedCheck += contributor.totalContributions;
//   // });

//   // console.log(totalRaisedCash, totalCashRaisedCheck);

//   fs.writeFileSync(
//     "./app-output/metaSTATSpartial.json",
//     JSON.stringify({
//       data: topFiveHundredContribArray,
//     })
//   );

//   console.log("successfully wrote metaSTATSpartial file to local drive");
// }

// // getTopContributors(senatorArray);
// // getTop500Contributors(senatorArray);

// // getBuckets(senatorArray);

module.exports = {
  parseContributions,
  // getTopContributors,
};

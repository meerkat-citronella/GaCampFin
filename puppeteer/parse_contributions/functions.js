const fs = require("fs");

module.exports = {
  turnContribObjIntoArrayAndSort(contributorsObj) {
    const contributorsArray = [];

    for (let contributor in contributorsObj) {
      contributorsArray.push({
        contributor: contributor,
        totalContributions: contributorsObj[contributor],
      });
    }

    contributorsArray.sort(
      (a, b) => b.totalContributions - a.totalContributions
    );

    return contributorsArray;
  },

  // get total itemized cash contributions from each report for a given senator's JSON data
  parseContributionsByReport(senJSON) {
    const reportTotals = [];
    for (let report of senJSON.data) {
      const data = report.data;
      const reportName = report.report;
      const url = report.url;
      let totalContributions = 0;
      for (let entry of data) {
        // check for accounting negative, i.e. ($someNumber)
        const cashEntry = entry.cashAmount;
        const inKindEntry = entry.inKindAmount;
        cashAmount = parseFloat(cashEntry.replace(/[$,()]/gi, ""));
        inKindAmount = parseFloat(inKindEntry.replace(/[$,()]/gi, ""));
        if (cashEntry.includes("(")) cashAmount = -cashAmount;
        if (inKindEntry.includes("(")) inKindAmount = -inKindAmount;
        totalContributions += cashAmount + inKindAmount;
      }
      reportTotals.push({
        reportName: reportName,
        totalContributions: totalContributions,
        url: url,
      });
    }
    return reportTotals;
  },

  // get totals for all unique contributors (cashAmount + inKindAmount) and sort
  parseUniqueContributionsAndSortByHighest(senJSON) {
    let contributors = {};

    for (let report of senJSON.data) {
      let data = report.data;
      for (let entry of data) {
        let contributor = /.+/
          .exec(entry.contribName)[0]
          .replace(/[,]/gi, "")
          .replace(/(LLC)/g, "")
          .replace(/(LLP)/g, "")
          .replace(/\b(Inc\.|INC\.|INC\b|Inc\b)/g, "")
          .replace(/^the\b/gi, "")
          .replace(/\b(the|teh)\b/gi, "the")
          .replace(/to/gi, "to")
          .replace(/of/gi, "of")
          .replace(/(\bAssoc\.|\bAssoc\b|\bAssn.|\bAssn\b)/g, "Association")
          .replace(/(Comm\.)/g, "Community")
          .replace(/Political Action Committee/gi, "PAC")
          .replace(/ PAC\b/g, "")
          .replace(/ Pac\b/g, "")
          .replace(/\b(GA|Ga)\b/g, "Georgia")
          .trim()
          .replace(/(  |   )/gi, " ")
          .replace(/(  )/gi, " ")
          .replace(/(  )/gi, " ") // twice cause the 4 spaces get broken down to 2 spaces
          .replace(/\b(hosPAC|HosPAC|HOS|Hos)\b/g, "HOSPAC")
          .replace(/(\bcard\b|\bc.a.r.d.)/gi, "C. A. R. D.")
          .replace(/GTLA/g, "Georgia Trial Lawyers Association")
          .replace(
            /(Civil Justice of the Georgia Trial Lawyers Association|Civil Justice of Georgia Trial Lawyers Association|Civil Justice of the Georgia Trial Lawy|Civil Justice Georgia Trial Lawyers Association|Civil Justic of the Georgia Trial Lawyers Association|Civil Justice of the Trial Lawyers Association|^Civil Justice$)/g,
            "Civil Justice PAC of the Georgia Trial Lawyers Association"
          )
          .trim()
          .toLowerCase();
        const cashEntry = entry.cashAmount;
        const inKindEntry = entry.inKindAmount;
        cashAmount = parseFloat(cashEntry.replace(/[$,()]/gi, ""));
        inKindAmount = parseFloat(inKindEntry.replace(/[$,()]/gi, ""));
        if (cashEntry.includes("(")) cashAmount = -cashAmount;
        if (inKindEntry.includes("(")) inKindAmount = -inKindAmount;

        if (contributor in contributors) {
          const prevTotalContrib = contributors[contributor];
          const newTotalContrib = prevTotalContrib + cashAmount + inKindAmount;
          contributors[contributor] = newTotalContrib;
        } else if (!(contributor in contributors)) {
          contributors[contributor] = cashAmount + inKindAmount;
        }
      }
    }

    const contributorsArray = module.exports.turnContribObjIntoArrayAndSort(
      contributors
    );

    const contributorsArrayCapitalized = contributorsArray.map((contrObj) => {
      const contributor = contrObj.contributor.split("");
      for (let i = 0; i < contributor.length; i++) {
        if (i - 1 < 0) {
          const upperCaseLetter = contributor[i].toUpperCase();
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
        } else if (
          contributor[i - 1] === " " &&
          contributor[i] === "f" &&
          contributor[i + 1] === "o" &&
          contributor[i + 2] === "r" &&
          contributor[i + 3] === " "
        ) {
          continue;
        } else if (contributor[i - 1] === " ") {
          const upperCaseLetter = contributor[i].toUpperCase();
          contributor[i] = upperCaseLetter;
        }
      }

      const contributorStr = contributor.join().replace(/,/gi, "");
      return {
        contributor: contributorStr,
        totalContributions: contrObj.totalContributions,
      };
    });

    return contributorsArrayCapitalized;
  },

  // INTERFACE: senJSON from fs.readFile
  getBuckets(senJSON) {
    const senReports = senJSON.data;

    let bucketOneDollars = 0;
    let bucketOneNumDonations = 0;
    let bucketTwoDollars = 0;
    let bucketTwoNumDonations = 0;
    let bucketThreeDollars = 0;
    let bucketThreeNumDonations = 0;
    let bucketFourDollars = 0;
    let bucketFourNumDonations = 0;
    let bucketFiveDollars = 0;
    let bucketFiveNumDonations = 0;
    let bucketSixDollars = 0;
    let bucketSixNumDonations = 0;
    let totalCash = 0;
    let totalDonations = 0;

    senReports.forEach((report) => {
      const reportEntries = report.data;
      reportEntries.forEach((entry) => {
        const cashEntry = entry.cashAmount;
        const inKindEntry = entry.inKindAmount;
        let cashAmount = parseFloat(cashEntry.replace(/[$,()]/gi, ""));
        let inKindAmount = parseFloat(inKindEntry.replace(/[$,()]/gi, ""));
        if (cashEntry.includes("(")) cashAmount = -cashAmount;
        if (inKindEntry.includes("(")) inKindAmount = -inKindAmount;

        let totalContribAmount = cashAmount + inKindAmount;
        const bucketOneMax = 500;
        const bucketTwoMax = 1000;
        const bucketThreeMax = 1500;
        const bucketFourMax = 2000;
        const bucketFiveMax = 2500;
        if (totalContribAmount < 0) {
          totalCash += totalContribAmount;
          totalDonations -= 1;
          return;
        } else if (totalContribAmount < bucketOneMax) {
          bucketOneDollars += totalContribAmount;
          bucketOneNumDonations += 1;
          totalCash += totalContribAmount;
          totalDonations += 1;
        } else if (totalContribAmount < bucketTwoMax) {
          bucketTwoDollars += totalContribAmount;
          bucketTwoNumDonations += 1;
          totalCash += totalContribAmount;
          totalDonations += 1;
        } else if (totalContribAmount < bucketThreeMax) {
          bucketThreeDollars += totalContribAmount;
          bucketThreeNumDonations += 1;
          totalCash += totalContribAmount;
          totalDonations += 1;
        } else if (totalContribAmount < bucketFourMax) {
          bucketFourDollars += totalContribAmount;
          bucketFourNumDonations += 1;
          totalCash += totalContribAmount;
          totalDonations += 1;
        } else if (totalContribAmount < bucketFiveMax) {
          bucketFiveDollars += totalContribAmount;
          bucketFiveNumDonations += 1;
          totalCash += totalContribAmount;
          totalDonations += 1;
        } else {
          bucketSixDollars += totalContribAmount;
          bucketSixNumDonations += 1;
          totalCash += totalContribAmount;
          totalDonations += 1;
        }
      });
    });

    const bucketOneCashPercentage = Math.round(
      100 * (bucketOneDollars / totalCash)
    );
    const bucketOneNumPercentage = Math.round(
      100 * (bucketOneNumDonations / totalDonations)
    );
    const bucketTwoCashPercentage = Math.round(
      100 * (bucketTwoDollars / totalCash)
    );
    const bucketTwoNumPercentage = Math.round(
      100 * (bucketTwoNumDonations / totalDonations)
    );
    const bucketThreeCashPercentage = Math.round(
      100 * (bucketThreeDollars / totalCash)
    );
    const bucketThreeNumPercentage = Math.round(
      100 * (bucketThreeNumDonations / totalDonations)
    );
    const bucketFourCashPercentage = Math.round(
      100 * (bucketFourDollars / totalCash)
    );
    const bucketFourNumPercentage = Math.round(
      100 * (bucketFourNumDonations / totalDonations)
    );
    const bucketFiveCashPercentage = Math.round(
      100 * (bucketFiveDollars / totalCash)
    );
    const bucketFiveNumPercentage = Math.round(
      100 * (bucketFiveNumDonations / totalDonations)
    );
    const bucketSixCashPercentage = Math.round(
      100 * (bucketSixDollars / totalCash)
    );
    const bucketSixNumPercentage = Math.round(
      100 * (bucketSixNumDonations / totalDonations)
    );

    return {
      bucketOneCashPercentage,
      bucketOneNumPercentage,
      bucketTwoCashPercentage,
      bucketTwoNumPercentage,
      bucketThreeCashPercentage,
      bucketThreeNumPercentage,
      bucketFourCashPercentage,
      bucketFourNumPercentage,
      bucketFiveCashPercentage,
      bucketFiveNumPercentage,
      bucketSixCashPercentage,
      bucketSixNumPercentage,
      totalCash,
      totalDonations,
    };
  },

  // get top contributors across ALL stats files
  getTopContributors(senatorArray) {
    const allUniqueContributorsArray = [];
    senatorArray.forEach((senObject) => {
      const senSTATSdata = JSON.parse(
        fs.readFileSync(
          `${__dirname}/../../json/stats_files/${senObject.fileName}STATS.json`
        )
      );
      const senUniqueContributorsArray = senSTATSdata.uniqueContributors.data;
      senUniqueContributorsArray.forEach((uniqueContributor) => {
        allUniqueContributorsArray.push(uniqueContributor);
      });
    });

    const contributors = {};

    allUniqueContributorsArray.forEach((uniqueContributor) => {
      const contributorName = uniqueContributor.contributor;
      if (contributorName in contributors) {
        const prevTotalContrib = contributors[contributorName];
        const newTotalContrib =
          prevTotalContrib + uniqueContributor.totalContributions;
        contributors[contributorName] = newTotalContrib;
      } else if (!(contributorName in contributors)) {
        contributors[contributorName] = uniqueContributor.totalContributions;
      }
    });

    const topContributorsArray = module.exports.turnContribObjIntoArrayAndSort(
      contributors
    );

    return topContributorsArray;
  },
};

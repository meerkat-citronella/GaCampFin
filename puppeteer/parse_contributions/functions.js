module.exports = {
  turnContribObjIntoArrayAndSort(contributorsObj) {
    let contributorsArray = [];

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

    let contributorsArray = module.exports.turnContribObjIntoArrayAndSort(
      contributors
    );

    let contributorsArrayCapitalized = contributorsArray.map((contrObj) => {
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
        } else if (
          contributor[i - 1] === " " &&
          contributor[i] === "f" &&
          contributor[i + 1] === "o" &&
          contributor[i + 2] === "r" &&
          contributor[i + 3] === " "
        ) {
          continue;
        } else if (contributor[i - 1] === " ") {
          let upperCaseLetter = contributor[i].toUpperCase();
          contributor[i] = upperCaseLetter;
        }
      }

      let contributorStr = contributor.join().replace(/,/gi, "");
      return {
        contributor: contributorStr,
        totalContributions: contrObj.totalContributions,
      };
    });

    return contributorsArrayCapitalized;
  },

  // INTERFACE: senJSON from fs.readFile
  getBuckets(senJSON) {
    let senReports = senJSON.data;

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
      let reportEntries = report.data;
      reportEntries.forEach((entry) => {
        let cashEntry = entry.cashAmount;
        let inKindEntry = entry.inKindAmount;
        let cashAmount = parseFloat(cashEntry.replace(/[$,()]/gi, ""));
        let inKindAmount = parseFloat(inKindEntry.replace(/[$,()]/gi, ""));
        if (cashEntry.includes("(")) cashAmount = -cashAmount;
        if (inKindEntry.includes("(")) inKindAmount = -inKindAmount;

        let totalContribAmount = cashAmount + inKindAmount;
        let bucketOneMax = 500;
        let bucketTwoMax = 1000;
        let bucketThreeMax = 1500;
        let bucketFourMax = 2000;
        let bucketFiveMax = 2500;
        let bucketSixMax;
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

    let bucketOneCashPercentage = Math.round(
      100 * (bucketOneDollars / totalCash)
    );
    let bucketOneNumPercentage = Math.round(
      100 * (bucketOneNumDonations / totalDonations)
    );
    let bucketTwoCashPercentage = Math.round(
      100 * (bucketTwoDollars / totalCash)
    );
    let bucketTwoNumPercentage = Math.round(
      100 * (bucketTwoNumDonations / totalDonations)
    );
    let bucketThreeCashPercentage = Math.round(
      100 * (bucketThreeDollars / totalCash)
    );
    let bucketThreeNumPercentage = Math.round(
      100 * (bucketThreeNumDonations / totalDonations)
    );
    let bucketFourCashPercentage = Math.round(
      100 * (bucketFourDollars / totalCash)
    );
    let bucketFourNumPercentage = Math.round(
      100 * (bucketFourNumDonations / totalDonations)
    );
    let bucketFiveCashPercentage = Math.round(
      100 * (bucketFiveDollars / totalCash)
    );
    let bucketFiveNumPercentage = Math.round(
      100 * (bucketFiveNumDonations / totalDonations)
    );
    let bucketSixCashPercentage = Math.round(
      100 * (bucketSixDollars / totalCash)
    );
    let bucketSixNumPercentage = Math.round(
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
};

module.exports = {
  selectors: {
    url: "https://www.legis.ga.gov/members/senate",
    rows:
      "body > app-root > div > main > app-member-list-page > div.pageContent > app-loader > div > div > div.table-responsive > app-member-list > table > tbody > tr",
    link: "td:nth-child(2) a",
    name: "td:nth-child(2)",
    party: "td:nth-child(3)",
    district: "td:nth-child(4)",
    city: "td:nth-child(5)",
    image:
      "body > app-root > div > main > app-member-page-component > app-loader > div.pageContent > div > div.col-8.offset-2.col-md-3.offset-md-0 > div > img",
  },
  nameSubs: {
    randy: "randall",
    mike: "michael",
    bill: "william",
    steve: "stephen",
    chuck: "charles",
    marty: "maurice",
    ben: "benjamin",
  },
  specificSenSubs: {
    // for specific sens that aren't handled above
    "martin p.": "martin peter",
    "miller butch": "miller cecil",
    "strickland brian": "strickland robert",
    "jones burt": "jones william",
  },
};

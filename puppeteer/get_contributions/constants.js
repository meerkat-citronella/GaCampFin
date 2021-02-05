module.exports = {
  SELECTORS: {
    mainPageUrl:
      "http://media.ethics.ga.gov/search/Campaign/Campaign_ByName.aspx",
    firstNameInput: "#ctl00_ContentPlaceHolder1_txtFirst",
    lastNameInput: "#ctl00_ContentPlaceHolder1_txtLast",
    noSearchResults: "#ctl00_ContentPlaceHolder1_lblMessage",
    viewButtons: "#ctl00_ContentPlaceHolder1_Search_List > tbody > tr > td > a",
    gridItems: "#ctl00_ContentPlaceHolder1_NameInfo1_dlDOIs tbody .lblentry",
    candidateName: "#ctl00_ContentPlaceHolder1_NameInfo1_lblName",
    campaignRepsDrpdwnButton:
      "#ctl00_ContentPlaceHolder1_Name_Reports1_TabContainer1_TabPanel1_Panel8",
    viewReportButtons:
      "#ctl00_ContentPlaceHolder1_Name_Reports1_TabContainer1_TabPanel1_dgReports .gridviewrow td a, #ctl00_ContentPlaceHolder1_Name_Reports1_TabContainer1_TabPanel1_dgReports .gridviewalterrow td a",
    reportYear:
      "#ctl00_ContentPlaceHolder1_Name_Reports1_dgReports > tbody:nth-child(1) > tr:nth-child(2) > td:nth-child(2)",
    reportType:
      "#ctl00_ContentPlaceHolder1_Name_Reports1_dgReports > tbody:nth-child(1) > tr:nth-child(2) > td:nth-child(3)",
    reportReport: "td.lblentry:nth-child(4)",
    viewContributionsButton:
      "#ctl00_ContentPlaceHolder1_Name_Reports1_dgReports_ctl02_ViewCont",
    noContributions: "#ctl00_ContentPlaceHolder1_Messagelabel",
    contributionRow:
      "#ctl00_ContentPlaceHolder1_Campaign_ByContributions_RFResults2_dgContSummary tbody tr.gridviewrow, #ctl00_ContentPlaceHolder1_Campaign_ByContributions_RFResults2_dgContSummary tbody tr.gridviewalterrow",
  },
};

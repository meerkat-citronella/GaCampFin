# Georgia State Senate Accountability Project

Backend for [GA State Senate Accountability Project](https://gasenateaccountability.org/), an open source project that aggregates all campaign donations to sitting GA state senators, displays top donors and and a breakdown of donation amount by dollar donation value. The aim of this project is to inform the electorate as to who their elected representative is most indebted to.

This is a node.js web scraper app that crawls the [Georgia Government Transparency and Campaign Finance Commission](http://media.ethics.ga.gov/search/Campaign/Campaign_ByName.aspx) website. It crawls the [Georgia State Senator](https://www.legis.ga.gov/members/senate) site for a current list of GA state senators, then crawls the state ethics site using headless Chrome (and its API, Puppeteer) and records each individual contribution they received and writes it to a JSON file, along with some associated stats. It then pushes this data to a Firebase Firestore.

## Available Scripts

Run

### `node app.js`

to run the app.

Note that in `app.js` there are commented out `const senArray`s that can be used when testing/debugging, to break down app execution into stages.

## Setup

If you want to run the app yourself, you will need to create a project in Firebase and create your credentials. The app can still run without as it saves data locally before pushing to firebase.

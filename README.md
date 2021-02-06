This is a node.js web scraper app that crawls the [Georgia Government Transparency and Campaign Finance Commission](http://media.ethics.ga.gov/search/Campaign/Campaign_ByName.aspx) website. It crawls the [Georgia State Senator](https://www.legis.ga.gov/members/senate) site for a current list of GA state senators, then crawls the state ethics site using headless Chrome (and its API, Puppeteer) and records each individual contribution they received and writes it to a JSON file, along with some associated stats. It then pushes this data to a Firebase Firestore.

## Available Scripts

Run

### `node app.js`

to run the app.

Note that in `app.js` there are commented out `const senArray`s that can be used when testing/debugging, to break down app execution into stages.

## Setup

If you want to run the app yourself, you will need to create a project in Firebase, create a new Service Account key, and then require it in as the serviceAccount variable in firebase.js. The app will still run without the proper Firebase configuration, but it will just save the data locally and simply throw an error when trying to write to Firestore.

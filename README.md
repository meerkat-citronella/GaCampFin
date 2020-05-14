This is a node.js web scraper app that crawls the Georgia Government Transparency and Campaign Finance Commission website (http://media.ethics.ga.gov/search/Campaign/Campaign_ByName.aspx). It crawls the Georgia State Senator site (http://www.senate.ga.gov/senators/en-US/SenateMembersList.aspx) for a current list of GA state senators, then crawls the state ethics site using headless Chrome (and its API, Puppeteer) and records each individual contribution they received and writes it to a JSON file, along with some associated stats. It then pushes this data to a Firebase Firestore.

This repo does not include dependencies (./node_modules). Dependencies can be installed with 'npm install'.

Run 'node app.js' to run the app. App will do the following:

- crawl the GA State Senate site and get list of current senators and photos
- parse the response and create an array of senator names
- for each senator name:
  - crawl the state ethics page and record all their contributions for their entire state senate career
  - write the results to ./app-output in a .json file
  - process some relevant stats, and write them to ./app-output in a STATS.json file
  - write the content of STATS.json file to Firebase Firestore.

If you want to run the app yourself, you will need to create a project in Firebase, create a new Service Account key, and then require it in as the serviceAccount variable in firebase.js. The app will still run without the proper Firebase configuration, but it will just save the data locally (to ./app-output) and simply throw an error when trying to write to Firestore. Note that both of the directories ./credentials and ./app-output are being .gitignored, so you will have to create them in the root directory prior to running the app yourself.

getSenNamesAndPhotos.js is saving senator photos to another folder, called GaCampFinClient/pics. Create this folder or change the filepath to fix.

app.js is meant to be run in two stages. Comment out the second stage, run the first, then reverse. Doing otherwise will throw a syntaxtError.

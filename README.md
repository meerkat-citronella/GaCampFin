This is a node.js web scraper app that crawls the Georgia Government Transparency and Campaign Finance Commission website (http://media.ethics.ga.gov/search/Campaign/Campaign_ByName.aspx). It queries the wikimedia API for a current list of GA state senators, then individually crawls the state ethics site and records each individual contribution they received and writes it to a JSON file, along with some associated stats.

Note that the repo does not include the dependencies (node_modules). Dependencies can be installed with 'npm install'.

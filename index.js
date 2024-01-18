const { scrapeLogic } = require("./scrape");
const express = require("express");
const app = express();

const PORT = process.env.PORT || 4000;

app.get("/", (req, res) => {
	res.send("Hello World!");
});

app.get("/nba", (req, res) => {
	scrapeLogic(res, "nba");
});

app.get("/nfl", (req, res) => {
	scrapeLogic(res, "nfl");
});

app.listen(PORT, () => {
	console.log(`Listening on port ${PORT}`);
});

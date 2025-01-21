require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));

app.use("/public", express.static(`${process.cwd()}/public`));

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

// Your first API endpoint
app.get("/api/hello", function (req, res) {
  res.json({ greeting: "hello API" });
});

let urlDatabase = [];
let urlDatabaseIndex = 0;
app.post("/api/shorturl", function (req, res) {
  let originalUrl = req.body.url;
  originalUrl = ensureFullUrl(originalUrl);

  if (!isValidUrl(originalUrl)) {
    return res.status(400).json({ error: "Invalid URL" });
  }
  console.log(originalUrl);
  let shortUrl = urlDatabaseIndex;
  urlDatabase.push({ originalUrl, shortUrl });
  urlDatabaseIndex++;
  console.log(urlDatabase);
  console.log(typeof urlDatabase.toString());
  res.json({ originalUrl, shortUrl });
});

app.get("/api/shorturl/:shortUrl", function (req, res) {
  let shortUrl = req.params.shortUrl;
  let urlObject = urlDatabase.find((url) => url.shortUrl == shortUrl);
  let originalUrl = urlObject ? urlObject.originalUrl : null;

  console.log("shortUrl= " + shortUrl);
  console.log("urlOb= " + urlObject);
  console.log("originalUrl= " + originalUrl);

  if (originalUrl) {
    res.redirect(originalUrl);
    console.log("Redirecting to " + originalUrl);
  } else {
    res.status(404).json({ error: "No URL found for the given shortUrl" });
  }
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});

function ensureFullUrl(url) {
  if (!/^https?:\/\//i.test(url)) {
    return "http://" + url;
  }
  return url;
}

function isValidUrl(url) {
  const urlPattern = new RegExp(
    "^(https?:\\/\\/)?" + // protocolo
      "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|" + // dominio
      "((\\d{1,3}\\.){3}\\d{1,3}))" + // dirección IP (v4)
      "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // puerto y ruta
      "(\\?[;&a-z\\d%_.~+=-]*)?" + // cadena de consulta
      "(\\#[-a-z\\d_]*)?$",
    "i"
  ); // fragmento
  return !!urlPattern.test(url);
}

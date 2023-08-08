//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
mongoose.connect("mongodb://127.0.0.1:27017/todolistDB");

// async function main() {
const itemsSchema = {
  name: String,
};
const Item = mongoose.model("Item ", itemsSchema);
const item1 = new Item({
  name: "welcome",
});
const item2 = new Item({
  name: "how are you",
});
const item3 = new Item({
  name: "<- you can check/uncheck this",
});
const defaultItems = [item1, item2, item3];

const workItems = [];

app.get("/", function (req, res) {
  run();
  async function run() {
    let foundItem = await Item.find({});
    if (foundItem.length === 0) {
      Item.insertMany(defaultItems).then(() => {
        console.log("data inserted");
      });
      res.redirect("/");
    }
    console.log(foundItem);
    res.render("list", { listTitle: "Today", newListItems: foundItem });
  }
});

app.post("/", function (req, res) {
  const itemName = req.body.newItem;
  const item = new Item({
    name: itemName,
  });
  item.save();
  res.redirect("/");
});

app.get("/work", function (req, res) {
  res.render("list", { listTitle: "Work List", newListItems: workItems });
});

app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});

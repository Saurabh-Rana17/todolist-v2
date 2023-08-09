//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
var _ = require("lodash");

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
mongoose.connect(
  "mongodb+srv://saurabhrana200317:PdmMzUEaRO3xu5e2@cluster0.eox6mh0.mongodb.net/todolistDB"
);

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

const listSchema = {
  name: String,
  items: [itemsSchema],
};
const List = mongoose.model("List", listSchema);

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
  const listName = req.body.list;
  const item = new Item({
    name: itemName,
  });
  run();
  async function run() {
    if (listName === "Today") {
      item.save();
      res.redirect("/");
    } else {
      await List.findOne({ name: listName }).then((foundList) => {
        foundList.items.push(item);
        foundList.save();
        res.redirect("/" + listName);
      });
    }
  }
});

app.post("/delete", (req, res) => {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    Item.deleteOne({ _id: checkedItemId }).then(() => {
      console.log("item deleted");
    });
    res.redirect("/");
  } else {
    List.findOneAndUpdate(
      { name: listName },
      { $pull: { items: { _id: checkedItemId } } }
    ).then((val) => {
      console.log("deleted item form custom list");
    });
    res.redirect("/" + listName);
  }
});

app.get("/:cutomListName", (req, res) => {
  const customListName = _.capitalize(req.params.cutomListName);
  // const customListName = req.params.cutomListName;

  run();
  async function run() {
    await List.findOne({ name: customListName }).then((foundList) => {
      if (!foundList) {
        const list = new List({
          name: customListName,
          items: defaultItems,
        });
        list.save();
        res.redirect("/" + customListName);
      } else {
        res.render("list", {
          listTitle: foundList.name,
          newListItems: foundList.items,
        });
      }
    });
  }
});

app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});

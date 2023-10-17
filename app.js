//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const date = require(__dirname + "/date.js");

const app = express();
const port = 3000;

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

// mongoose.connect("mongodb://127.0.0.1:27017/todolistDB", {useNewUrlParser: true});
mongoose.connect("mongodb+srv://techvisionskc:hGshXudYYY7kkL4G@cluster0.pkdui5y.mongodb.net/todolistDB");

app.get("/", function(req, res) {

  // const day = date.getDate();
  //find all item
    Item.find({})   
    //    pass foundItems to use inside this loop
    .then((foundItems) => {
      //       to list.ejs,                             self declare const
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    })
    .catch((err) => {
      console.log(err);
    });

});
//declare item schema
const itemsSchema = new mongoose.Schema({
  name: String
});
//declare item model
const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Welcome to your todolist!"
});

const item2 = new Item({
  name: "Hit the + button to add a new item."
});

const item3 = new Item({
  name: "<-- Hit this to delete an item."
});

const defaultItems = [item1, item2, item3];
// declare list schema
const listSchema = {
  name: String,
  items: [itemsSchema]
};
//declare list model
const List = mongoose.model("List", listSchema);

// Item.insertMany(defaulItems)
//        not passing any function, just show log
//   .then(() => {
//     console.log("Successfully save all the items.");
//   })
//   .catch((err) => {
//     console.log(err);
//   });

app.post("/", function(req, res) {
  const itemName = req.body.newItem;
  //                        .list is the input from ejs, name="list"
  const listName = req.body.list;
  
  const item = new Item({
    name: itemName
  });

  if (listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    //find listName in List model
    List.findOne({ name: listName })
    //then passing value as foundList
    .then(function(foundList) {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    })
    .catch((err) => {
      console.error(err);
    });
  }
});

app.post("/delete", function(req, res){
  const checkedItemId = req.body.checkbox;
  //                        .listName is the input from ejs, name="listName"
  const listName = req.body.listName;

  if(listName === "Today") {
    //try to check value in checkedItemId
    Item.findByIdAndRemove(checkedItemId)
    .then(() => {
      console.log("Successfully deleted checked item.");
      res.redirect("/");
    })
    .catch((err) => {
      console.log(err);
    });
  } else {
    List.findOneAndUpdate({name: listName})
    .then(foundList => {
      //search for items.pull method usage
      foundList.items.pull({_id: checkedItemId});
      foundList.save();
      res.redirect("/" + listName);

    })
    .catch((err) => {
      console.error(err);
    });
  }

  
})

// app.post("/", function(req, res){

//   const item = req.body.newItem;

//   if (req.body.list === "Work") {
//     workItems.push(item);
//     res.redirect("/work");
//   } else {
//     items.push(item);
//     res.redirect("/");
//   }
// });

// app.get("/work", function(req,res){
//   res.render("list", {listTitle: "Work List", newListItems: workItems});
// });
app.get("/:customListName", function(req, res){
  const customListName = req.params.customListName;
  //find customListName in List model
  List.findOne({ name: customListName })
      // pass in foundList(self declare variable)
    .then(function(foundList) {
      if (!foundList) {
        // Create a new list
        const list = new List({
          name: customListName,
          items: defaultItems,
        });
 
        return list.save();
        res.redirect("/"+ customListName)
        
      } else {
        // Show an existing List
        res.render("list", { listTitle: foundList.name, newListItems: foundList.items });
      }
    })
    .then(function(savedList) {
      if (savedList) {
        // If a new list was created and saved, now render it
        res.render("list", { listTitle: savedList.name, newListItems: savedList.items });
      }
    })
    .catch(function(err) {
      console.log(err);
    });
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(port, () => {
  console.log("Server started on port 3000");
});

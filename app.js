const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
var _ = require('lodash');

// database connection
mongoose.connect("mongodb+srv://ibrahim:ibrahim123@cluster0.n66dv.mongodb.net/todoDB");
// todo list schema
const itemsSchema = new mongoose.Schema({
    name: String
})
const workItemsSchema = new mongoose.Schema({
    name: String
})

// collections creation
const Item = mongoose.model("item", itemsSchema)

const item1 = new Item({name: "Welcome to your Todo list!"})
const item2 = new Item({name: "Hit the + button to add new items"})
const item3 = new Item({name: "<== Hit this to delete an item"})

const defaultItems = [item1, item2, item3]

const listSchema = new mongoose.Schema({
    name: String,
    items: [itemsSchema]
})
const List = mongoose.model("list", listSchema)

var app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'));

app.get("/", function (req, res) {


    Item.find({}, function (err, items) {
        if (err) {
            console.log(err)
        } else {

            if (items.length === 0) {
                Item.insertMany(defaultItems, function (err) {
                    if (err) {
                        console.log(err)
                    } else {
                        console.log("Successfully saved default items to DB.")
                    }
                })
                res.redirect('/')
            } else {
                res.render('index', {
                    listTitle: "Today",
                    items: items,
                })
            }
            
        }
    })
    
});

app.post('/', function (req, res) {

    const listName = req.body.list
    const item = req.body.newItem;
    const newItem = new Item({name: item});
    if (listName === "Today") {
        newItem.save();
        res.redirect('/');
    } else {
        
        List.findOne({name: listName}, function(err, list) {
            if (err) {
                console.log(err)
            } else {
                list.items.push(newItem)
                list.save();
            }
        })
        res.redirect("/" + listName)
    }


    
    
});


app.get('/:list', function (req, res) {

    const listName = _.capitalize(req.params.list);
    if (listName === 'Favicon.ico') {

        res.redirect('/')
        
    } else {

        List.findOne({name: listName}, function (err, list) {
            if (!err) {
                if (!list) {
                    const list = new List({
                        name: listName,
                        items: defaultItems
                    })
                    list.save()
                    res.redirect("/" + listName)

                } else {
                    res.render('index', {
                        listTitle: list.name,
                        items: list.items
                    })
                }
            }
        })
    }

    
    
});


app.post("/delete/:listName", function (req, res) {
    const itemId = req.body.checkbox
    const listName = req.params.listName
    if (listName === "Today") {
        
        Item.deleteOne({_id: itemId}, function(err) {
            if (err) {
                console.log(err)
            } else {
                console.log("successfully deleted checked item from DB.")
            }   
        })
        res.redirect('/')
    } else {

        List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: itemId}}}, function (err, result) {
            if(!err) {
                console.log("successfully deleted checked item from DB.")
            }
        })
        res.redirect("/" + listName)
    }
})


let port = process.env.PORT;
if(port == null || port == "") {
    port = 3000;
}

app.listen(port, function () {
    console.log("Server has started successfully.");
});

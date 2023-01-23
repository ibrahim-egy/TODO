const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
var _ = require('lodash');
require('dotenv').config()


const date = new Date();

const today = `${date.getDate()}-${date.getMonth()+1}-${date.getFullYear()}`


// database connection
mongoose.connect(process.env.mongoUrl);
// todo list schema
const itemsSchema = new mongoose.Schema({
    name: String
})
// collections creation
const Item = mongoose.model("item", itemsSchema)

const item1 = new Item({name: "Welcome to your Todo list!"})
const item2 = new Item({name: "Hit the + button to add new items"})
const item3 = new Item({name: "<== Hit this to delete an item"})

const defaultItems = [item1, item2, item3]


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
                    listTitle: today,
                    items: items,
                })
            }
            
        }
    })
    
});

app.post('/', function (req, res) {

    const item = req.body.newItem;
    const newItem = new Item({name: item});
    
    newItem.save();
    console.log("Successfully added new item to items collection🌚");

    res.redirect('/')

});

app.post("/delete", function (req, res) {
    const itemId = req.body.id
        
    Item.deleteOne({_id: itemId}, function(err) {
        if (err) {
            console.log(err)
        } else {
            console.log("successfully deleted checked item from DB.")
        }   
    })
    res.redirect('/')
})


let port = process.env.PORT;
if(port == null || port == "") {
    port = 3000;
}

app.listen(3000, function () {
    console.log("Server has started successfully.");
});

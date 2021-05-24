const express = require('express');
const ejs = require('ejs');
const PORT = 3000;
const bodyParser = require('body-parser');
const couchbase = require("couchbase");
const User = require('./models/Users');
const Uuid = require("uuid");
const  response  = require('express');

var cluster = new couchbase.Cluster("couchbase://localhost",{
    username: 'Administrator',
    password: 'Password'
});


var bucket = cluster.bucket("register");
const collection = bucket.defaultCollection();
const app = express();

app.use(bodyParser.json());
app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}))

app.get("/", (req, res) => {
    res.render("index");
});

app.get("/register", (req, res) => {
    console.log("");
    res.render("register");

});

app.get("/login", (req, res) => {
    res.render("login");
});

//Ports request

app.post('/register', async (req, res) =>{
    try {
        const email = req.body.email;
    const password = req.body.password;
    let id = Uuid.v4();
    let user = {
        email: email,
        password: password
    }

    let result = await collection.upsert(id, user);
    // console.log("Users upserted", result);
    res.send({
      status: 200,
      msg: "User signed-up successfully",
      result,
    });
    } catch(error) {
        console.log("error", error);
    }
    
});

app.post('/login', (req, res) =>{
    const email = req.body.email;
    const password = req.body.password;

    User.findOne({email: email}, (err, foundResults) =>{
        if(err) {
            console.log(err);
        } else {
            if(foundResults.password == password){
                res.send('You Logged In! welcome to groundhogApps');
            }else {
                res.send('Incorrect Email or password Please try again');
            }
        }
    });


});


app.listen(PORT, () => console.log('Server Started On Port 3000'));
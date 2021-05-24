const express = require("express");
const ejs = require("ejs");
const PORT = 3000;
const bodyParser = require("body-parser");
const couchbase = require("couchbase");
const User = require("./models/Users");
const Uuid = require("uuid");
const response = require("express");

var cluster = new couchbase.Cluster("couchbase://127.0.0.1", {
  username: "Administrator",
  password: "Password",
});

var bucket = cluster.bucket("register");
const collection = bucket.defaultCollection();
const app = express();

app.use(bodyParser.json());
app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));

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

app.post("/register", async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    let id = Uuid.v4();
    let user = {
      email: email,
      password: password,
    };

    let result = await collection.upsert(id, user);
    // console.log("Users upserted", result);
    res.send({
      status: 200,
      msg: "User signed-up successfully",
      result,
    });
  } catch (error) {
    console.log("error", error);
  }
});

app.post("/login", async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  let userFindQuery = `SELECT * FROM \`register\` WHERE email == \'${req.body.email}\'`;
  console.log(userFindQuery);
  let userFindResult = await cluster.query(userFindQuery);

  console.log(userFindResult.rows[0]);
  if (userFindResult && userFindResult.rows && userFindResult.rows.length) {
    if (userFindResult.rows[0].register.password == password) {
      res.send({
        status: 200,
        msg: "User Login successfully",
      });
    } else {
      res.send({
        status: 400,
        msg: "User login failed",
      });
    }
  } else {
    res.send({
      status: 400,
      msg: "User login failed",
    });
  }
});

app.listen(PORT, () => console.log("Server Started On Port 3000"));

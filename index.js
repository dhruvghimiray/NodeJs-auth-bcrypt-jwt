const express = require("express");
const app = express();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const userModel = require("./models/user");

const cookieParser = require("cookie-parser");
const path = require("path");

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.render("index");
});

app.post("/create", async (req, res) => {
  const { age, name, email, username, password } = req.body;

  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(password, salt, async (err, hash) => {
      console.log(hash);
      const data = await userModel.create({
        name,
        username,
        age,
        email,
        password: hash,
      });

      let token = jwt.sign(email, "SecretKey");
      res.cookie("token", token);

      res.send(data);
    });
  });
});

app.get("/logout", (req, res) => {
  res.cookie("token", "");
  res.redirect("/");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await userModel.findOne({ email: email });
  if (!user) {
    res.send("Something went wrong 1");
  } else {
    bcrypt.compare(password, user.password, (err, result) => {
      if (result) {
        console.log("Logged in Successfully");
        // jwt
        let token = jwt.sign(email, "SecretKey");
        res.cookie("token", token);
        res.send("Logged in Successfully");
      } else {
        console.log("Somethign went wrong 2");
        res.send("Invalid Password or Username");
      }
    });
  }

  console.log(user);
});

app.listen(3000);

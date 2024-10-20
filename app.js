// **********App Information**********

// - create user
//    - signup/register
//    - login
//    - logout

//---------------------------------------------------------------------------------------------------------------------

// **********Installation**********

// - express ==> npm i express
// - mongoose ==> npm i mongoose
// - bcrypt ==> npm i bcrypt
// - cookie-parser ==> npm i cookie-parser
// - JWT ==> npm i jsonwebtoken
// - ejs ==> npm i ejs
// - run the app ==> npx nodemon app.js

//---------------------------------------------------------------------------------------------------------------------

// **********Requirements**********

const express = require("express");
const app = express();
const userModel = require("./models/user");
const path = require("path");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

//---------------------------------------------------------------------------------------------------------------------

// **********App Setup(sum predifined middleware)**********

app.set("view engine" , "ejs");
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname,"public")));
app.use(cookieParser());

//---------------------------------------------------------------------------------------------------------------------

// **********Routes**********

//Home route
app.get("/",function(req,res){
    res.render("index");
});

//Multer route
app.get("/tezst",function(req,res){
    res.render("index");
});

//register route
app.post("/register",async function(req,res){
    let user = await userModel.findOne({email: req.body.email}); //return true or false

    if(user){
        return res.status(500).send("User already registered...");
    }else{
        bcrypt.genSalt(10,function(err,salt){
            //console.log(salt); //cheack salt is created or not
            bcrypt.hash(req.body.password,salt,async function(err,hash){
                //console.log(hash); //cheack hash is created or not
                let user = await userModel.create({
                    name : req.body.name,
                    username : req.body.username,
                    email : req.body.email,
                    password : hash
                });

                //create jwt token
                let token = jwt.sign({email:req.body.email,userid: user._id},"niranjansd");
                res.cookie("token",token);
                //res.send("registered...");
                res.redirect("/login");
            });
        });
    }
});

//login route
app.get("/login",function(req,res){
    res.render("login");
});

//profile route
app.get("/profile",isLoggedIn,async function(req,res){
    //console.log(req.user); // data come from isLoggedIn middleware and print on console
    let user = await userModel.findOne({email: req.user.email});
    //console.log(user);
    
    res.render("profile",{user}); // render to login page
});

//login post
app.post("/login",async function(req,res){
    let user = await userModel.findOne({email: req.body.email}); //return true or false

    if(!user){
        return res.status(500).send("Something Went Wrong...");
    }else{
        bcrypt.compare(req.body.password,user.password,function(err,result){
            if(result){
                let token = jwt.sign({email:req.body.email,userid: user._id},"niranjansd");
                res.cookie("token",token);
                // res.status(200).send("You can Login...");
                res.status(200).redirect("/profile");
            }else{
                res.redirect("/login");
            }
        });
    }
});

//logout route
app.get("/logout",function(req,res){
    res.cookie("token",""); //remove cookie
    res.redirect("/login");
});

//middleware for protected routes for session
function isLoggedIn(req,res,next){
    if(req.cookies.token === ""){ //cheack token is empty or not
        //return res.send("You must be loged in"); // if token is empty
        return res.redirect("/login");
    }else{
        let data = jwt.verify(req.cookies.token,"niranjansd"); //fetch user data
        req.user = data; //data send to isLoggedIn middleware in the form of req
        next();
    }
    
}

//---------------------------------------------------------------------------------------------------------------------

// **********Server**********

app.listen(3000,function(req,res){
    console.log("Server Started...");
});

//---------------------------------------------------------------------------------------------------------------------
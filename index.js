import express, { Router } from "express";
import ejs from "ejs";
import path from "path";
import cookieParser from "cookie-parser";
import exp from "constants";
import Users from "./features.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const app = express()
const users = []

app.use(express.static(path.join(path.resolve(),"public"))); 
// using the below middleware we can access the data of form
app.use(express.urlencoded({extended:true})) 
app.use(cookieParser())
app.use(express.json())

app.set("view engine", "ejs");

const isAuthenticated = async(req,res,next) =>{
    const {token} = req.cookies;
    if(token){
        const decoded = jwt.verify(token, "secretkey");
        req.user = await Users.findById(decoded._id);

        next();
        // res.render("logout")
    }
    else{
        res.render("login")
    }
}

app.get("/",isAuthenticated,(req,res)=>{
    res.render("logout" ,  {name : req.user.name})
    // res.render("login",{name:"omkar"});
    // res.sendFile("index");
})

app.get("/logout",(req,res)=>{
    res.cookie("token", null,{
        expires: new Date(Date.now())
    })
    // res.render("logout")
    res.redirect("/")
})

app.get("/register",(req,res)=>{
    res.render("register");
})

app.get("/login",(req,res)=>{
    res.render("login");
})

app.post("/login",async(req,res)=>{
    const {email,password} = req.body;
    let user = await Users.findOne({email});
    if (!user){
        return res.redirect("/register")
    }
    
    const isMatch = await bcrypt.compare(String(password),String(user.password))
 
    if (!isMatch){
       return  res.render("login",{email,message:"Incorrect Password"})
    }

    const token = jwt.sign({_id : user._id}, "secretkey");

    res.cookie("token",token,{
        httpOnly: true, expires:new Date(Date.now()+60*1000),
    })

    res.redirect("/")

})
app.post("/register", async(req,res)=>{
    const {name,email,password} = req.body;
    let user = await Users.findOne({email});
    
    if (user){
        return res.redirect("/login");
    }
    
    const hashedPassword = await bcrypt.hash(password,10);

     user = await Users.create({
        name, 
        email,
        password:hashedPassword,
    });
    const token = jwt.sign({_id : user._id}, "secretkey");
    res.cookie("token",token,{
        httpOnly: true, expires:new Date(Date.now()+60*1000),
    })

    res.redirect("/")
})





app.listen(5000,(req,res)=>{
    console.log("server is listening at port 5000");
})
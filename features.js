import mongoose, { mongo }  from "mongoose";

mongoose.connect("mongodb://127.0.0.1:27017/User").then(()=>{
    console.log("connected to database")
}).catch((err)=>{
    console.log(err)
})

const userSchema = mongoose.Schema({
    name:String,
    email:String,
    password:String,
});

const Users = mongoose.model("Users",userSchema)

export default Users;

const express = require('express')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const path = require('path')
const multer  = require('multer')
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      return cb(null,path.join(__dirname,"..",'uploads'))
    },
    filename: function (req, file, cb) {
    //   const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
      return cb(null, file.originalname)
    }
  })
  
  const upload = multer({ storage: storage })

const pat_records = require("../models/patients/patient_login")
const router = express.Router();

const hashPassword = async (myPlaintextPassword) => {
    try {
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(myPlaintextPassword, salt);
        // Store hash in your password DB.
        return hash;
    } catch (err) {
        console.error("Error hashing password:", err);
        throw err;
    }
};

const loginAcc = async (req, res) => {
    console.log("hi")
    console.log(req.body);
    const { email, password } = req.body || {}; // Ensure req.body.data is defined

    if (!email || !password) {
        return res.status(400).end("Email and password are required");
    }

    try {
        const user = await pat_records.findOne({ email });
        console.log(user);

        if (!user) {
            return res.status(404).end("User not found");
        }

        const result = await bcrypt.compare(password, user.password);
        console.log(result);
        if (result) {
            let token = jwt.sign({ email }, "qwerty");
            console.log(token);
            res.cookie("token", token); // Secure cookie
            res.status(200).end("login successful");
        } else {
            res.status(401).end("Invalid Password");
        }

        console.log(result ? "login successful" : "invalid password");
    } catch (err) {
        console.error(err);
        res.status(500).end("Error occurred");
    }
};

router.route("/login").post(loginAcc)

router.route("/signup").post(async(req,res)=>{
    const {email,password} = req.body;
    try{
        const count = await pat_records.find({email}).countDocuments();
        if(count!==0){
            return res.status(409).json({
                message:"account already exists"
            })
        }
        const pass = await hashPassword(password);
        const data = await pat_records.create({email,password:pass});
        console.log(data)
        return res.json(data)
    }catch(err){
        console.log(err)
        return res.status(500).json({
            message:"error occured while creating account"
        });
    }
})

router.route("/logout").get((req,res)=>{
    console.log(req.cookies)
    res.clearCookie('token')
    return res.json({
        message:"Logged out successfully"
    })
})


router.route("/feedback").post(async (req, res) => {
    const { email, feedback } = req.body;
    console.log(feedback)
    try {
        const data = await pat_records.findOne({email});
        console.log(data)
        console.log(data._id)
        const obj = await pat_records.updateOne({email});
        const index = Object.keys(obj)?.findIndex((key)=>key !== "feedback")
        if(index === -1){
            console.log("if")
            await pat_records.updateOne({email},{$set:{feedback:[{...feedback,rating:Number(feedback.rating)}]}})
        }else{
            console.log("else")
            await pat_records.updateOne({email},{$push:{feedback:{...feedback,rating:Number(feedback.rating)}}})
        }
        res.status(200).json({ message: "Feedback added successfully!" });
    } catch (error) {
        res.status(500).json({ message: "Error updating feedback: " + error });
    }
});


router.route("/uploadfile").get((req,res)=>{
    res.render("index")
})

router.route("/api/uploadfile").post(upload.single("profile"),(req,res)=>{
    console.log(req.file)
    res.json(req.file)
})

module.exports = router;
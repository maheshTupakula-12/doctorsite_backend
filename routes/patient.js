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
    const { email, password } = req.body || {}; // Ensure req.body.data is defined

    if (!email || !password) {
        return res.status(400).end("Email and password are required");
    }

    try {
        const user = await pat_records.findOne({ email });
        if (!user) {
            return res.status(404).end("User not found");
        }

        const result = await bcrypt.compare(password, user.password);
        if (result) {
            let token = jwt.sign({ email }, "qwerty");
            console.log(token);
            res.cookie("token", token); // Secure cookie
            res.status(200).end("login successful");
        } else {
            res.status(401).end("Invalid Password");
        }
    } catch (err) {
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
        return res.json(data)
    }catch(err){
        return res.status(500).json({
            message:"error occured while creating account",
            msg:err.message
        });
    }
})

router.route("/logout").get((req,res)=>{
    res.clearCookie('token')
    return res.json({
        message:"Logged out successfully"
    })
})


router.route("/feedback").post(async (req, res) => {
    const { email, feedback } = req.body;
    try {
        const insertData = {...feedback,rating:Number(feedback.rating)}
        await pat_records.updateOne({email:email},{$push:{feedback:{...insertData}}})
        return res.status(200).json({ message: "Feedback added successfully!" });
    } catch (error) {
        return res.status(500).json({ message: "Error updating feedback: " + error });
    }
});


router.route("/uploadfile").get((req,res)=>{
    res.render("index")
})

router.route("/api/uploadfile").post(upload.single("profile"),(req,res)=>{
    res.json(req.file)
})

module.exports = router;
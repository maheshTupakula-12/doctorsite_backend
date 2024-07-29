const info2 = require('../models/doctors/doctors_info')
const bcrypt = require('bcrypt')



const jwt = require('jsonwebtoken')

const removePassword = (obj) => {
    const { password, ...rest } = obj; // Destructure the object, excluding the password field
    return rest; // Return the rest of the object without the password
};

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


const createAcc = async(req,res)=>{
    console.log("create function called")
    console.log(req.body)
    const data = req.body["signupData"]
    try{
        const count = await info2.find({email:data.email}).countDocuments();
        if(count !== 0){
            return res.status(411).json({
                message:"already available"
            })
        }
        const pass = await hashPassword(data.password);
        const message = await info2.create({...data,password:pass});
        console.log(message)
        return res.json({info:"account created successfully",message})
    }catch{
        return res.status(500).json({
            message:"error while insertion"
        })
    }
}

const uploadImage = async(req,res)=>{
    console.log(req.file)
    res.end({
        msg:"hello"
    })
   
}

const loginAcc = async (req, res) => {
    console.log(req.body);
    const { email, password } = req.body.data || {}; // Ensure req.body.data is defined

    if (!email || !password) {
        return res.status(400).end("Email and password are required");
    }

    try {
        const user = await info2.findOne({ email });
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
            res.status(200).json({
                id:user.id
            });
        } else {
            res.status(401).end("Invalid Password");
        }

        console.log(result ? "login successful" : "invalid password");
    } catch (err) {
        console.error(err);
        res.status(500).end("Error occurred");
    }
};


module.exports = {loginAcc,createAcc,uploadImage}
const info2 = require('../models/doctors/doctors_info')
const info3 = require("../models/services/services")
const {generateListOfServices} = require("../handlers/generateDescription")
const serviceCollection = require("../models/services/services")

const bcrypt = require('bcrypt')

const {generateDoctorDescription} = require("./generateDescription")

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
    const data = req.body["signupData"]
    try{
        const count = await info2.countDocuments({email:data.email});
        if(count !== 0){
            return res.status(411).json({
                message:"already available"
            })
        }

        const services = await serviceCollection.find({});
        console.log(services)
        const idx = services.findIndex((service)=>service.organ === data.expertise)
        if(idx === -1){
            const dataOfServices = await generateListOfServices(data.expertise);
            const serviceData = dataOfServices.data.map((service)=>{
                if(service.substring(service.length-1) === ":"){
                    return service.substring(0,service.length-1);
                }
                return service;
            })
            await serviceCollection.create({
                data: {
                    organ:data.expertise,
                    diseases:serviceData
                }
            })
        }
        const pass = await hashPassword(data.password);
        const description = await generateDoctorDescription(data)
        const message = await info2.create({...data,password:pass,description});
        
        return res.json({info:"account created successfully"})
    }catch(err){
        return res.status(500).json({
            message:"error while insertion",
            msg:err.message
        })
    }
}

const loginAcc = async (req, res) => {
    const { email, password } = req.body.data || {}; // Ensure req.body.data is defined

    if (!email || !password) {
        return res.status(400).end("Email and password are required");
    }

    try {
        const user = await info2.findOne({ email });
        if (!user) {
            return res.status(404).end("User not found");
        }

        const result = await bcrypt.compare(password, user.password);

        if (result) {
            let token = jwt.sign({ email }, "qwerty");
            console.log(token);
            res.cookie("token", token); // Secure cookie
            res.status(200).json({
                id:user.id,
                name:user.name
            });
        } else {
            res.status(401).end("Invalid Password");
        }
    } catch (err) {
        res.status(500).end("Error occurred");
    }
};


module.exports = {loginAcc,createAcc}
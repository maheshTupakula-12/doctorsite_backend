const router = require('express').Router()

const serviceCollection = require("../models/services/services")
const info2 = require('../models/doctors/doctors_info')
const info3 = require("../models/doctors/slots")
const path = require('path')

const cloudinary = require('../cloudinary')

const multer  = require('multer')


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/"); 
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
      cb(null, uniqueSuffix+file.originalname)
    }
  })
  
const upload = multer({ storage:storage })

const middleware = (req, res, next) => {
    let token = req.body.token
    if (token) {
        console.log("logged in")
        next()
    } else {
        res.status(401).end("not logged in")
    }
}

function isTimeInRange(time, startTime, endTime) {
    const [hours, minutes] = time.split(':').map(Number);
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    const [endHours, endMinutes] = endTime.split(':').map(Number);
  
    const timeDate = new Date();
    timeDate.setHours(hours, minutes, 0, 0);
  
    const startDate = new Date();
    startDate.setHours(startHours, startMinutes, 0, 0);
  
    const endDate = new Date();
    endDate.setHours(endHours, endMinutes, 0, 0);
  
    return timeDate >= startDate && timeDate <= endDate;
  }

function isOneHourGap(time1, time2) {
    const [hours1, minutes1] = time1.split(':').map(Number);
    const [hours2, minutes2] = time2.split(':').map(Number);

    const date1 = new Date();
    date1.setHours(hours1, minutes1, 0, 0);

    const date2 = new Date();
    date2.setHours(hours2, minutes2, 0, 0);

    const differenceInMilliseconds = Math.abs(date2 - date1);
    const oneHourInMilliseconds = 60 * 60 * 1000;

    return differenceInMilliseconds >= oneHourInMilliseconds;
}


const { getAllDataOfDoctors, deleteDoc } = require('../handlers/doctor')

const { loginAcc, createAcc } = require('../handlers/docsignin')


router.route("/del").post(deleteDoc)

router.route("/info").get(getAllDataOfDoctors)

router.route("/signup").post(createAcc)


    router.post("/upload-image",upload.single("image"),async(req,res)=>{
        // const filename = req.file.filename;
        try{
            const data = await cloudinary.uploader.upload(req.file.path,{folder:'myimages'});
            await info2.updateOne({id:req.body.id},{$set:{image_of_doctor:data.url}});
            return res.json({data,status:"success"})
        }catch(err){
            return res.status(500).json({
                message:err.message,
                status:"failure"
            })
        }
    })


router.route("/render").get((req,res)=>{
    res.render("index");
})


router.route("/login").post(loginAcc)

router.route("/services").get(async (req, res) => {
    const data = await serviceCollection.find({})
    res.send({
        data
    })
})

router.route("/add/:organ").post(async (req, res) => {
    const data = req.body.diseases;
    const { organ } = req.params;
    const check = await serviceCollection.create({
        data: {
            organ: organ,
            diseases: data
        },
    })
    res.send(check)
})

router.route("/appointment").post(async (req, res) => {
    const { name, id, addToSlot, date, suffering_with, particular_disease, description } = req.body;
    try {
        const {fromTime,toTime} = await info2.findOne({id})
        if(!isTimeInRange(addToSlot,fromTime,toTime)){
            return res.json({
                message: "slot booking failed",
                additional:"doctor not available",
                status:"failure"
            })
        }
        const value = await info3.countDocuments({ id, date })
        if(value === 0){
            const data = await info3.create({
                name, id, slot: addToSlot, date, suffering_with, particular_disease, description
            })
            return res.json({
                message: "slot booking successfully",
                status:"success"
            })
        }
        if (value < 2) {
            const docs = await info3.find({ id, date });
            for (let j = 0; j < docs.length; j++) {
                if (!isOneHourGap(addToSlot, docs[j].slot)) {
                    const data = await info3.create({
                        name, id, slot: addToSlot, date, suffering_with, particular_disease, description
                    })
                    return res.json({
                        message: "slot booking failed",
                        additional:"already slot reserved",
                        status:"failure"
                    })
                }
            }
            return res.json({
                message: "slot booking successfully",
                status:"success"
            })
        } else {
            return res.json({
                message: "slot booking failed",
                additional:"max bookings reached",
                status:"failure"
            })
        }
    } catch (err) {
        res.json({
            err: err
        })
    }
})


router.route('/logout').get((req, res) => {
    res.clearCookie('token', { path: '/' }); // Specify the cookie name and path if needed
    res.status(200).json({ message: 'Logged out successfully' });
});


function isSameDay(dateString) {
    // Parse the input date string into a Date object
    const inputDate = new Date(dateString);
  
    // Get the current date
    const currentDate = new Date();
  
    // Compare the year, month, and day components
    return (
      inputDate.getUTCFullYear() === currentDate.getUTCFullYear() &&
      inputDate.getUTCMonth() === currentDate.getUTCMonth() &&
      inputDate.getUTCDate() === currentDate.getUTCDate()
    );
  }

router.route("/slots").get(async(req,res)=>{

    const data = await info3.find({})
    const slots = data?.filter((obj)=>isSameDay(obj.date))
    console.log(data)
    return res.json({
        data:slots
    })
})

module.exports = router;
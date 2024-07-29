const info2 = require('../models/doctors/doctors_info')

const getAllDataOfDoctors = async(req,res)=>{
    try{
     const data = await info2.find({},{_id:0,__v:0})
     const arr = data.map(({ email,password, ...rest }) => rest);
     console.log(arr)
        return res.json({data:data})
    }catch(err){
        console.log(err)
        res.status(500).send("error")
    }
}


const deleteDoc = async(req,res)=>{
    const email = req.body.email;
    try{
        const data = await info2.deleteOne({email});
        console.log(data);
        if(data.deletedCount === 0){
            return res.json({
                message:`no doctor with email ${email} is found`
            })
        }
        return res.json({
            message:`doctor acccount with email ${email} is deleted`
        })
    }catch(err){
        console.log(err)
        res.status(500).json({
            message:"error occured while deleting from collection"
        })
    }
}

// const addDoc = ()=>{
//     try{
        
//     }
// }

module.exports = {getAllDataOfDoctors,deleteDoc}


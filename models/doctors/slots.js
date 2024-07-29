const mongoose = require('mongoose')

const slotSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
    },id:{
        type: Number,
        unique: false,
    },slot:{
        type:String,
        required:true
    },suffering_with:{
        type:String,
        required:true
    },
    date:{
        type:String,
        required:true
    },
    particular_disease:{
        type:String,
        required:true,
    },description:{
        type:String,
        required:false
    }
});

const slotModel = mongoose.model("slot",slotSchema);

module.exports = slotModel;
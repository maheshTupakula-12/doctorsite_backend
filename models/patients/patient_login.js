const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const patientSignInSchema = new Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },feedback:{
        type: [
        {disease: {
            type: String,
            required: true
          },
        doctor: {
            type: String,
            required: true
        },
        mail:{
          type:String,
          required:true
        },
        opinion: {
          type: String,
          required: true
        },
        description: {
          type: String,
          required: true
        },
        date: {
          type: Date,
          required: true,
          default: Date.now
        },
        rating: {
          type: Number,
          required: false,
          default:3
        }}], 
        required: false 
    },overall_rating:{
        type:Number,
        required:false,
    },
    review_count:{
        type:Number,
        required:false,
    }
});

// Create the model
const PatientSignInModel = mongoose.model('PatientSignIn', patientSignInSchema);

module.exports = PatientSignInModel;

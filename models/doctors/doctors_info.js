const mongoose = require('mongoose');

const doctorInfoSchema = new mongoose.Schema({
    id: {
        type: Number,
        unique: true,
        default: 0 // Default value will be replaced by a function
    },
    name: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: function() {
            return !this.username;
        },
        match: [/.+\@.+\..+/, 'Please fill a valid email address']
    },
    qualification: {
        type: String,
        required: true,
    },
    expertise: {
        type: String,
        required: true,
    },
    working_location: {
        type: String,
        required: true,
    },
    image_of_doctor: {
        type: String,
        required: false,
    },
    fromTime: {
        type: String,
        required: true,
    },
    toTime: {
        type: String,
        required: true,
    },
    experience: {
        type: Number,
        required: true,
    },description:{
        type:String,
        required:true,
    }
}, { timestamps: true }); // Adding timestamps if needed

// Pre-save hook to generate a unique `id` less than 100
doctorInfoSchema.pre('save', async function(next) {
    if (!this.isNew) return next(); // Only generate id for new documents

    try {
        const maxId = 99; // Max value for id
        const existingIds = await mongoose.models.DoctorInfo.distinct('id'); // Get existing ids
        let newId = Math.floor(Math.random() * (maxId + 1)); // Generate a random id

        // Ensure the new id is unique
        while (existingIds.includes(newId)) {
            newId = Math.floor(Math.random() * (maxId + 1));
        }

        this.id = newId; // Set the new id
        next();
    } catch (error) {
        next(error);
    }
});

const DoctorInfo = mongoose.model('DoctorInfo', doctorInfoSchema);


module.exports = DoctorInfo;

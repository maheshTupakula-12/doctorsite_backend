const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
    data: {
        type: {
            organ: {
                type: String,
                required: true,
                validate: {
                    validator: function(v) {
                        return v.trim().length > 0; // Ensure organ is not an empty string
                    },
                    message: props => 'Organ cannot be an empty string'
                }
            },
            diseases: {
                type: [String], // Ensure diseases is an array of strings
                required: true,
                validate: {
                    validator: function(v) {
                        return v.length > 0; // Ensure diseases array is not empty
                    },
                    message: props => 'Diseases array cannot be empty'
                }
            }
        },
        required: true
    }
});


const serviceModel = mongoose.model('service', serviceSchema);

module.exports = serviceModel;

const { GoogleGenerativeAI } = require("@google/generative-ai");

// Access your API key as an environment variable (see "Set up your API key" above)
const genAI = new GoogleGenerativeAI(process.env.apikey);

const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

async function generateDoctorDescription(doctor) {
    const prompt = `Write a long professional description for the following doctor:\n\nName: ${doctor.name}\nSpecialty: ${doctor.expertise}\nExperience: ${doctor.experience} years`;
    try{
        const result = await model.generateContent(prompt);
    const response =  result.response;
    const text = response.text();
    return text;
    }catch(error){
        console.error("Error generating description:", error.message);
        throw new Error(`Error generating doctor description: ${error.message}`);
    }
    // Construct a prompt using the doctor's details
}

module.exports = { generateDoctorDescription };

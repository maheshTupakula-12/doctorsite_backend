const { GoogleGenerativeAI } = require("@google/generative-ai");

// Access your API key as an environment variable (see "Set up your API key" above)
const genAI = new GoogleGenerativeAI(process.env.apikey);

const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

async function generateDoctorDescription(doctor) {
    const prompt = `Write a long professional description for the following doctor:\n\nName: ${doctor.name}\nSpecialty: ${doctor.expertise}\nExperience: ${doctor.experience} years`;
    try {
        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();
        return text;
    } catch (error) {
        console.error("Error generating description:", error.message);
        throw new Error(`Error generating doctor description: ${error.message}`);
    }
    // Construct a prompt using the doctor's details
}

async function generateListOfServices(expertise) {
    // Construct a prompt using the doctor's expertise
    const prompt = `List common conditions and diseases treated by a doctor specialized in ${expertise}.`;
  
    try {
      // Call the model to generate content
      const result = await model.generateContent(prompt);
  
      // Extract the response text
      const response = result.response;
      const rawText = await response.text();
  
      // Split the text into lines and filter for diseases
      const lines = rawText.split("\n");
  
      // Use a regular expression to extract diseases from lines
      const diseases = lines
        .map(line => {
          const match = line.match(/\*\*(.*?)\*\*/); // Match text between double asterisks
          return match ? match[1].trim() : null;
        })
        .filter(Boolean); // Remove null values
  
      // Return the result as a JSON object
      return {
        data: diseases
      };
    } catch (error) {
      console.error("Error generating list of services:", error.message);
      throw new Error(`Error generating list of services: ${error.message}`);
    }
  }
  
module.exports = { generateDoctorDescription, generateListOfServices };

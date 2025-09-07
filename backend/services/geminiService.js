const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.getPriorityFromDescription = async (description) => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

        const prompt = `Analyze the following civic complaint and classify its urgency. Respond with only one word: "Low", "Medium", or "High". Consider factors like safety hazards (e.g., 'exposed wire', 'deep pothole'), public health (e.g., 'overflowing garbage', 'sewage leak'), or infrastructure failure (e.g., 'streetlight out on highway'). Complaint: "${description}"`;

        const result = await model.generateContent(prompt);
        const response = result.response;
        let text = response.text().trim();

        if (['Low', 'Medium', 'High'].includes(text)) {
            return text;
        } else {
            console.warn(`Gemini returned an unexpected value: ${text}. Defaulting to Medium.`);
            return 'Medium';
        }
    } catch (error) {
        console.error("Error with Gemini API:", error);
        return 'Medium';
    }
};


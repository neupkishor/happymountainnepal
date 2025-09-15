import { config } from 'dotenv';
config();

if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY') {
    console.log(`
[Genkit] ♊️ Gemini API key not found.

Please get your key from Google AI Studio and add it to the .env file.
https://aistudio.google.com/app/apikey

Set the GEMINI_API_KEY variable in the .env file in the root of your project.
`);
}

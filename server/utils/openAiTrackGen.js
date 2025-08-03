// utils/openaiTrackGen.js
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function getAITrack(interest, difficulty) {
  const systemPrompt = `
  You are an expert finance educator. Generate 3 ${difficulty} 7-day learning track on "${interest}".
  Each day must include:
  - A topic title
  - A 3-5 sentence content lesson
  - A short quiz with 2 MCQs
  Respond in JSON format with: title, description, difficulty, tracks:[ days: [{ dayNumber, topic, content, quiz }]
  `;

  const completion = await openai.chat.completions.create({
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: "Generate the learning track." }
    ],
    model: "gpt-4-0613",
    temperature: 0.7,
  });

  const parsed = JSON.parse(completion.choices[0].message.content);
  console.log("here",parsed)
  return parsed;
}

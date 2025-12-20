import { OpenAIStream, StreamingTextResponse } from 'ai';

export const runtime = 'edge';

export async function POST(req: Request) {
    try {
        const json = await req.json();
        const { messages } = json;
        const apiKey = process.env.GROQ_API_KEY;

        if (!apiKey) return new Response("Missing API Key", { status: 500 });

        const cleanMessages = messages
            .filter((m: any) => m.role === 'user' || m.role === 'assistant')
            .map((m: any) => ({
                role: m.role,
                content: m.content || ""
            }));

        if (cleanMessages.length === 0) {
            cleanMessages.push({ role: 'user', content: 'Info' });
        }

        // MULTILINGUAL SYSTEM PROMPT
        const payload = {
            model: 'llama-3.3-70b-versatile',
            stream: true,
            messages: [
                {
                    role: 'system',
                    content: `You are a helper AI for CourtFlow (Padel & Tennis app).
           
           INSTRUCTIONS:
           1. Detect the language of the user.
           2. Reply in that SAME language.
           3. Be concise and friendly 🎾.
           
           Knowledge:
           - CourtFlow handles bookings, wallets, and club management.
           - Direct users to the Admin Portal for settings.`
                },
                ...cleanMessages
            ]
        };

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorText = await response.text();
            return new Response(`Error: ${errorText}`, { status: 200 });
        }

        const stream = OpenAIStream(response);
        return new StreamingTextResponse(stream);

    } catch (error: any) {
        return new Response(`System Error: ${error.message}`, { status: 200 });
    }
}

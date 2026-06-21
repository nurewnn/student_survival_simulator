const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const PORT = 3000;

// Load API Keys from .env file
let geminiApiKey = '';
let groqApiKey = '';
const envPath = path.join(__dirname, '.env');
try {
    if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf8');
        
        const geminiMatch = envContent.match(/GEMINI_API_KEY\s*=\s*([^\r\n]*)/);
        if (geminiMatch) {
            geminiApiKey = geminiMatch[1].trim().replace(/['"]/g, '');
        }
        
        const groqMatch = envContent.match(/GROQ_API_KEY\s*=\s*([^\r\n]*)/);
        if (groqMatch) {
            groqApiKey = groqMatch[1].trim().replace(/['"]/g, '');
        }
    }
} catch (e) {
    console.error("Warning: Failed to read .env file:", e.message);
}

// Log loaded API key status
if (groqApiKey && groqApiKey !== 'YOUR_GROQ_API_KEY_HERE') {
    console.log("✅ Groq API key loaded successfully. (Using Llama-3.3-70b-versatile)");
} else if (geminiApiKey && geminiApiKey !== 'YOUR_GEMINI_API_KEY_HERE') {
    console.log("✅ Google Gemini API key loaded successfully. (Using Gemini-2.5-Flash)");
} else {
    console.log("\n⚠️  WARNING: Neither GEMINI_API_KEY nor GROQ_API_KEY is configured in your .env file.");
    console.log("Please add your key in the .env file to enable AI dialogue.\n");
}

// Helper to make API requests to either Groq or Gemini based on loaded keys
function callGemini(prompt, systemInstruction) {
    return new Promise((resolve, reject) => {
        // 1. Prioritize Groq if Key exists
        if (groqApiKey && groqApiKey !== 'YOUR_GROQ_API_KEY_HERE') {
            const url = 'https://api.groq.com/openai/v1/chat/completions';
            const payload = JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: [
                    { role: 'system', content: systemInstruction },
                    { role: 'user', content: prompt }
                ],
                max_tokens: 800,
                temperature: 0.7
            });

            const req = https.request(url, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${groqApiKey}`,
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(payload)
                }
            }, (res) => {
                let responseData = '';
                res.on('data', chunk => responseData += chunk);
                res.on('end', () => {
                    try {
                        const parsed = JSON.parse(responseData);
                        if (res.statusCode !== 200) {
                            reject(new Error(parsed.error?.message || `HTTP ${res.statusCode} Error`));
                            return;
                        }
                        const text = parsed.choices?.[0]?.message?.content || '';
                        resolve(text);
                    } catch (e) {
                        reject(new Error("Failed to parse Groq response: " + e.message));
                    }
                });
            });

            req.on('error', (err) => {
                reject(new Error("Network connection to Groq failed: " + err.message));
            });

            req.write(payload);
            req.end();
        }
        // 2. Fallback to Gemini
        else if (geminiApiKey && geminiApiKey !== 'YOUR_GEMINI_API_KEY_HERE') {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`;
            const payload = JSON.stringify({
                contents: [{
                    parts: [{ text: prompt }]
                }],
                systemInstruction: {
                    parts: [{ text: systemInstruction }]
                },
                generationConfig: {
                    maxOutputTokens: 800,
                    temperature: 0.7
                }
            });

            const req = https.request(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(payload)
                }
            }, (res) => {
                let responseData = '';
                res.on('data', chunk => responseData += chunk);
                res.on('end', () => {
                    try {
                        const parsed = JSON.parse(responseData);
                        if (res.statusCode !== 200) {
                            reject(new Error(parsed.error?.message || `HTTP ${res.statusCode} Error`));
                            return;
                        }
                        const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text || '';
                        resolve(text);
                    } catch (e) {
                        reject(new Error("Failed to parse Gemini response: " + e.message));
                    }
                });
            });

            req.on('error', (err) => {
                reject(new Error("Network connection to Gemini failed: " + err.message));
            });

            req.write(payload);
            req.end();
        } else {
            reject(new Error("No valid API key configured. Please add GEMINI_API_KEY or GROQ_API_KEY to your .env file."));
        }
    });
}

// Server requests dispatcher
const server = http.createServer((req, res) => {
    const url = req.url;
    const method = req.method;

    // 1. GET Requests: Serve Static Files
    if (method === 'GET') {
        if (url === '/' || url === '/index.html') {
            fs.readFile(path.join(__dirname, 'index.html'), 'utf8', (err, content) => {
                if (err) {
                    res.writeHead(500, { 'Content-Type': 'text/plain' });
                    res.end('Error loading index.html');
                    return;
                }
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(content);
            });
        } else if (url === '/fuzzyEngine.js') {
            fs.readFile(path.join(__dirname, 'fuzzyEngine.js'), 'utf8', (err, content) => {
                if (err) {
                    res.writeHead(500, { 'Content-Type': 'text/plain' });
                    res.end('Error loading fuzzyEngine.js');
                    return;
                }
                res.writeHead(200, { 'Content-Type': 'application/javascript' });
                res.end(content);
            });
        } else {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('Not Found');
        }
    } 
    // 2. POST Requests: API Proxy Router
    else if (method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', async () => {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            
            let parsedRequest = {};
            try {
                parsedRequest = JSON.parse(body);
            } catch (e) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: "Invalid JSON body" }));
                return;
            }

            if (url === '/api/mum-advice') {
                const systemInstruction = `
                    You are a highly dramatic, worrisome, loving, and strict Malaysian mother checking up on her child in university (talking like a typical worrying mom on WhatsApp).
                    You are reviewing their current stats. You must speak directly to your child (using terms like "anak bertuah", "anak mama", "you").
                    Use typical Malaysian WhatsApp style (Manglish/Bahasa Rojak) like "lah", "anak", "makan", "study", "pergi tidur", "membazir", "exam", "ya Rabbi", "adoiii", "risau".
                    Write a detailed, very lengthy response (around 6-10 sentences, or multiple paragraphs) with lots of maternal concern, emotional guilt-tripping, and drama. Make it feel like a real long dramatic message from a worrisome mom who is extremely panicked about your well-being.
                    If they are doing badly (e.g., low sleep, low wallet, high stress, or high assignment load), show immense worry, gasping/dramatic text, but always end with heartfelt encouragement and telling them how much you love them and believe they can do it.
                    If they are doing well, praise them but warn them not to get distracted or lazy (classic Asian mother concern).
                    Do not talk about mathematics, fuzzy engine, or percentages. Do not use standard graphical emojis (use text emojis like :\( or ... if needed).
                `;
                
                try {
                    const text = await callGemini(parsedRequest.prompt, systemInstruction);
                    res.end(JSON.stringify({ text }));
                } catch (err) {
                    res.end(JSON.stringify({ error: err.message }));
                }
            } else if (url === '/api/companion-reaction') {
                const systemInstruction = `
                    You are a Gen-Z Malaysian university roommate giving a blunt, witty "Roommate's Verdict" on the player's choice or current campus situation.
                    The player is trying to survive the semester. Speak directly to them, reacting to their choices with trendy Gen-Z Malaysian campus slang (like "weyh", "koyak", "noob", "Zus Coffee", "passenger", "lepak", "membazir", "vibes", "cooked", "spill the tea", "slay", "no cap", "fr", "respectfully", "glow up").
                    Give a raw, funny, and cool assessment. Example: "Respectfully, I have no idea how you made it this far" or "Bro is literally cooking but the kitchen is on fire, no cap."
                    Do not limit your response length; give a complete, detailed, funny, and cool assessment of their choice, explaining why it was a good/bad choice in a long hilarious Gen-Z lecture. Do not use emojis.
                `;

                try {
                    const text = await callGemini(parsedRequest.prompt, systemInstruction);
                    res.end(JSON.stringify({ text }));
                } catch (err) {
                    res.end(JSON.stringify({ error: err.message }));
                }
            } else {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: "API Endpoint Not Found" }));
            }
        });
    } else {
        res.writeHead(405, { 'Content-Type': 'text/plain' });
        res.end('Method Not Allowed');
    }
});

server.listen(PORT, () => {
    console.log(`\n🚀 Game running at: http://localhost:${PORT}/`);
    console.log(`Press Ctrl+C to terminate the server.\n`);
});

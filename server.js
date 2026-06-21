const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const PORT = 3000;

// Load API Key from .env file
let apiKey = '';
const envPath = path.join(__dirname, '.env');
try {
    if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf8');
        const match = envContent.match(/GEMINI_API_KEY\s*=\s*(.*)/);
        if (match) {
            apiKey = match[1].trim().replace(/['"]/g, '');
        }
    }
} catch (e) {
    console.error("Warning: Failed to read .env file:", e.message);
}

if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
    console.log("\n⚠️  WARNING: GEMINI_API_KEY is not configured in .env file.");
    console.log("Please open .env and replace placeholder with your Gemini API Key from Google AI Studio.\n");
} else {
    console.log("✅ Google Gemini API key loaded successfully.");
}

// Helper to make Gemini API requests in the backend
function callGemini(prompt, systemInstruction) {
    return new Promise((resolve, reject) => {
        if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
            reject(new Error("API key is not configured in your .env file. Please add your key first."));
            return;
        }

        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
        
        const payload = JSON.stringify({
            contents: [{
                parts: [{ text: prompt }]
            }],
            systemInstruction: {
                parts: [{ text: systemInstruction }]
            },
            generationConfig: {
                maxOutputTokens: 150,
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
                    You are a loving, strict, and highly relatable Malaysian mother (acting like a typical WhatsApp mother) checking up on her child in university.
                    You are reviewing their current stats. You must speak directly to the student in a caring yet firm tone.
                    Use typical Malaysian WhatsApp English/Malay mix (Manglish/Bahasa Rojak) like "lah", "anak", "makan", "study", "pergi tidur", "membazir", "exam".
                    Do not talk about the math or the fuzzy system. Focus purely on how well they are doing, their budget, their sleep, and their assignments.
                    If they are doing badly, nag them but show love. If they are doing well, praise them but tell them not to get lazy (typical Asian mom).
                    Keep your response under 3 sentences. Do not use emojis (use ASCII smiles or standard text if needed).
                `;
                
                try {
                    const text = await callGemini(parsedRequest.prompt, systemInstruction);
                    res.end(JSON.stringify({ text }));
                } catch (err) {
                    res.end(JSON.stringify({ error: err.message }));
                }
            } else if (url === '/api/companion-reaction') {
                const systemInstruction = `
                    You are a Gen-Z Malaysian university classmate/roommate companion reacting to the player's choice.
                    The player is trying to survive the semester. React to the choice they just made in a single, short, witty comment.
                    Use trendy Gen-Z Malaysian campus slang (like "weyh", "koyak", "noob", "Zus Coffee", "passenger", "lepak", "membazir", "vibes", "cooked", "spill the tea", "slay").
                    Keep the response under 15 words. Focus entirely on the choice and their stats. Do not use emojis.
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

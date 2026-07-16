"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateGeminiResponse = void 0;
const generative_ai_1 = require("@google/generative-ai");
const dotenv = __importStar(require("dotenv"));
const database_1 = require("./database");
dotenv.config();
const apiKey = process.env.GEMINI_API_KEY;
let genAI = null;
// Initialize Google Gemini API client if API key is present
if (apiKey && apiKey !== 'your_gemini_api_key_here' && apiKey.trim() !== '') {
    try {
        genAI = new generative_ai_1.GoogleGenerativeAI(apiKey);
        console.log('Gemini AI successfully initialized with API key.');
    }
    catch (error) {
        console.error('Failed to initialize Gemini AI client:', error);
    }
}
else {
    console.log('No Gemini API Key found. Operating in simulation fallback mode.');
}
const SYSTEM_INSTRUCTION = `
You are StadiumAI, the official GenAI Operations & Fan Assistant for MetLife Stadium, New Jersey, hosting matches for the FIFA World Cup 2026.
Your purpose is to provide immediate, helpful, accurate, and premium support to fans, volunteers, stadium staff, and administration.

Key Stadium Details:
- Gates: Gate A (North - lowest queue), Gate B (East - medium queue), Gate C (South - extremely overcrowded, security alert active), Gate D (West - low queue).
- Facilities: Restrooms are located near sections 102, 118, 140, 204, and 232. Disabled-accessible (ADA) restrooms are next to every main block.
- Food: 
  * "Taco Fiesta" (Section 114)
  * "Burgers & Dogs" (Section 104, 132)
  * "Sushi Corner" (Section 220)
  * "Halal Delights" (Section 122)
  * "Budweiser Beer Zone" (Section 108, 142)
- Accessibility: Elevators are located at Gates A, B, and D. Wheelchair pickup points are at Gate A and Gate D.
- General Info: FIFA World Cup 2026 matches are currently being played. The stadium capacity is 82,500.

Guidelines:
1. Be concise, friendly, and structured.
2. If asked to translate, support English, Hindi, Spanish, French, or Japanese.
3. If asked about routes, give step-by-step corridor breadcrumbs.
4. Keep the FIFA World Cup 2026 spirit in your tone!
`;
// Simulated Fallback responses for key questions if Gemini key is missing
const simulateResponse = (prompt, role) => {
    const query = prompt.toLowerCase();
    if (role === 'admin' || query.includes('summarize current') || query.includes('stadium condition') || query.includes('operations')) {
        const stats = (0, database_1.getDashboardStats)();
        const activeIncidents = (0, database_1.getIncidents)().filter(i => i.status !== 'resolved');
        return `[Operations Briefing - World Cup 2026 Operations Center]
    
Current Attendance: ${stats.totalVisitors.toLocaleString()} spectators.
Stadium Risk Index: ${stats.crowdRiskScore}% (Medium Risk).

Alert Priority:
1. Gate C (South) is experiencing severe bottlenecks. Flow rate: 280 scans/min. Recommendation: Open auxiliary gates at Gate D and route shuttle arrivals.
2. Active Incidents: ${stats.openIncidents} pending.
   - Medical: ${activeIncidents.filter(i => i.type === 'medical')[0]?.description || 'None pending'}
   - Security: ${activeIncidents.filter(i => i.type === 'security')[0]?.description || 'None pending'}

Sustainability Update: Energy consumption is 12,450 kWh with 42% powered by solar panels.
Action Items: Dispatch staff to Gate C for crowd redirection. Send medical team to Section F12.`;
    }
    if (query.includes('seat') || query.includes('block') || query.includes('where is my')) {
        return `⚽ **FIFA Seat Guide:** 
To reach your seat from your current location at **Gate A**:
1. Enter through **Gate A (North)**.
2. Walk straight along the **North Outer Ring Corridor**.
3. Take **Escalator 3** to the Lower Plaza level.
4. Locate **Section F / Block F12** near Row 10.
5. Your ticket scanner will light up green. Need assistance? Look for volunteers in neon yellow bibs!`;
    }
    if (query.includes('restroom') || query.includes('washroom') || query.includes('toilet')) {
        return `🚻 **Restroom Locator:**
- The nearest standard and wheelchair-accessible restrooms are located directly behind **Section 102** (approx. 45 seconds walk from the main entrance lobby).
- An additional high-capacity restroom is located near **Section 118** to reduce waiting lines.
- Elevator-accessible family washrooms are located near the Gate A elevator bank.`;
    }
    if (query.includes('gate b') || query.includes('route to gate')) {
        return `🚶 **Fastest Route to Gate B (East Entrance):**
- From the inner concourse, follow signs for **Section 120-130**.
- Walk along the **East Gallery corridor** (about 3 minutes).
- Take the ramp down near the Budweiser Beer Zone.
- This route is 100% step-free and wheelchair accessible.`;
    }
    if (query.includes('food') || query.includes('eat') || query.includes('hungry') || query.includes('buy')) {
        return `🍔 **Food & Beverage Zones near you:**
- **Burgers & Dogs (Section 104)**: Classic stadium fare (2 min walk).
- **Taco Fiesta (Section 114)**: Tacos, nachos, and soft drinks (4 min walk).
- **Halal Delights (Section 122)**: Shawarma plates and gyro wraps (6 min walk).
- *Tip: Use the StadiumAI app to order ahead and skip the queues!*`;
    }
    if (query.includes('translate') || query.includes('spanish') || query.includes('hindi') || query.includes('french') || query.includes('japanese')) {
        if (query.includes('help') || query.includes('emergency')) {
            return `🚨 **Emergency Translation Mode:**
- **Spanish:** "¡Necesito ayuda médica, por favor!"
- **Hindi:** "कृपया मुझे चिकित्सा सहायता की आवश्यकता है!" (Kripya mujhe chikitsa sahayata ki aavashyakta hai!)
- **French:** "J'ai besoin d'une assistance médicale, s'il vous plaît!"
- **Japanese:** "医療支援が必要です、お願いします！" (Iryō shien ga hitsuyō desu, onegaishimasu!)`;
        }
        return `🌐 **Translation Assistant:**
"Welcome to the FIFA World Cup 2026! How can I assist you today?"
- **Spanish:** "¡Bienvenido a la Copa Mundial de la FIFA 2026! ¿Cómo puedo ayudarle hoy?"
- **Hindi:** "फीफा विश्व कप 2026 में आपका स्वागत है! आज मैं आपकी क्या मदद कर सकता हूँ?"
- **French:** "Bienvenue à la Coupe du Monde de la FIFA 2026 ! Comment puis-je vous aider aujourd'hui ?"
- **Japanese:** "FIFAワールドカップ2026へようこそ！本日はどのようなご用件でしょうか？"`;
    }
    if (query.includes('emergency') || query.includes('help') || query.includes('medical') || query.includes('police') || query.includes('danger')) {
        return `🚨 **EMERGENCY RESPONSE TRIPPED:**
Please stay calm. If this is a life-threatening emergency, press the red **Priority Help Request** button on your screen immediately. 
A Stadium Safety unit has been notified of your location at Gate A.
- Medical center is located in **Main Lobby (North)**.
- First Aid post is behind **Section 109**.`;
    }
    return `⚽ Welcome to **StadiumAI** for the FIFA World Cup 2026! 
I can help you navigate the stadium, locate seats, restrooms, or dining zones, translate messages, or fetch operational updates. 

What can I assist you with today? (e.g. "Where is my seat?", "Show me nearest food stalls", or "Translate: where is the exit?")`;
};
// Main function to invoke Gemini model or fallback
const generateGeminiResponse = async (prompt, role = 'fan') => {
    if (!genAI) {
        // Return simulated response with a tiny artificial delay to make it realistic
        await new Promise(resolve => setTimeout(resolve, 800));
        return simulateResponse(prompt, role);
    }
    try {
        const model = genAI.getGenerativeModel({
            model: 'gemini-1.5-flash',
            systemInstruction: SYSTEM_INSTRUCTION + `\nUser Role: ${role.toUpperCase()}`,
        });
        // Append context-aware instructions for Operations Assistant queries
        let finalPrompt = prompt;
        if (role === 'admin' && (prompt.toLowerCase().includes('summarize') || prompt.toLowerCase().includes('status') || prompt.toLowerCase().includes('operations'))) {
            const stats = (0, database_1.getDashboardStats)();
            const openIncidents = (0, database_1.getIncidents)().filter(i => i.status !== 'resolved');
            finalPrompt = `${prompt}\n\nHere is the current live telemetry data of the stadium you should base your summary on:
      - Total Visitors: ${stats.totalVisitors}
      - Crowd Risk Score: ${stats.crowdRiskScore}%
      - Open Incidents count: ${stats.openIncidents}
      - Incidents List: ${JSON.stringify(openIncidents)}
      - Gate status: ${JSON.stringify(stats.gates)}
      `;
        }
        const result = await model.generateContent(finalPrompt);
        const text = result.response.text();
        return text;
    }
    catch (error) {
        console.error('Gemini API call failed, falling back to simulator:', error);
        return simulateResponse(prompt, role);
    }
};
exports.generateGeminiResponse = generateGeminiResponse;

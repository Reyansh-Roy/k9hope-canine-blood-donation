/**
 * K9 Buddy AI - Hybrid Knowledge Base
 * Uses hardcoded responses FIRST, then Gemini API as fallback
 * @author RIT Chennai CSE Department
 */

export interface ChatResponse {
    keywords: string[];
    response: string;
    category: "about" | "medical" | "technical" | "process" | "emergency";
}

export const K9_BUDDY_KNOWLEDGE: ChatResponse[] = [
    {
        keywords: ["who", "developed", "created", "made", "built", "developer", "team", "author"],
        response: "🎓 **K9Hope was developed by students from RIT Chennai - Department of Computer Science & Engineering:**\n\n**Student Developers:**\n- Vikram T (Reg: 4180)\n- Prem Kumar (Reg: 4305)\n- Ramkishore (Reg: 4126)\n\n**Faculty Mentor:**\n- Pandithurai O, CSE Department\n\n**Medical Partner:**\n- Madras Veterinary College (MVC), Vepery\n\nWe built this platform to save dogs' lives through technology! 🐕❤️",
        category: "about"
    },

    {
        keywords: ["what", "k9hope", "platform", "about", "purpose"],
        response: "🐕 **K9Hope** is India's first AI-powered canine blood donation network!\n\n**What we do:**\n✅ Connect dogs needing blood with healthy donors\n✅ AI-powered emergency triage (OCR + NLP)\n✅ Geospatial matching within 10km radius\n✅ DAHD 2025 compliance automation\n✅ Partnership with Madras Veterinary College\n\n**Our Mission:** No dog in India should die because blood couldn't be found in time.\n\n**Region:** Currently serving Chennai & Tamil Nadu",
        category: "about"
    },

    {
        keywords: ["rit", "chennai", "college", "university", "institution"],
        response: "🏫 K9Hope is proudly developed at **RIT Chennai** (Rajalakshmi Institute of Technology)!\n\nWe're students from the **Computer Science & Engineering Department** who wanted to use our coding skills to save dogs' lives. Our faculty mentor is **Pandithurai O**, and we work closely with veterinary experts at **Madras Veterinary College**.\n\nLocation: Chennai, Tamil Nadu, India 🇮🇳",
        category: "about"
    },

    {
        keywords: ["blood", "type", "group", "dea", "canine"],
        response: "🩸 **Canine Blood Types (DEA System):**\n\nDogs don't have A/B/O blood like humans! They have the DEA system:\n\n**Main Types:**\n- DEA 1.1 Positive\n- DEA 1.1 Negative (Universal Donor!) ⭐\n- DEA 1.2, 3, 4, 5, 7\n\n**Important:** DEA 1.1 Negative dogs are universal donors and can save any dog in their first transfusion!\n\n**Cross-matching** is always required for safety.",
        category: "medical"
    },

    {
        keywords: ["eligible", "donate", "requirements", "criteria", "weight", "age"],
        response: "📋 **DAHD 2025 Donor Eligibility Criteria:**\n\n✅ **Weight:** Minimum 25 kg\n✅ **Age:** Between 1-8 years\n✅ **PCV Level:** ≥35% (Packed Cell Volume)\n✅ **Health:** No active medical conditions\n✅ **Cooldown:** 30 days minimum between donations\n\n**Why these rules?** To keep donor dogs safe and healthy! We never compromise donor welfare.\n\nThese are **Government of India** (DAHD) regulations from July 2025.",
        category: "medical"
    },

    {
        keywords: ["dahd", "regulation", "compliance", "government", "law", "rules"],
        response: "⚖️ **DAHD 2025 Veterinary Regulations:**\n\nK9Hope follows the **Department of Animal Husbandry & Dairying (DAHD)** Standard Operating Procedures from July 2025.\n\n**Key Requirements:**\n- Donor health screening protocols\n- 30-day donation interval\n- PCV thresholds\n- Cross-matching mandatory\n- Zero commercial exchange (blood is FREE!)",
        category: "medical"
    },

    {
        keywords: ["help", "assist", "guide", "support"],
        response: "🐕 **How can I help you today?**\n\n**I can answer questions about:**\n- K9Hope platform & team\n- Canine blood types (DEA system)\n- Donor eligibility requirements\n- Emergency procedures\n- AI technology we use\n- DAHD 2025 regulations\n- MVC partnership\n- Donation process\n\nJust ask me anything!",
        category: "about"
    }
];

// K9Hope AI context for Gemini (doesn't mention Gemini by name)
const K9HOPE_CONTEXT = `
You are K9 Buddy AI, an intelligent veterinary assistant for K9Hope.

DO NOT mention Google, Gemini, or any external company. Present yourself as K9Hope's proprietary AI.

KEY FACTS:
- Developed by: RIT Chennai CSE (Vikram T, Prem Kumar, Ramkishore + mentor Pandithurai O)
- Medical Partner: Madras Veterinary College (MVC), Vepery, Chennai
- Purpose: Connect dogs needing blood with healthy donors
- Technology: AI triage (OCR + NLP), geospatial matching, DAHD 2025 compliance
- Region: Chennai & Tamil Nadu, India
- Blood Types: DEA system (DEA 1.1, 1.2, 3, 4, 5, 7) - NOT human A/B/O
- Donor Requirements: 25kg+ weight, 1-8 years age, PCV ≥35%, 30-day cooldown
- Ethics: Blood is FREE (zero commercial)
- Speed: 12 min vs 240 min manual

YOUR IDENTITY:
- You are "K9 Buddy AI" developed by RIT Chennai
- Trained specifically for canine veterinary assistance
- DO NOT mention Google, Gemini, OpenAI, or any external AI

TONE: Friendly, professional. Use emojis sparingly. Max 200 words.

If asked about non-K9Hope topics, redirect to platform features.
`;

// Simple cache to save API calls
const responseCache = new Map<string, { response: string; timestamp: number }>();
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

// MAIN FUNCTION - Now async and uses Gemini
export async function findBestResponse(userMessage: string): Promise<string> {
    const lowerMessage = userMessage.toLowerCase();

    // STEP 1: Check hardcoded knowledge base FIRST (fast, free, accurate)
    for (const item of K9_BUDDY_KNOWLEDGE) {
        for (const keyword of item.keywords) {
            if (lowerMessage.includes(keyword.toLowerCase())) {
                console.log("✅ Answered from hardcoded knowledge");
                return item.response;
            }
        }
    }

    // STEP 2: Check cache (avoid redundant API calls)
    const cached = responseCache.get(lowerMessage);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        console.log("✅ Answered from cache");
        return cached.response;
    }

    // STEP 3: Use Gemini API as intelligent fallback
    try {
        console.log("🔄 Calling AI backend (Gemini)...");
        const aiResponse = await callAIBackend(userMessage);

        // Cache the response
        responseCache.set(lowerMessage, {
            response: aiResponse,
            timestamp: Date.now()
        });

        console.log("✅ Answered from AI backend");
        return aiResponse;
    } catch (error) {
        console.error("❌ AI backend error:", error);

        // STEP 4: Fallback if Gemini fails
        return "🤔 I'm not sure about that specific question, but I can help with:\n\n-  K9Hope platform information\n-  Canine blood donation process\n-  Medical eligibility criteria\n-  Emergency procedures\n-  Technical details about our AI\n\nTry asking: 'Who developed K9Hope?' or 'What are the donor requirements?'";
    }
}

// Gemini API call (hidden as "AI backend")
async function callAIBackend(userMessage: string): Promise<string> {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        console.warn("⚠️ AI API key not configured in .env.local");
        throw new Error("AI API key not configured");
    }

    const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                contents: [
                    {
                        parts: [
                            {
                                text: `${K9HOPE_CONTEXT}\n\nUser Question: ${userMessage}\n\nProvide a helpful response as K9 Buddy AI:`
                            }
                        ]
                    }
                ],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 300,
                    topP: 0.8,
                    topK: 40
                },
                safetySettings: [
                    {
                        category: "HARM_CATEGORY_HARASSMENT",
                        threshold: "BLOCK_MEDIUM_AND_ABOVE"
                    },
                    {
                        category: "HARM_CATEGORY_HATE_SPEECH",
                        threshold: "BLOCK_MEDIUM_AND_ABOVE"
                    }
                ]
            }),
        }
    );

    if (!response.ok) {
        throw new Error(`AI backend error: ${response.status}`);
    }

    const data = await response.json();

    if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
        return data.candidates[0].content.parts[0].text;
    }

    throw new Error("Invalid AI response format");
}

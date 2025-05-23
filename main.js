import { GoogleGenAI } from '@google/genai';
import 'dotenv/config';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const gebruikersnaam = process.env.USERNAME;
const wachtwoord = process.env.PASSWORD;
const sg_ofset = process.env.OFFSET;
const wacht = process.env.WAIT;
const cooldown_in_min = process.env.COOLDOWN;
const bot = process.env.BOT;
let token_vernieuwen_datum;
let token;
let list = [];


const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
async function get_token() {
    if (token_vernieuwen_datum == null) {
        token_vernieuwen_datum = 1;
    }

    if (token_vernieuwen_datum <= Number(Date.now().toString().slice(0, 10))) {

        const response = await fetch(
            "https://api.wrts.nl/api/v3/auth/get_token?email=" + gebruikersnaam + "&password=" + wachtwoord,
            {
                method: "POST",
                redirect: "follow"
            }
        );

        const result = await response.json();

        // Update localStorage
        token = result.auth_token.toString();
        token_vernieuwen_datum = Number(result.renew_from);
        return result.auth_token.toString();

    } else { return token; }
}
async function sgUpload(token, body, id) {
    const response = await fetch("https://api.wrts.nl/api/v3/qna/questions/" + id + "/answers", {
        "credentials": "omit",
        "headers": {
            "Accept": "application/json, text/plain, */*",
            "Content-Type": "application/json",
            "X-Auth-Token": token
        },
        "body": JSON.stringify({
            "qna_answer": {
                "body": body,
                "qna_attachments_attributes": []
            }
        }),
        "method": "POST",
        "mode": "cors"
    });
    const result = await response.text();
    console.log(result);

    if (response.ok) {
        console.log("Successfully posted answer");
    } else {
        console.log("Failed to post answer:", response.status);
    }

}
async function main() {
    try {
        token = await get_token();
        const forum = await fetch("https://api.wrts.nl/api/v3/public/qna/questions", {
            "credentials": "omit",
            "headers": {
                "Accept": "application/json, text/plain, */*",
                "X-Auth-Token": await token,
            },
            "referrer": "https://studygo.com/",
            "method": "GET",
            "mode": "cors"
        });
        const forum_data = await forum.json();

        if (!list.includes(forum_data.results[sg_ofset].id)) {
            const antwoord = await ai.models.generateContent({
                model: 'gemini-2.0-flash-001',
                contents: 'hoe antwoord je deze vraag goed?' + forum_data.results[sg_ofset].contents + ' ' + bot,
            });
            console.log(antwoord.text);
            await new Promise(resolve => setTimeout(resolve, wacht * 1000));
            if (antwoord.text.trim().toLowerCase() !== "qrf") {
                sgUpload(token, antwoord.text, forum_data.results[sg_ofset].id);
            } else {
                console.log("IK WEIGER");
            }
        } else { console.log("offline"); }
        list.push(forum_data.results[sg_ofset].id);
        console.log("cooldown begint");
        await new Promise(resolve => setTimeout(resolve, cooldown_in_min * 60 * 1000));
        main();
    } catch (error) {
        console.log("ERROR: " + error);
        console.log("dubbele slaap tot de error weg is....");
        await new Promise(resolve => setTimeout(resolve, cooldown_in_min * 2 * 60 * 1000));
        main();
    }
}

main();
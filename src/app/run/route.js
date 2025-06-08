import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { GoogleGenAI } from '@google/genai';
import { Webhook } from 'discord-webhook-node';
import randomUseragent from 'random-useragent';
import { getToken, getForumPage } from '@openwrts/libwrts';
import fetch from 'node-fetch';

const prompts = [
    'Hou je antwoord minder dan 3 zinnen maar blijf wel vriendelijk!',
    'Antwoord als Batman. Geef een correct antwoord...',
    'Hou je antwoord minder dan 3 zinnen maar blijf wel vriendelijk!',
    'Antwoord als ',
];
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;


export async function GET(request) {
    try {
        const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
        const bots = await prisma.bot.findMany({ where: { banned: false } });
        const forum = await getForumPage();

        bots.forEach(async bot => {
            try {
                const hook = new Webhook(bot.webhookUrl);
                const sg_ofset = randomIntUnder10();
                const token = bot.botToken || getToken(bot.email, bot.password);
                const antwoord = await ai.models.generateContent({
                    model: 'gemini-2.0-flash-001',
                    contents: 'hoe antwoord je deze vraag goed?' + forum[sg_ofset].contents + ' ' + prompts[bot],
                });
                console.log(antwoord.text);
                if (antwoord.text.trim().toLowerCase() !== "qrf") {
                    const staat = await sgUpload(token, antwoord.text, forum[sg_ofset].id);
                    if (staat === 404) {
                        console.log("ACCOUNT DOOD");
                        hook.error('Error', 'ACCOUNT DOOD', 'De bot waarschijnlijk is verbannen van studygo.');
                        return;
                    } else {
                        hook.success('Success', 'Antwoord gepost', 'De bot heeft succesvol een antwoord gepost op [deze](https://studygo.com/nl/learn/question/' + forum[sg_ofset].id + '/) vraag.');
                    }
                } else {
                    console.log("IK WEIGER");
                    hook.info('Information', 'IK WEIGER', 'De bot weigert om [deze](https://studygo.com/nl/learn/question/' + forum[sg_ofset].id + '/) vraag te beantwoorden.');
                }
            } catch (error) {
                console.error(`Error processing bot ${bot.id}:`, error);
                prisma.bot.update({
                    where: { id: bot.id },
                    data: { botToken: null }
                });

            }

        });

        return NextResponse.json({ status: 'success', data: bots });
    } catch (error) {
        console.error('Route error:', error);
        return NextResponse.json(
            { status: 'error', message: error.message },
            { status: 500 }
        );
    }
}
async function sgUpload(token, body, id) {
    const response = await fetch("https://api.wrts.nl/api/v3/qna/questions/" + id + "/answers", {
        "credentials": "omit",
        "headers": {
            "Accept": "application/json, text/plain, */*",
            "Content-Type": "application/json",
            "X-Auth-Token": token,
            "User-Agent": randomUseragent.getRandom(),
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
    console.log(response);


    if (response.ok) {
        console.log("Successfully posted answer");
    } else {
        console.log("Failed to post answer:", response.status);
    }
    return response.status;

}
function randomIntUnder10() {
    return Math.floor(Math.random() * 10);
}
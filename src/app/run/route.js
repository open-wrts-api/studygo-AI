import { NextResponse } from 'next/server';
import prisma from "../../lib/prisma";
import { getForumPage, getToken } from '@openwrts/libwrts';

export async function GET(request) {
    const bots = await prisma.bot.findMany();
    const forum = await getForumPage();
    console.log('Forum data:', forum);
    bots.forEach(async bot => {
        try {

        }
        catch (error) {
            // als het niet werkt probeer de token te vernieuwen
            try {
                bot.botToken = await getToken(bot.email, bot.password);
                await prisma.bot.update({
                    where: { id: bot.id },
                    data: { botToken: bot.botToken }
                });
            } catch (error) {
                // hier is shit goed kapot
                console.error('shit goed kapot tijdens processing bot:', error);
            }
        }
    });
    return NextResponse.json({ status: 'success', data: bots });
}
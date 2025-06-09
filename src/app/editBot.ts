"use server";
import prisma from "@/lib/prisma";

export default async function EditBot(params:any) {
    const { botId, data } = params;
    if (!botId || !data) {
        throw new Error("botId and data are required parameters");
    }
    return await prisma.bot.update({
        where: { id: botId },
        data: data,
    });
}

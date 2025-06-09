"use server"
import prisma from "@/lib/prisma";

async function get_token(email: string, wachtwoord: string) {
  let myHeaders = new Headers();
  myHeaders.append("Sec-Fetch-Mode", "cors");
  myHeaders.append("Sec-Fetch-Site", "cross-site");
  myHeaders.append("Origin", "https://studygo.com");
  myHeaders.append("Referer", "https://studygo.com");
  myHeaders.append("Sec-Fetch-Dest", "empty");

  const response = await fetch(
    "https://api.wrts.nl/api/v3/auth/get_token?email=" +
      email +
      "&password=" +
      wachtwoord,
    {
      method: "POST",
      headers: myHeaders,
      redirect: "follow",
    }
  );

  const result = await response.json();
  console.log(result);
  return result.auth_token.toString();
}

async function get_user_data(token: string) {
  let myHeaders = new Headers();
  myHeaders.append("x-auth-token", await token);

  try {
    const response = await fetch("https://api.wrts.nl/api/v3/get_user_data", {
      method: "GET",
      headers: myHeaders,
      redirect: "follow",
    });

    let result = await response.json();

    return result;
  } catch (error) {
    throw error;
  }
}

export async function createBot(formData: FormData): Promise<void> {
  try {
    const email = formData.get("email")?.toString();
    const password = formData.get("password")?.toString();
    const promptString = formData.get("prompt")?.toString();
    const webhookUrl = formData.get("webhookUrl")?.toString();

    if (!email || !password || !promptString || !webhookUrl) {
      throw new Error("Vul alle verplichte velden in");
    }

    // Convert prompt to integer
    const prompt = parseInt(promptString, 10);

    if (isNaN(prompt)) {
      throw new Error("Prompt moet een geldig getal zijn");
    }
    const botToken = await get_token(email, password);
    const userData = await get_user_data(botToken);
    const name = userData?.first_name;
    if (!name) {
      throw new Error(
        "Kon de botnaam niet ophalen. Controleer de login gegevens."
      );
    }
    const newBot = await prisma.bot.create({
      data: {
        name: name,
        email: email,
        password: password,
        prompt: prompt,
        botToken: botToken,
        webhookUrl: webhookUrl,
        banned: false,
      },
    });

    console.log("Bot succesvol aangemaakt:", newBot);
  } catch (error) {
    console.error("Fout bij aanmaken bot:", error);
    throw error;
  }
}

export async function getBots() {
  try {
    return await prisma.bot.findMany({
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error(error);
    throw error;
  }
}

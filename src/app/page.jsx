"use server";

import prisma from "@/lib/prisma";
import BotList from "./botList";

async function get_user_data(token) {
  let myHeaders = new Headers();
  myHeaders.append("x-auth-token", await token);

  try {
    const response = await fetch(
      "https://api.wrts.nl/api/v3/get_user_data",
      {
        method: "GET",
        headers: myHeaders,
        redirect: "follow"
      }
    );

    let result = await response.json();

    return result;
  } catch (error) { throw error; }
}

async function get_token(email, wachtwoord) {

  let myHeaders = new Headers();
  myHeaders.append("Sec-Fetch-Mode", "cors");
  myHeaders.append("Sec-Fetch-Site", "cross-site");
  myHeaders.append("Origin", "https://studygo.com");
  myHeaders.append("Referer", "https://studygo.com");
  myHeaders.append("Sec-Fetch-Dest", "empty");

  const response = await fetch(
    "https://api.wrts.nl/api/v3/auth/get_token?email=" + email + "&password=" + wachtwoord,
    {
      method: "POST",
      headers: myHeaders,
      redirect: "follow"
    }
  );

  const result = await response.json();
  console.log(result);
  return result.auth_token.toString();
}

export async function createBot(formData) {
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
      throw new Error("Kon de botnaam niet ophalen. Controleer de login gegevens.");
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

    return { success: true, message: "Bot succesvol aangemaakt", data: newBot };
  } catch (error) {
    console.error("Fout bij aanmaken bot:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Onbekende fout",
    };
  }
}

export default async function Home() {
  let bots = [];
  try {
    bots = await prisma.bot.findMany({
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Fout bij het ophalen van bots:", error);
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-12 text-center relative">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Bot Beheer
            </span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Beheer de Studygo Bots
          </p>
        </div>

        <div className="mb-12 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 transition-colors duration-200">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-6">
            <span className="mr-2">🤖</span>
            Nieuwe Bot Aanmaken
          </h2>

          <form action={createBot} className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                required
                className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                placeholder="bot@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Wachtwoord
              </label>
              <input
                type="password"
                name="password"
                required
                placeholder="Voer het wachtwoord in"
                className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Prompt nummer
              </label>
              <input
                name="prompt"
                required
                className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Webhook URL
              </label>
              <input
                type="url"
                name="webhookUrl"
                required
                className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                placeholder="https://discord.com/webhook"
              />
            </div>

            <button
              type="submit"
              className="col-span-2 bg-blue-600 dark:bg-blue-700 text-white py-3 px-6 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors"
            >
              Bot Aanmaken
            </button>
          </form>
        </div>
        <BotList bots={bots} />
      </div>
    </main>

  );
}
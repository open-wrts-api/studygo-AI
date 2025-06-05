// app/page.tsx
"use server";

import prisma from "../lib/prisma";

export async function createBot(formData) {
  try {
    const name = formData.get("name")?.toString();
    const email = formData.get("email")?.toString();
    const password = formData.get("password")?.toString();
    const promptString = formData.get("prompt")?.toString();
    const webhookUrl = formData.get("webhookUrl")?.toString();

    if (!name || !email || !password || !promptString || !webhookUrl) {
      throw new Error("Vul alle verplichte velden in");
    }

    // Convert prompt to integer
    const prompt = parseInt(promptString, 10);

    if (isNaN(prompt)) {
      throw new Error("Prompt moet een geldig getal zijn");
    }

    const newBot = await prisma.bot.create({
      data: {
        name,
        email,
        password,
        prompt,
        webhookUrl,
        nextRun: new Date(),
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
            Beheer de Studygo Bot
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
                Bot Naam
              </label>
              <input
                name="name"
                required
                className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                placeholder="Jan henk oosterrijk"
              />
            </div>

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
                Prompt int
              </label>
              <input
                name="prompt"
                required
                className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                placeholder="0"
              />
            </div>

            <div className="col-span-2">
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

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden transition-colors duration-200">
          <div className="px-6 py-5 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
            <h3 className="text-lg font-semibold dark:text-gray-200">
              Geregistreerde Bots ({bots.length})
            </h3>
          </div>

          {bots.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              Geen bots gevonden in de database
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Naam</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Email</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Volgende Run</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Webhook</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {bots.map((bot) => (
                    <tr
                      key={bot.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <td className="px-6 py-4 dark:text-gray-300">{bot.name}</td>
                      <td className="px-6 py-4 dark:text-gray-300">{bot.email}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-sm ${bot.banned
                          ? 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-500'
                          : 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-500'
                          }`}>
                          {bot.banned ? "Geblokkeerd" : "Actief"}
                        </span>
                      </td>
                      <td className="px-6 py-4 dark:text-gray-300">
                        {new Date(bot.nextRun).toLocaleDateString("nl-NL", {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="px-6 py-4 break-all max-w-xs">
                        <a
                          href={bot.webhookUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          {bot.webhookUrl}
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
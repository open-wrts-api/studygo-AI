"use client";

import { useEffect, useState } from "react";
import BotList from "./botList";
import { Bot } from "@/generated/prisma";
import toast from "react-hot-toast";
import { createBot, getBots } from "./actions";
import { useRouter } from "next/navigation";

async function handleCreateBot(formData: FormData) {
  try {
    await createBot(formData);
    toast.success("Bot succesvol aangemaakt!");
  } catch (error) {
    console.error(error);
    toast.error("Fout bij het aanmaken van de bot!");
  }
}

export default function Home() {
  const router = useRouter();

  const [bots, setBots] = useState<Bot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBots() {
      try {
        const fetchedBots = await getBots();
        setBots(fetchedBots);
        router.refresh()
      } catch (error) {
        console.error("Fout bij het ophalen van bots:", error);
        toast.error("Fout bij het ophalen van bots");
      } finally {
        setLoading(false);
      }
    }

    fetchBots();
  }, []);

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

          <form action={handleCreateBot} className="grid grid-cols-2 gap-6">
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
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Bots laden...</p>
          </div>
        ) : (
          <BotList bots={bots} />
        )}
      </div>
    </main>

  );
}
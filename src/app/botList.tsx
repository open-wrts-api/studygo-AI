"use client";
import { useState } from "react";
import EditBot from "./editBot";
import type { Bot } from "@/generated/prisma";

export default function BotList({ bots }: { bots: Bot[] }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedBot, setSelectedBot] = useState<Bot | null>(null);
    const [formData, setFormData] = useState<Partial<Bot>>({});

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedBot(null);
    };

    const handleChange = (e: { target: { name: any; value: any; }; }) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: { preventDefault: () => void; }) => {
        e.preventDefault();
        if (selectedBot?.id) {
            await EditBot({
                botId: selectedBot.id,
                data: {
                    email: formData.email || selectedBot.email,
                    password: formData.password || undefined,
                    prompt: formData.prompt ? Number(formData.prompt) : selectedBot.prompt,
                    webhookUrl: formData.webhookUrl || selectedBot.webhookUrl,
                    banned: formData.banned ? formData.banned : selectedBot.banned,
                },
            });
            closeModal();
        }
    };

    return (
        <>
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
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Naam
                                    </th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Email
                                    </th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Prompt
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {bots.map((bot) => (
                                    <tr
                                        key={bot.id}
                                        className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                                        onClick={() => {
                                            setIsModalOpen(true);
                                            setSelectedBot(bot);
                                            setFormData({});
                                        }}
                                    >
                                        <td className="px-6 py-4 dark:text-gray-300">{bot.name}</td>
                                        <td className="px-6 py-4 dark:text-gray-300">{bot.email}</td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`px-2 py-1 rounded-full text-sm ${bot.banned
                                                        ? "bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-500"
                                                        : "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-500"
                                                    }`}
                                            >
                                                {bot.banned ? "Geblokkeerd" : "Actief"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 break-all max-w-xs dark:text-gray-300">
                                            {bot.prompt}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {isModalOpen && selectedBot && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                    onClick={closeModal}
                >
                    <div
                        className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl mx-4 shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 className="text-2xl font-semibold mb-4 dark:text-white">
                            Bot bewerken: {selectedBot.name}
                        </h2>
                        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
                            <div className="col-span-1">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    defaultValue={selectedBot.email}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                                />
                            </div>

                            <div className="col-span-1">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Wachtwoord
                                </label>
                                <input
                                    type="password"
                                    name="password"
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                                />
                            </div>

                            <div className="col-span-1">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Prompt nummer
                                </label>
                                <input
                                    type="number"
                                    name="prompt"
                                    defaultValue={selectedBot.prompt}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                                />
                            </div>

                            <div className="col-span-1">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Webhook URL
                                </label>
                                <input
                                    type="url"
                                    name="webhookUrl"
                                    defaultValue={selectedBot.webhookUrl}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                                />
                            </div>

                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Status
                                </label>
                                <select
                                    name="banned"
                                    defaultValue={selectedBot.banned ? "true" : "false"}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                                >
                                    <option value="false">Actief</option>
                                    <option value="true">Geblokkeerd</option>
                                </select>
                            </div>

                            <div className="col-span-2 flex justify-end gap-2 mt-4">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500"
                                >
                                    Annuleren
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                    Opslaan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
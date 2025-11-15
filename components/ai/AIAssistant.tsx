
import React, { useState, useRef, useEffect } from 'react';
import { useTrip } from '../../context/TripContext';
import { getAIResponse } from '../../services/geminiService';
import { Bot, Send, X, Loader, Sparkles } from 'lucide-react';

interface Message {
    sender: 'user' | 'ai';
    text: string;
}

const AIAssistant: React.FC<{ isOpen: boolean, onClose: () => void }> = ({ isOpen, onClose }) => {
    const { trip } = useTrip();
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    
    useEffect(() => {
        if(isOpen && messages.length === 0) {
            setMessages([{ sender: 'ai', text: "Hello! I'm your trip assistant. How can I help you? You can ask me to suggest a packing list, estimate your budget, and more." }]);
        }
    }, [isOpen, messages.length]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async (prompt?: string) => {
        const userMessage = prompt || input;
        if (!userMessage.trim()) return;

        setMessages(prev => [...prev, { sender: 'user', text: userMessage }]);
        setInput('');
        setIsLoading(true);

        try {
            const aiResponse = await getAIResponse(userMessage, trip);
            setMessages(prev => [...prev, { sender: 'ai', text: aiResponse }]);
        } catch (error) {
            console.error("AI Assistant Error:", error);
            setMessages(prev => [...prev, { sender: 'ai', text: "Sorry, I'm having trouble connecting right now. Please try again later." }]);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    const quickActions = [
        "Suggest a packing list for this trip",
        "Estimate the budget for a 3-day trip to Paris",
        "How much money should we collect for this trip?",
        "Suggest an expense category for 'Museum tickets'"
    ];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg h-[80vh] flex flex-col">
                <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center">
                        <Bot className="h-6 w-6 text-primary-500 mr-2" />
                        <h2 className="text-xl font-bold">AI Trip Assistant</h2>
                    </div>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"><X className="h-6 w-6" /></button>
                </header>

                <main className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
                            {msg.sender === 'ai' && <div className="bg-primary-500 text-white rounded-full p-2"><Bot size={16}/></div>}
                            <div className={`max-w-xs md:max-w-md px-4 py-2 rounded-2xl ${msg.sender === 'user' ? 'bg-primary-600 text-white rounded-br-none' : 'bg-gray-200 dark:bg-gray-700 rounded-bl-none'}`}>
                                <p className="whitespace-pre-wrap">{msg.text}</p>
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                         <div className="flex items-start gap-3">
                            <div className="bg-primary-500 text-white rounded-full p-2"><Bot size={16}/></div>
                            <div className="max-w-md px-4 py-3 rounded-2xl bg-gray-200 dark:bg-gray-700 rounded-bl-none">
                                <Loader className="animate-spin h-5 w-5" />
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </main>
                
                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                     <div className="flex flex-wrap gap-2 mb-2">
                        {messages.length <= 1 && quickActions.map(action => (
                            <button key={action} onClick={() => handleSend(action)} className="text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-primary-700 dark:text-primary-300 px-3 py-1 rounded-full flex items-center">
                                <Sparkles size={12} className="mr-1"/> {action.split(' ').slice(0, 4).join(' ')}...
                            </button>
                        ))}
                    </div>
                    <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex items-center gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask me anything about your trip..."
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-full focus:ring-primary-500 focus:border-primary-500"
                            disabled={isLoading}
                        />
                        <button type="submit" className="bg-primary-600 text-white p-3 rounded-full hover:bg-primary-700 disabled:bg-primary-300" disabled={isLoading}>
                            <Send className="h-5 w-5" />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AIAssistant;

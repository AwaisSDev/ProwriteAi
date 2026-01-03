import React, { useState, useEffect } from "react";
import { Sparkles, Layout, History, Settings, LogOut, Send, Trash2, Copy } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient"; // Ensure this path is correct


const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

const Dashboard = () => {
    const [user, setUser] = useState<any>(null);
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'writer' | 'history' | 'settings'>('writer');
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState("");
    const [step, setStep] = useState(0);
    const [productName, setProductName] = useState("");
    const [productFeatures, setProductFeatures] = useState("");
    const [tone, setTone] = useState("Professional");

    // AUTH CHECK - Ensures only logged in users stay here
    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                navigate('/login');
            } else {
                setUser(user); // Save user info
            }
        };
        checkUser();
    }, [navigate]);

    // HISTORY LOGIC
    const [history, setHistory] = useState<{ name: string, text: string, date: string }[]>(() => {
        const saved = localStorage.getItem("prowrite_history");
        return saved ? JSON.parse(saved) : [];
    });

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate("/");
    };

    const handleGenerate = async () => {
        if (!productName || !productFeatures) return alert("Fill in the fields!");

        setIsLoading(true);
        setResult("");

        try {
            // 1. START THE API CALL IMMEDIATELY
            const apiPromise = fetch("/api/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: productName, features: productFeatures, tone: tone }),
            });

            // 2. RUN ANIMATIONS
            setStep(1);
            await delay(1200);
            setStep(2);
            await delay(1200);
            setStep(3);
            await delay(1200);
            setStep(4);
            await delay(1000);

            // 3. NOW GET THE RESULT
            const response = await apiPromise;
            if (!response.ok) throw new Error("API Failed");

            const data = await response.json();
            const finalResult = data.description;
            setResult(finalResult);

            // SAVE TO HISTORY
            const newEntry = {
                name: productName,
                text: finalResult,
                date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
            };
            const updatedHistory = [newEntry, ...history].slice(0, 10);
            setHistory(updatedHistory);
            localStorage.setItem("prowrite_history", JSON.stringify(updatedHistory));

        } catch (error) {
            console.error(error);
            setResult("Error: AI took too long or API is down.");
        } finally {
            setIsLoading(false);
            setStep(0);
        }
    };

    return (
        <div className="flex h-screen bg-[#F9FAFB] text-slate-900 overflow-hidden font-sans">
            {/* SIDEBAR */}
            <aside className="w-64 bg-white border-r border-slate-200 p-6 flex flex-col gap-8 hidden md:flex shadow-sm">
                <Link to="/" className="no-underline group">
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-md transition-transform duration-300 group-hover:scale-110">
                            <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-bold text-foreground">ProwriteAI</span>
                    </div>
                </Link>

                <nav className="flex-1 space-y-1">
                    <button onClick={() => setActiveTab('writer')} className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all font-medium ${activeTab === 'writer' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:bg-slate-50'}`}>
                        <Layout size={18} /> Writer
                    </button>
                    <button onClick={() => setActiveTab('history')} className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all font-medium ${activeTab === 'history' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:bg-slate-50'}`}>
                        <History size={18} /> History
                    </button>
                    <button onClick={() => setActiveTab('settings')} className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all font-medium ${activeTab === 'settings' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:bg-slate-50'}`}>
                        <Settings size={18} /> Settings
                    </button>
                </nav>
            </aside>

            {/* MAIN CONTENT */}
            <main className="flex-1 flex overflow-hidden">
                {activeTab === 'writer' && (
                    <div className="flex-1 flex flex-col md:flex-row w-full animate-in fade-in duration-500">
                        <section className="flex-1 p-10 overflow-y-auto bg-white border-r border-slate-100">
                            <h1 className="text-2xl font-bold text-slate-800 mb-8">New Description</h1>
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase text-slate-400">Product Name</label>
                                    <input
                                        type="text"
                                        value={productName}
                                        onChange={(e) => setProductName(e.target.value)}
                                        placeholder="Enter product name..."
                                        className="w-full h-12 px-4 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase text-slate-400">Writing Tone</label>
                                    <select
                                        value={tone}
                                        onChange={(e) => setTone(e.target.value)}
                                        className="w-full h-12 px-4 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all cursor-pointer"
                                    >
                                        <option>Professional</option>
                                        <option>Hype & Energetic</option>
                                        <option>Funny & Sarcastic</option>
                                        <option>Minimalist (Apple Style)</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase text-slate-400">Key Features</label>
                                    <textarea
                                        value={productFeatures}
                                        onChange={(e) => setProductFeatures(e.target.value)}
                                        placeholder="Describe features..."
                                        className="w-full h-48 p-4 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all resize-none"
                                    />
                                </div>
                                <button
                                    onClick={handleGenerate}
                                    disabled={isLoading}
                                    className="w-full inline-flex items-center justify-center gap-2 text-sm font-semibold transition-all duration-300 disabled:opacity-50 bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-lg hover:scale-105 h-12 rounded-xl px-4"
                                >
                                    {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send size={18} />}
                                    {isLoading ? "Analyzing..." : "Generate Magic"}
                                </button>
                            </div>
                        </section>

                        <section className="flex-[1.2] p-10 bg-[#F8F9FC] flex flex-col h-full overflow-hidden">
                            <h2 className="text-xl font-bold text-slate-800 mb-6">AI Result</h2>
                            <div className="flex-1 bg-white border border-slate-200 rounded-[24px] shadow-sm p-8 flex flex-col relative overflow-hidden">

                                <div className="flex-1 overflow-y-auto pr-2 flex flex-col items-center justify-center h-full">
                                    {!isLoading && !result && (
                                        <div className="flex flex-col items-center justify-center text-center">
                                            <Sparkles className="w-12 h-12 text-slate-200 mb-4" />
                                            <h3 className="text-lg font-medium text-slate-700 italic">Ready to write...</h3>
                                        </div>
                                    )}

                                    {isLoading && (
                                        <div className="flex flex-col items-center justify-center space-y-8 w-full">
                                            <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center animate-bounce shadow-2xl shadow-indigo-200">
                                                <Sparkles className="text-white w-8 h-8" />
                                            </div>
                                            <div className="w-full max-w-[240px] space-y-4">
                                                <div className={`flex items-center gap-4 transition-all duration-700 ${step >= 1 ? 'opacity-100' : 'opacity-10'}`}>
                                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step > 1 ? 'bg-green-500 text-white' : 'border-2 border-indigo-500 text-indigo-500 animate-pulse'}`}>
                                                        {step > 1 ? "✓" : "1"}
                                                    </div>
                                                    <span className={`text-sm font-bold ${step === 1 ? 'text-indigo-600' : 'text-slate-400'}`}>SEO Analysis</span>
                                                </div>
                                                <div className={`flex items-center gap-4 transition-all duration-700 ${step >= 2 ? 'opacity-100' : 'opacity-10'}`}>
                                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step > 2 ? 'bg-green-500 text-white' : 'border-2 border-indigo-500 text-indigo-500 animate-pulse'}`}>
                                                        {step > 2 ? "✓" : "2"}
                                                    </div>
                                                    <span className={`text-sm font-bold ${step === 2 ? 'text-indigo-600' : 'text-slate-400'}`}>Tone Refinement</span>
                                                </div>
                                                <div className={`flex items-center gap-4 transition-all duration-700 ${step >= 3 ? 'opacity-100' : 'opacity-10'}`}>
                                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step > 3 ? 'bg-green-500 text-white' : 'border-2 border-indigo-500 text-indigo-500 animate-pulse'}`}>
                                                        {step > 3 ? "✓" : "3"}
                                                    </div>
                                                    <span className={`text-sm font-bold ${step === 3 ? 'text-indigo-600' : 'text-slate-400'}`}>Final Polish</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {!isLoading && result && (
                                        <div className="w-full h-full animate-in fade-in zoom-in-95 duration-1000 relative">
                                            <button
                                                onClick={() => navigator.clipboard.writeText(result)}
                                                className="absolute top-0 right-0 p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-500 transition-all z-10"
                                            >
                                                <Copy size={16} />
                                            </button>

                                            <div className="p-8 bg-indigo-50/20 border border-indigo-100 rounded-[20px] text-slate-700 shadow-sm overflow-y-auto max-h-full w-full">
                                                {result.split('\n').map((line, i) => {
                                                    const trimmedLine = line.trim();
                                                    if (!trimmedLine) return null;

                                                    const match = trimmedLine.match(/^(TITLE|DESCRIPTION|FEATURES|TAGS):?\s*(.*)/i);

                                                    if (match) {
                                                        const headerWord = match[1].toUpperCase();
                                                        const remainingText = match[2];

                                                        return (
                                                            <div key={i} className="mt-6 mb-2 first:mt-0">
                                                                <div className="mb-2">
                                                                    <span className="bg-indigo-600 text-white text-[10px] px-2 py-1 rounded-md font-black tracking-widest uppercase inline-block">
                                                                        {headerWord}
                                                                    </span>
                                                                </div>
                                                                {remainingText && (
                                                                    <div className="text-slate-600 leading-relaxed mb-4">
                                                                        {remainingText}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    }

                                                    if (trimmedLine.includes('#')) {
                                                        return (
                                                            <div key={i} className="flex flex-wrap gap-2 mt-3">
                                                                {trimmedLine.split(/\s+/).filter(t => t.startsWith('#')).map((tag, index) => (
                                                                    <span key={index} className="text-[11px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-1 rounded-lg">
                                                                        {tag}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        );
                                                    }

                                                    const isNumbered = /^\d\./.test(trimmedLine);
                                                    return (
                                                        <div key={i} className={`text-slate-600 leading-relaxed ${isNumbered ? 'ml-4 font-medium mb-1' : 'mb-4'}`}>
                                                            {trimmedLine}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </section>
                    </div>
                )}

                {activeTab === 'history' && (
                    <div className="flex-1 p-10 bg-white overflow-y-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <h1 className="text-2xl font-bold text-slate-800 mb-8">Generation History</h1>
                        <div className="space-y-4">
                            {history.length === 0 ? (
                                <p className="text-slate-400 italic">No magic saved yet...</p>
                            ) : (
                                history.map((item, index) => (
                                    <div key={index} className="p-5 border border-slate-100 rounded-2xl hover:bg-slate-50 transition-colors flex justify-between items-center group">
                                        <div className="cursor-pointer flex-1" onClick={() => { setResult(item.text); setActiveTab('writer'); }}>
                                            <h3 className="font-bold text-slate-700">{item.name}</h3>
                                            <p className="text-sm text-slate-400">Generated on {item.date}</p>
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                const newHistory = history.filter((_, i) => i !== index);
                                                setHistory(newHistory);
                                                localStorage.setItem("prowrite_history", JSON.stringify(newHistory));
                                            }}
                                            className="p-2 text-slate-300 hover:text-red-500 transition-all"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'settings' && (
                    <div className="flex-1 p-10 bg-white overflow-y-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <h1 className="text-2xl font-bold text-slate-800 mb-8">Account Settings</h1>
                        <div className="max-w-md space-y-6">
                            <div className="flex items-center gap-4 p-6 bg-indigo-50 rounded-2xl">
                                <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                                    {/* Dynamic Initial */}
                                    {user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0).toUpperCase() || "U"}
                                </div>
                                <div>
                                    {/* Dynamic Name */}
                                    <p className="font-bold text-slate-800">
                                        {user?.user_metadata?.full_name || "User"}
                                    </p>
                                    {/* Dynamic Email */}
                                    <p className="text-sm text-indigo-600 font-medium">
                                        {user?.email || "No email found"}
                                    </p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <button className="w-full text-left p-4 rounded-xl border border-slate-200 hover:border-indigo-300 transition-all font-medium text-slate-600">Update Profile</button>
                                <button className="w-full text-left p-4 rounded-xl border border-slate-200 hover:border-indigo-300 transition-all font-medium text-slate-600">Billing & Subscription</button>
                                <button onClick={handleLogout} className="w-full text-left p-4 rounded-xl border border-red-100 text-red-500 hover:bg-red-50 transition-all font-medium flex items-center gap-2">
                                    <LogOut size={18} /> Logout
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Dashboard;
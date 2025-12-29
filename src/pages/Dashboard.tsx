import React, { useState } from "react";
import { Sparkles, Layout, History, Settings, LogOut, Send, Trash2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const Dashboard = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'writer' | 'history' | 'settings'>('writer');
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState("");
    const [step, setStep] = useState(0); 

    const handleLogout = () => {
        navigate("/"); 
    };

    const handleGenerate = () => {
        setIsLoading(true);
        setResult("");
        setStep(1); 
        setTimeout(() => setStep(2), 5000);  
        setTimeout(() => setStep(3), 10000); 
        setTimeout(() => setStep(4), 15000); 
        setTimeout(() => {
            setIsLoading(false);
            setStep(0);
            setResult("Success! Your premium AI description is ready. We've maximized SEO density and perfected the brand voice for a high-converting result.");
        }, 20000);
    };

    return (
        <div className="flex h-screen bg-[#F9FAFB] text-slate-900 overflow-hidden font-sans">
            {/* SIDEBAR */}
            <aside className="w-64 bg-white border-r border-slate-200 p-6 flex flex-col gap-8 hidden md:flex shadow-sm">
                <Link to="/" className="no-underline group">
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-mdw-9 h-9 rounded-xl gradient-bg flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
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
                                    <input type="text" placeholder="Enter product name..." className="w-full h-12 px-4 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase text-slate-400">Key Features</label>
                                    <textarea placeholder="Describe features..." className="w-full h-48 p-4 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all resize-none" />
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

                        <section className="flex-[1.2] p-10 bg-[#F8F9FC] flex flex-col">
                            <h2 className="text-xl font-bold text-slate-800 mb-6">AI Result</h2>
                            <div className="flex-1 bg-white border border-slate-200 rounded-[24px] shadow-sm p-8 flex flex-col relative overflow-hidden">
                                {!isLoading && !result && (
                                    <div className="flex-1 flex flex-col items-center justify-center text-center">
                                        <Sparkles className="w-12 h-12 text-slate-200 mb-4" />
                                        <h3 className="text-lg font-medium text-slate-700 italic">Ready to write...</h3>
                                    </div>
                                )}
                                {isLoading && (
                                    <div className="flex-1 flex flex-col items-center justify-center space-y-8">
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
                                            {/* ... (steps 2 and 3 continue here) */}
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
                                    <div className="flex-1 animate-in fade-in zoom-in-95 duration-1000">
                                        <div className="p-8 bg-indigo-50/20 border border-indigo-100 rounded-[20px] text-slate-700 leading-relaxed italic text-lg shadow-sm">
                                            {result}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>
                )}

                {activeTab === 'history' && (
                    <div className="flex-1 p-10 bg-white overflow-y-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <h1 className="text-2xl font-bold text-slate-800 mb-8">Generation History</h1>
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="p-5 border border-slate-100 rounded-2xl hover:bg-slate-50 transition-colors flex justify-between items-center group">
                                    <div>
                                        <h3 className="font-bold text-slate-700">Premium Leather Watch</h3>
                                        <p className="text-sm text-slate-400">Generated on Oct {10 + i}, 2025</p>
                                    </div>
                                    <button className="p-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'settings' && (
                    <div className="flex-1 p-10 bg-white overflow-y-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <h1 className="text-2xl font-bold text-slate-800 mb-8">Account Settings</h1>
                        <div className="max-w-md space-y-6">
                            <div className="flex items-center gap-4 p-6 bg-indigo-50 rounded-2xl">
                                <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-xl">JD</div>
                                <div>
                                    <p className="font-bold text-slate-800">John Doe</p>
                                    <p className="text-sm text-indigo-600 font-medium">Pro Plan User</p>
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
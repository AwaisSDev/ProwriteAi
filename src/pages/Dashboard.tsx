import React, { useState, useEffect } from "react";
import { Sparkles, Layout, History, Settings, LogOut, Send, Trash2, Copy, Coins, Zap, Lock, Shield, ArrowRight, Sun, Moon, ChevronDown, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { useTheme } from "next-themes";

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

const Dashboard = () => {
    const { theme, setTheme } = useTheme();
    const [user, setUser] = useState<any>(null);
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'writer' | 'history' | 'settings'>('writer');

    const toggleTheme = () => {
        setTheme(theme === 'dark' ? 'light' : 'dark');
    };
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState("");
    const [step, setStep] = useState(0);
    const [productName, setProductName] = useState("");
    const [productFeatures, setProductFeatures] = useState("");
    const [tone, setTone] = useState("Professional");
    const [history, setHistory] = useState<any[]>([]);
    const [credits, setCredits] = useState<number>(0);
    const [plan, setPlan] = useState<string>("Free");
    const [isToneDropdownOpen, setIsToneDropdownOpen] = useState(false);
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const [showEmailBadge, setShowEmailBadge] = useState(false);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [newName, setNewName] = useState("");
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [isUpdating, setIsUpdating] = useState(false);

    // 1. AUTH & INITIAL FETCH
    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                navigate('/login');
            } else {
                setUser(user);
                setNewName(user.user_metadata?.full_name || "");
                fetchHistory(user.id); // Load from DB

                // Fetch Profile Data
                let { data: profile, error: fetchError } = await supabase
                    .from('profiles')
                    .select('credits, plan, last_reset_date')
                    .eq('id', user.id)
                    .single();

                // Fallback if column 'last_reset_date' doesn't exist yet
                if (fetchError) {
                    const { data: fallbackProfile } = await supabase
                        .from('profiles')
                        .select('credits, plan')
                        .eq('id', user.id)
                        .single();
                    profile = fallbackProfile;
                }

                if (profile) {
                    const today = new Date().toISOString().split('T')[0];
                    let finalCredits = profile.credits;

                    // Only attempt reset logic if we have the date column
                    if ('last_reset_date' in profile && profile.last_reset_date !== today) {
                        finalCredits = 10;
                        await supabase
                            .from('profiles')
                            .update({ credits: 10, last_reset_date: today, plan: 'Pro' })
                            .eq('id', user.id);
                    }

                    setCredits(finalCredits);
                    setPlan("Pro"); // Force Pro UI
                }

                // Add 2s delay for premium feel
                setTimeout(() => {
                    setIsInitialLoading(false);
                }, 1300);
            }
        };
        checkUser();
    }, [navigate]);

    // 2. FETCH FROM SUPABASE
    const fetchHistory = async (userId: string) => {
        const { data, error } = await supabase
            .from('history')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) console.error("Error fetching history:", error);
        else setHistory(data || []);
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate("/");
    };

    const handleGenerate = async () => {
        if (!productName || !productFeatures) return alert("Fill in the fields!");

        setIsLoading(true);
        setResult("");

        try {
            const { data: { session } } = await supabase.auth.getSession();

            const apiPromise = fetch("/api/generate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${session?.access_token}`
                },
                body: JSON.stringify({ name: productName, features: productFeatures, tone: tone }),
            });

            setStep(1); await delay(1200);
            setStep(2); await delay(1200);
            setStep(3); await delay(1200);
            setStep(4); await delay(1000);

            const response = await apiPromise;
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "API Failed");
            }

            const data = await response.json();
            const finalResult = data.description;
            setResult(finalResult);
            setCredits(prev => prev - 1); // Deduct credit locally

            // 3. SAVE TO SUPABASE
            const { data: savedData, error } = await supabase
                .from('history')
                .insert([
                    {
                        user_id: user.id,
                        product_name: productName,
                        result_text: finalResult
                    }
                ])
                .select();

            if (!error && savedData) {
                setHistory([savedData[0], ...history]); // Update UI
            }

        } catch (error: any) {
            console.error(error);
            setResult(error.message || "Error: AI took too long or API is down.");
        } finally {
            setIsLoading(false);
            setStep(0);
        }
    };

    const deleteHistoryItem = async (id: number) => {
        const { error } = await supabase.from('history').delete().eq('id', id);
        if (!error) {
            setHistory(history.filter(item => item.id !== id));
        }
    };

    const handleUpdateProfile = async () => {
        if (!newName && !newPassword) {
            toast.error("No changes detected");
            return;
        }

        setIsUpdating(true);
        try {
            const updates: any = {};

            // 1. If changing password, we REQUIRE current password verification
            if (newPassword) {
                if (!currentPassword) {
                    throw new Error("Current password is required to set a new one");
                }

                // Verify session is still fresh/valid
                const { error: signInError } = await supabase.auth.signInWithPassword({
                    email: user.email,
                    password: currentPassword
                });
                if (signInError) throw new Error("Incorrect current password");

                updates.password = newPassword;
            }

            // 2. Add Name update if changed
            if (newName && newName !== user.user_metadata?.full_name) {
                updates.data = { full_name: newName };
            }

            if (Object.keys(updates).length === 0) {
                toast.error("No new information to update");
                return;
            }

            // 3. Apply updates
            const { error } = await supabase.auth.updateUser(updates);
            if (error) throw error;

            toast.success("Profile updated!");
            setShowUpdateModal(false);
            setNewPassword("");
            setCurrentPassword("");

            // 4. Refresh local user state
            const { data: { user: updatedUser } } = await supabase.auth.getUser();
            setUser(updatedUser);
        } catch (error: any) {
            toast.error(error.message || "Failed to update profile");
        } finally {
            setIsUpdating(false);
        }
    };



    const [touchStart, setTouchStart] = useState<number | null>(null);
    const [touchCurrent, setTouchCurrent] = useState<number | null>(null);

    const handleTouchStart = (e: React.TouchEvent) => {
        setTouchStart(e.targetTouches[0].clientY);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        setTouchCurrent(e.targetTouches[0].clientY);
    };

    const handleTouchEnd = () => {
        if (!touchStart || !touchCurrent) return;
        const distance = touchCurrent - touchStart;
        const isDownSwipe = distance > 100; // Threshold

        if (isDownSwipe) {
            setResult(""); // Close it
            // Optional: You could add logic here to keep it open but minimized
        }
        setTouchStart(null);
        setTouchCurrent(null);
    };

    if (isInitialLoading) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center transition-colors duration-300">
                <div className="w-16 h-16 md:w-24 md:h-24 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl md:rounded-[32px] flex items-center justify-center animate-bounce">
                    <Sparkles className="text-white w-8 h-8 md:w-12 md:h-12" />
                </div>
                <div className="mt-8 md:mt-12 flex flex-col items-center">
                    <div className="w-24 md:w-40 h-1 md:h-1.5 bg-slate-100 dark:bg-slate-800/50 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-600 animate-progress-once origin-left w-full shadow-[0_0_15px_rgba(79,70,229,0.5)]" />
                    </div>
                </div>
                <style dangerouslySetInnerHTML={{
                    __html: `
                    @keyframes progressOnce {
                        0% { transform: scaleX(0); }
                        100% { transform: scaleX(1); }
                    }
                    .animate-progress-once {
                        animation: progressOnce 2s linear forwards;
                    }
                `}} />
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-background text-foreground overflow-hidden font-sans transition-colors duration-300">
            {/* SIDEBAR */}
            <aside className="w-64 bg-card border-r border-border p-6 flex flex-col gap-8 hidden md:flex shadow-sm transition-colors duration-300">
                <Link to="/" className="no-underline group">
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-md transition-transform duration-300 group-hover:scale-110">
                            <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-bold text-foreground">ProwriteAI</span>
                    </div>
                </Link>

                <nav className="flex-1 space-y-1">
                    <div className="mb-6 px-2 text-center">
                        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-4 text-white shadow-lg dark:shadow-none relative overflow-hidden group">
                            <p className="text-xs font-medium text-white/80 uppercase tracking-wider mb-1">Daily Credits</p>
                            <p className="text-2xl font-bold">{credits} / 10</p>
                            <p className="text-[10px] font-bold uppercase opacity-60 mt-2">Resets Daily</p>
                        </div>
                    </div>
                    <button onClick={() => setActiveTab('writer')} className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all font-medium ${activeTab === 'writer' ? 'bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                        <Layout size={18} /> Writer
                    </button>
                    <button onClick={() => setActiveTab('history')} className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all font-medium ${activeTab === 'history' ? 'bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                        <History size={18} /> History
                    </button>
                    <button onClick={() => setActiveTab('settings')} className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all font-medium ${activeTab === 'settings' ? 'bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                        <Settings size={18} /> Settings
                    </button>
                </nav>

                {/* THEME TOGGLE (PC) */}
                <div className="pt-6 border-t border-border">
                    <button
                        onClick={toggleTheme}
                        className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-border hover:border-indigo-300 transition-all group"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm border border-border group-hover:scale-110 transition-transform">
                                {theme === 'dark' ? <Moon size={16} className="text-yellow-500" /> : <Sun size={16} className="text-orange-500" />}
                            </div>
                            <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest">{theme === 'dark' ? 'Night Mode' : 'Light Mode'}</span>
                        </div>
                        <div className={`w-8 h-4 rounded-full p-0.5 transition-colors ${theme === 'dark' ? 'bg-indigo-600' : 'bg-slate-200'}`}>
                            <div className={`w-3 h-3 bg-white rounded-full shadow-sm transition-transform ${theme === 'dark' ? 'translate-x-4' : 'translate-x-0'}`} />
                        </div>
                    </button>
                </div>
            </aside>

            {/* MAIN CONTENT */}
            <main className="flex-1 flex overflow-hidden">
                {activeTab === 'writer' && (
                    <div className="flex-1 flex flex-col md:flex-row w-full animate-in fade-in duration-500">
                        {/* INPUT SECTION */}
                        <section className="flex-1 p-10 overflow-y-auto bg-card border-r border-border pb-24 md:pb-10 transition-colors">
                            {/* MOBILE CREDITS DISPLAY */}
                            <div className="md:hidden mb-6 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-4 text-white shadow-lg flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-white/80 uppercase tracking-wider mb-0.5">Daily Credits Remaining</p>
                                    <p className="text-2xl font-bold leading-none">{credits} / 10</p>
                                </div>
                                <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                                    <Sparkles size={20} className="text-white" />
                                </div>
                            </div>

                            <h1 className="text-4xl font-black text-slate-800 dark:text-white mb-8 transition-colors tracking-tight">New Description</h1>
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase text-slate-400">Product Name</label>
                                    <input
                                        type="text"
                                        value={productName}
                                        onChange={(e) => setProductName(e.target.value)}
                                        placeholder="Enter product name..."
                                        className="w-full h-14 px-5 bg-slate-50 dark:bg-indigo-900/10 rounded-xl border border-slate-200 dark:border-indigo-500/20 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all text-foreground"
                                    />
                                </div>
                                <div className="space-y-2 relative">
                                    <label className="text-xs font-bold uppercase text-slate-400">Writing Tone</label>

                                    <div className="relative">
                                        <button
                                            onClick={() => setIsToneDropdownOpen(!isToneDropdownOpen)}
                                            className="w-full h-12 px-4 bg-slate-50 dark:bg-indigo-900/10 rounded-xl border border-slate-200 dark:border-indigo-500/20 flex items-center justify-between text-left hover:border-slate-300 dark:hover:border-indigo-400 transition-all active:scale-[0.99]"
                                        >
                                            <span className="text-sm font-medium text-slate-700 dark:text-indigo-400">{tone}</span>
                                            <div className={`transition-transform duration-200 ${isToneDropdownOpen ? 'rotate-180' : ''}`}>
                                                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M1 3.5L5 7.5L9 3.5" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            </div>
                                        </button>

                                        {isToneDropdownOpen && (
                                            <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-2xl shadow-2xl z-50 py-3 animate-in fade-in zoom-in-95 duration-200 origin-top">
                                                {/* FREE MODELS SECTION */}
                                                <div className="px-4 mb-2">
                                                    <span className="text-[11px] font-black text-slate-500 uppercase tracking-tight">Base Tones</span>
                                                </div>
                                                {[
                                                    { name: 'Professional', premium: false },
                                                    { name: 'Energetic', premium: false },
                                                    { name: 'Funny', premium: false },
                                                ].map((t) => (
                                                    <button
                                                        key={t.name}
                                                        onClick={() => {
                                                            setTone(t.name);
                                                            setIsToneDropdownOpen(false);
                                                        }}
                                                        className={`w-full px-4 py-2 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left ${tone === t.name ? 'text-indigo-600' : 'text-foreground'}`}
                                                    >
                                                        <span className="text-sm font-medium">{t.name}</span>
                                                        {tone === t.name && <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 shadow-[0_0_8px_rgba(79,70,229,0.5)]" />}
                                                    </button>
                                                ))}

                                                <div className="my-2 border-t border-slate-50" />

                                                {/* ELITE MODELS SECTION (Plus & Pro) */}
                                                <div className="px-4 mt-4 mb-2 flex items-center justify-between">
                                                    <span className="text-[11px] font-black text-indigo-600 uppercase tracking-tight">Elite Tones</span>
                                                    <Zap size={10} className="text-indigo-500 fill-current" />
                                                </div>
                                                {[
                                                    { name: 'Minimalist', premium: true },
                                                    { name: 'Luxury', premium: true },
                                                    { name: 'Gen Z', premium: true },
                                                    { name: 'Persuasive', premium: true },
                                                    { name: 'Sharp', premium: true }
                                                ].map((t) => (
                                                    <button
                                                        key={t.name}
                                                        onClick={() => {
                                                            setTone(t.name);
                                                            setIsToneDropdownOpen(false);
                                                        }}
                                                        className={`w-full px-4 py-2 flex items-center justify-between hover:bg-indigo-50/50 transition-colors text-left ${tone === t.name ? 'text-indigo-600' : 'text-foreground'}`}
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm font-medium">{t.name}</span>
                                                        </div>
                                                        {tone === t.name && <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 shadow-[0_0_8px_rgba(79,70,229,0.5)]" />}
                                                    </button>
                                                ))}

                                                <div className="my-2 border-t border-slate-50" />

                                                {/* PRO ONLY SECTION */}
                                                <div className="px-4 mt-4 mb-2 flex items-center justify-between">
                                                    <span className="text-[11px] font-black text-purple-600 uppercase tracking-tight">Pro Exclusive</span>
                                                    <Sparkles size={10} className="text-purple-500 fill-current" />
                                                </div>
                                                {[
                                                    { name: 'Storyteller', pro: true },
                                                    { name: 'Executive', pro: true },
                                                    { name: 'Technical', pro: true },
                                                    { name: 'Seductive', pro: true },
                                                    { name: 'Cinematic', pro: true }
                                                ].map((t) => (
                                                    <button
                                                        key={t.name}
                                                        onClick={() => {
                                                            setTone(t.name);
                                                            setIsToneDropdownOpen(false);
                                                        }}
                                                        className={`w-full px-4 py-2 flex items-center justify-between hover:bg-purple-50 transition-colors text-left ${tone === t.name ? 'text-purple-600' : 'text-foreground'}`}
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm font-medium">{t.name}</span>
                                                        </div>
                                                        {tone === t.name && <div className="w-1.5 h-1.5 rounded-full bg-purple-600 shadow-[0_0_8px_rgba(147,51,234,0.5)]" />}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase text-slate-400">Key Features</label>
                                    <textarea
                                        value={productFeatures}
                                        onChange={(e) => setProductFeatures(e.target.value)}
                                        placeholder="Describe features..."
                                        className="w-full h-56 p-5 bg-slate-50 dark:bg-indigo-900/10 rounded-xl border border-slate-200 dark:border-indigo-500/20 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all resize-none text-foreground"
                                    />
                                </div>
                                <button
                                    onClick={handleGenerate}
                                    disabled={isLoading}
                                    className="w-full inline-flex items-center justify-center gap-2 text-sm font-semibold transition-all duration-300 disabled:opacity-50 bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-lg dark:shadow-none hover:scale-105 h-14 rounded-2xl px-4"
                                >
                                    {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send size={18} />}
                                    {isLoading ? "Analyzing..." : "Generate Magic"}
                                </button>
                            </div>
                        </section>

                        {/* RESULT SECTION - Only show when active */}
                    </div>
                )}

                {/* RESULT SECTION - Lifted out of tab logic so it shows over any tab */}
                {(result || isLoading) && (
                    <section
                        onTouchStart={handleTouchStart}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}
                        className="fixed bottom-0 left-0 right-0 md:relative md:flex-[1.2] p-6 md:p-10 bg-background flex flex-col h-[85vh] md:h-full overflow-hidden transition-transform duration-500 ease-in-out md:translate-y-0 rounded-t-[30px] md:rounded-none shadow-[0_-10px_40px_rgba(0,0,0,0.1)] md:shadow-none z-40 border-t border-border md:border-t-0 md:bg-background"
                        style={touchStart && touchCurrent && (touchCurrent - touchStart > 0) ? { transform: `translateY(${touchCurrent - touchStart}px)` } : {}}
                    >

                        <div className="flex items-center justify-between mb-6 md:hidden">
                            <button
                                onClick={() => setResult("")}
                                className="p-2 bg-slate-50 dark:bg-slate-800 rounded-full border border-border text-slate-500 hover:text-indigo-600 transition-all active:scale-90"
                            >
                                <ChevronDown size={24} />
                            </button>
                            <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full mr-12" /> {/* Centered handle relative to button */}
                        </div>

                        <h2 className="text-xl font-bold text-foreground mb-6 hidden md:block">AI Result</h2>
                        <div className="flex-1 bg-card border border-border rounded-[24px] shadow-sm p-8 flex flex-col relative overflow-hidden transition-colors">
                            <div className="flex-1 overflow-y-auto pr-2 flex flex-col items-center justify-center h-full">

                                {/* LOADING STATE */}
                                {isLoading && (
                                    <div className="flex flex-col items-center justify-center space-y-8 w-full">
                                        <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center animate-bounce shadow-2xl dark:shadow-none shadow-indigo-200">
                                            <Sparkles className="text-white w-8 h-8" />
                                        </div>
                                        <div className="w-full max-w-[240px] space-y-4">
                                            {[{ s: 1, t: "SEO Analysis" }, { s: 2, t: "Tone Refinement" }, { s: 3, t: "Final Polish" }].map((item) => (
                                                <div key={item.s} className={`flex items-center gap-4 transition-all duration-700 ${step >= item.s ? 'opacity-100' : 'opacity-10'}`}>
                                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step > item.s ? 'bg-green-500 text-white' : 'border-2 border-indigo-500 text-indigo-500 animate-pulse'}`}>
                                                        {step > item.s ? "✓" : item.s}
                                                    </div>
                                                    <span className={`text-sm font-bold ${step === item.s ? 'text-indigo-600' : 'text-slate-400'}`}>{item.t}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* RESULT STATE */}
                                {!isLoading && result && (
                                    <div className="w-full h-full animate-in fade-in zoom-in-95 duration-1000 relative">
                                        <button
                                            onClick={() => navigator.clipboard.writeText(result)}
                                            className="absolute top-0 right-0 p-2 bg-card border border-border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 transition-all z-10"
                                        >
                                            <Copy size={16} />
                                        </button>
                                        <div className="p-8 bg-indigo-50/20 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-500/20 rounded-[20px] text-foreground shadow-sm overflow-y-auto max-h-full w-full">
                                            {result.split('\n').map((line, i) => {
                                                const trimmedLine = line.trim();
                                                if (!trimmedLine) return null;
                                                const match = trimmedLine.match(/^(TITLE|DESCRIPTION|FEATURES|TAGS):?\s*(.*)/i);
                                                if (match) {
                                                    return (
                                                        <div key={i} className="mt-6 mb-2 first:mt-0">
                                                            <div className="mb-2">
                                                                <span className="bg-indigo-600 text-white text-[10px] px-2 py-1 rounded-md font-black tracking-widest uppercase inline-block">{match[1].toUpperCase()}</span>
                                                            </div>
                                                            {match[2] && <div className="text-slate-600 leading-relaxed mb-4">{match[2]}</div>}
                                                        </div>
                                                    );
                                                }
                                                if (trimmedLine.includes('#')) {
                                                    return (
                                                        <div key={i} className="flex flex-wrap gap-2 mt-3">
                                                            {trimmedLine.split(/\s+/).filter(t => t.startsWith('#')).map((tag, idx) => (
                                                                <span key={idx} className="text-[11px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-1 rounded-lg">{tag}</span>
                                                            ))}
                                                        </div>
                                                    );
                                                }
                                                return <div key={i} className={`text-slate-600 leading-relaxed ${/^\d\./.test(trimmedLine) ? 'ml-4 font-medium mb-1' : 'mb-4'}`}>{trimmedLine}</div>;
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>
                )}

                {activeTab === 'history' && (
                    <div className="flex-1 p-10 bg-card overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24 md:pb-10 relative transition-colors">
                        <div>
                            <h1 className="text-4xl font-black text-slate-800 dark:text-white mb-8 transition-colors tracking-tight">Generation History</h1>

                            <div className="space-y-4">
                                {history.length === 0 ? (
                                    <p className="text-slate-400 italic">No magic saved in your account yet...</p>
                                ) : (
                                    history.map((item, idx) => (
                                        <button
                                            key={item.id || idx}
                                            onClick={() => {
                                                setProductName(item.product_name);
                                                setResult(item.result_text);
                                            }}
                                            className="w-full text-left p-5 border border-border rounded-2xl flex justify-between items-center group bg-card hover:border-indigo-500/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all cursor-pointer active:scale-[0.99]"
                                        >
                                            <div className="flex-1">
                                                <h3 className="font-bold text-foreground dark:text-white group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{item.product_name || "Premium Generation"}</h3>
                                                <p className="text-sm text-slate-400">Generated on {item.created_at ? new Date(item.created_at).toLocaleDateString() : 'Recently'}</p>
                                            </div>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    deleteHistoryItem(item.id);
                                                }}
                                                className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-all"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </button>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* SETTINGS (No changes) */}
                {activeTab === 'settings' && (
                    <div className="flex-1 p-10 bg-card overflow-y-auto animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24 md:pb-10 transition-colors">
                        <div className="max-w-md w-full mb-8 flex items-center md:hidden">
                            <h1 className="text-2xl font-bold text-foreground">Settings</h1>
                        </div>
                        <h1 className="text-2xl font-bold text-foreground mb-8 hidden md:block">Account Settings</h1>
                        <div className="max-w-md space-y-6">
                            <div className="flex items-center gap-4 p-6 bg-indigo-50 dark:bg-indigo-900/10 rounded-2xl border border-indigo-100/50 dark:border-indigo-500/20 relative overflow-hidden">
                                <div className="w-12 h-12 flex-shrink-0 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                                    {user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0).toUpperCase() || "U"}
                                </div>
                                <div>
                                    <p className="font-bold text-slate-800 dark:text-indigo-400">{user?.user_metadata?.full_name || "User"}</p>
                                    <div className="flex flex-wrap items-center gap-2 max-w-full">
                                        <button
                                            onClick={() => setShowEmailBadge(true)}
                                            className="text-sm text-indigo-600 font-medium truncate max-w-[120px] xs:max-w-[150px] md:max-w-none text-left"
                                        >
                                            {user?.email || "No email found"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <button onClick={() => setShowUpdateModal(true)} className="w-full text-left p-4 rounded-xl border border-slate-200 dark:border-indigo-500/20 hover:border-indigo-300 dark:hover:border-indigo-400 bg-transparent dark:bg-indigo-900/5 transition-all font-medium text-slate-600 dark:text-indigo-300/80">Update Profile</button>
                                <button
                                    onClick={() => navigate('/support')}
                                    className="w-full text-left p-4 rounded-xl border border-indigo-200 dark:border-indigo-500/30 bg-indigo-50/50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-all font-bold flex items-center justify-between group"
                                >
                                    <div className="flex items-center gap-2">
                                        <Shield size={18} className="text-indigo-600 dark:text-indigo-400" />
                                        <span>Suport line</span>
                                    </div>
                                    <ArrowRight size={16} className="text-indigo-600 dark:text-indigo-400" />
                                </button>
                                <button
                                    onClick={toggleTheme}
                                    className="md:hidden w-full text-left p-4 rounded-xl border border-slate-200 dark:border-indigo-500/20 hover:border-indigo-300 dark:hover:border-indigo-400 bg-transparent dark:bg-indigo-900/5 transition-all font-medium text-slate-600 dark:text-indigo-300/80 flex items-center justify-between"
                                >
                                    <div className="flex items-center gap-3">
                                        {theme === 'dark' ? <Moon size={18} className="text-yellow-500" /> : <Sun size={18} className="text-orange-500" />}
                                        <span className="font-bold">Dark Mode</span>
                                    </div>
                                    <div className={`w-10 h-5 rounded-full p-1 transition-colors ${theme === 'dark' ? 'bg-indigo-600' : 'bg-slate-200'}`}>
                                        <div className={`w-3 h-3 bg-white rounded-full transition-transform ${theme === 'dark' ? 'translate-x-5' : 'translate-x-0'}`} />
                                    </div>
                                </button>
                                <button onClick={handleLogout} className="w-full text-left p-4 rounded-xl border border-red-100 dark:border-red-900/30 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all font-medium flex items-center gap-2">
                                    <LogOut size={18} /> Logout
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* UPDATE PROFILE MODAL */}
                {showUpdateModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
                        <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-300 border border-slate-100 dark:border-slate-800">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Update Profile</h2>
                                <button onClick={() => setShowUpdateModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                                    <X size={20} className="text-slate-400" />
                                </button>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase text-slate-400">Full Name</label>
                                    <input
                                        type="text"
                                        value={newName}
                                        onChange={(e) => setNewName(e.target.value)}
                                        className="w-full h-12 px-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-foreground transition-all"
                                        placeholder="Your full name"
                                    />
                                </div>
                                <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                                    <p className="text-[10px] font-bold uppercase text-indigo-500 mb-4 tracking-widest">Change Password (Optional)</p>
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold uppercase text-slate-400">Current Password</label>
                                            <input
                                                type="password"
                                                value={currentPassword}
                                                onChange={(e) => setCurrentPassword(e.target.value)}
                                                className="w-full h-12 px-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-foreground transition-all"
                                                placeholder="Required only to change password"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold uppercase text-slate-400">New Password</label>
                                            <input
                                                type="password"
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                className="w-full h-12 px-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-foreground transition-all"
                                                placeholder="Enter new password"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4 flex gap-3">
                                    <button
                                        onClick={() => setShowUpdateModal(false)}
                                        className="flex-1 py-3 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleUpdateProfile}
                                        disabled={isUpdating}
                                        className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 dark:shadow-none hover:bg-indigo-700 disabled:opacity-50 transition-all flex items-center justify-center"
                                    >
                                        {isUpdating ? "Saving..." : "Save Changes"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}



                {/* FLOATING EMAIL VIEWER (MOBILE) */}
                {showEmailBadge && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm md:hidden animate-in fade-in duration-300" onClick={() => setShowEmailBadge(false)}>
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-[32px] border border-indigo-500/20 shadow-2xl max-w-xs w-full animate-in zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>
                            <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-2">Logged in as</p>
                            <p className="text-lg font-bold text-foreground break-all mb-6">{user?.email}</p>
                            <button
                                onClick={() => setShowEmailBadge(false)}
                                className="w-full bg-indigo-600 text-white font-bold py-3 rounded-2xl shadow-lg shadow-indigo-500/20 active:scale-95 transition-all"
                            >
                                Got it
                            </button>
                        </div>
                    </div>
                )}
            </main>

            {/* MOBILE NAVIGATION */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border p-3 flex justify-around z-50 transition-colors">
                <button onClick={() => setActiveTab('writer')} className={`flex flex-col items-center gap-1 ${activeTab === 'writer' ? 'text-indigo-600' : 'text-slate-400'}`}>
                    <Layout size={20} />
                    <span className="text-[10px] font-bold">Writer</span>
                </button>
                <button onClick={() => setActiveTab('history')} className={`flex flex-col items-center gap-1 ${activeTab === 'history' ? 'text-indigo-600' : 'text-slate-400'}`}>
                    <History size={20} />
                    <span className="text-[10px] font-bold">History</span>
                </button>
                <button onClick={() => setActiveTab('settings')} className={`flex flex-col items-center gap-1 ${activeTab === 'settings' ? 'text-indigo-600' : 'text-slate-400'}`}>
                    <Settings size={20} />
                    <span className="text-[10px] font-bold">Settings</span>
                </button>
            </nav>

            {/* Click-away overlay for dropdown */}
            {isToneDropdownOpen && (
                <div
                    className="fixed inset-0 z-40 bg-transparent"
                    onClick={() => setIsToneDropdownOpen(false)}
                />
            )}
        </div>
    );
};

export default Dashboard;
import React, { useState, useEffect } from "react";
import {
    Check, Sparkles, Zap, Shield, ArrowLeft, Loader2,
    HelpCircle, ChevronDown, Star, Globe, ZapOff,
    Lock, CreditCard, MessageCircle, BarChart3, Cloud
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

const Pricing = () => {
    const navigate = useNavigate();
    const [userPlan, setUserPlan] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<string | null>(null);
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    // 1. Initial Data Fetch & SafePay Success Handling
    useEffect(() => {
        const initPricing = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data } = await supabase
                    .from('profiles')
                    .select('plan')
                    .eq('id', user.id)
                    .single();
                if (data) setUserPlan(data.plan);
            }

            // Check for SafePay return params
            const params = new URLSearchParams(window.location.search);
            const tracker = params.get('tracker');
            const orderId = params.get('order_id');

            if (tracker && orderId) {
                const planName = orderId.split('_')[2];
                toast.success(`Access Granted! Welcome to ${planName}!`, {
                    description: "Your account features have been updated automatically.",
                });
                setUserPlan(planName);
                window.history.replaceState({}, '', '/pricing');
            }
        };

        initPricing();
    }, []);

    const handleUpgrade = async (planName: string) => {
        if (planName === 'Free' || userPlan === planName) return;
        setIsLoading(planName);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return navigate('/auth');

            const response = await fetch('/api/safepay-session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: planName === 'Pro' ? 5600 : 2800,
                    planName,
                    userId: user.id
                })
            });

            const data = await response.json();
            if (!data.token) throw new Error("Payment initialization failed.");

            const baseURL = "https://sandbox.api.getsafepay.com/components";
            const params = new URLSearchParams({
                env: "sandbox",
                beacon: data.token,
                source: 'custom',
                order_id: data.order_id,
                redirect_url: `https://www.prowriteai.online/pricing`,
                cancel_url: `https://www.prowriteai.online/pricing`
            });

            window.location.href = `${baseURL}?${params.toString()}`;
        } catch (error) {
            toast.error("Could not connect to SafePay. Try again later.");
            setIsLoading(null);
        }
    };

    const plans = [
        {
            name: "Free",
            price: "0",
            description: "Essential tools for casual writers.",
            features: ["5 Generations per day", "Standard AI Engine", "Basic Tone Detection", "Community Access"],
            highlight: false,
            color: "slate",
        },
        {
            name: "Plus",
            price: "10",
            description: "Level up your content game.",
            features: ["100 Generations per day", "Advanced GPT-4 Access", "Unlimited Tone Profiles", "Priority Email Support", "History Export (CSV)"],
            highlight: true,
            icon: <Zap className="w-5 h-5" />,
            color: "indigo",
        },
        {
            name: "Pro",
            price: "20",
            description: "The ultimate power for businesses.",
            features: ["Unlimited Generations*", "Custom Brand Voice", "Full API Access", "Dedicated Manager", "Early Beta Access", "Advanced Analytics"],
            highlight: false,
            icon: <Sparkles className="w-5 h-5" />,
            color: "purple",
        },
    ];

    const faqs = [
        { q: "How does the daily limit reset?", a: "Daily generation limits reset every 24 hours at 00:00 UTC. For Pro users, limits are effectively unlimited for standard usage." },
        { q: "Can I cancel my subscription anytime?", a: "Yes! You can cancel your Plus or Pro plan at any time from your settings page. You will keep access until the end of your billing cycle." },
        { q: "Is SafePay secure for my transactions?", a: "Absolutely. SafePay is a leading payment gateway. During this sandbox phase, no real money is charged, but the encryption remains top-tier." },
        { q: "Do you offer a refund policy?", a: "We offer a 14-day money-back guarantee for any Plus or Pro subscription if you aren't satisfied with the results." }
    ];

    return (
        <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans pb-24 overflow-x-hidden">
            {/* --- TOP NAVIGATION --- */}
            <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <Link to="/dashboard" className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-all font-semibold">
                        <ArrowLeft size={18} />
                        <span>Back</span>
                    </Link>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-200">
                            <Sparkles className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-2xl font-black tracking-tight text-slate-800">ProWrite<span className="text-indigo-600">AI</span></span>
                    </div>
                    <div className="hidden md:block">
                        <span className="text-sm font-medium text-slate-400 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                            Current Plan: <span className="text-indigo-600 font-bold">{userPlan || 'Free'}</span>
                        </span>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-6">
                {/* --- HERO SECTION --- */}
                <header className="py-20 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <span className="px-4 py-1.5 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold uppercase tracking-widest border border-indigo-100 mb-6 inline-block">
                            Simple Transparent Pricing
                        </span>
                        <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight text-slate-900">
                            Boost your writing <br />
                            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent italic">productivity.</span>
                        </h1>
                        <p className="text-slate-500 text-xl max-w-2xl mx-auto leading-relaxed">
                            Stop staring at a blank page. Choose a plan that fits your workflow and start creating content that converts.
                        </p>
                    </motion.div>
                </header>

                {/* --- PRICING CARDS --- */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-32">
                    {plans.map((plan, idx) => (
                        <motion.div
                            key={plan.name}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className={`group relative bg-white rounded-[40px] p-10 border-2 transition-all duration-500 ${plan.highlight
                                    ? "border-indigo-600 shadow-2xl shadow-indigo-100 scale-105 z-10"
                                    : "border-slate-100 hover:border-slate-300 shadow-xl shadow-slate-200/50"
                                }`}
                        >
                            {plan.highlight && (
                                <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-6 py-1.5 rounded-full text-xs font-black uppercase tracking-widest shadow-lg">
                                    Recommended
                                </div>
                            )}

                            <div className="mb-10">
                                <div className={`w-14 h-14 rounded-2xl mb-6 flex items-center justify-center transition-transform group-hover:scale-110 duration-500 ${plan.name === 'Pro' ? 'bg-purple-50 text-purple-600' :
                                        plan.name === 'Plus' ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-50 text-slate-600'
                                    }`}>
                                    {plan.icon || <Cloud className="w-6 h-6" />}
                                </div>
                                <h3 className="text-2xl font-extrabold text-slate-800 mb-2">{plan.name}</h3>
                                <p className="text-slate-400 text-sm font-medium">{plan.description}</p>
                            </div>

                            <div className="flex items-baseline gap-1 mb-10">
                                <span className="text-6xl font-black text-slate-900">${plan.price}</span>
                                <span className="text-slate-400 font-bold text-lg">/mo</span>
                            </div>

                            <div className="space-y-5 mb-12">
                                {plan.features.map((feature, i) => (
                                    <div key={i} className="flex items-start gap-4">
                                        <div className={`mt-1 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${plan.highlight ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'
                                            }`}>
                                            <Check size={12} strokeWidth={4} />
                                        </div>
                                        <span className="text-slate-600 text-sm font-semibold leading-tight">{feature}</span>
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={() => handleUpgrade(plan.name)}
                                disabled={!!isLoading || userPlan === plan.name}
                                className={`w-full py-5 rounded-3xl font-black text-lg transition-all duration-300 flex items-center justify-center gap-3 active:scale-95 ${userPlan === plan.name
                                        ? "bg-slate-50 text-slate-400 cursor-not-allowed border border-slate-200"
                                        : plan.highlight
                                            ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-xl shadow-indigo-200"
                                            : "bg-white border-2 border-slate-200 text-slate-800 hover:border-indigo-600 hover:text-indigo-600"
                                    }`}
                            >
                                {isLoading === plan.name ? (
                                    <>
                                        <Loader2 className="w-6 h-6 animate-spin" />
                                        <span>Connecting...</span>
                                    </>
                                ) : (
                                    <span>{userPlan === plan.name ? "Current Active Plan" : "Get Started Now"}</span>
                                )}
                            </button>
                        </motion.div>
                    ))}
                </div>

                {/* --- FEATURES COMPARISON TABLE --- */}
                <section className="mb-32">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-black text-slate-900 mb-4">Compare Features</h2>
                        <p className="text-slate-500">A detailed look at why ProWriteAI is the right choice for you.</p>
                    </div>

                    <div className="bg-white rounded-[40px] border border-slate-200 overflow-hidden shadow-sm">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50">
                                    <th className="p-8 text-sm font-bold text-slate-400 uppercase tracking-widest">Feature</th>
                                    <th className="p-8 text-sm font-bold text-slate-900 uppercase tracking-widest">Free</th>
                                    <th className="p-8 text-sm font-bold text-indigo-600 uppercase tracking-widest">Plus</th>
                                    <th className="p-8 text-sm font-bold text-purple-600 uppercase tracking-widest">Pro</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {[
                                    { f: "Monthly AI Generations", free: "150", plus: "3,000", pro: "Unlimited*" },
                                    { f: "Brand Voice Customization", free: "No", plus: "No", pro: "Yes" },
                                    { f: "Context Window", free: "4k", plus: "32k", pro: "128k" },
                                    { f: "Priority Support", free: "No", plus: "Yes", pro: "24/7 Dedicated" },
                                    { f: "API Access", free: "No", plus: "No", pro: "Yes" },
                                ].map((row, i) => (
                                    <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="p-8 text-slate-700 font-bold">{row.f}</td>
                                        <td className="p-8 text-slate-500">{row.free}</td>
                                        <td className="p-8 text-slate-500">{row.plus}</td>
                                        <td className="p-8 text-slate-500 font-bold">{row.pro}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* --- FAQ SECTION --- */}
                <section className="max-w-3xl mx-auto mb-32">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-black text-slate-900 mb-4">Questions? We have answers.</h2>
                    </div>
                    <div className="space-y-4">
                        {faqs.map((faq, idx) => (
                            <div key={idx} className="bg-white rounded-3xl border border-slate-200 overflow-hidden">
                                <button
                                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                                    className="w-full p-6 text-left flex items-center justify-between hover:bg-slate-50 transition-colors"
                                >
                                    <span className="font-bold text-slate-800">{faq.q}</span>
                                    <ChevronDown className={`text-slate-400 transition-transform duration-300 ${openFaq === idx ? 'rotate-180' : ''}`} />
                                </button>
                                <AnimatePresence>
                                    {openFaq === idx && (
                                        <motion.div
                                            initial={{ height: 0 }}
                                            animate={{ height: "auto" }}
                                            exit={{ height: 0 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="p-6 pt-0 text-slate-500 text-sm leading-relaxed border-t border-slate-50">
                                                {faq.a}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ))}
                    </div>
                </section>

                {/* --- FOOTER TRUST SECTION --- */}
                <section className="text-center py-10">
                    <div className="flex flex-col items-center gap-8">
                        <div className="flex items-center gap-8 text-slate-300 grayscale opacity-70">
                            <Star className="w-8 h-8" />
                            <Globe className="w-8 h-8" />
                            <Lock className="w-8 h-8" />
                            <CreditCard className="w-8 h-8" />
                            <MessageCircle className="w-8 h-8" />
                            <BarChart3 className="w-8 h-8" />
                        </div>
                        <div className="flex flex-col items-center gap-4">
                            <div className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-full shadow-sm">
                                <Shield className="text-green-500 w-5 h-5" />
                                <span className="text-sm font-bold text-slate-600">Enterprise-grade security guaranteed.</span>
                            </div>
                            <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">
                                Verified by <span className="text-indigo-600">SafePay</span> Sandbox Authority
                            </p>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default Pricing;
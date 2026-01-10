import { Check, Sparkles, Zap, Shield, ArrowLeft, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { toast } from "sonner";
import { useState, useEffect } from "react";

const Pricing = () => {
    const navigate = useNavigate();
    const [userPlan, setUserPlan] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<string | null>(null);

    useEffect(() => {
        const fetchUserPlan = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('plan')
                    .eq('id', user.id)
                    .single();
                if (profile) setUserPlan(profile.plan || 'Free');
            }
        };
        fetchUserPlan();

        // Initialize SafePay when script loads
        const initSafePay = () => {
            if (window.safepay) {
                try {
                    window.safepay.setup({
                        environment: 'sandbox',
                        apiKey: 'sec_12efcfb2-706e-4401-b85f-7ec98c6d669a',
                        vpay: false
                    });
                } catch (error) {
                    console.error('SafePay setup error:', error);
                }
            }
        };

        // Try immediately
        initSafePay();

        // Also try after a delay in case script is still loading
        const timer = setTimeout(initSafePay, 1000);
        return () => clearTimeout(timer);
    }, []);

    const [showCheckoutModal, setShowCheckoutModal] = useState(false);
    const [checkoutData, setCheckoutData] = useState<any>(null);

    const handleUpgrade = async (planName: string) => {
        if (planName === 'Free') return;

        setIsLoading(planName);

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            toast.error("Please login to upgrade");
            navigate('/auth');
            setIsLoading(null);
            return;
        }

        try {
            // 1. Create SafePay checkout session
            const amount = planName === 'Pro' ? 5600 : 2800; // PKR
            const response = await fetch('/api/safepay-session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount,
                    currency: 'PKR',
                    planName,
                    userId: user.id
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('API Error:', errorData);
                throw new Error(errorData.error || 'Failed to init payment');
            }

            const data = await response.json();
            console.log('SafePay checkout created:', data);

            // 2. Show mock checkout modal
            setCheckoutData({ ...data, planName, user });
            setShowCheckoutModal(true);
            setIsLoading(null);

        } catch (error: any) {
            console.error("Payment Error:", error);
            toast.error(error.message || "Payment failed to start");
            setIsLoading(null);
        }
    };

    const handlePaymentComplete = async () => {
        if (!checkoutData) return;

        try {
            toast.info("Processing payment...");

            // Simulate payment processing
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Update Profile in Supabase
            const { error } = await supabase
                .from('profiles')
                .update({
                    plan: checkoutData.planName,
                    credits: checkoutData.planName === 'Pro' ? 200 : 100
                })
                .eq('id', checkoutData.user.id);

            if (!error) {
                toast.success(`Payment successful! Welcome to ${checkoutData.planName}! 🎉`);
                setUserPlan(checkoutData.planName);
                setShowCheckoutModal(false);
            } else {
                toast.error("Failed to update plan. Please contact support.");
            }
        } catch (error) {
            toast.error("Payment processing failed");
        }
    };

    const plans = [
        {
            name: "Free",
            price: "0",
            description: "Perfect for trying out ProwriteAI",
            features: [
                "5 Generations per day",
                "Standard AI Engine",
                "Basic Tones",
                "Email Support",
            ],
            buttonText: userPlan === "Free" || !userPlan ? "Current Plan" : "Downgrade",
            highlight: false,
        },
        {
            name: "Plus",
            price: "10",
            description: "For creators who need more power",
            features: [
                "100 Generations per day",
                "Advanced AI Engine",
                "All Writing Tones",
                "Priority Support",
                "History Storage",
            ],
            buttonText: userPlan === "Plus" ? "Current Plan" : "Upgrade to Plus",
            highlight: true,
            icon: <Zap className="w-5 h-5 text-indigo-500" />,
        },
        {
            name: "Pro",
            price: "20",
            description: "The ultimate tool for professionals",
            features: [
                "Everything in Plus",
                "200 Generations per day",
                "Custom Brand Voice",
                "API Access",
                "Dedicated Account Manager",
                "Early Access to Features",
            ],
            buttonText: userPlan === "Pro" ? "Current Plan" : "Upgrade to Pro",
            highlight: false,
            icon: <Sparkles className="w-5 h-5 text-purple-500" />,
        },
    ];

    return (
        <div className="min-h-screen bg-[#F9FAFB] text-slate-900 font-sans pb-20">
            {/* Header */}
            <nav className="p-6 md:p-10 flex items-center justify-between">
                <Link to="/dashboard" className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors font-medium">
                    <ArrowLeft size={20} />
                    <span>Back to Dashboard</span>
                </Link>
                <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-md">
                        <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xl font-bold">ProwriteAI</span>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-6 pt-10">
                <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-4 bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent italic">
                        Choose Your Power
                    </h1>
                    <p className="text-slate-500 text-lg max-w-2xl mx-auto">
                        Unlock the full potential of AI-driven copywriting. Scalable plans for every stage of your journey.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {plans.map((plan, idx) => (
                        <div
                            key={plan.name}
                            style={{ animationDelay: `${idx * 100}ms` }}
                            className={`relative bg-white rounded-[32px] p-8 transition-all duration-500 hover:scale-[1.02] ${plan.highlight
                                ? "border-2 border-indigo-600 shadow-[0_20px_50px_rgba(79,70,229,0.15)] ring-1 ring-indigo-600/10"
                                : "border border-slate-200 shadow-sm hover:shadow-xl hover:border-slate-300"
                                } animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-both`}
                        >
                            {plan.highlight && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                                    Most Popular
                                </div>
                            )}

                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className="text-2xl font-bold text-slate-800">{plan.name}</h3>
                                    <p className="text-slate-400 text-sm mt-1">{plan.description}</p>
                                </div>
                                {plan.icon && (
                                    <div className="bg-slate-50 p-3 rounded-2xl">
                                        {plan.icon}
                                    </div>
                                )}
                            </div>

                            <div className="flex items-baseline gap-1 mb-8">
                                <span className="text-5xl font-black text-slate-900">${plan.price}</span>
                                <span className="text-slate-400 font-medium">/month</span>
                            </div>

                            <div className="space-y-4 mb-10">
                                {plan.features.map((feature, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <div className={`w-5 h-5 rounded-full flex items-center justify-center ${plan.highlight ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-50 text-slate-400'}`}>
                                            <Check size={12} strokeWidth={3} />
                                        </div>
                                        <span className="text-slate-600 text-sm font-medium">{feature}</span>
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={() => handleUpgrade(plan.name)}
                                disabled={!!isLoading || userPlan === plan.name}
                                className={`w-full py-4 rounded-2xl font-bold transition-all duration-300 flex items-center justify-center gap-2 ${plan.highlight
                                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:shadow-indigo-300 active:scale-95"
                                    : userPlan === plan.name
                                        ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                                        : "bg-white border-2 border-slate-200 text-slate-700 hover:border-indigo-600 hover:text-indigo-600 active:scale-95"
                                    } ${isLoading === plan.name ? 'opacity-70' : ''}`}
                            >
                                {isLoading === plan.name && <Loader2 className="w-4 h-4 animate-spin" />}
                                {plan.buttonText}
                            </button>
                        </div>
                    ))}
                </div>

                {/* FAQ or Micro-copy */}
                <div className="mt-20 text-center animate-in fade-in duration-1000 delay-500">
                    <div className="flex flex-col items-center gap-4">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-full text-xs font-bold text-slate-500 shadow-sm">
                            <Shield size={14} className="text-green-500" />
                            <span>Secure SSL Encryption & 14-day money back guarantee</span>
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                            Payments powered by <span className="text-indigo-600">SafePay</span> Sandbox
                        </p>
                    </div>
                </div>
            </main>

            {/* SafePay Checkout Modal */}
            {showCheckoutModal && checkoutData && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-[32px] p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <Shield className="w-8 h-8 text-white" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900 mb-2">SafePay Sandbox Checkout</h2>
                            <p className="text-sm text-slate-500">Secure Payment Gateway</p>
                        </div>

                        <div className="space-y-4 mb-6">
                            <div className="bg-slate-50 rounded-2xl p-4">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-xs font-bold text-slate-400 uppercase">Plan</span>
                                    <span className="text-sm font-bold text-slate-900">{checkoutData.planName}</span>
                                </div>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-xs font-bold text-slate-400 uppercase">Amount</span>
                                    <span className="text-sm font-bold text-slate-900">PKR {checkoutData.amount}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-bold text-slate-400 uppercase">Order ID</span>
                                    <span className="text-xs font-mono text-slate-600">{checkoutData.orderId?.slice(0, 20)}...</span>
                                </div>
                            </div>

                            <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3">
                                <p className="text-xs text-indigo-700 font-medium">
                                    🧪 <strong>Sandbox Mode:</strong> This is a test payment. No real money will be charged.
                                </p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <button
                                onClick={handlePaymentComplete}
                                className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-200 hover:scale-[1.02] transition-transform active:scale-95"
                            >
                                Complete Test Payment
                            </button>
                            <button
                                onClick={() => setShowCheckoutModal(false)}
                                className="w-full py-4 bg-white border-2 border-slate-200 text-slate-700 rounded-2xl font-bold hover:border-slate-300 transition-all active:scale-95"
                            >
                                Cancel
                            </button>
                        </div>

                        <p className="text-center text-xs text-slate-400 mt-4">
                            Powered by <span className="font-bold text-indigo-600">SafePay</span> Sandbox
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Pricing;

import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CheckCircle, XCircle, ArrowRight, RefreshCw } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';

const ConfirmEmail = () => {
    const navigate = useNavigate();
    const [isVerified, setIsVerified] = useState(false);
    const [loading, setLoading] = useState(false);

    // Check verification status
    const checkVerification = async () => {
        setLoading(true);
        try {
            // Use getUser to fetch fresh user data from the server
            const { data: { user } } = await supabase.auth.getUser();

            if (user?.email_confirmed_at) {
                setIsVerified(true);
            } else {
                // Try refreshing session occasionally to sync with server identity
                await supabase.auth.refreshSession();
                setIsVerified(false);
            }
        } catch (error) {
            console.error("Error checking verification:", error);
        } finally {
            // Add a small artificial delay for better UX on button press
            setTimeout(() => setLoading(false), 500);
        }
    };

    useEffect(() => {
        checkVerification();

        // Poll every 3 seconds to auto-update when they verify
        const interval = setInterval(checkVerification, 3000);

        // Listen for auth state changes (e.g. verified in another tab)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
                if (session?.user?.email_confirmed_at) {
                    setIsVerified(true);
                }
            }
        });

        return () => {
            clearInterval(interval);
            subscription.unsubscribe();
        };
    }, []);

    const handleContinue = () => {
        if (isVerified) {
            navigate('/dashboard');
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-[#2e0653] px-4 font-sans selection:bg-purple-500 selection:text-white">
            {/* Background Glows */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/20 blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/20 blur-[120px]" />
            </div>

            <div className="w-full max-w-md space-y-8 rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl shadow-2xl text-center">

                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white/10 mb-6">
                    {isVerified ? (
                        <CheckCircle className="h-10 w-10 text-green-400" />
                    ) : (
                        <XCircle className="h-10 w-10 text-red-400" />
                    )}
                </div>

                <div className="space-y-2">
                    <h2 className="text-3xl font-extrabold tracking-tight text-white">
                        {isVerified ? "Email Verified!" : "Verify your email"}
                    </h2>
                    <p className="text-purple-200/60 text-sm">
                        {isVerified
                            ? "Your account has been successfully verified. You can now access your dashboard."
                            : "We've sent a verification link to your email. Please check your inbox and confirm your account."
                        }
                    </p>
                </div>

                <div className="space-y-4 pt-4">
                    <Button
                        onClick={handleContinue}
                        disabled={!isVerified}
                        className={`w-full py-6 text-lg font-semibold rounded-xl bg-gradient-to-r text-white transition-all ${isVerified ? 'from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 hover:scale-[1.02] shadow-[0_0_20px_rgba(34,197,94,0.4)]' : 'from-gray-600 to-gray-700 opacity-50 cursor-not-allowed'}`}
                    >
                        {isVerified ? "Continue to Dashboard" : "Waiting for verification..."}
                        {isVerified && <ArrowRight className="ml-2 h-5 w-5" />}
                    </Button>

                    {!isVerified && (
                        <button
                            onClick={checkVerification}
                            disabled={loading}
                            className="flex items-center justify-center w-full text-sm text-purple-300 hover:text-white transition-colors gap-2"
                        >
                            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                            {loading ? "Checking..." : "I've verified my email"}
                        </button>
                    )}

                    <div className="pt-4 border-t border-white/10 mt-6">
                        <p className="text-xs text-purple-200/40">
                            Wrong email? <Link to="/auth?mode=signup" className="text-purple-400 hover:text-white transition-colors">Sign up again</Link>
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ConfirmEmail;

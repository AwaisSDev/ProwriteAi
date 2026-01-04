import { useState, useEffect } from 'react';
import { Briefcase, ShoppingBag, Store, Users, Zap, TrendingUp, Target } from 'lucide-react';
import { supabase } from "../supabaseClient";
import { useNavigate } from 'react-router-dom';

export default function Onboarding() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [selectedPersona, setSelectedPersona] = useState(null);
    const [selectedNiches, setSelectedNiches] = useState([]);
    const [selectedGoal, setSelectedGoal] = useState(null);

    // Add Inter font to the document
    useEffect(() => {
        const link = document.createElement('link');
        link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap';
        link.rel = 'stylesheet';
        document.head.appendChild(link);
        document.body.style.fontFamily = "'Inter', sans-serif";
        return () => {
            document.head.removeChild(link);
        };
    }, []);

    const progress = (step / 3) * 100;

    const handleNiches = (niche) => {
        setSelectedNiches(prev =>
            prev.includes(niche)
                ? prev.filter(n => n !== niche)
                : [...prev, niche]
        );
    };

    const canContinue = () => {
        if (step === 1) return selectedPersona !== null;
        if (step === 2) return selectedNiches.length > 0;
        if (step === 3) return selectedGoal !== null;
        return false;
    };

    const handleContinue = async () => {
        if (step < 3) {
            setStep(step + 1);
        } else {
            // 1. Get the current user
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                console.error("No user found! Redirecting to auth...");
                navigate('/auth');
                return;
            }

            // 2. Prepare the data
            const onboardingData = {
                id: user.id,
                persona: selectedPersona,
                niches: selectedNiches,
                goal: selectedGoal,
                onboarding_complete: true,
                updated_at: new Date().toISOString()
            };

            console.log("Attempting to save:", onboardingData);

            // 3. Send to Supabase
            const { error } = await supabase
                .from('profiles')
                .upsert(onboardingData);

            if (error) {
                console.error("Supabase Error:", error.message);
                alert("Save failed: " + error.message);
            } else {
                console.log("Save successful!");
                navigate('/dashboard');
            }
        }
    };

    const personas = [
        { id: 'freelancer', label: 'Freelancer', icon: Briefcase },
        { id: 'dropshipper', label: 'Dropshipper', icon: ShoppingBag },
        { id: 'ecommerce', label: 'E-commerce Brand', icon: Store },
        { id: 'agency', label: 'Agency', icon: Users }
    ];

    const niches = ['Tech', 'Fashion', 'Home Decor', 'Health & Beauty', 'Food & Beverage', 'Sports & Fitness', 'Travel', 'Custom'];

    const goals = [
        { id: 'write-faster', label: 'Write faster', icon: Zap },
        { id: 'improve-seo', label: 'Improve SEO', icon: TrendingUp },
        { id: 'increase-conversions', label: 'Increase Conversions', icon: Target }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white flex items-center justify-center p-4">
            <div className="w-full max-w-2xl">
                {/* Progress Bar */}
                <div className="mb-8">
                    <div className="h-2 bg-indigo-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-indigo-600 transition-all duration-500 ease-out"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <div className="mt-2 text-sm text-indigo-600 text-center uppercase font-bold tracking-wider">
                        Step {step} of 3
                    </div>
                </div>

                {/* Main Card */}
                <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 border border-indigo-50">
                    {/* Screen 1: Persona Selection */}
                    {step === 1 && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="text-center">
                                <h1 className="text-3xl font-bold mb-2 text-gray-900">Tell us about yourself</h1>
                                <p className="text-gray-500">Select the option that best describes you</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {personas.map(persona => {
                                    const Icon = persona.icon;
                                    const isSelected = selectedPersona === persona.id;
                                    return (
                                        <button
                                            key={persona.id}
                                            onClick={() => setSelectedPersona(persona.id)}
                                            className={`p-6 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-4 hover:shadow-md ${isSelected
                                                ? 'border-indigo-600 bg-indigo-50 shadow-md'
                                                : 'border-gray-100 bg-white hover:border-indigo-200'
                                                }`}
                                        >
                                            <div className={`p-4 rounded-full ${isSelected ? 'bg-indigo-600' : 'bg-indigo-100'}`}>
                                                <Icon className={`w-8 h-8 ${isSelected ? 'text-white' : 'text-indigo-600'}`} />
                                            </div>
                                            <span className="font-semibold text-gray-900">{persona.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Screen 2: Niche Selection */}
                    {step === 2 && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="text-center">
                                <h1 className="text-3xl font-bold mb-2 text-gray-900">What is your niche?</h1>
                                <p className="text-gray-500">Select all that apply</p>
                            </div>

                            <div className="flex flex-wrap gap-3 justify-center">
                                {niches.map(niche => {
                                    const isSelected = selectedNiches.includes(niche);
                                    return (
                                        <button
                                            key={niche}
                                            onClick={() => handleNiches(niche)}
                                            className={`px-6 py-3 rounded-full border-2 font-medium transition-all duration-200 ${isSelected
                                                ? 'border-indigo-600 bg-indigo-600 text-white shadow-md'
                                                : 'border-gray-200 bg-white text-gray-700 hover:border-indigo-300'
                                                }`}
                                        >
                                            {niche}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Screen 3: Goal Setting */}
                    {step === 3 && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="text-center">
                                <h1 className="text-3xl font-bold mb-2 text-gray-900">What is your main goal?</h1>
                                <p className="text-gray-500">Choose one to get started</p>
                            </div>

                            <div className="space-y-4">
                                {goals.map(goal => {
                                    const Icon = goal.icon;
                                    const isSelected = selectedGoal === goal.id;
                                    return (
                                        <button
                                            key={goal.id}
                                            onClick={() => setSelectedGoal(goal.id)}
                                            className={`w-full p-6 rounded-xl border-2 transition-all duration-200 flex items-center gap-4 hover:shadow-md ${isSelected
                                                ? 'border-indigo-600 bg-indigo-50 shadow-md'
                                                : 'border-gray-100 bg-white hover:border-indigo-200'
                                                }`}
                                        >
                                            <div className={`p-3 rounded-full ${isSelected ? 'bg-indigo-600' : 'bg-indigo-100'}`}>
                                                <Icon className={`w-6 h-6 ${isSelected ? 'text-white' : 'text-indigo-600'}`} />
                                            </div>
                                            <span className="font-semibold text-gray-900">{goal.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Continue Button */}
                    <div className="mt-8 pt-8 border-t border-gray-100">
                        <button
                            onClick={handleContinue}
                            disabled={!canContinue()}
                            className={`w-full py-4 rounded-xl font-bold transition-all duration-200 ${canContinue()
                                ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg'
                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                }`}
                        >
                            {/* Change the text here so it feels like the FINAL step of the setup */}
                            {step === 3 ? 'Complete Setup' : 'Continue'}
                        </button>
                    </div>
                </div>

                {/* Brand Name */}
                <div className="text-center mt-8">
                    <p className="text-indigo-600 font-bold tracking-widest uppercase text-xs">ProwriteAI</p>
                </div>
            </div>
        </div>
    );
}
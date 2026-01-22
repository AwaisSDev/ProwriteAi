import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Pricing = () => {
    const navigate = useNavigate();

    useEffect(() => {
        // Platform is now free! Redirect to dashboard.
        navigate('/dashboard');
    }, [navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="text-center">
                <h1 className="text-2xl font-bold mb-4 text-slate-800">ProwriteAI is now fully Free! 🎉</h1>
                <p className="text-slate-500">Redirecting you to the dashboard...</p>
            </div>
        </div>
    );
};

export default Pricing;

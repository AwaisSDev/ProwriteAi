import { useState, useEffect } from "react";
import { Shield, ArrowLeft, Search, Mail, User, Clock, CheckCircle2, XCircle, Loader2, Lock, Eye } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { toast } from "sonner";

export default function AdminSupport() {
    const navigate = useNavigate();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState("");
    const [tickets, setTickets] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [filter, setFilter] = useState("All");
    const [replyingTo, setReplyingTo] = useState<any>(null);
    const [replyText, setReplyText] = useState("");
    const [isSendingReply, setIsSendingReply] = useState(false);

    const ADMIN_PASS = "prowrite_master_2024";

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === ADMIN_PASS) {
            setIsAuthenticated(true);
            toast.success("Terminal Authorised.");
            fetchGlobalTickets();
        } else {
            toast.error("Access Denied.");
        }
    };

    const fetchGlobalTickets = async () => {
        setIsLoading(true);
        const { data, error } = await supabase
            .from('support_tickets')
            .select('*')
            .order('created_at', { ascending: false });

        if (!error) {
            setTickets(data || []);
        }
        setIsLoading(false);
    };

    const updateTicketStatus = async (id: any, newStatus: string) => {
        const { error } = await supabase
            .from('support_tickets')
            .update({ status: newStatus })
            .eq('id', id);

        if (!error) {
            toast.success(`Marked as ${newStatus}`);
            setTickets(tickets.map(t => t.id === id ? { ...t, status: newStatus } : t));
        }
    };

    const handleSendReply = async (id: any) => {
        if (!replyText.trim()) return;
        setIsSendingReply(true);
        console.log("Attempting to reply to ticket:", id, "with text:", replyText);

        const { data, error } = await supabase
            .from('support_tickets')
            .update({
                admin_reply: replyText,
                status: 'Solved'
            })
            .eq('id', id)
            .select(); // This is crucial to see if it actually changed

        if (!error && data && data.length > 0) {
            console.log("Success! Data updated:", data);
            toast.success("Reply Transmitted Successfully.");
            setTickets(tickets.map(t => t.id === id ? { ...t, admin_reply: replyText, status: 'Solved' } : t));
            setReplyingTo(null);
            setReplyText("");
        } else {
            console.error("Supabase Update Failed:", error);
            const msg = error?.message || (data?.length === 0 ? "Permission Denied (RLS Block)" : "Unknown Sync Error");
            toast.error(`Terminal Error: ${msg}`, {
                duration: 5000,
            });
        }
        setIsSendingReply(false);
    };

    const filteredTickets = tickets.filter(t =>
        filter === "All" ? true : t.status === filter
    );

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]">
                <div className="max-w-md w-full bg-white/5 backdrop-blur-xl p-10 rounded-[40px] border border-white/10 shadow-2xl text-center space-y-8">
                    <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-indigo-500/40 rotate-3">
                        <Lock className="text-white w-10 h-10" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-white mb-2 uppercase tracking-widest">Admin Terminal</h1>
                        <p className="text-slate-400 text-sm font-medium">Restricted Access.</p>
                    </div>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter Passcode..."
                            className="w-full h-14 px-6 bg-white/5 rounded-2xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-white text-center text-lg"
                        />
                        <button className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black uppercase tracking-widest transition-all active:scale-95">
                            Authorize Access
                        </button>
                    </form>
                    <Link to="/dashboard" className="block text-slate-500 text-xs font-bold hover:text-slate-300 transition-colors">
                        ← Exit
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F4F4F9] text-slate-900 font-sans pb-20">
            <div className="bg-slate-900 text-white p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 border-b border-indigo-500/20 shadow-xl">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center">
                        <Shield size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black tracking-tight leading-none">Command Center</h1>
                        <p className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Priority Support System</p>
                    </div>
                </div>

                <div className="flex items-center gap-2 bg-white/5 p-1 rounded-2xl border border-white/5">
                    {['All', 'Open', 'Solved'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === f ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'
                                }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>

                <Link to="/dashboard" className="text-slate-400 hover:text-white transition-colors text-sm font-bold flex items-center gap-2">
                    <ArrowLeft size={16} /> Exit Terminal
                </Link>
            </div>

            <main className="max-w-6xl mx-auto p-6 md:p-10">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-40 space-y-4">
                        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
                        <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Syncing Database...</p>
                    </div>
                ) : filteredTickets.length === 0 ? (
                    <div className="text-center py-40 space-y-4">
                        <CheckCircle2 className="text-slate-200 mx-auto" size={60} />
                        <p className="text-slate-400 font-bold italic">Queue is currently empty.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-8">
                        {filteredTickets.map((ticket) => (
                            <div key={ticket.id} className="bg-white rounded-[32px] p-8 border border-slate-200 shadow-sm hover:shadow-xl transition-all relative overflow-hidden group">
                                <div className={`absolute top-0 left-0 w-1.5 h-full ${ticket.priority === 'Urgent' ? 'bg-purple-600' : 'bg-indigo-600'
                                    }`} />

                                <div className="flex flex-col md:flex-row justify-between gap-10">
                                    <div className="flex-1 space-y-6">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${ticket.status === 'Open' ? 'bg-indigo-100 text-indigo-600' : 'bg-green-100 text-green-600'
                                                    }`}>
                                                    {ticket.status}
                                                </span>
                                                <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                                                    ID: {ticket.user_id.substring(0, 8)}
                                                </span>
                                            </div>
                                            <div className="text-slate-400 text-xs font-medium flex items-center gap-1">
                                                <Clock size={12} /> {new Date(ticket.created_at).toLocaleDateString()}
                                            </div>
                                        </div>

                                        <div>
                                            <h2 className="text-2xl font-black text-slate-900 mb-3">{ticket.subject}</h2>
                                            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 italic text-slate-600 leading-relaxed font-medium">
                                                "{ticket.message}"
                                            </div>
                                        </div>

                                        {ticket.admin_reply && (
                                            <div className="space-y-2 animate-in fade-in duration-500">
                                                <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest flex items-center gap-2">
                                                    <Shield size={12} fill="currentColor" /> Outgoing Response
                                                </p>
                                                <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100 text-indigo-700 font-bold text-sm leading-relaxed">
                                                    {ticket.admin_reply}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="md:w-64 flex flex-col gap-3 pt-6 md:pt-0">
                                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status Control</h3>
                                        <button
                                            onClick={() => updateTicketStatus(ticket.id, 'Solved')}
                                            disabled={ticket.status === 'Solved'}
                                            className="w-full py-4 bg-green-500 hover:bg-green-600 disabled:opacity-30 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all"
                                        >
                                            Mark Solved
                                        </button>

                                        <button
                                            onClick={() => updateTicketStatus(ticket.id, 'Open')}
                                            disabled={ticket.status === 'Open'}
                                            className="w-full py-4 border border-slate-200 hover:border-indigo-600 hover:text-indigo-600 disabled:opacity-30 text-slate-400 rounded-2xl font-black text-xs uppercase tracking-widest transition-all"
                                        >
                                            Re-open Ticket
                                        </button>

                                        {replyingTo === ticket.id ? (
                                            <div className="space-y-3 animate-in slide-in-from-top-2 duration-300">
                                                <textarea
                                                    value={replyText}
                                                    onChange={(e) => setReplyText(e.target.value)}
                                                    placeholder="Type your official response..."
                                                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 resize-none h-32"
                                                />
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleSendReply(ticket.id)}
                                                        disabled={isSendingReply}
                                                        className="flex-1 py-3 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase hover:bg-indigo-700 disabled:opacity-50"
                                                    >
                                                        {isSendingReply ? 'Sending...' : 'Transmit'}
                                                    </button>
                                                    <button
                                                        onClick={() => { setReplyingTo(null); setReplyText(""); }}
                                                        className="px-4 bg-slate-100 text-slate-500 rounded-xl text-[10px] font-black uppercase hover:bg-slate-200"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => setReplyingTo(ticket.id)}
                                                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all"
                                            >
                                                Quick Reply
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}

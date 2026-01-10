import React, { useState } from 'react';
import { Sparkles, Download, Copy, Sun, Moon, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const LogoAsset = () => {
    const [bgColor, setBgColor] = useState('bg-slate-950');
    const [logoSize, setLogoSize] = useState(1000);
    const [showCircle, setShowCircle] = useState(true);

    const toggleBg = () => {
        const colors = ['bg-slate-950', 'bg-white', 'bg-green-500', 'bg-[#0f172a]'];
        const nextIndex = (colors.indexOf(bgColor) + 1) % colors.length;
        setBgColor(colors[nextIndex]);
    };

    const getLogoSvg = () => document.getElementById('main-logo-svg');

    const downloadPNG = () => {
        const svg = getLogoSvg();
        if (!svg) return;

        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        const exportSize = 2048;
        canvas.width = exportSize;
        canvas.height = exportSize;

        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);

        img.onload = () => {
            if (ctx) {
                ctx.clearRect(0, 0, exportSize, exportSize);
                ctx.drawImage(img, 0, 0, exportSize, exportSize);
                const pngUrl = canvas.toDataURL('image/png');
                const downloadLink = document.createElement('a');
                downloadLink.href = pngUrl;
                downloadLink.download = `prowrite-logo-ultra.png`;
                document.body.appendChild(downloadLink);
                downloadLink.click();
                document.body.removeChild(downloadLink);
                URL.revokeObjectURL(url);
            }
        };
        img.src = url;
    };

    const downloadICO = () => {
        const svg = getLogoSvg();
        if (!svg) return;

        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;

        const svgData = new XMLSerializer().serializeToString(svg);
        const img = new Image();
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);

        img.onload = () => {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.clearRect(0, 0, 512, 512);
                ctx.drawImage(img, 0, 0, 512, 512);
                const pngUrl = canvas.toDataURL('image/png');
                const downloadLink = document.createElement('a');
                downloadLink.href = pngUrl;
                downloadLink.download = `prowrite-favicon-ultra.ico`;
                downloadLink.click();
            }
            URL.revokeObjectURL(url);
        };
        img.src = url;
    };

    return (
        <div className={`min-h-screen ${bgColor} flex flex-col items-center justify-center p-8 transition-colors duration-500`}>
            {/* Controls */}
            <div className="fixed top-8 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-white/10 backdrop-blur-md p-2 rounded-2xl border border-white/20 shadow-2xl z-50">
                <Button variant="ghost" size="icon" onClick={() => setLogoSize(prev => Math.max(100, prev - 200))} className="text-white hover:bg-white/20">
                    <span className="text-xl font-bold">-</span>
                </Button>
                <div className="px-4 text-white font-medium min-w-[80px] text-center">{logoSize}px</div>
                <Button variant="ghost" size="icon" onClick={() => setLogoSize(prev => Math.min(3000, prev + 200))} className="text-white hover:bg-white/20">
                    <span className="text-xl font-bold">+</span>
                </Button>
                <div className="w-[1px] h-6 bg-white/20" />
                <Button variant="ghost" size="icon" onClick={toggleBg} className="text-white hover:bg-white/20" title="Toggle Page Background">
                    {bgColor === 'bg-white' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                </Button>
                <div className="w-[1px] h-6 bg-white/20" />
                <Button
                    variant={showCircle ? "secondary" : "ghost"}
                    className="text-white hover:bg-white/20 px-3 gap-2"
                    onClick={() => setShowCircle(!showCircle)}
                >
                    {showCircle ? "Hide Circle" : "Show Circle"}
                </Button>
                <div className="w-[1px] h-6 bg-white/20" />
                <Button
                    variant="ghost"
                    className="text-white hover:bg-white/20 px-3 gap-2"
                    onClick={downloadPNG}
                >
                    <Download className="w-4 h-4" /> 2K PNG
                </Button>
                <Button
                    variant="ghost"
                    className="text-white hover:bg-white/20 px-3 gap-2"
                    onClick={downloadICO}
                >
                    <Maximize2 className="w-4 h-4" /> HQ ICO
                </Button>
                <Button
                    variant="ghost"
                    className="text-white hover:bg-white/20 px-3 gap-2"
                    onClick={() => {
                        const svg = getLogoSvg()?.outerHTML;
                        if (svg) navigator.clipboard.writeText(svg);
                    }}
                >
                    <Copy className="w-4 h-4" /> SVG
                </Button>
            </div>

            {/* Logo Canvas */}
            <div className="relative group">
                <div
                    id="logo-export-area"
                    style={{
                        width: `${logoSize}px`,
                        height: `${logoSize}px`,
                    }}
                    className="relative flex items-center justify-center animate-scale-in"
                >
                    {/* The Full Logo SVG */}
                    <svg
                        id="main-logo-svg"
                        width="100%"
                        height="100%"
                        viewBox="0 0 100 100"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="relative z-10 drop-shadow-[0_20px_50px_rgba(0,0,0,0.3)]"
                    >
                        <defs>
                            <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#4f46e5" />
                                <stop offset="40%" stopColor="#a855f7" />
                                <stop offset="100%" stopColor="#06b6d4" />
                            </linearGradient>
                            <filter id="logoGlow" x="-20%" y="-20%" width="140%" height="140%">
                                <feGaussianBlur stdDeviation="1.5" result="blur" />
                                <feComposite in="SourceGraphic" in2="blur" operator="over" />
                            </filter>
                        </defs>

                        {/* Background Circle */}
                        {showCircle && (
                            <>
                                <circle cx="50" cy="50" r="48" fill="url(#logoGradient)" />
                                {/* Inner subtle shadow for depth */}
                                <circle cx="50" cy="50" r="48" fill="black" fillOpacity="0.1" />
                            </>
                        )}

                        {/* Main Center Spark */}
                        <path
                            d="M50 20C50 36 44 44 20 50C44 56 50 64 50 80C50 64 56 56 80 50C56 44 50 36 50 20Z"
                            fill="white"
                            filter="url(#logoGlow)"
                        />

                        {/* Top Right Spark */}
                        <path
                            d="M72 28C72 34 69 37 63 38.5C69 40 72 43 72 49C72 43 75 40 81 38.5C75 37 72 34 72 28Z"
                            fill="white"
                            fillOpacity="0.9"
                        />

                        {/* Bottom Left Dot/Spark */}
                        <circle cx="32" cy="68" r="2.5" fill="white" fillOpacity="0.8" />
                    </svg>

                    {/* Outer Glow Ring for UI Only (not in SVG) */}
                    <div className="absolute inset-[-10%] rounded-full bg-indigo-500/20 blur-[100px] pointer-events-none opacity-50" />
                </div>
            </div>

            {/* Info */}
            <div className="mt-12 text-center text-white/50 space-y-2 animate-fade-in delay-300">
                <h1 className="text-2xl font-bold text-white tracking-tight">ProwriteAI Ultra-HD Asset</h1>
                <p>Resolution: {logoSize} x {logoSize} (SVG Vector Based)</p>
                <p className="text-sm">Screenshot this page at full screen for maximum quality.</p>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                @media print {
                    body * { visibility: hidden; }
                    .relative.group, .relative.group * { visibility: visible; }
                    .relative.group { position: absolute; left: 0; top: 0; }
                }
            `}} />
        </div>
    );
};

export default LogoAsset;

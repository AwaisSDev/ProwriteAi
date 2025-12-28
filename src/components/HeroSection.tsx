import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Zap, Star } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen gradient-hero overflow-hidden pt-16">
      {/* Floating decorative elements */}
      <div className="absolute top-32 left-10 w-20 h-20 rounded-full bg-primary/10 float-animation" />
      <div className="absolute top-48 right-20 w-32 h-32 rounded-full bg-secondary/10 float-animation-delayed" />
      <div className="absolute bottom-40 left-1/4 w-16 h-16 rounded-full bg-accent/30 float-animation" />
      <div className="absolute top-1/3 right-1/4 w-24 h-24 rounded-full bg-primary/5 float-animation-delayed" />

      <div className="container mx-auto px-6 flex flex-col items-center justify-center min-h-screen text-center relative z-10">
        {/* Badge */}
        <div className="animate-fade-in-up opacity-0 mb-6">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent border border-primary/20 text-sm font-medium text-accent-foreground">
            <Sparkles className="w-4 h-4 text-primary" />
            AI-Powered Product Descriptions
          </span>
        </div>

        {/* Main headline */}
        <h1 className="animate-fade-in-up opacity-0 delay-100 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight max-w-4xl mb-6">
          Transform Products into{" "}
          <span className="gradient-text">Compelling Stories</span>
        </h1>

        {/* Subtext */}
        <p className="animate-fade-in-up opacity-0 delay-200 text-lg sm:text-xl text-muted-foreground max-w-2xl mb-10">
          Generate high-converting product descriptions in seconds. 
          Our AI understands your brand voice and creates copy that sells.
        </p>

        {/* CTA Buttons */}
        <div className="animate-fade-in-up opacity-0 delay-300 flex flex-col sm:flex-row gap-4">
          <Button variant="hero" size="lg" className="group">
            Start Free Trial
            <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
          </Button>
          <Button variant="outline" size="lg">
            Watch Demo
          </Button>
        </div>

        {/* Trust badges */}
        <div className="animate-fade-in-up opacity-0 delay-400 mt-16 flex flex-col items-center gap-4">
          <p className="text-sm text-muted-foreground">Trusted by 10,000+ e-commerce brands</p>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-1">
              <Zap className="w-5 h-5 text-secondary" />
              <span className="text-sm font-medium text-foreground">Lightning Fast</span>
            </div>
            <div className="w-px h-4 bg-border" />
            <div className="flex items-center gap-1">
              <Star className="w-5 h-5 text-secondary fill-secondary" />
              <span className="text-sm font-medium text-foreground">4.9/5 Rating</span>
            </div>
            <div className="w-px h-4 bg-border hidden sm:block" />
            <div className="hidden sm:flex items-center gap-1">
              <Sparkles className="w-5 h-5 text-secondary" />
              <span className="text-sm font-medium text-foreground">50M+ Descriptions</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

export default HeroSection;

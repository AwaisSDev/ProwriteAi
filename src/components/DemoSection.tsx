import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sparkles, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";

const sampleDescriptions: Record<string, string> = {
  "wireless headphones": "Experience audio perfection with our premium wireless headphones. Featuring advanced noise-cancellation technology, 40-hour battery life, and ultra-soft memory foam ear cushions, these headphones deliver studio-quality sound wherever you go. The sleek, minimalist design pairs seamlessly with any style, while Bluetooth 5.3 ensures rock-solid connectivity. Perfect for music lovers, gamers, and professionals who demand the best.",
  "running shoes": "Engineered for champions, these lightweight running shoes combine cutting-edge cushioning technology with breathable mesh construction. The responsive foam midsole returns energy with every stride, while the grippy outsole provides confident traction on any surface. Whether you're crushing a marathon or enjoying a morning jog, experience the perfect blend of comfort, support, and style.",
  "coffee maker": "Start every morning with barista-quality coffee from the comfort of your kitchen. This premium coffee maker features precision temperature control, programmable brewing schedules, and a sleek stainless steel design that elevates any countertop. The advanced extraction system unlocks the full flavor potential of your favorite beans, delivering rich, aromatic coffee in minutes.",
  default: "Enter your product name above and click 'Generate' to see AI-powered description magic in action. Our advanced language model will craft compelling, conversion-focused copy tailored to your product.",
};

const DemoSection = () => {
  const [productName, setProductName] = useState("");
  const [description, setDescription] = useState(sampleDescriptions.default);
  const [isGenerating, setIsGenerating] = useState(false);
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const generateDescription = () => {
    if (!productName.trim()) return;
    
    setIsGenerating(true);
    setDisplayedText("");
    
    setTimeout(() => {
      const key = productName.toLowerCase();
      const newDescription = sampleDescriptions[key] || 
        `Discover the extraordinary ${productName} – meticulously crafted for those who appreciate quality and innovation. This premium product combines exceptional functionality with stunning design, making it the perfect choice for discerning customers. Built with premium materials and backed by our satisfaction guarantee, the ${productName} is designed to exceed your expectations and enhance your everyday life.`;
      
      setDescription(newDescription);
      setIsGenerating(false);
      setIsTyping(true);
    }, 1500);
  };

  useEffect(() => {
    if (isTyping && displayedText.length < description.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(description.slice(0, displayedText.length + 1));
      }, 20);
      return () => clearTimeout(timeout);
    } else if (displayedText.length === description.length) {
      setIsTyping(false);
    }
  }, [isTyping, displayedText, description]);

  useEffect(() => {
    if (!isTyping && !isGenerating) {
      setDisplayedText(description);
    }
  }, []);

  return (
    <section id="demo" className="py-24 bg-muted/30 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-20 right-10 w-40 h-40 rounded-full bg-secondary/10 float-animation" />
      <div className="absolute bottom-20 left-10 w-32 h-32 rounded-full bg-primary/10 float-animation-delayed" />

      <div className="container mx-auto px-6 relative z-10">
        {/* Section header */}
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-1.5 rounded-full bg-accent text-accent-foreground text-sm font-medium mb-4">
            Interactive Demo
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            See the <span className="gradient-text">Magic</span> in Action
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Try it yourself! Enter a product name and watch as our AI generates a compelling description.
          </p>
        </div>

        {/* Demo card */}
        <Card className="max-w-3xl mx-auto p-8 gradient-card border-border/50">
          {/* Input section */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <input
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="Enter product name (e.g., wireless headphones)"
              className="flex-1 h-12 px-5 rounded-xl bg-background border border-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all duration-300"
              onKeyDown={(e) => e.key === "Enter" && generateDescription()}
            />
            <Button
              onClick={generateDescription}
              disabled={isGenerating || !productName.trim()}
              className="h-12 min-w-[140px]"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate
                </>
              )}
            </Button>
          </div>

          {/* Output section */}
          <div className="relative">
            <div className="absolute -top-3 left-4 px-2 bg-card text-xs font-medium text-muted-foreground">
              Generated Description
            </div>
            <div className="p-6 rounded-xl border border-border bg-background/50 min-h-[160px]">
              <p className="text-foreground leading-relaxed">
                {displayedText}
                {isTyping && (
                  <span className="inline-block w-0.5 h-5 bg-primary ml-1 animate-pulse" />
                )}
              </p>
            </div>
          </div>

          {/* Quick suggestions */}
          <div className="mt-6 flex flex-wrap gap-2">
            <span className="text-sm text-muted-foreground">Try:</span>
            {["wireless headphones", "running shoes", "coffee maker"].map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => {
                  setProductName(suggestion);
                }}
                className="px-3 py-1 rounded-full text-sm bg-accent text-accent-foreground hover:bg-primary/10 hover:text-primary transition-all duration-300"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </Card>
      </div>
    </section>
  );
};

export default DemoSection;

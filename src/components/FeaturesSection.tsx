import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Zap, Globe, Palette, BarChart3, Shield } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const features = [
  {
    icon: Sparkles,
    title: "AI-Powered Writing",
    description: "Advanced language models trained on millions of successful product listings to craft compelling descriptions.",
  },
  {
    icon: Zap,
    title: "Instant Generation",
    description: "Get polished, SEO-optimized descriptions in under 3 seconds. No more writer's block.",
  },
  {
    icon: Globe,
    title: "Multi-Language Support",
    description: "Generate descriptions in 25+ languages while maintaining your brand's unique voice and tone.",
  },
  {
    icon: Palette,
    title: "Brand Voice Matching",
    description: "Train the AI on your existing content to perfectly match your established brand personality.",
  },
  {
    icon: BarChart3,
    title: "SEO Optimization",
    description: "Every description is crafted with search engines in mind, boosting your organic visibility.",
  },
  {
    icon: Shield,
    title: "Plagiarism-Free",
    description: "100% unique content guaranteed. Every description is original and copyright-safe.",
  },
];

const FeaturesSection = () => {
  const [visibleCards, setVisibleCards] = useState<number[]>([]);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.getAttribute("data-index") || "0");
            setVisibleCards((prev) => [...new Set([...prev, index])]);
          }
        });
      },
      { threshold: 0.2, rootMargin: "0px 0px -50px 0px" }
    );

    const cards = sectionRef.current?.querySelectorAll("[data-index]");
    cards?.forEach((card) => observer.observe(card));

    return () => observer.disconnect();
  }, []);

  return (
    <section id="features" className="py-24 bg-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-6 relative z-10" ref={sectionRef}>
        {/* Section header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-accent text-accent-foreground text-sm font-medium mb-4">
            Features
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            Everything You Need to{" "}
            <span className="gradient-text">Scale Your Store</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Powerful features designed to help you create product descriptions that convert browsers into buyers.
          </p>
        </div>

        {/* Features grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card
              key={index}
              data-index={index}
              className={`gradient-card border-border/50 transition-all duration-700 ${
                visibleCards.includes(index)
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-foreground">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;

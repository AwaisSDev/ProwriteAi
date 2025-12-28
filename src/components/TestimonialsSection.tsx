import { Card } from "@/components/ui/card";
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { useState, useEffect } from "react";

const testimonials = [
  {
    name: "Sarah Mitchell",
    role: "E-commerce Director",
    company: "StyleHub",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face",
    content: "ProwriteAI has completely transformed our product listing workflow. What used to take our team hours now takes minutes. The quality of descriptions is incredible – our conversion rate increased by 34% in the first month.",
    rating: 5,
  },
  {
    name: "Michael Chen",
    role: "Founder & CEO",
    company: "TechGear Pro",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
    content: "As someone who manages over 5,000 SKUs, finding a tool that maintains quality at scale was crucial. ProwriteAI delivers consistently excellent copy that matches our brand voice perfectly.",
    rating: 5,
  },
  {
    name: "Emma Rodriguez",
    role: "Marketing Manager",
    company: "BeautyBox",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
    content: "The multi-language feature is a game-changer for our international expansion. We launched in 12 new markets with perfectly translated, culturally-adapted product descriptions.",
    rating: 5,
  },
  {
    name: "David Park",
    role: "Head of Operations",
    company: "FreshMart",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face",
    content: "The ROI was immediate. We reduced our content creation costs by 70% while actually improving the quality of our product pages. Our customers love the detailed, engaging descriptions.",
    rating: 5,
  },
];

const TestimonialsSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const goToNext = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const goToPrev = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section id="testimonials" className="py-24 bg-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/2 left-0 w-[600px] h-[600px] -translate-y-1/2 bg-primary/5 rounded-full blur-3xl -translate-x-1/2" />
      <div className="absolute top-1/2 right-0 w-[600px] h-[600px] -translate-y-1/2 bg-secondary/5 rounded-full blur-3xl translate-x-1/2" />

      <div className="container mx-auto px-6 relative z-10">
        {/* Section header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-accent text-accent-foreground text-sm font-medium mb-4">
            Testimonials
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            Loved by <span className="gradient-text">10,000+ Brands</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            See what our customers have to say about transforming their e-commerce with ProwriteAI.
          </p>
        </div>

        {/* Testimonial carousel */}
        <div className="max-w-4xl mx-auto relative">
          {/* Navigation buttons */}
          <button
            onClick={goToPrev}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-12 w-10 h-10 rounded-full bg-card border border-border shadow-soft flex items-center justify-center text-muted-foreground hover:text-foreground hover:shadow-card transition-all duration-300 z-10"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-12 w-10 h-10 rounded-full bg-card border border-border shadow-soft flex items-center justify-center text-muted-foreground hover:text-foreground hover:shadow-card transition-all duration-300 z-10"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Testimonial card */}
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {testimonials.map((testimonial, index) => (
                <Card
                  key={index}
                  className="w-full flex-shrink-0 p-8 md:p-10 gradient-card border-border/50"
                >
                  <div className="flex flex-col items-center text-center">
                    {/* Quote icon */}
                    <Quote className="w-10 h-10 text-primary/20 mb-6" />

                    {/* Rating */}
                    <div className="flex gap-1 mb-6">
                      {Array.from({ length: testimonial.rating }).map((_, i) => (
                        <Star key={i} className="w-5 h-5 text-secondary fill-secondary" />
                      ))}
                    </div>

                    {/* Content */}
                    <p className="text-lg md:text-xl text-foreground leading-relaxed mb-8">
                      "{testimonial.content}"
                    </p>

                    {/* Author */}
                    <div className="flex items-center gap-4">
                      <img
                        src={testimonial.image}
                        alt={testimonial.name}
                        className="w-14 h-14 rounded-full object-cover border-2 border-primary/20"
                      />
                      <div className="text-left">
                        <p className="font-semibold text-foreground">{testimonial.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {testimonial.role} at {testimonial.company}
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Dots indicator */}
          <div className="flex justify-center gap-2 mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setIsAutoPlaying(false);
                  setCurrentIndex(index);
                }}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? "bg-primary w-8"
                    : "bg-border hover:bg-muted-foreground"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;

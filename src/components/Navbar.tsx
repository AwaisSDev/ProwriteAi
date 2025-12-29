import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { Link } from "react-router-dom"; // Added this

const Navbar = () => {
  return (
<nav className="fixed top-4 left-0 right-0 z-50 mx-auto max-w-7xl px-4">
  <div className="rounded-2xl bg-background/30 backdrop-blur-xl border border-white/10 px-6 h-16 w-150 flex items-center justify-between shadow-2xl">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-xl gradient-bg flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-foreground">ProwriteAI</span>
        </Link>
        
        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors duration-300">Features</a>
          <a href="#demo" className="text-muted-foreground hover:text-foreground transition-colors duration-300">Demo</a>
          <a href="#testimonials" className="text-muted-foreground hover:text-foreground transition-colors duration-300">Testimonials</a>
        </div>

        <div className="flex items-center gap-3">
          {/* Wrapped your Log in button */}
          <Link to="/auth">
            <Button variant="ghost" size="sm" className="hidden sm:inline-flex">
              Log in
            </Button>
          </Link>

          {/* Wrapped your Get Started button */}
          <Link to="/Dashboard">
            <Button size="sm">
              Get Started
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
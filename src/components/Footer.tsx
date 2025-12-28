import { Sparkles, Twitter, Linkedin, Github, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

const footerLinks = {
  product: [
    { label: "Features", href: "#features" },
    { label: "Pricing", href: "#" },
    { label: "Demo", href: "#demo" },
    { label: "API", href: "#" },
  ],
  company: [
    { label: "About", href: "#" },
    { label: "Blog", href: "#" },
    { label: "Careers", href: "#" },
    { label: "Press", href: "#" },
  ],
  resources: [
    { label: "Documentation", href: "#" },
    { label: "Help Center", href: "#" },
    { label: "Tutorials", href: "#" },
    { label: "Status", href: "#" },
  ],
  legal: [
    { label: "Privacy", href: "#" },
    { label: "Terms", href: "#" },
    { label: "Security", href: "#" },
  ],
};

const socialLinks = [
  { icon: Twitter, href: "#", label: "Twitter" },
  { icon: Linkedin, href: "#", label: "LinkedIn" },
  { icon: Github, href: "#", label: "GitHub" },
  { icon: Mail, href: "#", label: "Email" },
];

const Footer = () => {
  return (
    <footer className="gradient-footer text-primary-foreground pt-20 pb-8 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-white/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-6 relative z-10">
        {/* CTA Section */}
        <div className="text-center mb-16 pb-16 border-b border-white/10">
          <h3 className="text-3xl sm:text-4xl font-bold mb-4">
            Ready to Transform Your Product Listings?
          </h3>
          <p className="text-lg text-white/70 mb-8 max-w-xl mx-auto">
            Join thousands of e-commerce brands using ProwriteAI to create compelling product descriptions.
          </p>
          <Button 
            size="lg" 
            className="bg-primary text-white font-semibold hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border-0"
          >
            Start Your Free Trial
          </Button>
        </div>

        {/* Links grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-16">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-1">
            <a href="#" className="flex items-center gap-2 mb-4 group">
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">ProwriteAI</span>
            </a>
            <p className="text-sm text-white/60 mb-6">
              AI-powered product descriptions that convert.
            </p>
            {/* Social links */}
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center text-white/70 hover:bg-white/20 hover:text-white transition-all duration-300"
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Product links */}
          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-white/60 hover:text-white transition-colors duration-300"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company links */}
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-white/60 hover:text-white transition-colors duration-300"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources links */}
          <div>
            <h4 className="font-semibold mb-4">Resources</h4>
            <ul className="space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-white/60 hover:text-white transition-colors duration-300"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal links */}
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-white/60 hover:text-white transition-colors duration-300"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-white/50">
            © {new Date().getFullYear()} ProwriteAI. All rights reserved.
          </p>
          <p className="text-sm text-white/50">
            Made By Prowrite Inc
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

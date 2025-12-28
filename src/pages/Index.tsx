import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import BrandStrip from "@/components/BrandStrip";
import FeaturesSection from "@/components/FeaturesSection";
import DemoSection from "@/components/DemoSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import Footer from "@/components/Footer";
import { Helmet } from "react-helmet-async";

const Index = () => {
  return (
    <>
      <Helmet>
        <title>DescribeAI - AI-Powered E-commerce Product Descriptions</title>
        <meta 
          name="description" 
          content="Generate high-converting product descriptions in seconds with DescribeAI. Our AI understands your brand voice and creates compelling copy that sells." 
        />
      </Helmet>
      <div className="min-h-screen bg-background">
        <Navbar />
        <main>
          <HeroSection />
          <BrandStrip />
          <FeaturesSection />
          <DemoSection />
          <TestimonialsSection />
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Index;
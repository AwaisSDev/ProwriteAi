const brands = [
  { name: "", logo: "https://1000logos.net/wp-content/uploads/2021/11/Nike-Logo-500x281.png" },
  { name: "", logo: "https://1000logos.net/wp-content/uploads/2016/10/Apple-Logo.png" },
  { name: "", logo: "https://1000logos.net/wp-content/uploads/2016/10/Amazon-Logo.png" },
  { name: "", logo: "https://1000logos.net/wp-content/uploads/2016/10/Adidas-Logo.png" },
  { name: "", logo: "https://1000logos.net/wp-content/uploads/2017/05/Rolex-logo-500x278.png" },
  { name: "", logo: "https://1000logos.net/wp-content/uploads/2023/04/Starbucks-logo-500x281.png" },
  { name: "", logo: "https://1000logos.net/wp-content/uploads/2021/04/Tesla-logo-500x281.png" },
  { name: "", logo: "https://1000logos.net/wp-content/uploads/2021/04/Louis-Vuitton-logo.png" },
  { name: "", logo: "https://1000logos.net/wp-content/uploads/2021/11/Fiverr-Logo.png" },
];

const BrandStrip = () => {
  return (
    /* We force the section itself to be white so there's no blue background behind the logos */
    <section className="myrulz overflow-hidden border-y border-gray-100">
      {/* Reduced padding on mobile (pt-6) vs desktop (pt-12) */}
      <div className="flex items-center gap-4 mb-6 md:mb-10 justify-center pt-6 md:pt-12 px-4">
        <div className="h-px bg-gray-200 flex-1 max-w-10 md:max-w-20" />
        <span className="text-[10px] md:text-sm font-medium uppercase tracking-widest text-gray-400 text-center">
          Trusted by leading brands
        </span>
        <div className="h-px bg-gray-200 flex-1 max-w-10 md:max-w-20" />
      </div>

      {/* Reduced bottom padding on mobile */}
      <div className="relative pb-8 md:pb-12">
        <div className="flex animate-scroll">
          {[...brands, ...brands].map((brand, index) => (
            <div key={index} className="brand-logo-wrapper px-4 md:px-10">
              <img 
                src={brand.logo} 
                alt={brand.name} 
                className="h-8 md:h-14 w-auto object-contain opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-300" 
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BrandStrip;

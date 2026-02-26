import { dataSources, features, navLinks, pricingPlans, steps, testimonials } from "../../data/landing";
import { BlogSection } from "./BlogSection";
import { CtaSection } from "./CtaSection";
import { DataSourcesSection } from "./DataSourcesSection";
import { FeaturesSection } from "./FeaturesSection";
import { FooterSection } from "./FooterSection";
import { HeaderClient } from "./HeaderClient";
import { HeroSection } from "./HeroSection";
import { PricingToggleClient } from "./PricingToggleClient";
import { StepsSection } from "./StepsSection";
import { TestimonialsClient } from "./TestimonialsClient";

export function LandingPage() {
  return (
    <div className="min-h-screen bg-[#F4F6F9] text-[#0F0F14]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <HeaderClient navLinks={navLinks} />

      <main>
        <HeroSection />
        <DataSourcesSection dataSources={dataSources} />
        <FeaturesSection features={features} />
        <StepsSection steps={steps} />
        <TestimonialsClient testimonials={testimonials} />
        <BlogSection />
        <CtaSection />
        <PricingToggleClient pricingPlans={pricingPlans} />
        <FooterSection />
      </main>
    </div>
  );
}

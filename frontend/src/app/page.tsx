import { Container } from "@/components/layout/container";
import { HeroSection } from "@/features/products/components/hero-section";
import { CategorySection } from "@/features/categories/components/category-section";
import { NewArrivalsSection } from "@/features/products/components/new-arrivals-section";
import { ExploreProductsSection } from "@/features/products/components/explore-products-section";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen pb-16">
      <Container>
        {/* 1. Hero Section with category sidebar and promo banner */}
        <HeroSection />

        {/* 2. Browse By Category Section */}
        <CategorySection />

        {/* 3. New Arrivals (4 products) */}
        <NewArrivalsSection />

        {/* 4. Explore Our Products (8 products in 2x4 grid) */}
        <ExploreProductsSection />
      </Container>
    </div>
  );
}

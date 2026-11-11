import Link from "next/link";
import { ArrowRight, ShoppingBag } from "lucide-react";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center py-16 sm:py-24">
      <Container className="flex flex-col items-center text-center max-w-3xl space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
          <ShoppingBag className="size-3.5" />
          <span>JustBuy Storefront Foundation Ready</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground">
          Buy anything you want from anywhere at your fingertips.
        </h1>

        <p className="text-lg text-muted-foreground max-w-xl leading-relaxed">
          Explore thousands of authentic products from verified vendors across the country.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <Link href="/products">
            <Button size="lg" className="gap-2">
              <span>Explore Products</span>
              <ArrowRight className="size-4" />
            </Button>
          </Link>
          <Link href="/categories">
            <Button variant="outline" size="lg">
              Browse Categories
            </Button>
          </Link>
        </div>
      </Container>
    </div>
  );
}

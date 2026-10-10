import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold">This is our landing page</h1>
        <Button>Buy Now</Button>
      </main>
    </div>
  );
}

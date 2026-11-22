import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("animate-pulse rounded-md bg-[#E2E8F0]", className)}
      {...props}
    />
  );
}

export { Skeleton };
export default Skeleton;

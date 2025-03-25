import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex w-screen h-screen justify-center items-center flex-col gap-4">
      <h1 className="text-4xl font-bold">404 | Not Found</h1>
      <p className="text-lg">The page you are looking for does not exist.</p>
      <Link href="/">
        <Button>Return to Home</Button>
      </Link>
    </div>
  );
}

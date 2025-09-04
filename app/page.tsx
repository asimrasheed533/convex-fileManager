import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex justify-between items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <Button className="cursor-pointer" type="submit">
        Login
      </Button>
    </div>
  );
}

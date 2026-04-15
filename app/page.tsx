
import { AppHeader } from "@/components/AppHeader";
import { PostsList } from "@/components/PostsList";

export default function Home() {
  return (
    <div className="relative min-h-screen">
      <AppHeader />
      <div className="flex justify-center pt-24 px-4 pb-8">
        <div className="w-full max-w-lg">
          <PostsList />
        </div>
      </div>
    </div>
  );
}

import { CreatePost } from "@/components/CreatePost";
import { Navbar } from "@/components/Navbar";
import { ProfileCard } from "@/components/ProfileCard";

export default function Home() {
  return (
    <div>
      <Navbar />
      <div className="flex p-8 gap-8 justify-around">
        <ProfileCard />
        <div className="w-1/2">
          <CreatePost />
        </div>
        <div></div>
      </div>
    </div>
  );
}

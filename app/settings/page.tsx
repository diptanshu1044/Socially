import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { SettingsClient } from "@/components/SettingsClient";

export default async function SettingsPage() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect("/signin");
  }

  return (
    <div className="min-h-screen-navbar bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Mobile Layout */}
      <div className="block lg:hidden">
        <div className="container-mobile py-4">
          <div className="mobile-card">
            <SettingsClient />
          </div>
        </div>
      </div>

      {/* Tablet Layout */}
      <div className="hidden lg:block xl:hidden">
        <div className="container-mobile py-6">
          <div className="mobile-card">
            <SettingsClient />
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden xl:block">
        <div className="container-mobile py-8">
          <div className="max-w-4xl mx-auto">
            <div className="mobile-card">
              <SettingsClient />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
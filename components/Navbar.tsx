"use client";

import { SignedIn, SignedOut, useClerk } from "@clerk/nextjs";
import { UserButton } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import ModeToggle from "@/components/ModeToggle";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { AlignJustify, Bell, House, User } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import {
  Sheet,
  SheetTitle,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { getCurrentUser } from "@/actions/user.action";

type User = Awaited<ReturnType<typeof getCurrentUser>>;

export const Navbar = () => {
  const { signOut } = useClerk();
  const router = useRouter();
  const { theme } = useTheme();
  const [user, setUser] = useState<User>(null);

  const [signInVariant, setSignInVariant] = useState("default");
  const [signUpVariant, setSignUpVariant] = useState("secondary");
  const [signOutVariant, setSignOutVariant] = useState("default");

  useEffect(() => {
    const findUser = async () => {
      try {
        const usr = await getCurrentUser();
        setUser(usr);
      } catch (e) {
        console.log(e);
      }
    };

    findUser();
  }, []);

  useEffect(() => {
    setSignInVariant(theme === "dark" ? "secondary" : "default");
    setSignUpVariant(theme === "dark" ? "default" : "secondary");
    setSignOutVariant(theme === "dark" ? "secondary" : "default");
  }, [theme]);

  return (
    <>
      <div className="flex justify-evenly gap-20 md:gap-48 lg:gap-96 w-full h-20 px-4 py-2 sticky top-0 z-50 backdrop-blur-xl">
        <div className="flex justify-center items-center">
          <Link
            href="/"
            className="font-mono text-xl tablet:text-2xl font-semibold"
          >
            Socially
          </Link>
        </div>
        <div className="hidden tablet:flex justify-evenly items-center gap-12">
          <ModeToggle />
          <Link href="/">
            <div className="flex gap-2 items-center justify-center hover:cursor-pointer">
              <House />
              <h2>Home</h2>
            </div>
          </Link>
          {user && (
            <SignedIn>
              <Link href="/notifications">
                <div className="flex gap-2 items-center justify-center hover:cursor-pointer">
                  <Bell />
                  <h2>Notifications</h2>
                </div>
              </Link>
              <Link href={`/profile/${user.username}`}>
                <div className="flex gap-2 items-center justify-center hover:cursor-pointer">
                  <User />
                  <h2>Profile</h2>
                </div>
              </Link>
            </SignedIn>
          )}
          <SignedIn>
            <div className="flex gap-4 justify-center items-center">
              <UserButton />
              <Button variant={signOutVariant} onClick={() => signOut()}>
                Sign Out
              </Button>
            </div>
          </SignedIn>
          <SignedOut>
            <div className="flex gap-4">
              <Button
                variant={signInVariant}
                onClick={() => router.push("/signin")}
              >
                Sign In
              </Button>
              <Button
                variant={signUpVariant}
                onClick={() => router.push("/signup")}
              >
                Sign Up
              </Button>
            </div>
          </SignedOut>
        </div>
        <div className="flex tablet:hidden justify-center items-center gap-10">
          <ModeToggle />
          <Sheet>
            <SheetTrigger>
              <AlignJustify />
            </SheetTrigger>
            <SheetContent className="w-72 py-2">
              <SheetTitle className="text-center flex justify-center items-center text-lg">
                Menu
              </SheetTitle>
              <Separator />
              <div className="flex gap-2 items-center px-4 py-1 hover:cursor-pointer">
                <House />
                <h2>Home</h2>
              </div>
              <div className="flex gap-2 items-center px-4 py-1 hover:cursor-pointer">
                <Bell />
                <h2>Notifications</h2>
              </div>
              <div className="flex gap-2 items-center px-4 py-1 hover:cursor-pointer">
                <User />
                <h2>Profile</h2>
              </div>
              <SignedIn>
                <div className="flex gap-4 justify-center items-center">
                  <UserButton />
                  <Button variant={signOutVariant} onClick={() => signOut()}>
                    Sign Out
                  </Button>
                </div>
              </SignedIn>
              <SignedOut>
                <div className="flex gap-4 items-center px-4 justify-center">
                  <Button
                    variant={signInVariant}
                    onClick={() => router.push("/signin")}
                  >
                    Sign In
                  </Button>
                  <Button
                    variant={signUpVariant}
                    onClick={() => router.push("/signup")}
                  >
                    Sign Up
                  </Button>
                </div>
              </SignedOut>
            </SheetContent>
          </Sheet>
        </div>
      </div>
      <Separator />
    </>
  );
};

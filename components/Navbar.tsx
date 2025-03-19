"use client";

import { SignedIn, SignedOut, useClerk, useUser } from "@clerk/nextjs";
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
  SheetClose,
  SheetTitle,
  SheetFooter,
  SheetHeader,
  SheetContent,
  SheetTrigger,
  SheetDescription,
} from "@/components/ui/sheet";
import { syncUser } from "@/actions/user.action";
import { auth } from "@clerk/nextjs/server";

export const Navbar = () => {
  const { signOut } = useClerk();
  const router = useRouter();
  const { theme } = useTheme();

  const [signInVariant, setSignInVariant] = useState("default");
  const [signUpVariant, setSignUpVariant] = useState("secondary");
  const [signOutVariant, setSignOutVariant] = useState("default");

  useEffect(() => {
    setSignInVariant(theme === "dark" ? "secondary" : "default");
    setSignUpVariant(theme === "dark" ? "default" : "secondary");
    setSignOutVariant(theme === "dark" ? "secondary" : "default");
  }, [theme]);

  return (
    <>
      <div className="flex justify-evenly gap-20 md:gap-48 lg:gap-96 w-full h-20 px-4 py-2 sticky ">
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
          <div className="flex gap-2 items-center justify-center hover:cursor-pointer">
            <House />
            <h2>Home</h2>
          </div>
          <div className="flex gap-2 items-center justify-center hover:cursor-pointer">
            <Bell />
            <h2>Notifications</h2>
          </div>
          <div className="flex gap-2 items-center justify-center hover:cursor-pointer">
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

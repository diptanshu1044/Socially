import { SignUp } from "@clerk/nextjs";

export default function SignUpForm() {
  return (
    <div className="min-h-screen flex justify-center items-center p-4 safe-padding">
      <div className="w-full max-w-md">
        <SignUp />
      </div>
    </div>
  );
}

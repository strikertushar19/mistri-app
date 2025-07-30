import AuthForm from "@/components/aceternity/auth-form";

export default function SignupPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-grid-small-white/[0.2]">
      <AuthForm mode="signup" />
    </div>
  );
}

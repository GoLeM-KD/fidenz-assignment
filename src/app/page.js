'use client';
import { useEffect } from "react";
import { useUser } from "@auth0/nextjs-auth0/client";
import { useRouter } from "next/navigation";
import LogoutButton from "@/components/LogoutButton";
import Profile from "@/components/Profile";

export default function Home() {
  const { user, isLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/auth/login");
    }
  }, [isLoading, user, router]);

  if (isLoading) return <p>Loading...</p>;
  if (!user) return null;
  return (
    <div className="app-container">
      <div className="main-card-wrapper">
        <img
          src="https://cdn.auth0.com/quantum-assets/dist/latest/logos/auth0/auth0-lockup-en-ondark.png"
          alt="Auth0 Logo"
          className="auth0-logo"
        />
        <h1 className="main-title">Next.js + Auth0</h1>
        
        <div className="action-card">
          <div className="logged-in-section">
            <p className="logged-in-message">Successfully logged in!</p>
            <Profile />
            <LogoutButton />
          </div>
        </div>
      </div>
    </div>
  );
}

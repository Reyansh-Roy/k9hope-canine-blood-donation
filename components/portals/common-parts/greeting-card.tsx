// @ts-nocheck
import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"; // Adjust import based on your project

const defaultName = "";
const defaultRole = "";

export default function GreetingCard({ name = defaultName, role = defaultRole, customGreeting = null }) {

  const [greeting, setGreeting] = useState("");
  const [bgClass, setBgClass] = useState("");

  useEffect(() => {
    const hour = new Date().getHours();

    if (hour < 12) {
      setGreeting("☀️ Good Morning");
      setBgClass("bg-white dark:bg-slate-900 border border-blue-100 dark:border-slate-800");
    } else if (hour < 18) {
      setGreeting("🌤️ Good Afternoon");
      setBgClass("bg-white dark:bg-slate-900 border border-blue-100 dark:border-slate-800");
    } else {
      setGreeting("🌙 Good Evening");
      setBgClass("bg-white dark:bg-slate-900 border border-blue-100 dark:border-slate-800");
    }
  }, []);

  // Role-based message
  const roleMessages = {
    donor: "Find where you can save lives today.",
    patient: "Healing takes time, and we are here to support you every step of the way!",
    hospital: "Manage blood supply and help those in need.",
    organisation: "Coordinate donations and save more lives.",
  };

  // Use custom greeting if provided, otherwise use default
  const displayGreeting = customGreeting || `${greeting}, ${name}`;

  return (
    <div className="pb-10">
      <Card className={`text-foreground bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 transition-all duration-500 shadow-lg`}>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white">
            {displayGreeting}
          </CardTitle>
          <CardDescription className="text-lg text-slate-600 dark:text-slate-300">
            {roleMessages[role] || "Welcome to the Blood Bank Platform."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="italic text-slate-600 dark:text-slate-300">Let's make a difference today</p>
        </CardContent>
      </Card>
    </div>
  );
}

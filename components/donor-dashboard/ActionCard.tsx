import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface ActionCardProps {
    icon: LucideIcon;
    title: string;
    description: string;
    href: string;
    accentColor?: "red" | "blue" | "purple" | "green";
    count?: number;
}

const accentColors = {
    red: "border-l-red-500 hover:border-l-red-600 hover:bg-red-50 dark:hover:bg-red-950/20",
    blue: "border-l-blue-500 hover:border-l-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/20",
    purple: "border-l-purple-500 hover:border-l-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/20",
    green: "border-l-green-500 hover:border-l-green-600 hover:bg-green-50 dark:hover:bg-green-950/20",
};

const iconColors = {
    red: "text-red-600",
    blue: "text-blue-600",
    purple: "text-purple-600",
    green: "text-green-600",
};

export function ActionCard({
    icon: Icon,
    title,
    description,
    href,
    accentColor = "blue",
    count,
}: ActionCardProps) {
    return (
        <Link href={href} className="block">
            <Card
                className={cn(
                    "border-l-4 transition-all duration-200 hover:shadow-md cursor-pointer h-full",
                    accentColors[accentColor]
                )}
            >
                <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                        <Icon className={cn("h-8 w-8", iconColors[accentColor])} />
                        {count !== undefined && count > 0 && (
                            <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
                                {count}
                            </span>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="space-y-1">
                    <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {title}
                    </CardTitle>
                    <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
                        {description}
                    </CardDescription>
                </CardContent>
            </Card>
        </Link>
    );
}

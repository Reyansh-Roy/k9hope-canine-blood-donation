import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
    icon: LucideIcon;
    title: string;
    value: string | number;
    subtitle?: string;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    colorScheme?: "blue" | "green" | "purple" | "orange";
}

const colorSchemes = {
    blue: {
        bg: "bg-blue-50 dark:bg-blue-950/20",
        icon: "text-blue-600",
        text: "text-blue-900 dark:text-blue-100",
    },
    green: {
        bg: "bg-green-50 dark:bg-green-950/20",
        icon: "text-green-600",
        text: "text-green-900 dark:text-green-100",
    },
    purple: {
        bg: "bg-purple-50 dark:bg-purple-950/20",
        icon: "text-purple-600",
        text: "text-purple-900 dark:text-purple-100",
    },
    orange: {
        bg: "bg-orange-50 dark:bg-orange-950/20",
        icon: "text-orange-600",
        text: "text-orange-900 dark:text-orange-100",
    },
};

export function StatsCard({
    icon: Icon,
    title,
    value,
    subtitle,
    trend,
    colorScheme = "blue",
}: StatsCardProps) {
    const colors = colorSchemes[colorScheme];

    return (
        <Card className={cn("border-none shadow-sm", colors.bg)}>
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        {title}
                    </CardTitle>
                    <Icon className={cn("h-5 w-5", colors.icon)} />
                </div>
            </CardHeader>
            <CardContent className="space-y-1">
                <div className={cn("text-3xl font-bold", colors.text)}>{value}</div>
                {subtitle && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>
                )}
                {trend && (
                    <div className="flex items-center gap-1 text-xs">
                        <span
                            className={cn(
                                "font-medium",
                                trend.isPositive ? "text-green-600" : "text-red-600"
                            )}
                        >
                            {trend.isPositive ? "+" : ""}
                            {trend.value}%
                        </span>
                        <span className="text-gray-500">from last month</span>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

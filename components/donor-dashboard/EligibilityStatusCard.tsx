import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Calendar } from "lucide-react";
import Link from "next/link";

interface EligibilityStatusCardProps {
    isEligible: boolean;
    donorName?: string;
    nextEligibleDate?: Date;
    lastDonationDate?: Date;
}

export function EligibilityStatusCard({
    isEligible,
    donorName,
    nextEligibleDate,
    lastDonationDate,
}: EligibilityStatusCardProps) {
    if (!isEligible && nextEligibleDate) {
        return (
            <Card className="border-l-4 border-l-orange-500 bg-orange-50 dark:bg-orange-950/20">
                <CardHeader>
                    <div className="flex items-start justify-between">
                        <div className="space-y-1">
                            <CardTitle className="text-xl font-bold text-orange-900 dark:text-orange-100">
                                Thank you for your recent donation!
                            </CardTitle>
                            <CardDescription className="text-orange-700 dark:text-orange-300">
                                Your next eligible donation date is coming soon
                            </CardDescription>
                        </div>
                        <Calendar className="h-8 w-8 text-orange-600" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        <p className="text-sm text-orange-800 dark:text-orange-200">
                            <span className="font-semibold">Next eligible date:</span>{" "}
                            {nextEligibleDate.toLocaleDateString("en-US", {
                                month: "long",
                                day: "numeric",
                                year: "numeric",
                            })}
                        </p>
                        {lastDonationDate && (
                            <p className="text-sm text-orange-700 dark:text-orange-300">
                                Last donation: {lastDonationDate.toLocaleDateString()}
                            </p>
                        )}
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border-l-4 border-l-green-600 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div className="space-y-2">
                        <CardTitle className="text-2xl font-bold text-green-900 dark:text-green-100">
                            You're eligible to donate!
                        </CardTitle>
                        <CardDescription className="text-lg text-green-700 dark:text-green-300">
                            Your donation today will give someone another chance at life
                        </CardDescription>
                    </div>
                    <Heart className="h-10 w-10 text-green-600 fill-green-600" />
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex items-center gap-4">
                    <Link href="/app/d/donate/urgent" className="flex-1">
                        <Button
                            size="lg"
                            className="w-full bg-[#E63946] hover:bg-[#d32f3c] text-white font-semibold shadow-md"
                        >
                            Donate Now
                        </Button>
                    </Link>
                    <Link href="/app/d/donate/nearby">
                        <Button
                            size="lg"
                            variant="outline"
                            className="border-green-600 text-green-700 hover:bg-green-50 dark:border-green-500 dark:text-green-400 dark:hover:bg-green-950/30"
                        >
                            Find Nearby
                        </Button>
                    </Link>
                </div>
            </CardContent>
        </Card>
    );
}

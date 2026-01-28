import React from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, Droplet } from "lucide-react";
import Link from "next/link";

interface UrgentRequestCardProps {
    id: string;
    patientName?: string;
    patientId?: string;
    bloodType: string;
    urgency: "immediate" | "within-24hrs" | "within-48hrs";
    distance?: number;
    location?: string;
}

const urgencyConfig = {
    immediate: {
        label: "Immediate",
        className: "bg-red-600 text-white hover:bg-red-700",
    },
    "within-24hrs": {
        label: "Within 24 hours",
        className: "bg-orange-600 text-white hover:bg-orange-700",
    },
    "within-48hrs": {
        label: "Within 48 hours",
        className: "bg-yellow-600 text-white hover:bg-yellow-700",
    },
};

export function UrgentRequestCard({
    id,
    patientName,
    patientId,
    bloodType,
    urgency,
    distance,
    location,
}: UrgentRequestCardProps) {
    const displayName = patientName || `Patient #${patientId || id.slice(0, 6)}`;
    const urgencyInfo = urgencyConfig[urgency];

    return (
        <Card className="border-l-4 border-l-red-500 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {displayName}
                    </CardTitle>
                    <Badge className={urgencyInfo.className}>
                        <Clock className="h-3 w-3 mr-1" />
                        {urgencyInfo.label}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                    <Droplet className="h-4 w-4 text-red-600" />
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                        Blood Type: {bloodType}
                    </span>
                </div>
                {(distance || location) && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <MapPin className="h-4 w-4" />
                        <span>
                            {distance && `${distance.toFixed(1)} km away`}
                            {distance && location && " • "}
                            {location}
                        </span>
                    </div>
                )}
            </CardContent>
            <CardFooter>
                <Link href={`/app/d/requests/${id}`} className="w-full">
                    <Button className="w-full bg-[#457B9D] hover:bg-[#3d6d8a] text-white">
                        View Details
                    </Button>
                </Link>
            </CardFooter>
        </Card>
    );
}

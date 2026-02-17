// @ts-nocheck
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebaseConfig";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Phone, Mail, MapPin, Calendar, Droplet } from "lucide-react";
import { format } from "date-fns";

export default function ProfilePage() {
    const params = useParams();
    const userId = params?.userId as string;

    const [profile, setProfile] = useState<any>(null);
    const [role, setRole] = useState<string>("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userId) return;

        async function fetchProfile() {
            try {
                // Try different collections
                const collections = [
                    { name: "donors", role: "Donor" },
                    { name: "patients", role: "Patient" },
                    { name: "veterinaries", role: "Hospital" },
                ];

                for (const col of collections) {
                    const docRef = doc(db, col.name, userId);
                    const docSnap = await getDoc(docRef);

                    if (docSnap.exists()) {
                        setProfile(docSnap.data());
                        setRole(col.role);
                        break;
                    }
                }
            } catch (error) {
                console.error("Error:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchProfile();
    }, [userId]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p>Loading profile...</p>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Card className="max-w-md">
                    <CardContent className="p-8 text-center">
                        <h2 className="text-2xl font-bold mb-2">Profile Not Found</h2>
                        <p className="text-gray-500">This user profile does not exist.</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
            <div className="container mx-auto px-4 py-12">
                <Card className="max-w-3xl mx-auto shadow-2xl">
                    <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
                        <div className="flex items-center gap-6">
                            <Avatar className="h-24 w-24 border-4 border-white">
                                <AvatarImage src={profile.profilePicture} />
                                <AvatarFallback className="text-2xl bg-white text-blue-600">
                                    {profile.d_name?.[0] || profile.p_name?.[0] || profile.h_name?.[0] || "?"}
                                </AvatarFallback>
                            </Avatar>

                            <div>
                                <CardTitle className="text-3xl mb-2">
                                    {profile.d_name || profile.p_name || profile.h_name || "User"}
                                </CardTitle>
                                <Badge className="bg-white text-blue-600">{role}</Badge>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="p-8 space-y-6">
                        {/* Contact Info */}
                        <div className="space-y-3">
                            {profile.phone && (
                                <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                                    <Phone className="h-5 w-5 text-blue-600" />
                                    <span>{profile.phone}</span>
                                </div>
                            )}

                            {profile.email && (
                                <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                                    <Mail className="h-5 w-5 text-blue-600" />
                                    <span>{profile.email}</span>
                                </div>
                            )}

                            {(profile.d_city || profile.p_city || profile.h_city) && (
                                <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                                    <MapPin className="h-5 w-5 text-blue-600" />
                                    <span>{profile.d_city || profile.p_city || profile.h_city}</span>
                                </div>
                            )}
                        </div>

                        {/* Donor Specific */}
                        {role === "Donor" && (
                            <div className="pt-6 border-t space-y-3">
                                <h3 className="font-semibold text-lg">Donor Information</h3>

                                {profile.d_bloodgroup && (
                                    <div className="flex items-center gap-3">
                                        <Droplet className="h-5 w-5 text-red-600" />
                                        <span>Blood Type: <strong>{profile.d_bloodgroup}</strong></span>
                                    </div>
                                )}

                                {profile.d_weight_kg && (
                                    <div className="flex items-center gap-3">
                                        <span>Weight: <strong>{profile.d_weight_kg} kg</strong></span>
                                    </div>
                                )}

                                {profile.d_donationCount !== undefined && (
                                    <div className="flex items-center gap-3">
                                        <span>Total Donations: <strong>{profile.d_donationCount}</strong></span>
                                    </div>
                                )}

                                {profile.d_lastDonation && (
                                    <div className="flex items-center gap-3">
                                        <Calendar className="h-5 w-5 text-gray-600" />
                                        <span>Last Donation: {format(new Date(profile.d_lastDonation), "PPP")}</span>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Patient Specific */}
                        {role === "Patient" && profile.p_bloodgroup && (
                            <div className="pt-6 border-t space-y-3">
                                <h3 className="font-semibold text-lg">Pet Information</h3>

                                <div className="flex items-center gap-3">
                                    <Droplet className="h-5 w-5 text-red-600" />
                                    <span>Blood Type: <strong>{profile.p_bloodgroup}</strong></span>
                                </div>

                                {profile.p_weight_kg && (
                                    <div className="flex items-center gap-3">
                                        <span>Weight: <strong>{profile.p_weight_kg} kg</strong></span>
                                    </div>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

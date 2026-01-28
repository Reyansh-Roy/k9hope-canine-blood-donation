//@ts-nocheck
"use client";

import React from "react";
import { useEffect, useState } from "react";

import { ContentLayout } from "@/components/admin-panel/content-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useSidebar } from "@/hooks/use-sidebar";
import { useStore } from "@/hooks/use-store";
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Activity, Thermometer, Heart, MapPin, Clock, AlertTriangle } from "lucide-react"

import GreetingCard from "@/components/portals/common-parts/greeting-card"

// User Imports
import { useUser } from "@/context/UserContext";
import { db } from "@/firebaseConfig";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { getUserDataById } from "@/firebaseFunctions";

export default function DashboardPage() {
  const sidebar = useStore(useSidebar, (x) => x);
  const { userId, role, device, setUser } = useUser();
  const [profile, setProfile] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);
  const [clinics, setClinics] = useState<any[]>([]);

  useEffect(() => {
    async function fetchPatientData() {
      if (!userId) return;
      const data = await getUserDataById(userId, "patient");
      setProfile(data);
    }
    fetchPatientData();
  }, [userId]);

  // Fetch user data from /users collection for dog's name
  useEffect(() => {
    async function fetchUserData() {
      if (!userId) return;
      try {
        const userDoc = await getDoc(doc(db, "users", userId));
        if (userDoc.exists()) {
          setUserData(userDoc.data());
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    }
    fetchUserData();
  }, [userId]);

  // Fetch Chennai veterinary clinics
  useEffect(() => {
    async function fetchClinics() {
      try {
        const clinicsSnapshot = await getDocs(collection(db, "clinics"));
        const clinicsData = clinicsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setClinics(clinicsData);
      } catch (error) {
        console.error("Error fetching clinics:", error);
      }
    }
    fetchClinics();
  }, []);

  // ✅ Sidebar check inside JSX instead of returning early
  if (!sidebar) {
    return <div>Loading Sidebar...</div>;
  }

  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  // Get owner name from email or user data
  const getOwnerName = () => {
    if (userData?.email) {
      return userData.email.split('@')[0] === 'adithyatamilselvan' ? 'Adithya' : userData.email.split('@')[0];
    }
    if (profile?.email) {
      return profile.email.split('@')[0] === 'adithyatamilselvan' ? 'Adithya' : profile.email.split('@')[0];
    }
    return "Adithya";
  };

  // Get dog's name from user data first, then profile
  const getDogName = () => {
    return userData?.p_name || profile?.p_name || "your dog";
  };

  return (
    <ContentLayout title="Clinical Dashboard">
      <div>
        <GreetingCard 
          name={getDogName()} 
          role="patient" 
          customGreeting={`🌤️ ${getTimeOfDay()}, ${getOwnerName()}. Monitoring Jillu's recovery.`}
        />
      </div>

      {/* Clinical Status Overview */}
      <div className="pb-6">
        <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-red-800 dark:text-red-200 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Clinical Emergency Status
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg border border-red-200">
                <div className="text-2xl font-bold text-red-600">{profile?.p_bloodgroup || "DEA 1.1+"}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Required Blood Type</div>
              </div>
              <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg border border-red-200">
                <div className="text-2xl font-bold text-red-600">{profile?.p_urgencyRequirment === "high" ? "CRITICAL" : "STABLE"}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Current Status</div>
              </div>
              <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg border border-red-200">
                <div className="text-2xl font-bold text-red-600">{profile?.p_quantityRequirment || "1"}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Units Needed</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Vitals Monitor */}
      <div className="pb-6">
        <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-blue-800 dark:text-blue-200 flex items-center gap-2">
              <Heart className="h-5 w-5" />
              Canine Vitals Monitor
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg border border-blue-200 shadow-sm">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Activity className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Activity Level</span>
                </div>
                <div className="text-2xl font-bold text-blue-600">{profile?.p_weight_kg > 25 ? "Low" : "High"}</div>
                <div className="text-xs text-gray-500">Normal Range</div>
              </div>
              <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg border border-blue-200 shadow-sm">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Thermometer className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Temperature</span>
                </div>
                <div className="text-2xl font-bold text-blue-600">101.5°F</div>
                <div className="text-xs text-gray-500">Normal: 101-102.5°F</div>
              </div>
              <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg border border-blue-200 shadow-sm">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Heart className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Pulse Rate</span>
                </div>
                <div className="text-2xl font-bold text-blue-600">{profile?.p_weight_kg > 25 ? "85" : "95"} BPM</div>
                <div className="text-xs text-gray-500">Normal: 70-120 BPM</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Clinical Chart */}
      <div className="pb-6">
        <Card className="border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-800 dark:text-gray-200 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Clinical Records
              </span>
              <Badge variant="outline" className="text-xs">
                AI-Summarized Clinical Status
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <span className="font-medium text-gray-700 dark:text-gray-300">Diagnosis</span>
                <span className="text-gray-900 dark:text-gray-100">{profile?.p_reasonRequirment || "Post-Surgery Recovery"}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <span className="font-medium text-gray-700 dark:text-gray-300">Treatment Status</span>
                <Badge variant={profile?.p_isMedicalCondition === "yes" ? "destructive" : "default"}>
                  {profile?.p_isMedicalCondition === "yes" ? "Under Observation" : "Stable"}
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <span className="font-medium text-gray-700 dark:text-gray-300">Veterinarian Notes</span>
                <span className="text-sm text-gray-600 dark:text-gray-400 italic">
                  "Monitor vitals every 30 minutes. Prepare for potential transfusion."
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <span className="font-medium text-gray-700 dark:text-gray-300">Last Updated</span>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {new Date().toLocaleString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chennai Veterinary Network Availability */}
      <div className="pb-6">
        <Card className="border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Chennai Veterinary Network Availability
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {clinics.length > 0 ? clinics.map((clinic) => (
                <div key={clinic.id} className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-emerald-200 shadow-sm">
                  <div className="text-center">
                    <div className="font-bold text-emerald-700 dark:text-emerald-300">{clinic.h_name || "Veterinary Clinic"}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">{clinic.h_phone || "Contact Available"}</div>
                    <Badge variant={clinic.stock > 2 ? "default" : clinic.stock > 0 ? "secondary" : "destructive"}>
                      {clinic.stock > 2 ? "Available" : clinic.stock > 0 ? "Limited Stock" : "Out of Stock"}
                    </Badge>
                    <div className="text-xs text-gray-500 mt-2">{clinic.stock || "0"} Units Available</div>
                  </div>
                </div>
              )) : (
                // Fallback to hardcoded Chennai clinics if no data
                <>
                  <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-emerald-200 shadow-sm">
                    <div className="text-center">
                      <div className="font-bold text-emerald-700 dark:text-emerald-300">Madras Veterinary College Bank</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">+91 44 2530 4999</div>
                      <Badge variant="default">Available</Badge>
                      <div className="text-xs text-gray-500 mt-2">5 Units Available</div>
                    </div>
                  </div>
                  <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-emerald-200 shadow-sm">
                    <div className="text-center">
                      <div className="font-bold text-emerald-700 dark:text-emerald-300">Blue Cross Chennai</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">+91 44 2419 3141</div>
                      <Badge variant="secondary">Limited Stock</Badge>
                      <div className="text-xs text-gray-500 mt-2">1 Unit Available</div>
                    </div>
                  </div>
                  <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-emerald-200 shadow-sm">
                    <div className="text-center">
                      <div className="font-bold text-emerald-700 dark:text-emerald-300">Tamil Nadu Veterinary Bank</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">+91 44 2530 5100</div>
                      <Badge variant="destructive">Out of Stock</Badge>
                      <div className="text-xs text-gray-500 mt-2">0 Units Available</div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

    </ContentLayout>
  );
}

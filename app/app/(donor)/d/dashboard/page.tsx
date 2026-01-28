"use client";
import React, { useEffect, useState } from "react";
import { ContentLayout } from "@/components/admin-panel/content-layout";
import { useUser } from "@/context/UserContext";
import { useRouter } from "next/navigation";
import { getUserDataById, getDonorStats, getUrgentRequests } from "@/firebaseFunctions";
import { EligibilityStatusCard } from "@/components/donor-dashboard/EligibilityStatusCard";
import { ActionCard } from "@/components/donor-dashboard/ActionCard";
import { UrgentRequestCard } from "@/components/donor-dashboard/UrgentRequestCard";
import { StatsCard } from "@/components/donor-dashboard/StatsCard";
import { AlertCircle, MapPin, Calendar, BarChart3, Heart, Users, Clock, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import HeartLoading from "@/components/custom/HeartLoading";

export default function DonorDashboard() {
  const { userId, role } = useUser();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [urgentRequests, setUrgentRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    // Redirect if not a donor
    if (!userId || role !== "donor") {
      router.push("/");
      return;
    }

    // Set greeting based on time of day
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 17) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");

    // Fetch all dashboard data
    async function fetchDashboardData() {
      setLoading(true);
      try {
        // Fetch donor profile data
        const donorData = await getUserDataById(userId, "donor");
        setProfile(donorData);

        if (donorData) {
          // Fetch donor stats (donations, lives saved, etc.)
          const donorStats = await getDonorStats(userId);
          setStats(donorStats);

          // Fetch urgent requests filtered by donor's city and blood type
          const requests = await getUrgentRequests(donorData.d_city, donorData.d_bloodgroup);
          setUrgentRequests(requests);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, [userId, role, router]);

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <HeartLoading />
      </div>
    );
  }

  const donorName = profile?.d_name || "Donor";
  const isEligible = stats?.isEligible ?? true;
  const nextEligibleDate = stats?.nextEligibleDate;
  const lastDonationDate = stats?.lastDonationDate;

  return (
    <ContentLayout title="Dashboard">
      <div className="space-y-8">
        {/* Header Section */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {greeting}, {donorName}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Find where you can save lives today
          </p>
        </div>

        {/* Eligibility Status Card */}
        <EligibilityStatusCard
          isEligible={isEligible}
          donorName={donorName}
          nextEligibleDate={nextEligibleDate}
          lastDonationDate={lastDonationDate}
        />

        {/* Quick Action Cards Grid */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <ActionCard
              icon={AlertCircle}
              title="Urgent Requests"
              description="See critical blood needs now"
              href="/app/d/donate/urgent"
              accentColor="red"
              count={urgentRequests.length}
            />
            <ActionCard
              icon={MapPin}
              title="Nearby Patients"
              description="Find patients in your area"
              href="/app/d/donate/nearby"
              accentColor="blue"
            />
            <ActionCard
              icon={Calendar}
              title="My Appointments"
              description="View scheduled donations"
              href="/app/d/appointments"
              accentColor="purple"
            />
            <ActionCard
              icon={BarChart3}
              title="Donation History"
              description="Track your impact"
              href="/app/d/donation-history"
              accentColor="green"
            />
          </div>
        </section>

        {/* Urgent Blood Requests Section */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
              🆘 Urgent Blood Needs in Your Area
            </h2>
          </div>
          {urgentRequests.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {urgentRequests.map((request: any) => (
                <UrgentRequestCard
                  key={request.id}
                  id={request.id}
                  patientName={request.p_name}
                  patientId={request.id}
                  bloodType={request.p_bloodgroup}
                  urgency={
                    request.p_urgencyRequirment === "immediate"
                      ? "immediate"
                      : request.p_urgencyRequirment === "within_24_hours"
                        ? "within-24hrs"
                        : "within-48hrs"
                  }
                  location={`${request.p_city || "Unknown"}, ${request.p_pincode || ""}`}
                />
              ))}
            </div>
          ) : (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <Heart className="h-12 w-12 text-gray-400 mb-4" />
                <p className="text-lg font-medium text-gray-600 dark:text-gray-400">
                  No urgent requests nearby
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                  Check back soon or explore nearby patients
                </p>
              </CardContent>
            </Card>
          )}
        </section>

        {/* Impact Dashboard Section */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Your Donation Impact
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard
              icon={Heart}
              title="Total Donations"
              value={stats?.totalDonations || 0}
              subtitle="Lifetime contributions"
              colorScheme="blue"
            />
            <StatsCard
              icon={Users}
              title="Lives Potentially Saved"
              value={stats?.livesSaved || 0}
              subtitle="Each donation helps 3 patients"
              colorScheme="green"
            />
            <StatsCard
              icon={Clock}
              title="Last Donation"
              value={stats?.lastDonation || "Never"}
              subtitle={stats?.lastDonation !== "Never" ? "Thank you!" : "Ready to start?"}
              colorScheme="purple"
            />
            <StatsCard
              icon={TrendingUp}
              title="Next Available"
              value={stats?.nextEligible || "Now"}
              subtitle={isEligible ? "You're eligible!" : "Mark your calendar"}
              colorScheme="orange"
            />
          </div>
        </section>

        {/* Call-to-Action Banner */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-blue-900 dark:text-blue-100">
              Help Us Spread the Word
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-blue-800 dark:text-blue-200">
              Know someone with a healthy dog? Invite them to join our life-saving community!
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href="/refer"
                className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                Refer a Donor
              </a>
              <a
                href="/community"
                className="inline-flex items-center px-4 py-2 border border-blue-600 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-lg font-medium transition-colors"
              >
                Join Community
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </ContentLayout>
  );
}

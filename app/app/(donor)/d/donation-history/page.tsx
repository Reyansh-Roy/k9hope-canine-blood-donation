"use client";
import { useEffect, useState } from "react";
import { useUser } from "@/context/UserContext";
import { useRouter } from "next/navigation";
import { getDonorHistory, getDonorStats } from "@/firebaseFunctions";
import { Award, Droplet, Heart, TrendingUp, Download, Calendar, MapPin, Star } from "lucide-react";
import HeartLoading from "@/components/custom/HeartLoading";
import Link from "next/link";
import { ContentLayout } from "@/components/admin-panel/content-layout";

export default function DonationHistoryPage() {
  const { userId, role } = useUser();
  const router = useRouter();

  const [donations, setDonations] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!userId || role !== "donor") {
      router.push("/");
      return;
    }

    async function fetchData() {
      setIsLoading(true);
      try {
        const history = await getDonorHistory(userId);
        const donorStats = await getDonorStats(userId);

        setDonations(history);
        setStats(donorStats);
      } catch (error) {
        console.error("Error fetching donation history:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [userId, role, router]);

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background z-50">
        <HeartLoading />
      </div>
    );
  }

  // Calculate achievements
  const totalDonations = stats?.totalDonations || 0;
  const achievements = [
    { title: "First Time Hero", icon: "🏆", earned: totalDonations >= 1, requirement: "1 donation" },
    { title: "Regular Contributor", icon: "🌟", earned: totalDonations >= 3, requirement: "3 donations" },
    { title: "Lifesaver", icon: "💝", earned: totalDonations >= 5, requirement: "5 donations" },
    { title: "Champion Donor", icon: "👑", earned: totalDonations >= 10, requirement: "10 donations" },
  ];

  return (
    <ContentLayout title="Donation History">
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Hero Section with Stats */}
        <section className="bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl mb-6 shadow-md">
          <div className="max-w-7xl mx-auto px-6 py-12">
            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-3 flex items-center gap-2">
                <Droplet className="w-8 h-8 fill-current" /> My Donation History
              </h2>
              <p className="text-red-50 text-lg">
                Tracking your journey of hope and life-saving contributions.
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20 shadow-inner">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="w-5 h-5 text-yellow-300" />
                  <p className="text-sm font-semibold text-red-50">Total Donations</p>
                </div>
                <p className="text-4xl font-bold">{totalDonations}</p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20 shadow-inner">
                <div className="flex items-center gap-2 mb-2">
                  <Heart className="w-5 h-5 text-red-300 fill-current" />
                  <p className="text-sm font-semibold text-red-50">Lives Saved</p>
                </div>
                <p className="text-4xl font-bold">{stats?.livesSaved || 0}</p>
                <p className="text-xs text-red-100 mt-1 italic">~3 patients helped per donation</p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20 shadow-inner">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-green-300" />
                  <p className="text-sm font-semibold text-red-50">Total Blood</p>
                </div>
                <p className="text-4xl font-bold">{totalDonations * 450} <span className="text-xl">ml</span></p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20 shadow-inner">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-5 h-5 text-blue-300" />
                  <p className="text-sm font-semibold text-red-50">Last Donation</p>
                </div>
                <p className="text-lg font-bold truncate">{stats?.lastDonation || "Never"}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Achievements Section */}
        <section className="w-full mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-6">
              <Award className="w-6 h-6 text-yellow-500" />
              <h3 className="text-xl font-bold text-gray-900">Donor Achievements</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {achievements.map((achievement, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-xl text-center transition-all border-2 ${achievement.earned
                      ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-400 shadow-sm'
                      : 'bg-gray-50 border-gray-100 grayscale opacity-40'
                    }`}
                >
                  <div className="text-4xl mb-2 drop-shadow-sm">{achievement.icon}</div>
                  <p className="font-bold text-sm text-gray-900 mb-1">{achievement.title}</p>
                  <p className="text-xs font-medium text-gray-500">{achievement.requirement}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Donation Timeline */}
        <main className="w-full pb-8">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-6 h-6 text-red-500" />
            <h3 className="text-xl font-bold text-gray-900">Donation Timeline</h3>
          </div>

          {donations.length > 0 ? (
            <div className="space-y-6">
              {donations.map((donation) => (
                <DonationItem key={donation.id} donation={donation} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl p-16 text-center shadow-sm border border-gray-100">
              <Droplet className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                No donation records found
              </h3>
              <p className="text-gray-500 mb-6">
                You haven&apos;t completed any donations yet. Start your journey of hope today!
              </p>
              <Link href="/app/d/donate/urgent">
                <button className="bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-lg font-bold shadow-md transition-all active:scale-95">
                  Find Donation Opportunities
                </button>
              </Link>
            </div>
          )}
        </main>
      </div>
    </ContentLayout>
  );
}

function DonationItem({ donation }: any) {
  const donationDate = donation.donationDate?.toDate
    ? donation.donationDate.toDate()
    : new Date(donation.donationDate);

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all border-l-4 border-red-500 overflow-hidden">
      <div className="p-6">
        <div className="flex flex-col sm:flex-row items-start justify-between mb-6 gap-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 mb-1">
              Donation #{donation.id.slice(0, 8).toUpperCase()}
            </h3>
            <p className="text-gray-600 font-medium">
              {donationDate.toLocaleDateString('en-IN', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
          <div className="bg-green-100 text-green-700 px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm">
            <Heart className="w-4 h-4 fill-current" />
            <span className="text-sm font-bold uppercase tracking-wider">Completed</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-red-50 rounded-lg p-4 border border-red-100">
            <p className="text-sm font-semibold text-gray-600 mb-1">Blood Type</p>
            <p className="text-lg font-bold text-red-600 flex items-center gap-2">
              <Droplet className="w-4 h-4" />
              {donation.bloodType || "DEA 4"}
            </p>
          </div>

          <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
            <p className="text-sm font-semibold text-gray-600 mb-1">Amount Donated</p>
            <p className="text-lg font-bold text-blue-600">
              {donation.quantityDonated || "450 ml"}
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
            <p className="text-sm font-semibold text-gray-600 mb-1">Location</p>
            <p className="text-sm font-bold text-gray-900 flex items-center gap-2 line-clamp-1">
              <MapPin className="w-4 h-4 text-gray-400" />
              {donation.hospital || "Veterinary Clinic"}
            </p>
          </div>
        </div>

        {donation.patientName && (
          <div className="mt-4 p-4 bg-green-50 rounded-xl border border-green-100 flex items-center gap-3">
            <div className="bg-white p-2 rounded-full shadow-sm text-green-600">
              <Heart className="w-4 h-4" />
            </div>
            <p className="text-sm font-medium text-gray-700">
              Your donation helped a patient named <strong className="text-green-700 underline decoration-green-200 decoration-2 underline-offset-2">{donation.patientName}</strong>
            </p>
          </div>
        )}

        <div className="flex gap-3 mt-6">
          <button className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-bold shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2">
            <Download className="w-4 h-4" />
            Download Certificate
          </button>
          <button className="px-6 border-2 border-gray-200 hover:border-gray-300 text-gray-600 py-3 rounded-lg font-bold transition-all active:scale-[0.98]">
            Share Impact
          </button>
        </div>
      </div>
    </div>
  );
}

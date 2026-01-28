"use client";
import { useEffect, useState } from "react";
import { useUser } from "@/context/UserContext";
import { useRouter } from "next/navigation";
import { getUserDataById, getUrgentRequests } from "@/firebaseFunctions";
import { ArrowLeft, AlertCircle, Clock, Droplet, MapPin, Phone, Mail, Calendar, ChevronDown, Search } from "lucide-react";
import HeartLoading from "@/components/custom/HeartLoading";
import Link from "next/link";
import { ContentLayout } from "@/components/admin-panel/content-layout";

export default function UrgentDonationsPage() {
  const { userId, role } = useUser();
  const router = useRouter();

  const [donorData, setDonorData] = useState<any>(null);
  const [urgentRequests, setUrgentRequests] = useState<any[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("nearest");

  useEffect(() => {
    if (!userId || role !== "donor") {
      router.push("/");
      return;
    }

    async function fetchData() {
      setIsLoading(true);
      try {
        const donor = await getUserDataById(userId, "donor");
        setDonorData(donor);

        if (donor) {
          const requests = await getUrgentRequests(donor.d_city, donor.d_bloodgroup, true);
          setUrgentRequests(requests);
          setFilteredRequests(requests);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [userId, role, router]);

  // Search & Sort functionality
  useEffect(() => {
    let filtered = [...urgentRequests];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(req =>
        req.p_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.p_city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.p_hospitalName?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort
    if (sortBy === "nearest") {
      filtered.sort((a, b) => {
        const aMatch = a.p_city?.toLowerCase() === donorData?.d_city?.toLowerCase() ? 0 : 1;
        const bMatch = b.p_city?.toLowerCase() === donorData?.d_city?.toLowerCase() ? 0 : 1;
        return aMatch - bMatch;
      });
    } else if (sortBy === "urgent") {
      const urgencyOrder: Record<string, number> = { immediate: 0, within_24_hours: 1, within_3_days: 2 };
      filtered.sort((a, b) => (urgencyOrder[a.p_urgencyRequirment] ?? 99) - (urgencyOrder[b.p_urgencyRequirment] ?? 99));
    }

    setFilteredRequests(filtered);
  }, [searchQuery, sortBy, urgentRequests, donorData]);

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background z-50">
        <HeartLoading />
      </div>
    );
  }

  return (
    <ContentLayout title="Urgent Donations">
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl mb-6">
          <div className="max-w-7xl mx-auto px-6 py-12">
            <div className="flex items-start gap-4">
              <div className="bg-white/20 p-3 rounded-lg">
                <AlertCircle className="w-8 h-8" />
              </div>
              <div className="flex-1">
                <h2 className="text-3xl font-bold mb-3">Urgent Blood Requests</h2>
                <p className="text-red-50 text-lg mb-2">
                  Lives are at risk. <span className="font-semibold">Urgent blood donations</span> are needed at the hospitals listed below.
                </p>
                <p className="text-red-50 text-lg">
                  Your donation can be the difference between life and death.
                </p>
              </div>
            </div>

            <div className="mt-6 bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center gap-2 text-sm">
                <Droplet className="w-5 h-5" />
                <span>Your blood group: <strong>{donorData?.d_bloodgroup || "Unknown"}</strong></span>
              </div>
              <p className="text-sm text-red-50 mt-2">
                You&apos;ll only see donation requests that <strong>match your profile</strong>, so make sure your information is always up to date.
              </p>
              <p className="text-xs text-red-50 mt-2">
                BU = Blood Unit. 1 BU = 450 ml blood.
              </p>
            </div>
          </div>
        </section>

        {/* Search & Filter Section */}
        <section className="bg-white border-b rounded-xl mb-6 shadow-sm">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <Search className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  placeholder="Find hospitals to donate at..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                />
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white min-w-[200px] outline-none"
              >
                <option value="nearest">Nearest first</option>
                <option value="urgent">Most urgent first</option>
              </select>
            </div>
          </div>
        </section>

        {/* Request Cards */}
        <main className="max-w-7xl mx-auto w-full">
          {filteredRequests.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 mb-8">
              {filteredRequests.map((request) => (
                <UrgentRequestItem key={request.id} request={request} donorCity={donorData?.d_city} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl p-16 text-center shadow-sm">
              <div className="text-gray-400 mb-4">
                <AlertCircle className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                No urgent donation requests match your profile right now.
              </h3>
              <p className="text-gray-500">
                Check back soon or explore nearby donation opportunities.
              </p>
              <Link href="/app/d/donate/nearby">
                <button className="mt-6 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
                  View Nearby Donations
                </button>
              </Link>
            </div>
          )}
        </main>
      </div>
    </ContentLayout>
  );
}

function UrgentRequestItem({ request, donorCity }: any) {
  const [expanded, setExpanded] = useState(false);

  const urgencyConfig: Record<string, any> = {
    immediate: {
      color: 'bg-red-500',
      label: 'Immediate',
      icon: '🚨',
      textColor: 'text-red-600',
      bgLight: 'bg-red-50'
    },
    within_24_hours: {
      color: 'bg-orange-500',
      label: 'Within 24 hours',
      icon: '⚠️',
      textColor: 'text-orange-600',
      bgLight: 'bg-orange-50'
    },
    within_3_days: {
      color: 'bg-yellow-500',
      label: 'Within 48 hours',
      icon: '⏰',
      textColor: 'text-yellow-600',
      bgLight: 'bg-yellow-50'
    }
  };

  const urgency = urgencyConfig[request.p_urgencyRequirment] || urgencyConfig.immediate;
  const isSameCity = request.p_city?.toLowerCase() === donorCity?.toLowerCase();

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all border-l-4 border-red-500 overflow-hidden">
      <div className="p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start justify-between mb-4 gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <h3 className="text-2xl font-bold text-gray-900">
                {request.p_name || `Patient #${request.id.slice(0, 6)}`}
              </h3>
              {isSameCity && (
                <span className="bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> Your City
                </span>
              )}
            </div>
            {request.p_hospitalName && (
              <p className="text-gray-600 font-medium">🏥 {request.p_hospitalName}</p>
            )}
          </div>
          <div className={`${urgency.color} text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 whitespace-nowrap shadow-sm`}>
            <Clock className="w-4 h-4" />
            {urgency.label}
          </div>
        </div>

        {/* Key Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className={`${urgency.bgLight} rounded-lg p-4`}>
            <div className="flex items-center gap-2 mb-1">
              <Droplet className={`w-5 h-5 ${urgency.textColor}`} />
              <p className="text-sm font-medium text-gray-600">Blood Type</p>
            </div>
            <p className={`text-2xl font-bold ${urgency.textColor}`}>{request.p_bloodgroup}</p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-1">
              <MapPin className="w-5 h-5 text-gray-600" />
              <p className="text-sm font-medium text-gray-600">Location</p>
            </div>
            <p className="text-lg font-bold text-gray-900">{request.p_city}</p>
            <p className="text-sm text-gray-500">{request.p_pincode}</p>
          </div>

          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-1">
              <Droplet className="w-5 h-5 text-blue-600" />
              <p className="text-sm font-medium text-gray-600">Units Needed</p>
            </div>
            <p className="text-2xl font-bold text-blue-600">
              {request.p_quantityRequirment || "N/A"} BU
            </p>
            <p className="text-xs text-gray-500">~{((request.p_quantityRequirment || 0) * 450).toLocaleString()}ml</p>
          </div>
        </div>

        {/* Expand/Collapse Details */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between text-gray-600 hover:text-gray-900 py-2 border-t border-b border-gray-200 transition-colors"
        >
          <span className="font-medium">
            {expanded ? "Hide" : "View"} Additional Details
          </span>
          <ChevronDown className={`w-5 h-5 transition-transform ${expanded ? 'rotate-180' : ''}`} />
        </button>

        {expanded && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-1">Reason for Request</p>
              <p className="text-gray-600">{request.p_reasonRequirment || "Not specified"}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {request.p_doctorName && (
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-1">Attending Veterinarian</p>
                  <p className="text-gray-600">Dr. {request.p_doctorName}</p>
                </div>
              )}
              {request.emergency_contact_phone && (
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-1">Emergency Contact</p>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="w-4 h-4" />
                    <span>{request.emergency_contact_phone}</span>
                  </div>
                </div>
              )}
            </div>
            {request.email && (
              <div className="flex items-center gap-2 text-gray-600 border-t pt-2 mt-2">
                <Mail className="w-4 h-4" />
                <span className="text-sm">{request.email}</span>
              </div>
            )}
          </div>
        )}

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mt-6">
          <button className="flex-1 bg-red-500 hover:bg-red-600 text-white py-4 rounded-lg font-bold text-lg transition-all shadow-md hover:shadow-lg active:scale-[0.98]">
            🩸 I Can Help - Donate Now
          </button>
          <button className="px-6 border-2 border-gray-300 hover:border-red-500 hover:bg-red-50 text-gray-700 hover:text-red-600 py-4 rounded-lg font-semibold transition-all shadow-sm active:scale-[0.98]">
            Share Request
          </button>
        </div>
      </div>
    </div>
  );
}
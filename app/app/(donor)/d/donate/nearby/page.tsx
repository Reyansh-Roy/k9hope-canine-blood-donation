"use client";
import { useEffect, useState } from "react";
import { useUser } from "@/context/UserContext";
import { useRouter } from "next/navigation";
import { getUserDataById, getUrgentRequests } from "@/firebaseFunctions";
import { MapPin, Droplet, Phone, Mail, ChevronDown, Navigation, Search, Info } from "lucide-react";
import HeartLoading from "@/components/custom/HeartLoading";
import Link from "next/link";
import { ContentLayout } from "@/components/admin-panel/content-layout";

export default function NearbyDonationsPage() {
  const { userId, role } = useUser();
  const router = useRouter();

  const [donorData, setDonorData] = useState<any>(null);
  const [nearbyRequests, setNearbyRequests] = useState<any[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterBloodType, setFilterBloodType] = useState("all");

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
          // Get all requests, not just urgent ones
          const requests = await getUrgentRequests(undefined, undefined, false);
          setNearbyRequests(requests);
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

  // Filter functionality
  useEffect(() => {
    let filtered = [...nearbyRequests];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(req =>
        req.p_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.p_city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.p_hospitalName?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Blood type filter
    if (filterBloodType !== "all") {
      filtered = filtered.filter(req => req.p_bloodgroup === filterBloodType);
    }

    // Sort by city proximity (same city first)
    filtered.sort((a, b) => {
      const aMatch = a.p_city?.toLowerCase() === donorData?.d_city?.toLowerCase() ? 0 : 1;
      const bMatch = b.p_city?.toLowerCase() === donorData?.d_city?.toLowerCase() ? 0 : 1;
      return aMatch - bMatch;
    });

    setFilteredRequests(filtered);
  }, [searchQuery, filterBloodType, nearbyRequests, donorData]);

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background z-50">
        <HeartLoading />
      </div>
    );
  }

  const bloodTypes = ["DEA 1.1+", "DEA 1.2+", "DEA 3", "DEA 4", "DEA 5", "DEA 7", "Universal"];

  return (
    <ContentLayout title="Nearby Patients">
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl mb-6">
          <div className="max-w-7xl mx-auto px-6 py-12">
            <div className="flex items-start gap-4">
              <div className="bg-white/20 p-3 rounded-lg">
                <MapPin className="w-8 h-8" />
              </div>
              <div className="flex-1">
                <h2 className="text-3xl font-bold mb-3">Find Patients Near You</h2>
                <p className="text-blue-50 text-lg mb-4">
                  Discover dogs in your area who could benefit from your life-saving donation. Every contribution makes a difference.
                </p>
                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 text-sm">
                  <Navigation className="w-4 h-4" />
                  <span>Showing patients near <strong>{donorData?.d_city || "your location"}</strong></span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Filters Section */}
        <section className="bg-white border-b rounded-xl mb-6 shadow-sm">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <Search className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  placeholder="Search by patient name or location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
              <select
                value={filterBloodType}
                onChange={(e) => setFilterBloodType(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white min-w-[200px] outline-none"
              >
                <option value="all">All Blood Types</option>
                {bloodTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* Patient Cards */}
        <main className="max-w-7xl mx-auto w-full">
          {filteredRequests.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {filteredRequests.map((request) => (
                <NearbyPatientItem key={request.id} request={request} donorCity={donorData?.d_city} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl p-16 text-center shadow-sm">
              <MapPin className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                No patients found matching your filters
              </h3>
              <p className="text-gray-500">
                Try adjusting your search criteria or check back later.
              </p>
            </div>
          )}
        </main>
      </div>
    </ContentLayout>
  );
}

function NearbyPatientItem({ request, donorCity }: any) {
  const [expanded, setExpanded] = useState(false);
  const isSameCity = request.p_city?.toLowerCase() === donorCity?.toLowerCase();

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all border-l-4 border-blue-500 flex flex-col h-full">
      <div className="p-6 flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between mb-4 gap-2">
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-1">
              {request.p_name || `Patient #${request.id.slice(0, 6)}`}
            </h3>
            {request.p_hospitalName && (
              <p className="text-sm text-gray-600 flex items-center gap-1">
                🏥 {request.p_hospitalName}
              </p>
            )}
          </div>
          {isSameCity && (
            <span className="bg-green-100 text-green-700 text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1 whitespace-nowrap">
              <MapPin className="w-3 h-3" /> Same City
            </span>
          )}
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-red-50 rounded-lg p-3">
            <p className="text-xs text-gray-600 mb-1 font-medium">Blood Type</p>
            <p className="text-lg font-bold text-red-600 flex items-center gap-1">
              <Droplet className="w-4 h-4" />
              {request.p_bloodgroup}
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-600 mb-1 font-medium">Location</p>
            <p className="text-sm font-semibold text-gray-900 truncate">{request.p_city}</p>
            <p className="text-xs text-gray-500">{request.p_pincode}</p>
          </div>
        </div>

        {/* Reason */}
        {request.p_reasonRequirment && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg flex gap-2">
            <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-gray-700 mb-0.5">Reason for Requirement</p>
              <p className="text-sm text-gray-800 line-clamp-2">{request.p_reasonRequirment}</p>
            </div>
          </div>
        )}

        {/* Contact Info (Expandable) */}
        <div className="mt-auto">
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full flex items-center justify-between text-sm text-gray-600 hover:text-gray-900 py-2 border-t border-gray-100 transition-colors"
          >
            <span className="font-medium">{expanded ? "Hide" : "View"} Contact Info</span>
            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} />
          </button>

          {expanded && (
            <div className="mt-2 p-3 bg-gray-50 rounded-lg space-y-2 text-sm animate-in fade-in slide-in-from-top-1 duration-200">
              {request.emergency_contact_phone && (
                <div className="flex items-center gap-2 text-gray-700">
                  <Phone className="w-4 h-4 text-blue-500" />
                  <span>{request.emergency_contact_phone}</span>
                </div>
              )}
              {request.email && (
                <div className="flex items-center gap-2 text-gray-700">
                  <Mail className="w-4 h-4 text-blue-500" />
                  <span className="truncate">{request.email}</span>
                </div>
              )}
              {!request.emergency_contact_phone && !request.email && (
                <p className="text-xs text-gray-500 italic">No contact information available</p>
              )}
            </div>
          )}

          {/* CTA */}
          <button className="w-full mt-4 bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-semibold transition-all shadow-sm active:scale-[0.98]">
            Offer to Donate
          </button>
        </div>
      </div>
    </div>
  );
}
"use client";
import { useEffect, useState } from "react";
import { useUser } from "@/context/UserContext";
import { useRouter } from "next/navigation";
import { getDonorAppointments } from "@/firebaseFunctions";
import { Calendar, MapPin, Clock, Phone, CheckCircle, AlertTriangle, XCircle, Download } from "lucide-react";
import HeartLoading from "@/components/custom/HeartLoading";
import Link from "next/link";
import { ContentLayout } from "@/components/admin-panel/content-layout";

export default function AppointmentsPage() {
  const { userId, role } = useUser();
  const router = useRouter();

  const [appointments, setAppointments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("upcoming");

  useEffect(() => {
    if (!userId || role !== "donor") {
      router.push("/");
      return;
    }

    async function fetchAppointments() {
      setIsLoading(true);
      try {
        const appointmentsData = await getDonorAppointments(userId);
        setAppointments(appointmentsData);
      } catch (error) {
        console.error("Error fetching appointments:", error);
        setAppointments([]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchAppointments();
  }, [userId, role, router]);

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background z-50">
        <HeartLoading />
      </div>
    );
  }

  const now = new Date();
  const filteredAppointments = appointments.filter(apt => {
    const aptDate = apt.appointmentDate?.toDate ? apt.appointmentDate.toDate() : new Date(apt.appointmentDate);

    if (filterStatus === "upcoming") {
      return aptDate >= now && apt.status !== "completed" && apt.status !== "cancelled";
    } else if (filterStatus === "past") {
      return aptDate < now || apt.status === "completed";
    } else if (filterStatus === "cancelled") {
      return apt.status === "cancelled";
    }
    return true;
  });

  return (
    <ContentLayout title="My Donation Schedule">
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl mb-6 shadow-md">
          <div className="max-w-7xl mx-auto px-6 py-12">
            <div className="flex items-start gap-4">
              <div className="bg-white/20 p-3 rounded-lg">
                <Calendar className="w-8 h-8" />
              </div>
              <div className="flex-1">
                <h2 className="text-3xl font-bold mb-3">Upcoming Appointments</h2>
                <p className="text-purple-50 text-lg">
                  Track and manage your <strong>donation schedule</strong>.
                </p>
                <p className="text-purple-50 text-lg mt-2 font-medium">
                  Thank you for your life-saving commitment!
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Filter Tabs */}
        <section className="bg-white border-b rounded-xl mb-6 shadow-sm overflow-hidden">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex overflow-x-auto gap-2 py-4 scrollbar-hide">
              <button
                onClick={() => setFilterStatus("upcoming")}
                className={`px-6 py-2 rounded-lg font-semibold transition-all whitespace-nowrap ${filterStatus === "upcoming"
                    ? "bg-purple-500 text-white shadow-md active:scale-95"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
              >
                Upcoming ({appointments.filter(a => {
                  const d = a.appointmentDate?.toDate ? a.appointmentDate.toDate() : new Date(a.appointmentDate);
                  return d >= now && a.status !== "completed" && a.status !== "cancelled";
                }).length})
              </button>
              <button
                onClick={() => setFilterStatus("past")}
                className={`px-6 py-2 rounded-lg font-semibold transition-all whitespace-nowrap ${filterStatus === "past"
                    ? "bg-purple-500 text-white shadow-md active:scale-95"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
              >
                Past
              </button>
              <button
                onClick={() => setFilterStatus("cancelled")}
                className={`px-6 py-2 rounded-lg font-semibold transition-all whitespace-nowrap ${filterStatus === "cancelled"
                    ? "bg-purple-500 text-white shadow-md active:scale-95"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
              >
                Cancelled
              </button>
            </div>
          </div>
        </section>

        {/* Appointments List */}
        <main className="max-w-7xl mx-auto w-full flex-1">
          {filteredAppointments.length > 0 ? (
            <div className="space-y-6 mb-8">
              {filteredAppointments.map((appointment) => (
                <AppointmentItem key={appointment.id} appointment={appointment} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl p-16 text-center shadow-sm">
              <Calendar className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                No records found
              </h3>
              <p className="text-gray-500 mb-6">
                {filterStatus === "upcoming"
                  ? "You don't have any upcoming appointments scheduled yet."
                  : "No records to show in this category."}
              </p>
              {filterStatus === "upcoming" && (
                <Link href="/app/d/donate/urgent">
                  <button className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold shadow-md transition-all active:scale-95">
                    Find Donation Opportunities
                  </button>
                </Link>
              )}
            </div>
          )}
        </main>
      </div>
    </ContentLayout>
  );
}

function AppointmentItem({ appointment }: any) {
  const appointmentDate = appointment.appointmentDate?.toDate
    ? appointment.appointmentDate.toDate()
    : new Date(appointment.appointmentDate);

  const statusConfig: Record<string, any> = {
    confirmed: {
      icon: CheckCircle,
      color: "text-green-600",
      bgLight: "bg-green-50",
      label: "Confirmed"
    },
    pending: {
      icon: AlertTriangle,
      color: "text-yellow-600",
      bgLight: "bg-yellow-50",
      label: "Pending Confirmation"
    },
    cancelled: {
      icon: XCircle,
      color: "text-red-600",
      bgLight: "bg-red-50",
      label: "Cancelled"
    },
    completed: {
      icon: CheckCircle,
      color: "text-blue-600",
      bgLight: "bg-blue-50",
      label: "Completed"
    }
  };

  const status = statusConfig[appointment.status || "pending"] || statusConfig.pending;
  const StatusIcon = status.icon;

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all border-l-4 border-purple-500 overflow-hidden">
      <div className="p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start justify-between mb-6 gap-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 mb-1">
              {appointment.hospitalName || "Hospital Appointment"}
            </h3>
            {appointment.patientName && (
              <p className="text-gray-600 font-medium">For: {appointment.patientName}</p>
            )}
          </div>
          <div className={`${status.bgLight} ${status.color} px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm shrink-0`}>
            <StatusIcon className="w-4 h-4" />
            <span className="text-sm font-bold uppercase tracking-wider">{status.label}</span>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="w-5 h-5 text-purple-600" />
              <p className="text-sm font-semibold text-gray-600">Date</p>
            </div>
            <p className="text-lg font-bold text-gray-900">
              {appointmentDate.toLocaleDateString('en-IN', {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })}
            </p>
          </div>

          <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-5 h-5 text-blue-600" />
              <p className="text-sm font-semibold text-gray-600">Time</p>
            </div>
            <p className="text-lg font-bold text-gray-900">
              {appointment.appointmentTime || "TBD"}
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
            <div className="flex items-center gap-2 mb-1">
              <MapPin className="w-5 h-5 text-gray-600" />
              <p className="text-sm font-semibold text-gray-600">Location</p>
            </div>
            <p className="text-sm font-bold text-gray-900 line-clamp-1">
              {appointment.city || "Not specified"}
            </p>
          </div>
        </div>

        {/* Contact Info */}
        {appointment.contactPhone && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-100 flex items-center gap-3">
            <div className="bg-white p-2 rounded-full shadow-sm text-purple-600">
              <Phone className="w-4 h-4" />
            </div>
            <span className="text-sm text-gray-700">
              Hospital Contact: <strong className="ml-1">{appointment.contactPhone}</strong>
            </span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mt-4">
          {appointment.status === "confirmed" && (
            <>
              <button className="flex-1 bg-purple-500 hover:bg-purple-600 text-white py-3 rounded-lg font-bold shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2">
                <Download className="w-4 h-4" />
                Add to Calendar
              </button>
              <button className="px-6 border-2 border-gray-200 hover:border-red-500 hover:bg-red-50 text-gray-700 hover:text-red-600 py-3 rounded-lg font-semibold transition-all active:scale-[0.98]">
                Request Cancellation
              </button>
            </>
          )}
          {appointment.status === "pending" && (
            <div className="flex-1 bg-yellow-100 text-yellow-800 py-3 rounded-lg font-bold text-center border border-yellow-200">
              Awaiting Hospital Confirmation
            </div>
          )}
          {appointment.status === "completed" && (
            <div className="flex-1 bg-green-100 text-green-800 py-3 rounded-lg font-bold text-center border border-green-200">
              ✓ Donation Completed - Thank You!
            </div>
          )}
          {appointment.status === "cancelled" && (
            <div className="flex-1 bg-gray-100 text-gray-500 py-3 rounded-lg font-bold text-center border border-gray-200">
              Cancelled Appointment
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// --@ts-nocheck
"use client";
import { ContentLayout } from "@/components/admin-panel/content-layout";
import { useState, useEffect } from "react";
import { CalendarCheck, Clock, MapPin, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

// Firebase imports
import { useUser } from "@/context/UserContext";
import { db } from "@/firebaseConfig";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";

export default function AppointmentsPage() {
  const { userId } = useUser();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);

  // Fetch user profile and appointments
  useEffect(() => {
    async function fetchData() {
      if (!userId) return;

      try {
        // Fetch user profile
        const profileDoc = await getDoc(doc(db, "patients", userId));
        if (profileDoc.exists()) {
          setProfile(profileDoc.data());
        }

        // Fetch user data for dog's name
        const userDoc = await getDoc(doc(db, "users", userId));
        if (userDoc.exists()) {
          setUserData(userDoc.data());
        }

        // Fetch appointments
        const appointmentsQuery = query(
          collection(db, "appointments"),
          where("userId", "==", userId)
        );
        const querySnapshot = await getDocs(appointmentsQuery);
        const appointmentData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setAppointments(appointmentData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [userId]);

  // Get dog's name with fallback
  const getDogName = () => {
    return userData?.p_name || profile?.p_name || "your dog";
  };

  // Format appointment date
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-IN', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  return (
    <ContentLayout title="Scheduled Clinical Visits">
      <div className="flex flex-col md:flex-row md:justify-between items-start md:items-center mb-6 gap-4">
        <div className="px-2">
          <div className="flex items-center gap-2">
            <CalendarCheck className="h-6 w-6" />
            <h2 className="text-2xl font-semibold">📅 Scheduled Clinical Visits & Transfusions</h2>
          </div>
          <p className="text-foreground text-md mt-3">
            Here you will see your <span className="text-accent">confirmed appointments</span> at Chennai Veterinary Clinics for blood transfusion.
          </p>
          <p className="text-foreground text-sm mt-2 bg-blue-50 dark:bg-blue-900 p-3 rounded-lg border border-blue-200">
            <strong>📋 Important:</strong> Please bring your dog's previous clinical records to the clinic.
          </p>
          <p className="text-foreground text-md mt-3">
            Wishing {getDogName()} a healthy recovery!
          </p>
        </div>
      </div>

      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
            <Stethoscope className="h-5 w-5" />
            Clinical Appointment Schedule
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-gray-500">
              Loading appointments...
            </div>
          ) : appointments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <CalendarCheck className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium">No scheduled appointments found</p>
              <p className="text-sm mt-2">Your upcoming clinical visits will appear here</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Clinic Name</TableHead>
                  <TableHead>Appointment Type</TableHead>
                  <TableHead>Dog's Name</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {appointments.map((appointment) => (
                  <TableRow key={appointment.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-blue-600" />
                        {appointment.clinicName || "Chennai Veterinary Clinic"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900">
                        {appointment.type || "Transfusion"}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      {getDogName()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-gray-500" />
                        {formatDate(appointment.date || appointment.scheduledDate)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={appointment.status === "confirmed" ? "default" : "secondary"}>
                        {appointment.status || "Scheduled"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-center mt-6 space-x-2">
        <Button disabled className="bg-accent">
          Previous
        </Button>
        <span className="px-4 py-2">1 / 1</span>
        <Button disabled className="bg-accent">
          Next
        </Button>
      </div>
    </ContentLayout>
  );
}

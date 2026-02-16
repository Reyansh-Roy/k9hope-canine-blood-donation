"use client";

import { useState, useEffect } from "react";
import { doc, setDoc, updateDoc, collection, query, where, getDocs, Timestamp, deleteDoc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useUser } from "@/context/UserContext";
import { db } from "@/firebaseConfig";
import { ContentLayout } from "@/components/admin-panel/content-layout";
import Link from "next/link";
import { addDays, format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Droplet, Clock, AlertCircle, Users, Phone, Mail, MapPin, Heart, X, Check } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Canine Blood Types
const CANINE_BLOOD_TYPES = [
  { short: "DEA1.1", full: "DEA 1.1 Positive" },
  { short: "DEA1.2", full: "DEA 1.2 Positive" },
  { short: "DEA3", full: "DEA 3 Positive" },
  { short: "DEA4", full: "DEA 4 Positive (Universal)" },
  { short: "DEA5", full: "DEA 5 Positive" },
  { short: "DEA7", full: "DEA 7 Positive" },
  { short: "DEA1-NEG", full: "DEA 1.1 Negative (Universal)" },
  { short: "UNKNOWN", full: "Unknown Blood Type" },
];

interface DonorRequest {
  id: string;
  clinicId: string;
  isUrgent: string;
  bloodTypeNeeded: string;
  quantityNeeded: number;
  requestExpires: any;
  reason: string;
  linkedPatientId?: string;
  linkedPatientName?: string;
  status: "open" | "closed";
  createdAt: any;
  appointments: DonorAppointment[];
}

interface DonorAppointment {
  id: string;
  donorId: string;
  donorName: string;
  donorPhone: string;
  donorEmail: string;
  dogName: string;
  dogWeight: number;
  dogBloodType: string;
  appointmentDate: string;
  status: "pending" | "completed" | "cancelled";
  notes?: string;
  createdAt: any;
}

interface SavedDonor {
  id: string;
  d_name: string;
  phone: string;
  email: string;
  d_bloodgroup: string;
  d_weight_kg: number;
  d_city: string;
  d_lastDonation?: string;
  d_donationCount: number;
  savedAt: any;
}

export default function DonorManagementPage() {
  const { userId } = useUser();
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<DonorRequest[]>([]);
  const [savedDonors, setSavedDonors] = useState<SavedDonor[]>([]);

  const [mainTab, setMainTab] = useState("request");
  const [requestTab, setRequestTab] = useState("open");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [appointmentsDialogOpen, setAppointmentsDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<DonorRequest | null>(null);

  // Form states
  const [isUrgent, setIsUrgent] = useState("no");
  const [bloodTypeNeeded, setBloodTypeNeeded] = useState("DEA4");
  const [quantityNeeded, setQuantityNeeded] = useState("");
  const [requestExpires, setRequestExpires] = useState<Date>(addDays(new Date(), 7));
  const [reason, setReason] = useState("");
  const [linkedPatientId, setLinkedPatientId] = useState("");
  const [linkedPatientName, setLinkedPatientName] = useState("");

  const [calendarOpen, setCalendarOpen] = useState(false);
  const [patients, setPatients] = useState<any[]>([]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const maxExpiryDate = addDays(new Date(), 30);

  useEffect(() => {
    fetchAllData();
  }, [userId]);

  async function fetchAllData() {
    if (!userId) return;

    setLoading(true);
    try {
      await Promise.all([
        fetchRequests(),
        fetchSavedDonors(),
        fetchPatients(),
      ]);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchRequests() {
    const requestsRef = collection(db, "veterinary-donor-requests");
    const q = query(requestsRef, where("clinicId", "==", userId));
    const snapshot = await getDocs(q);

    const fetchedRequests = await Promise.all(
      snapshot.docs.map(async (docSnap) => {
        const data = docSnap.data();

        // Fetch appointments for this request
        const appointmentsRef = collection(db, "donor-appointments");
        const appQuery = query(appointmentsRef, where("requestId", "==", docSnap.id));
        const appSnapshot = await getDocs(appQuery);
        const appointments = appSnapshot.docs.map(appDoc => ({
          id: appDoc.id,
          ...appDoc.data()
        })) as DonorAppointment[];

        return {
          id: docSnap.id,
          ...data,
          appointments,
        } as DonorRequest;
      })
    );

    // Sort by creation date (newest first)
    fetchedRequests.sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds);
    setRequests(fetchedRequests);
  }

  async function fetchSavedDonors() {
    const savedRef = collection(db, "saved-donors");
    const q = query(savedRef, where("clinicId", "==", userId));
    const snapshot = await getDocs(q);

    const donors = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as SavedDonor[];

    setSavedDonors(donors);
  }

  async function fetchPatients() {
    const patientsRef = collection(db, "patients");
    const q = query(
      patientsRef,
      where("assigned_clinic_id", "==", userId),
      where("request_status", "==", "accepted")
    );
    const snapshot = await getDocs(q);
    setPatients(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  }

  async function handleCreateRequest() {
    if (!bloodTypeNeeded || !quantityNeeded || !requestExpires) {
      alert("Please fill all required fields (*)");
      return;
    }

    try {
      const requestsRef = collection(db, "veterinary-donor-requests");
      const requestId = `${userId}-r${Date.now()}`;

      const newRequest = {
        clinicId: userId,
        isUrgent,
        bloodTypeNeeded,
        quantityNeeded: Number(quantityNeeded),
        requestExpires: Timestamp.fromDate(requestExpires),
        reason: reason || "",
        linkedPatientId: linkedPatientId || null,
        linkedPatientName: linkedPatientName || null,
        status: "open",
        createdAt: Timestamp.now(),
      };

      await setDoc(doc(db, "veterinary-donor-requests", requestId), newRequest);

      alert("✅ Donor request created successfully!");
      setDialogOpen(false);
      resetForm();
      fetchRequests();
    } catch (error) {
      console.error("Error creating request:", error);
      alert("❌ Failed to create request. Please try again.");
    }
  }

  async function handleCloseRequest(requestId: string) {
    if (!confirm("Are you sure you want to close this donor request?")) {
      return;
    }

    try {
      const requestRef = doc(db, "veterinary-donor-requests", requestId);
      await updateDoc(requestRef, {
        status: "closed",
        closedAt: Timestamp.now()
      });

      alert("✅ Request closed successfully!");
      fetchRequests();
    } catch (error) {
      console.error("Error closing request:", error);
      alert("❌ Failed to close request.");
    }
  }

  async function handleCompleteAppointment(appointmentId: string, notes: string) {
    try {
      const appointmentRef = doc(db, "donor-appointments", appointmentId);
      await updateDoc(appointmentRef, {
        status: "completed",
        completedAt: Timestamp.now(),
        notes,
      });

      // Update donor's donation count
      const appointment = selectedRequest?.appointments.find(a => a.id === appointmentId);
      if (appointment) {
        const donorRef = doc(db, "donors", appointment.donorId);
        const donorSnap = await getDocs(query(collection(db, "donors"), where("phone", "==", appointment.donorPhone)));

        if (!donorSnap.empty) {
          const donorDoc = donorSnap.docs[0]; // Fix: access first doc
          const currentCount = donorDoc.data().d_donationCount || 0;
          await updateDoc(donorDoc.ref, {
            d_donationCount: currentCount + 1,
            d_lastDonation: format(new Date(), "yyyy-MM-dd"),
            updatedAt: Timestamp.now()
          });
        }
      }

      alert("✅ Appointment marked as completed!");
      fetchRequests();
    } catch (error) {
      console.error("Error completing appointment:", error);
      alert("❌ Failed to complete appointment.");
    }
  }

  async function handleSaveDonor(donorId: string) {
    try {
      // Fetch donor details
      const donorRef = doc(db, "donors", donorId);
      const donorSnap = await getDocs(query(collection(db, "donors"), where("__name__", "==", donorId)));

      if (donorSnap.empty) {
        alert("Donor not found");
        return;
      }

      const donorData = donorSnap.docs[0].data(); // Fix: access first doc

      // Check if already saved
      const savedRef = collection(db, "saved-donors");
      const existingQuery = query(
        savedRef,
        where("clinicId", "==", userId),
        where("donorId", "==", donorId)
      );
      const existing = await getDocs(existingQuery);

      if (!existing.empty) {
        alert("This donor is already saved!");
        return;
      }

      // Save donor
      const savedId = `${userId}-${donorId}`;
      await setDoc(doc(db, "saved-donors", savedId), {
        clinicId: userId,
        donorId,
        d_name: donorData.d_name,
        phone: donorData.phone,
        email: donorData.email,
        d_bloodgroup: donorData.d_bloodgroup,
        d_weight_kg: donorData.d_weight_kg,
        d_city: donorData.d_city,
        d_lastDonation: donorData.d_lastDonation,
        d_donationCount: donorData.d_donationCount || 0,
        savedAt: Timestamp.now(),
      });

      alert("✅ Donor saved successfully!");
      fetchSavedDonors();
    } catch (error) {
      console.error("Error saving donor:", error);
      alert("❌ Failed to save donor.");
    }
  }

  async function handleRemoveSavedDonor(savedDonorId: string) {
    if (!confirm("Remove this donor from saved list?")) {
      return;
    }

    try {
      await deleteDoc(doc(db, "saved-donors", savedDonorId));
      alert("✅ Donor removed from saved list");
      fetchSavedDonors();
    } catch (error) {
      console.error("Error removing donor:", error);
      alert("❌ Failed to remove donor.");
    }
  }

  function resetForm() {
    setIsUrgent("no");
    setBloodTypeNeeded("DEA4");
    setQuantityNeeded("");
    setRequestExpires(addDays(new Date(), 7));
    setReason("");
    setLinkedPatientId("");
    setLinkedPatientName("");
  }

  function formatTimestamp(timestamp: any) {
    if (!timestamp) return "N/A";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return format(date, "PPP");
  }

  const filteredRequests = requests.filter(r => r.status === requestTab);

  if (loading) {
    return (
      <ContentLayout title="Donor Management">
        <div className="flex items-center justify-center h-64">
          <div className="animate-pulse">Loading donor management...</div>
        </div>
      </ContentLayout>
    );
  }

  return (
    <ContentLayout title="Donor Management">
      <Tabs value={mainTab} onValueChange={setMainTab} className="w-full">
        <TabsList className="mb-4 w-full">
          <TabsTrigger className="w-full" value="request">
            Request for Blood ({requests.filter(r => r.status === "open").length})
          </TabsTrigger>
          <TabsTrigger className="w-full" value="saved">
            💾 Saved Donors ({savedDonors.length})
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: REQUEST FOR BLOOD */}
        <TabsContent value="request">
          <div className="flex flex-col md:flex-row md:justify-between items-start md:items-center mb-6 gap-4">
            <div className="px-2">
              <h2 className="text-2xl font-semibold">🩸 Request Blood from Canine Donors</h2>
              <p className="text-foreground text-md mt-3">Here you can:</p>
              <ul className="list-disc list-inside text-foreground mt-2 space-y-2">
                <li>Create requests for <span className="text-accent">canine blood donations</span></li>
                <li>Allow donors to book appointments for their dogs</li>
                <li>View appointments, complete donations, and track blood collection</li>
              </ul>
              <p className="text-foreground text-md mt-3">
                See your current blood stock in{' '}
                <Link href="/app/h/blood-inventory" className="text-accent underline hover:text-accent/80">
                  Blood Inventory
                </Link>.
              </p>
            </div>
            <div className="flex justify-center w-full md:w-auto px-4">
              <Button className="bg-accent" onClick={() => setDialogOpen(true)}>
                + Create Request
              </Button>
            </div>
          </div>

          <Tabs value={requestTab} onValueChange={setRequestTab} className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="open">
                Open Requests ({requests.filter(r => r.status === "open").length})
              </TabsTrigger>
              <TabsTrigger value="closed">
                Closed Requests ({requests.filter(r => r.status === "closed").length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value={requestTab}>
              {filteredRequests.length === 0 ? (
                <Card className="p-8">
                  <p className="text-center text-gray-500">
                    No {requestTab} requests.
                  </p>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredRequests.map((req) => (
                    <RequestCard
                      key={req.id}
                      request={req}
                      onClose={handleCloseRequest}
                      onViewAppointments={() => {
                        setSelectedRequest(req);
                        setAppointmentsDialogOpen(true);
                      }}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </TabsContent>

        {/* TAB 2: SAVED DONORS */}
        <TabsContent value="saved">
          <div className="px-2 mb-6">
            <h2 className="text-2xl font-semibold">💾 Saved Canine Donors</h2>
            <p className="text-foreground text-md mt-3">
              Donors you've saved for quick contact and future blood requests.
            </p>
          </div>

          {savedDonors.length === 0 ? (
            <Card className="p-8">
              <p className="text-center text-gray-500">
                No saved donors yet. Complete appointments to save donors.
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {savedDonors.map((donor) => (
                <SavedDonorCard
                  key={donor.id}
                  donor={donor}
                  onRemove={handleRemoveSavedDonor}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* CREATE REQUEST DIALOG */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Donor Request</DialogTitle>
            <DialogDescription>
              Create a request for canine blood donations
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Request Details */}
            <div>
              <h3 className="font-bold border-b-2 border-blue-500 pb-2 mb-4">
                Request Details
              </h3>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={isUrgent === "yes"}
                    onCheckedChange={(checked) => setIsUrgent(checked ? "yes" : "no")}
                  />
                  <Label>🚨 Urgent Request</Label>
                </div>

                <div>
                  <Label>Blood Type Needed *</Label>
                  <Select value={bloodTypeNeeded} onValueChange={setBloodTypeNeeded}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CANINE_BLOOD_TYPES.map((type) => (
                        <SelectItem key={type.short} value={type.short}>
                          {type.full}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Quantity Needed (ml) *</Label>
                  <Input
                    type="number"
                    value={quantityNeeded}
                    onChange={(e) => setQuantityNeeded(e.target.value)}
                    placeholder="450"
                  />
                  <p className="text-xs text-gray-500 mt-1">Standard donation: 450ml</p>
                </div>

                <div>
                  <Label>Request Expires *</Label>
                  <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {format(requestExpires, "PPP")}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={requestExpires}
                        onSelect={(date) => {
                          if (date) {
                            setRequestExpires(date);
                            setCalendarOpen(false);
                          }
                        }}
                        disabled={(date) => date < today || date > maxExpiryDate}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div>
                  <Label>Reason/Diagnosis</Label>
                  <Textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Surgery, trauma, anemia, tick fever, etc."
                    rows={3}
                  />
                </div>
              </div>
            </div>

            {/* Link to Patient */}
            <div>
              <h3 className="font-bold border-b-2 border-green-500 pb-2 mb-4">
                Link to Patient (Optional)
              </h3>

              <div className="space-y-4">
                <div>
                  <Label>Select Patient</Label>
                  <Select value={linkedPatientId} onValueChange={(id) => {
                    setLinkedPatientId(id);
                    const patient = patients.find(p => p.id === id);
                    if (patient) {
                      setLinkedPatientName(patient.p_name);
                      setBloodTypeNeeded(patient.p_bloodgroup);
                      setQuantityNeeded(patient.p_quantityRequirment);
                      setReason(patient.p_reasonRequirment);
                    }
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a patient (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {patients.map((patient) => (
                        <SelectItem key={patient.id} value={patient.id}>
                          {patient.p_name} - {patient.p_bloodgroup}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 mt-1">
                    Linking pre-fills blood type and quantity from patient request
                  </p>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateRequest}>Create Request</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* APPOINTMENTS DIALOG */}
      <AppointmentsDialog
        request={selectedRequest}
        open={appointmentsDialogOpen}
        onClose={() => setAppointmentsDialogOpen(false)}
        onComplete={handleCompleteAppointment}
        onSaveDonor={handleSaveDonor}
      />
    </ContentLayout>
  );
}

// Request Card Component
function RequestCard({ request, onClose, onViewAppointments }: {
  request: DonorRequest;
  onClose: (id: string) => void;
  onViewAppointments: () => void;
}) {
  const completedAppointments = request.appointments?.filter(a => a.status === "completed").length || 0;
  const totalAppointments = request.appointments?.length || 0;

  return (
    <Card className={request.isUrgent === "yes" ? "border-red-500 border-2" : ""}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">🩸 Request #{request.id.split("-r")?.slice(0, 6)}</CardTitle>
          <div className="flex flex-wrap gap-2">
            <Badge className={request.status === "open" ? "bg-green-500" : "bg-gray-500"}>
              {request.status}
            </Badge>
            {request.isUrgent === "yes" && (
              <Badge className="bg-red-500">🚨 Urgent</Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="flex items-center gap-2">
          <Droplet className="h-4 w-4 text-red-500" />
          <span className="font-semibold">{request.bloodTypeNeeded}</span>
          <span className="text-sm text-gray-500">({request.quantityNeeded}ml)</span>
        </div>

        {request.reason && (
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-orange-500 mt-0.5" />
            <div className="text-sm">
              <span className="font-semibold">Reason:</span> {request.reason}
            </div>
          </div>
        )}

        {request.linkedPatientName && (
          <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
            <div className="text-xs text-gray-600">Linked Patient</div>
            <div className="font-semibold text-sm">🐕 {request.linkedPatientName}</div>
          </div>
        )}

        <div className="text-xs text-gray-600">
          <Clock className="h-3 w-3 inline mr-1" />
          Created: {formatTimestamp(request.createdAt)}
        </div>

        <div className="text-xs text-gray-600">
          Expires: {formatTimestamp(request.requestExpires)}
        </div>

        <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-900 p-2 rounded">
          <Users className="h-4 w-4" />
          <span className="text-sm font-semibold">
            {totalAppointments} Appointments ({completedAppointments} completed)
          </span>
        </div>
      </CardContent>

      <CardFooter className="flex flex-col gap-2">
        <Button
          onClick={onViewAppointments}
          variant="outline"
          className="w-full"
        >
          View Appointments
        </Button>
        {request.status === "open" && (
          <Button
            onClick={() => onClose(request.id)}
            variant="destructive"
            className="w-full"
          >
            Close Request
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

// Saved Donor Card
function SavedDonorCard({ donor, onRemove }: {
  donor: SavedDonor;
  onRemove: (id: string) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">🐕 {donor.d_name}</CardTitle>
          <Heart className="h-5 w-5 text-red-500 fill-red-500" />
        </div>
      </CardHeader>

      <CardContent className="space-y-2 text-sm">
        <div className="flex items-center gap-2">
          <Droplet className="h-4 w-4 text-red-500" />
          <span className="font-semibold">{donor.d_bloodgroup}</span>
          <span className="text-gray-500">-  {donor.d_weight_kg}kg</span>
        </div>

        <div className="flex items-center gap-2">
          <Phone className="h-4 w-4" />
          <a href={`tel:${donor.phone}`} className="text-blue-600 hover:underline">
            {donor.phone}
          </a>
        </div>

        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4" />
          <a href={`mailto:${donor.email}`} className="text-blue-600 hover:underline text-xs">
            {donor.email}
          </a>
        </div>

        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          <span>{donor.d_city}</span>
        </div>

        <div className="bg-green-50 dark:bg-green-900/20 p-2 rounded">
          <div className="text-xs text-gray-600">Total Donations</div>
          <div className="font-bold text-lg text-green-600">{donor.d_donationCount}</div>
        </div>

        {donor.d_lastDonation && (
          <div className="text-xs text-gray-500">
            Last donated: {format(new Date(donor.d_lastDonation), "PPP")}
          </div>
        )}
      </CardContent>

      <CardFooter>
        <Button
          onClick={() => onRemove(donor.id)}
          variant="outline"
          size="sm"
          className="w-full"
        >
          <X className="h-4 w-4 mr-2" /> Remove
        </Button>
      </CardFooter>
    </Card>
  );
}

// Appointments Dialog Component
function AppointmentsDialog({ request, open, onClose, onComplete, onSaveDonor }: {
  request: DonorRequest | null;
  open: boolean;
  onClose: () => void;
  onComplete: (id: string, notes: string) => void;
  onSaveDonor: (donorId: string) => void;
}) {
  const [selectedAppointment, setSelectedAppointment] = useState<DonorAppointment | null>(null);
  const [notes, setNotes] = useState("");

  if (!request) return null;

  const pendingAppointments = request.appointments.filter(a => a.status === "pending");
  const completedAppointments = request.appointments.filter(a => a.status === "completed");

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Appointments for Request #{request.id.split("-r")?.slice(0, 6)}
          </DialogTitle>
          <DialogDescription>
            {request.bloodTypeNeeded} -  {request.quantityNeeded}ml needed
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="pending">
          <TabsList>
            <TabsTrigger value="pending">
              Pending ({pendingAppointments.length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed ({completedAppointments.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            {pendingAppointments.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No pending appointments</p>
            ) : (
              pendingAppointments.map((appointment) => (
                <Card key={appointment.id}>
                  <CardContent className="p-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="font-semibold">🐕 {appointment.dogName}</div>
                        <div className="text-sm text-gray-600">
                          Owner: {appointment.donorName}
                        </div>
                        <div className="text-sm">
                          <Phone className="h-3 w-3 inline mr-1" />
                          <a href={`tel:${appointment.donorPhone}`} className="text-blue-600">
                            {appointment.donorPhone}
                          </a>
                        </div>
                      </div>
                      <div>
                        <div className="text-sm">
                          <Droplet className="h-3 w-3 inline mr-1" />
                          {appointment.dogBloodType} -  {appointment.dogWeight}kg
                        </div>
                        <div className="text-sm">
                          <Clock className="h-3 w-3 inline mr-1" />
                          {format(new Date(appointment.appointmentDate), "PPP")}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-4">
                      <Button
                        onClick={() => setSelectedAppointment(appointment)}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        <Check className="h-4 w-4 mr-2" /> Complete Donation
                      </Button>
                      <Button
                        onClick={() => onSaveDonor(appointment.donorId)}
                        variant="outline"
                        className="flex-1"
                      >
                        <Heart className="h-4 w-4 mr-2" /> Save Donor
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {completedAppointments.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No completed appointments</p>
            ) : (
              completedAppointments.map((appointment) => (
                <Card key={appointment.id} className="opacity-75">
                  <CardContent className="p-4">
                    <div className="flex justify-between">
                      <div>
                        <div className="font-semibold">🐕 {appointment.dogName}</div>
                        <div className="text-sm text-gray-600">
                          {appointment.dogBloodType} -  {appointment.dogWeight}kg
                        </div>
                        <div className="text-sm">Owner: {appointment.donorName}</div>
                      </div>
                      <Badge className="bg-green-500">✓ Completed</Badge>
                    </div>
                    {appointment.notes && (
                      <div className="mt-2 text-sm bg-gray-50 dark:bg-gray-900 p-2 rounded">
                        <strong>Notes:</strong> {appointment.notes}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>

      {/* Complete Appointment Dialog */}
      {selectedAppointment && (
        <Dialog open={!!selectedAppointment} onOpenChange={() => setSelectedAppointment(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Complete Donation</DialogTitle>
              <DialogDescription>
                Mark donation from {selectedAppointment.dogName} as completed
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label>Notes (Optional)</Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any observations, complications, or follow-up needed..."
                  rows={4}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedAppointment(null)}>
                Cancel
              </Button>
              <Button onClick={() => {
                onComplete(selectedAppointment.id, notes);
                setSelectedAppointment(null);
                setNotes("");
              }} className="bg-green-600 hover:bg-green-700">
                <Check className="h-4 w-4 mr-2" /> Complete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </Dialog>
  );
}

function formatTimestamp(timestamp: any) {
  if (!timestamp) return "N/A";
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return format(date, "PPP");
}

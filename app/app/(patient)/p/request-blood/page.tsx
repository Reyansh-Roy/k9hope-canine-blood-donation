// --@ts-nocheck
"use client";
import { ContentLayout } from "@/components/admin-panel/content-layout";
import { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { SquareUserRound, Plus } from "lucide-react";
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

// Firebase imports
import { useUser } from "@/context/UserContext";
import { db } from "@/firebaseConfig";
import { collection, addDoc, query, where, getDocs, doc, getDoc } from "firebase/firestore";

export default function RequestBloodPage() {
  const { userId } = useUser();
  const [bloodRequests, setBloodRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);

  // Fetch user profile and blood requests
  useEffect(() => {
    async function fetchData() {
      if (!userId) return;

      try {
        // Fetch user profile
        const profileDoc = await getDoc(doc(db, "patients", userId));
        if (profileDoc.exists()) {
          setProfile(profileDoc.data());
        }

        // Fetch blood requests
        const requestsQuery = query(
          collection(db, "blood_requests"),
          where("userId", "==", userId)
        );
        const querySnapshot = await getDocs(requestsQuery);
        const requests = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setBloodRequests(requests);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [userId]);

  // Handle new blood request
  const handlePostRequest = async () => {
    if (!userId || !profile) return;

    try {
      const newRequest = {
        userId,
        dogName: profile.p_name,
        bloodType: profile.p_bloodgroup,
        location: profile.p_city || "Chennai",
        urgency: profile.p_urgencyRequirment || "medium",
        reason: profile.p_reasonRequirment || "Treatment",
        status: "Pending",
        createdAt: new Date(),
        quantity: profile.p_quantityRequirment || "1"
      };

      await addDoc(collection(db, "blood_requests"), newRequest);
      
      // Refresh the requests list
      const requestsQuery = query(
        collection(db, "blood_requests"),
        where("userId", "==", userId)
      );
      const querySnapshot = await getDocs(requestsQuery);
      const requests = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setBloodRequests(requests);

      alert("Canine blood request posted successfully!");
    } catch (error) {
      console.error("Error posting request:", error);
      alert("Failed to post request. Please try again.");
    }
  };

  return (
    <ContentLayout title="Request Blood">
      <div className="flex flex-col md:flex-row md:justify-between items-start md:items-center mb-6 gap-4">
        <div className="px-2">
          <div className="flex items-center gap-2">
            <SquareUserRound className="h-6 w-6" />
            <h2 className="text-2xl font-semibold">Canine Blood Requests</h2>
          </div>
          <p className="text-foreground text-md mt-3">
            Here you will find <span className="text-accent">Veterinary Clinics</span> to submit <span className="text-accent">Canine Blood Requests</span> to.
          </p>
          <p className="text-foreground text-sm mt-3">
            Chennai network veterinary services for your canine companion's blood needs.
          </p>
        </div>
      </div>

      <Card className="p-6">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl">🐕 Your Canine Blood Requests</CardTitle>
            <Button onClick={handlePostRequest} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Post Request
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center text-gray-500">Loading requests...</p>
          ) : bloodRequests.length === 0 ? (
            <p className="text-center text-gray-500">No canine blood requests found. Post your first request above!</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Dog Name</TableHead>
                  <TableHead>DEA Blood Type</TableHead>
                  <TableHead>Chennai Location</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bloodRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium">{request.dogName || "N/A"}</TableCell>
                    <TableCell>{request.bloodType || "N/A"}</TableCell>
                    <TableCell>{request.location || "Chennai"}</TableCell>
                    <TableCell>
                      <Badge variant={request.status === "Matched" ? "default" : "secondary"}>
                        {request.status || "Pending"}
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

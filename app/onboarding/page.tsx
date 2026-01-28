"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/firebaseConfig";
import DonorOnboarding from "@/components/onb-forms/donorOnb";
import PatientOnboarding from "@/components/onb-forms/patientOnb";
import HospitalOnboarding from "@/components/onb-forms/hospitalOnb";
import OrganisationOnboarding from "@/components/onb-forms/organisationOnb";
import HeartLoading from "@/components/custom/HeartLoading";

const OnboardingPage = () => {
  const { setUser, userId, role, onboarded, isAuthLoading } = useUser();
  const router = useRouter();
  const [content, setContent] = useState<React.ReactElement | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState<string>("");


  useEffect(() => {
    // Wait for auth to finish loading
    if (isAuthLoading) {
      return;
    }

    // Redirect to login if no userId
    if (!userId) {
      router.replace("/login");
      return;
    }

    // If user is already onboarded, redirect to dashboard
    if (role !== "guest" && onboarded === "yes") {
      switch (role) {
        case "patient":
          router.replace("/app/p/dashboard");
          break;
        case "donor":
          router.replace("/app/d/dashboard");
          break;
        case "veterinary":
          router.replace("/app/h/dashboard");
          break;
        case "organisation":
          router.replace("/app/o/dashboard");
          break;
        default:
          router.replace("/app");
      }
      return;
    }

    // Check if user has a pending role from login page
    const pendingRole = sessionStorage.getItem('pendingRole');

    if (pendingRole) {
      // Auto-select the role and show appropriate form
      sessionStorage.removeItem('pendingRole');
      handleRoleSelection(pendingRole);
    } else if (role !== "guest") {
      // User has a role but not onboarded - show form directly
      handleRoleSelection(role);
    } else {
      // Show role selection for new users
      setContent(<RoleSelection onSelect={handleRoleSelection} />);
    }

    setIsLoading(false);
  }, [userId, role, onboarded, isAuthLoading, router]);


  const handleRoleSelection = async (role: string) => {
    setSelectedRole(role);

    // Save role to users collection
    try {
      await setDoc(doc(db, "users", userId), {
        role: role,
        onboarded: "no",
        createdAt: new Date(),
        updatedAt: new Date()
      }, { merge: true });

      // Update user context
      setUser(userId, role as any, "no");

      // Load appropriate onboarding form
      switch (role) {
        case "patient":
          setContent(<PatientOnboarding />);
          break;
        case "donor":
          setContent(<DonorOnboarding />);
          break;
        case "veterinary":
          setContent(<HospitalOnboarding />);
          break;
        case "organisation":
          setContent(<OrganisationOnboarding />);
          break;
        default:
          router.push("/login");
          break;
      }
    } catch (error) {
      console.error("Error saving role:", error);
    }
  };

  const handleOnboardingComplete = async () => {
    try {
      // Mark as onboarded in users collection
      await setDoc(doc(db, "users", userId), {
        onboarded: "yes",
        updatedAt: new Date()
      }, { merge: true });

      // Update user context
      setUser(userId, selectedRole as any, "yes");

      // Redirect to role-specific dashboard
      switch (selectedRole) {
        case "patient":
          router.push("/app/patient");
          break;
        case "donor":
          router.push("/app/donor");
          break;
        case "veterinary":
          router.push("/app/veterinary");
          break;
        case "organisation":
          router.push("/app/organisation");
          break;
        default:
          router.push("/app");
      }
    } catch (error) {
      console.error("Error completing onboarding:", error);
    }
  };

  if (isAuthLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <HeartLoading />
      </div>
    );
  }

  // If already onboarded, don't render content (useEffect will redirect)
  if (role !== "guest" && onboarded === "yes") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <HeartLoading />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <button
            onClick={() => router.push("/login")}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7 7" />
            </svg>
            Back to Login
          </button>
        </div>



        <div className="bg-white rounded-lg shadow-md p-6">
          {content}
        </div>
      </div>
    </div>
  );
};

// Role Selection Component
const RoleSelection: React.FC<{ onSelect: (role: string) => void }> = ({ onSelect }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-center mb-6">Select Your Role</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={() => onSelect("patient")}
          className="p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
        >
          <h3 className="text-lg font-semibold mb-2">🐕 Pet Patient</h3>
          <p className="text-gray-600">Request blood for your pet in need</p>
        </button>

        <button
          onClick={() => onSelect("donor")}
          className="p-6 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
        >
          <h3 className="text-lg font-semibold mb-2">🩸 Dog Donor</h3>
          <p className="text-gray-600">Register your dog as a blood donor</p>
        </button>

        <button
          onClick={() => onSelect("veterinary")}
          className="p-6 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors"
        >
          <h3 className="text-lg font-semibold mb-2">🏥 Veterinary Clinic</h3>
          <p className="text-gray-600">Manage blood requests and donations</p>
        </button>

        <button
          onClick={() => onSelect("organisation")}
          className="p-6 border-2 border-gray-200 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-colors"
        >
          <h3 className="text-lg font-semibold mb-2">🤝 Animal Welfare Organisation</h3>
          <p className="text-gray-600">Organize blood drives and support the community</p>
        </button>
      </div>
    </div>
  );
};

export default OnboardingPage;

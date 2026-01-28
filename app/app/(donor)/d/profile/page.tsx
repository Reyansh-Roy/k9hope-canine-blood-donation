"use client";
import { useEffect, useState, useRef } from "react";
import { useUser } from "@/context/UserContext";
import { useRouter } from "next/navigation";
import { getUserDataById, updateUserData } from "@/firebaseFunctions";
import {
  Edit, Save, X, Globe, Link as LinkIcon, User, Phone, Mail,
  MapPin, Droplet, Weight, Calendar, Heart, AlertTriangle,
  Shield, CheckCircle2, Dog, Camera, Info
} from "lucide-react";
import HeartLoading from "@/components/custom/HeartLoading";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ContentLayout } from "@/components/admin-panel/content-layout";
import { FileUploaderRegular } from '@uploadcare/react-uploader';
import '@uploadcare/react-uploader/core.css';

export default function ProfilePage() {
  const { userId, role } = useUser();
  const router = useRouter();

  const [donorData, setDonorData] = useState<any>(null);
  const [editMode, setEditMode] = useState(false);
  const [editedData, setEditedData] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublicLoading, setIsPublicLoading] = useState(false);

  useEffect(() => {
    if (!userId || role !== "donor") {
      router.push("/");
      return;
    }

    async function fetchProfile() {
      setIsLoading(true);
      try {
        const donor = await getUserDataById(userId, "donor");
        setDonorData(donor);
        setEditedData(donor || {});
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchProfile();
  }, [userId, role, router]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await updateUserData("donors", userId, editedData);
      if (response.success) {
        setDonorData(editedData);
        setEditMode(false);
        // Using alert for simplicity, could use a toast
        alert("Profile updated successfully!");
      } else {
        alert("Failed to update profile: " + response.message);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("An error occurred while saving.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleMakePublic = async () => {
    setIsPublicLoading(true);
    const newStatus = !donorData?.isPublic;
    try {
      const response = await updateUserData("donors", userId, { isPublic: newStatus });
      if (response.success) {
        setDonorData({ ...donorData, isPublic: newStatus });
        setEditedData({ ...editedData, isPublic: newStatus });
        alert(newStatus ? "Profile is now PUBLIC and visible to vets." : "Profile is now PRIVATE.");
      }
    } catch (error) {
      console.error("Error toggling public status:", error);
    } finally {
      setIsPublicLoading(false);
    }
  };

  const handleCancel = () => {
    setEditedData(donorData);
    setEditMode(false);
  };

  const copyProfileLink = () => {
    const link = `${window.location.origin}/donor-profile/${userId}`;
    navigator.clipboard.writeText(link);
    alert("Profile link copied to clipboard!");
  };

  const handleFileUpload = (e: any) => {
    if (e.allEntries && e.allEntries[0]?.status === 'success') {
      const cdnUrl = e.allEntries[0].cdnUrl;
      setEditedData({ ...editedData, d_photo: cdnUrl });
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background z-50">
        <HeartLoading />
      </div>
    );
  }

  const getInitials = (name: string) => {
    if (!name) return "D";
    return name.split(' ').map(n => n.charAt(0)).join('').toUpperCase().slice(0, 2);
  };

  const hasChanged = (key: string) => {
    return donorData && editedData[key] !== donorData[key];
  };

  // Eligibility Check Logic
  const checkEligibility = () => {
    if (!donorData) return { status: 'Unknown', color: 'text-gray-500', bg: 'bg-gray-50' };

    const weight = parseFloat(donorData.d_weight_kg || "0");
    const age = donorData.d_dob ? (new Date().getFullYear() - new Date(donorData.d_dob).getFullYear()) : 0;
    const isVaccinated = donorData.d_vaccinated === "yes" || donorData.d_vaccinated === true;
    const isHealthy = donorData.d_health_status === "healthy";

    if (weight >= 25 && age >= 1 && age <= 8 && isVaccinated && isHealthy) {
      return { status: 'Eligible Hero', color: 'text-green-700', bg: 'bg-green-50', icon: <CheckCircle2 className="w-4 h-4" /> };
    }
    return { status: 'Pending Review', color: 'text-orange-700', bg: 'bg-orange-50', icon: <AlertTriangle className="w-4 h-4" /> };
  };

  const eligibility = checkEligibility();

  return (
    <ContentLayout title="Dog Profile">
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col pb-10">
        {/* Top Header Actions */}
        <div className="max-w-7xl mx-auto w-full mb-6">
          <div className="flex flex-wrap gap-3 items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-3">
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold ${eligibility.bg} ${eligibility.color} border border-current opacity-80`}>
                {eligibility.icon}
                {eligibility.status}
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleMakePublic}
                disabled={isPublicLoading}
                className={`px-5 py-2.5 rounded-lg font-semibold flex items-center gap-2 shadow-sm transition-all active:scale-95 text-sm border ${donorData?.isPublic
                  ? "bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100"
                  : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                  }`}
              >
                <Globe className={`w-4 h-4 ${donorData?.isPublic ? "text-indigo-600" : "text-slate-400"}`} />
                {donorData?.isPublic ? "Public Profile" : "Make Public"}
              </button>
              <button
                onClick={copyProfileLink}
                className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-5 py-2.5 rounded-lg font-semibold flex items-center gap-2 shadow-sm transition-all active:scale-95 text-sm"
              >
                <LinkIcon className="w-4 h-4 text-slate-400" />
                Copy Link
              </button>
              {!editMode ? (
                <button
                  onClick={() => setEditMode(true)}
                  className="bg-red-500 hover:bg-red-600 text-white px-6 py-2.5 rounded-lg font-semibold flex items-center gap-2 shadow-sm transition-all active:scale-95 text-sm"
                >
                  <Edit className="w-4 h-4" />
                  Edit Profile
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={handleCancel}
                    disabled={isSaving}
                    className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-5 py-2.5 rounded-lg font-semibold flex items-center gap-2 text-sm disabled:opacity-50"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-6 py-2.5 rounded-lg font-semibold flex items-center gap-2 shadow-sm transition-all active:scale-95 text-sm"
                  >
                    <Save className="w-4 h-4" />
                    {isSaving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Forms */}
          <div className="lg:col-span-2 space-y-6">
            {/* Identity & Basic Info */}
            <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="bg-slate-50 border-b border-slate-100 px-8 py-4 flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Dog className="w-5 h-5 text-red-500" /> Canine Identity
                </h2>
                {editMode && <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 animate-pulse">Editing Mode</span>}
              </div>

              <div className="p-8">
                <div className="flex flex-col md:flex-row gap-10">
                  {/* Photo Section */}
                  <div className="flex flex-col items-center gap-4">
                    <div className="relative group">
                      <div className="w-40 h-40 rounded-2xl bg-slate-100 border-4 border-white shadow-xl flex items-center justify-center overflow-hidden">
                        {editedData.d_photo ? (
                          <img src={editedData.d_photo} alt="Dog" className="w-full h-full object-cover" />
                        ) : (
                          <div className="flex flex-col items-center text-slate-400">
                            <Dog className="w-12 h-12 mb-2 opacity-20" />
                            <span className="text-[10px] font-bold uppercase tracking-wider">No Photo</span>
                          </div>
                        )}
                      </div>
                      {editMode && (
                        <div className="mt-3 w-full">
                          <FileUploaderRegular
                            pubkey={process.env.NEXT_PUBLIC_UPLOADCARE_PUBLIC_KEY || '2dfc9b7ac4035bd19beb'}
                            multiple={false}
                            imgOnly={true}
                            sourceList="local, url, camera"
                            onChange={handleFileUpload}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Basic Fields */}
                  <div className="flex-1 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <ProfileField
                        icon={User}
                        label="Dog's Name"
                        value={editedData.d_name}
                        editable={editMode}
                        onChange={(val: string) => setEditedData({ ...editedData, d_name: val })}
                        placeholder="Buddy"
                        changed={hasChanged('d_name')}
                      />
                      <ProfileField
                        icon={Dog}
                        label="Breed"
                        value={editedData.d_breed}
                        editable={editMode}
                        onChange={(val: string) => setEditedData({ ...editedData, d_breed: val })}
                        placeholder="Golden Retriever"
                        changed={hasChanged('d_breed')}
                      />
                      <ProfileField
                        icon={Droplet}
                        label="Blood Type (DEA)"
                        value={editedData.d_bloodgroup}
                        editable={editMode}
                        onChange={(val: string) => setEditedData({ ...editedData, d_bloodgroup: val })}
                        type="select"
                        options={["DEA 1.1+", "DEA 1.1-", "DEA 1.2", "DEA 3", "DEA 4", "DEA 5", "DEA 7", "Universal"]}
                        changed={hasChanged('d_bloodgroup')}
                        highlight="text-red-600 font-bold"
                      />
                      <ProfileField
                        icon={Calendar}
                        label="Date of Birth"
                        value={editedData.d_dob}
                        editable={editMode}
                        onChange={(val: string) => setEditedData({ ...editedData, d_dob: val })}
                        type="date"
                        changed={hasChanged('d_dob')}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Health & Clinical Data */}
            <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="bg-slate-50 border-b border-slate-100 px-8 py-4">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Heart className="w-5 h-5 text-red-500" /> Medical & Health Status
                </h2>
              </div>

              <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                  <ProfileField
                    icon={Weight}
                    label="Weight (kg)"
                    value={editedData.d_weight_kg}
                    editable={editMode}
                    onChange={(val: string) => setEditedData({ ...editedData, d_weight_kg: val })}
                    type="number"
                    suffix="kg"
                    changed={hasChanged('d_weight_kg')}
                  />
                  <ProfileField
                    icon={Shield}
                    label="Health Condition"
                    value={editedData.d_health_status}
                    editable={editMode}
                    onChange={(val: string) => setEditedData({ ...editedData, d_health_status: val })}
                    type="select"
                    options={["healthy", "chronic_condition", "on_medication", "recovering"]}
                    changed={hasChanged('d_health_status')}
                  />
                </div>

                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">Core Eligibility Requirements</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <MedicalSwitch
                      label="Up-to-date Vaccinations"
                      subLabel="Required for all blood donors"
                      value={editedData.d_vaccinated === "yes" || editedData.d_vaccinated === true}
                      editable={editMode}
                      onChange={(checked) => setEditedData({ ...editedData, d_vaccinated: checked ? "yes" : "no" })}
                    />
                    <MedicalSwitch
                      label="Recent De-worming"
                      subLabel="Within the last 3 months"
                      value={editedData.d_dewormed === "yes" || editedData.d_dewormed === true}
                      editable={editMode}
                      onChange={(checked) => setEditedData({ ...editedData, d_dewormed: checked ? "yes" : "no" })}
                    />
                    <MedicalSwitch
                      label="Recent Donation"
                      subLabel="Has donated in last 8 weeks?"
                      value={editedData.d_isRecentDonation === "yes"}
                      editable={editMode}
                      onChange={(checked) => setEditedData({ ...editedData, d_isRecentDonation: checked ? "yes" : "no" })}
                      warningWhenTrue
                    />
                    <MedicalSwitch
                      label="On Long-term Medication"
                      subLabel="Excluding flea/tick/worming"
                      value={editedData.d_isMedication === "yes"}
                      editable={editMode}
                      onChange={(checked) => setEditedData({ ...editedData, d_isMedication: checked ? "yes" : "no" })}
                      warningWhenTrue
                    />
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Impact & Status */}
            <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
              <h3 className="font-bold text-slate-800 mb-6 flex items-center justify-between">
                Current Standing
                <Info className="w-4 h-4 text-slate-300" />
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-100 rounded-lg text-red-600">
                      <Droplet className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase">Donations</p>
                      <p className="text-xl font-black text-slate-800">{donorData?.totalDonations || 0}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-slate-400 uppercase">Lives Saved</p>
                    <p className="text-xl font-black text-red-600">{(donorData?.totalDonations || 0) * 3}</p>
                  </div>
                </div>

                <div className="p-4 bg-indigo-600 rounded-xl text-white shadow-lg shadow-indigo-200">
                  <p className="text-[10px] font-bold uppercase tracking-wider opacity-70 mb-1">Donor Tier</p>
                  <p className="text-lg font-bold">Lifesaver Guardian</p>
                  <div className="mt-4 w-full bg-indigo-400/30 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-white h-full transition-all duration-1000" style={{ width: '45%' }}></div>
                  </div>
                  <p className="text-[10px] mt-2 text-indigo-100 font-medium italic">2 more donations until Silver Tier</p>
                </div>
              </div>
            </section>

            {/* Support/Security Card */}
            <section className="bg-slate-800 rounded-2xl p-6 text-white shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <Shield className="w-6 h-6 text-indigo-400" />
                <h3 className="font-bold">Verified Information</h3>
              </div>

              <div className="space-y-4">
                <div className="opacity-80">
                  <p className="text-[10px] font-bold uppercase text-slate-400 mb-1">Registered Phone</p>
                  <p className="text-sm font-medium">{donorData?.phone}</p>
                </div>
                <div className="opacity-80">
                  <p className="text-[10px] font-bold uppercase text-slate-400 mb-1">Primary Location</p>
                  <p className="text-sm font-medium">{donorData?.d_city}, {donorData?.d_region?.[1] || donorData?.d_region?.[0]}</p>
                </div>
                <div className="pt-4 border-t border-slate-700 mt-2">
                  <p className="text-[11px] text-slate-400 leading-relaxed italic">
                    For security, contact info and location are verified at onboarding. Contact <span className="text-indigo-400 font-bold">support@k9hope.org</span> to update these.
                  </p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </ContentLayout>
  );
}

function ProfileField({ icon: Icon, label, value, editable, onChange, type = "text", options, highlight, placeholder, suffix, changed }: any) {
  return (
    <div className={`space-y-1.5 ${changed ? 'relative' : ''}`}>
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2 tracking-wider">
          <Icon className="w-3.5 h-3.5" />
          {label}
        </label>
        {changed && <span className="text-[9px] font-bold bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded leading-none">Modified</span>}
      </div>

      {editable ? (
        type === "select" ? (
          <Select value={value} onValueChange={onChange}>
            <SelectTrigger className="w-full h-11 border-slate-200 focus:ring-red-500 focus:border-red-500 bg-white rounded-lg transition-all">
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options.map((opt: string) => (
                <SelectItem key={opt} value={opt}>{opt}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <div className="relative">
            <Input
              type={type}
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              className="h-11 border-slate-200 focus:ring-red-500 focus:border-red-500 bg-white rounded-lg pr-10"
            />
            {suffix && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold pointer-events-none">
                {suffix}
              </span>
            )}
          </div>
        )
      ) : (
        <div className="h-11 flex items-center px-4 bg-slate-50 border border-slate-100 rounded-lg">
          <p className={`text-sm font-semibold truncate ${highlight || 'text-slate-700'}`}>
            {value || <span className="text-slate-400 italic">Not set</span>}
            {suffix && value && ` ${suffix}`}
          </p>
        </div>
      )}
    </div>
  );
}

function MedicalSwitch({ label, subLabel, value, editable, onChange, warningWhenTrue }: any) {
  const isActive = warningWhenTrue ? !value : value;

  return (
    <div className={`flex items-center justify-between p-4 rounded-xl border transition-all ${value
      ? (warningWhenTrue ? 'bg-amber-50 border-amber-100' : 'bg-green-50 border-green-100')
      : 'bg-slate-50 border-slate-100'
      }`}>
      <div className="pr-4">
        <p className="text-sm font-bold text-slate-800">{label}</p>
        <p className="text-[10px] text-slate-500 font-medium">{subLabel}</p>
      </div>
      {editable ? (
        <Switch checked={value} onCheckedChange={onChange} />
      ) : (
        <div className={`w-2.5 h-2.5 rounded-full ${isActive ? 'bg-green-500' : 'bg-slate-300'}`}></div>
      )}
    </div>
  );
}

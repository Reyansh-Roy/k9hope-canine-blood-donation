"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, ExternalLink, Building, Shield } from "lucide-react";
import { ContentLayout } from "@/components/admin-panel/content-layout";

interface Clinic {
  id: string;
  name: string;
  area: string;
  details: string;
  mapLink: string;
  theme: 'government' | 'clinical';
}

// Government-authorized Veterinary Centers in Chennai
const CLINICS: Clinic[] = [
  {
    id: 'mvc-vepery',
    name: 'Madras Veterinary College (MVC) Teaching Hospital',
    area: 'Vepery',
    details: 'Primary Government Referral Center',
    mapLink: 'https://www.google.com/maps/search/?api=1&query=Madras+Veterinary+College+Vepery+Chennai',
    theme: 'government'
  },
  {
    id: 'tanuvas-madhavaram',
    name: 'TANUVAS Peripheral Hospital',
    area: 'Madhavaram',
    details: 'Government Veterinary Clinical Services',
    mapLink: 'https://www.google.com/maps/search/?api=1&query=TANUVAS+Peripheral+Hospital+Madhavaram+Chennai',
    theme: 'government'
  },
  {
    id: 'sahs-chennai',
    name: 'SAHS Government Aided Center',
    area: 'Chennai',
    details: 'Specialized Surgical & Transfusion Unit',
    mapLink: 'https://www.google.com/maps/search/?api=1&query=Veterinary+Hospital+Chennai',
    theme: 'clinical'
  }
];

export default function AuthorizedClinics() {
  return (
    <ContentLayout title="Authorized Chennai Veterinary Network">
      <div className="p-4">
        <div className="max-w-6xl pb-6">
          <div className="flex items-center gap-3 mb-4">
            <Building className="h-8 w-8 text-red-600" />
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">
              🏥 Authorized Chennai Veterinary Network
            </h1>
          </div>
          <p className="text-md text-gray-700 dark:text-gray-300 mb-6">
            Government-led and specialized emergency canine blood management centers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {CLINICS.map((clinic) => (
            <a
              key={clinic.id}
              href={clinic.mapLink}
              target="_blank"
              rel="noopener noreferrer"
              className="block group"
            >
              <Card className={`
                flex flex-col pt-6 shadow-md hover:shadow-xl transition-all duration-300 rounded-2xl border-2
                ${clinic.theme === 'government' 
                  ? 'border-red-200 bg-red-50 hover:border-red-400 dark:border-red-800 dark:bg-red-950' 
                  : 'border-blue-200 bg-blue-50 hover:border-blue-400 dark:border-blue-800 dark:bg-blue-950'
                }
              `}>
                <CardContent className="flex flex-col space-y-4">
                  {/* Authorization Badge */}
                  <div className="flex items-center justify-center mb-2">
                    <div className={`
                      flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold
                      ${clinic.theme === 'government'
                        ? 'bg-red-600 text-white'
                        : 'bg-blue-600 text-white'
                      }
                    `}>
                      <Shield className="h-3 w-3" />
                      {clinic.theme === 'government' ? 'GOVT AUTHORIZED' : 'SPECIALIZED CENTER'}
                    </div>
                  </div>

                  {/* Clinic Name */}
                  <h2 className="text-xl font-bold text-center text-gray-800 dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {clinic.name}
                  </h2>

                  {/* Area */}
                  <div className="text-center">
                    <span className="text-lg font-bold text-gray-700 dark:text-gray-300">
                      <strong>{clinic.area}</strong>
                    </span>
                  </div>

                  {/* Details */}
                  <div className="text-center text-sm text-gray-600 dark:text-gray-400 italic">
                    {clinic.details}
                  </div>

                  {/* Map Link */}
                  <div className="flex items-center justify-center gap-2 text-blue-600 dark:text-blue-400 text-sm font-medium group-hover:text-blue-800 dark:group-hover:text-blue-300 transition-colors">
                    <MapPin className="h-4 w-4" />
                    <span>View on Google Maps</span>
                    <ExternalLink className="h-3 w-3" />
                  </div>
                </CardContent>
              </Card>
            </a>
          ))}
        </div>
      </div>
    </ContentLayout>
  );
}

// --@ts-nocheck
"use client";

import { ContentLayout } from "@/components/admin-panel/content-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, Clock, CheckCircle, AlertCircle, User, Calendar } from "lucide-react";
import { useUser } from "@/context/UserContext";
import { db } from "@/firebaseConfig";
import { collection, query, where, getDocs, orderBy, limit } from "firebase/firestore";
import { useState, useEffect } from "react";

interface Notification {
  id: string;
  type: 'donor_match' | 'clinical_reminder' | 'record_update' | 'emergency_alert';
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  actionUrl?: string;
}

export default function NotificationsPage() {
  const { userId } = useUser();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNotifications() {
      if (!userId) return;

      try {
        setLoading(true);
        const notificationsQuery = query(
          collection(db, "notifications"),
          where("userId", "==", userId),
          orderBy("timestamp", "desc"),
          limit(20)
        );
        
        const querySnapshot = await getDocs(notificationsQuery);
        const notificationData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          type: doc.data().type || 'emergency_alert',
          title: doc.data().title || 'Clinical Alert',
          message: doc.data().message || '',
          timestamp: doc.data().timestamp?.toDate() || new Date(),
          isRead: doc.data().isRead || false,
          actionUrl: doc.data().actionUrl || undefined,
          ...doc.data()
        })) as Notification[];
        
        setNotifications(notificationData);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchNotifications();
  }, [userId]);

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(date);
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'donor_match':
        return <User className="h-5 w-5 text-green-600" />;
      case 'clinical_reminder':
        return <Calendar className="h-5 w-5 text-blue-600" />;
      case 'record_update':
        return <CheckCircle className="h-5 w-5 text-emerald-600" />;
      case 'emergency_alert':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Bell className="h-5 w-5 text-gray-600" />;
    }
  };

  const getAlertBadge = (type: string) => {
    switch (type) {
      case 'donor_match':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Donor Match</Badge>;
      case 'clinical_reminder':
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">Clinical</Badge>;
      case 'record_update':
        return <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">Update</Badge>;
      case 'emergency_alert':
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">Emergency</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">Alert</Badge>;
    }
  };

  return (
    <ContentLayout title="🔔 Clinical Notifications & Alerts">
      <div className="p-4 space-y-4">
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-200"></div>
          </div>
        ) : notifications.length === 0 ? (
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardContent className="p-8 text-center">
              <Bell className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                All Caught Up
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                You have no clinical alerts at this time.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <Card key={notification.id} className={`
                bg-white dark:bg-gray-800 border-l-4 transition-all duration-200 hover:shadow-md
                ${!notification.isRead ? 'border-l-blue-500 bg-blue-50 dark:bg-blue-950' : 'border-gray-200 dark:border-gray-700'}
              `}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {getAlertIcon(notification.type)}
                      <div>
                        <h4 className="font-semibold text-gray-800 dark:text-gray-200">
                          {notification.title}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {notification.message}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getAlertBadge(notification.type)}
                      {!notification.isRead && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{formatTime(notification.timestamp)}</span>
                    </div>
                    {notification.actionUrl && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => window.open(notification.actionUrl, '_blank')}
                      >
                        View Details
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </ContentLayout>
  );
}

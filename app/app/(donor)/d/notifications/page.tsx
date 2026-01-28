"use client";
import React, { useEffect, useState } from "react";
import { useUser } from "@/context/UserContext";
import { useRouter } from "next/navigation";
import { db } from "@/firebaseConfig";
import { collection, query, where, orderBy, getDocs, updateDoc, doc } from "firebase/firestore";
import { ArrowLeft, Bell, Check, AlertCircle, Calendar, Heart, Info, Trash2, CheckCheck } from "lucide-react";
import HeartLoading from "@/components/custom/HeartLoading";
import Link from "next/link";
import { ContentLayout } from "@/components/admin-panel/content-layout";

export default function NotificationsPage() {
  const { userId, role } = useUser();
  const router = useRouter();

  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterType, setFilterType] = useState("all");

  useEffect(() => {
    if (!userId || role !== "donor") {
      router.push("/");
      return;
    }

    async function fetchNotifications() {
      setIsLoading(true);

      try {
        const notificationsRef = collection(db, "notifications");
        const q = query(
          notificationsRef,
          where("userId", "==", userId),
          orderBy("createdAt", "desc")
        );

        const snapshot = await getDocs(q);
        // Filter out deleted notifications on client side
        const notificationsData = snapshot.docs
          .map(doc => ({
            id: doc.id,
            ...doc.data()
          }))
          .filter((n: any) => !n.deleted);

        setNotifications(notificationsData);
      } catch (error) {
        console.error("Error fetching notifications:", error);
        setNotifications([]);
      }

      setIsLoading(false);
    }

    fetchNotifications();
  }, [userId, role, router]);

  const markAsRead = async (notificationId: string) => {
    try {
      await updateDoc(doc(db, "notifications", notificationId), {
        read: true
      });
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    const unread = notifications.filter(n => !n.read);
    for (const notification of unread) {
      await markAsRead(notification.id);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      await updateDoc(doc(db, "notifications", notificationId), {
        deleted: true
      });
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background z-50">
        <HeartLoading />
      </div>
    );
  }

  // Filter notifications
  const filteredNotifications = notifications.filter(n => {
    if (filterType === "all") return true;
    return n.type === filterType;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <ContentLayout title="Notifications">
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl mb-6 shadow-md">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="flex items-center gap-6">
              <div className="bg-white/20 p-4 rounded-xl relative shadow-sm">
                <Bell className="w-8 h-8 text-white" />
                {unreadCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shadow-sm border-2 border-indigo-600">
                    {unreadCount}
                  </span>
                )}
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-1">Notification Center</h2>
                <div className="flex items-center gap-3">
                  <p className="text-blue-100 font-medium">
                    {unreadCount > 0
                      ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`
                      : "You're all caught up!"}
                  </p>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-white text-xs bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full flex items-center gap-1 transition-colors"
                    >
                      <CheckCheck className="w-3 h-3" /> Mark all read
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Filter Tabs */}
        <section className="bg-white border-b rounded-xl mb-6 shadow-sm overflow-hidden">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex gap-2 py-4 overflow-x-auto scrollbar-hide">
              {[
                { key: "all", label: "All", icon: Bell },
                { key: "match", label: "Matches", icon: Heart },
                { key: "appointment", label: "Appointments", icon: Calendar },
                { key: "system", label: "System", icon: Info },
              ].map(({ key, label, icon: Icon }) => {
                const count = notifications.filter(n => key === "all" || n.type === key).length;
                return (
                  <button
                    key={key}
                    onClick={() => setFilterType(key)}
                    className={`px-6 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 whitespace-nowrap active:scale-95 ${filterType === key
                        ? "bg-blue-500 text-white shadow-md"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                    {count > 0 && <span className={`text-xs ml-1 px-1.5 py-0.5 rounded-full ${filterType === key ? 'bg-white/20' : 'bg-gray-200'}`}>{count}</span>}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Notifications List */}
        <main className="max-w-7xl mx-auto w-full pb-8 flex-1">
          {filteredNotifications.length > 0 ? (
            <div className="space-y-4">
              {filteredNotifications.map((notification) => (
                <NotificationCard
                  key={notification.id}
                  notification={notification}
                  onMarkRead={markAsRead}
                  onDelete={deleteNotification}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl p-16 text-center shadow-sm border border-gray-100 h-64 flex flex-col justify-center items-center">
              <div className="text-yellow-400 mb-6 relative">
                <Bell className="w-16 h-16 mx-auto opacity-20 text-gray-400" />
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-green-500 bg-white rounded-full p-2 border-4 border-white shadow-sm">
                  <Check className="w-8 h-8" strokeWidth={3} />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-700 mb-2">
                All Clear!
              </h3>
              <p className="text-gray-500">
                You have no {filterType !== "all" ? `${filterType} ` : ''}notifications at the moment.
              </p>
            </div>
          )}
        </main>
      </div>
    </ContentLayout>
  );
}

function NotificationCard({ notification, onMarkRead, onDelete }: any) {
  const createdAt = notification.createdAt?.toDate
    ? notification.createdAt.toDate()
    : new Date(notification.createdAt);

  const getRelativeTime = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    const intervals = {
      year: 31536000,
      month: 2592000,
      week: 604800,
      day: 86400,
      hour: 3600,
      minute: 60
    };

    for (const [name, secondsInInterval] of Object.entries(intervals)) {
      const interval = Math.floor(seconds / secondsInInterval);
      if (interval >= 1) {
        return `${interval} ${name}${interval > 1 ? 's' : ''} ago`;
      }
    }
    return 'Just now';
  };

  const typeConfig: Record<string, any> = {
    match: { icon: Heart, color: "bg-red-50 border-red-100", iconColor: "text-red-500", iconBg: "bg-red-100" },
    appointment: { icon: Calendar, color: "bg-blue-50 border-blue-100", iconColor: "text-blue-500", iconBg: "bg-blue-100" },
    system: { icon: Info, color: "bg-gray-50 border-gray-100", iconColor: "text-gray-500", iconBg: "bg-gray-100" },
  };

  const config = typeConfig[notification.type] || typeConfig.system;
  const Icon = config.icon;

  return (
    <div className={`bg-white border rounded-xl p-6 ${!notification.read ? 'border-l-4 border-l-blue-500 shadow-md bg-blue-50/10' : 'border-gray-100 shadow-sm'} transition-all hover:shadow-lg group relative overflow-hidden`}>
      {/* Unread Indicator Dot */}
      {!notification.read && (
        <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
      )}

      <div className="flex items-start gap-5">
        <div className={`${config.iconBg} ${config.iconColor} p-3 rounded-xl shrink-0`}>
          <Icon className="w-6 h-6" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
            <h3 className={`font-bold text-lg ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
              {notification.title}
            </h3>
            <span className="text-xs font-medium text-gray-400 whitespace-nowrap sm:ml-2">
              {getRelativeTime(createdAt)}
            </span>
          </div>

          <p className="text-gray-600 mb-4 leading-relaxed">
            {notification.message}
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            {notification.actionUrl && (
              <Link href={notification.actionUrl}>
                <button className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-semibold shadow-sm transition-all active:scale-95">
                  {notification.actionLabel || "View Details"}
                </button>
              </Link>
            )}
            {!notification.read && (
              <button
                onClick={() => onMarkRead(notification.id)}
                className="border border-gray-200 hover:bg-gray-50 hover:border-gray-300 text-gray-600 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors"
              >
                <Check className="w-4 h-4" />
                Mark as Read
              </button>
            )}
            <button
              onClick={() => onDelete(notification.id)}
              className="ml-auto text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
              aria-label="Delete notification"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

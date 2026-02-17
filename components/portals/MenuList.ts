import {
  Users,
  Settings, UserSearch, ChartArea,
  HeartPulse, CircleAlert, Hospital, BellRing, BookHeart,
  History, SquareUserRound, MessageCircleReply, CalendarCheck, BotMessageSquare,
  LayoutGrid, Syringe, PersonStanding,
  LucideIcon, Tent, HandCoins,
  AlertCircle, Bot, MessageSquare,
  UserCheck, Droplet, BarChart3, User
} from "lucide-react";

type Submenu = {
  href: string;
  label: string;
  active?: boolean;

};

type Menu = {
  href: string;
  label: string;
  active?: boolean;
  icon: LucideIcon;
  submenus?: Submenu[];
  isSpecial?: boolean; // For special styling (e.g., K9 Buddy AI)
};

type Group = {
  groupLabel: string;
  menus: Menu[];
};



export function getMenuList(pathname: string, role: "guest" | "admin" | "removed" | "patient" | "donor" | "veterinary" | "hospital" | "organisation"): Group[] {

  if (role === "organisation") {
    return [
      {
        groupLabel: "",
        menus: [
          {
            href: "/app/o/dashboard",
            label: "Dashboard",
            icon: LayoutGrid,
            submenus: []
          }
        ]
      },

      {
        groupLabel: "Manage",
        menus: [
          {
            href: "/app/o/camps-n-events",
            label: "Camps & Events",
            icon: Tent,
            submenus: []
          },
          {
            href: "/app/o/hospital-n-supply",
            label: "Hospital & Supply",
            icon: Hospital,
            submenus: []
          },
          {
            href: "/app/o/inventory",
            label: "Inventory",
            icon: Syringe,
            submenus: []
          },
          {
            href: "/app/o/volunteers",
            label: "Volunteers",
            icon: PersonStanding,
            submenus: []
          },
          {
            href: "/app/o/fundraising",
            label: "Fundraising",
            icon: HandCoins,
            submenus: []
          },
          {
            href: "/app/o/notifications",
            label: "Notifications",
            icon: BellRing
          },
        ]
      },
      {
        groupLabel: "Options",
        menus: [
          {
            href: "/app/o/profile",
            label: "Profile",
            icon: SquareUserRound
          },
          {
            href: "/app/o/settings",
            label: "Settings",
            icon: Settings
          },
        ]
      },
      {
        groupLabel: "Help & Support",
        menus: [
          {
            href: "/app/o/community",
            label: "Community",
            icon: Users
          },
          {
            href: "/app/o/feedback",
            label: "Feedback",
            icon: MessageCircleReply
          },
          {
            href: "/app/o/k9buddy",
            label: "Chat with K9 Buddy AI",
            icon: BotMessageSquare
          }
        ]
      }
    ];
  }

  // VETERINARY SIDEBAR OPTIONS 
  else if (role === "veterinary") {
    return [
      {
        groupLabel: "",
        menus: [
          {
            href: "/app/h/dashboard",
            label: "Dashboard",
            icon: LayoutGrid,
            submenus: []
          }
        ]
      },

      {
        groupLabel: "Manage",
        menus: [
          {
            href: "/app/h/blood-requests",
            label: "Blood Requests",
            icon: HeartPulse,
            submenus: []
          },
          {
            href: "/app/h/patient-management",
            label: "Pet Patient Management",
            icon: Users,
            submenus: []
          },
          {
            href: "/app/h/blood-inventory",
            label: "Blood Inventory",
            icon: Droplet,
            submenus: []
          },
          {
            href: "/app/h/donor-management",
            label: "Donor Management",
            icon: UserCheck,
            submenus: []
          },
          {
            href: "/app/h/analytics",
            label: "Analytics",
            icon: BarChart3,
            submenus: []
          },
        ]
      },
      {
        groupLabel: "Options",
        menus: [
          {
            href: "/app/h/profile",
            label: "Profile",
            icon: User
          },
        ]
      },
      {
        groupLabel: "Help & Support",
        menus: [
          {
            href: "/app/h/k9buddy",
            label: "K9 Buddy AI",
            icon: Bot,
            isSpecial: true
          }
        ]
      }
    ];
  }

  // PATIENT SIDEBAR OPTIONS
  else if (role === "patient") {
    return [
      {
        groupLabel: "",
        menus: [
          {
            href: "/app/p/dashboard",
            label: "Dashboard",
            icon: LayoutGrid,
            submenus: []
          }
        ]
      },
      {
        groupLabel: "Request",
        menus: [
          {
            href: "/app/p/request-blood",
            label: "Request Blood",
            icon: SquareUserRound
          },
          {
            href: "/app/p/appointments",
            label: "Appointments",
            icon: CalendarCheck
          },
          {
            href: "/app/p/history",
            label: "Past Transfusions",
            icon: History
          },
          {
            href: "/app/p/find-hospital",
            label: "Vet Hospital",
            icon: Hospital
          },
          {
            href: "/app/p/notifications",
            label: "Notifications",
            icon: BellRing
          },
        ]
      },
      {
        groupLabel: "Help & Support",
        menus: [
          {
            href: "/app/p/k9buddy",
            label: "K9 Buddy AI",
            icon: Bot,
            isSpecial: true // Special styling for AI chatbot
          }
        ]
      }
    ];
  }

  // DONOR SIDE BAR OPTIONS
  else if (role === "donor") {
    return [
      {
        groupLabel: "",
        menus: [
          {
            href: "/app/d/dashboard",
            label: "Dashboard",
            icon: LayoutGrid,
            submenus: []
          }
        ]
      },
      {
        groupLabel: "Contribute",
        menus: [
          {
            href: "",
            label: "Donate Now",
            icon: HeartPulse,
            submenus: [
              {
                href: "/app/d/donate/urgent",
                label: "Urgent"
              },
              {
                href: "/app/d/donate/nearby",
                label: "Nearby Donations"
              }
            ]
          },
          {
            href: "/app/d/appointments",
            label: "Appointments",
            icon: CalendarCheck
          },
          {
            href: "/app/d/donation-history",
            label: "Donation History",
            icon: History
          },
          {
            href: "/app/d/notifications",
            label: "Notifications",
            icon: BellRing
          }
        ]
      },
      {
        groupLabel: "Options",
        menus: [
          {
            href: "/app/d/profile",
            label: "Profile",
            icon: SquareUserRound
          }
        ]
      },
      {
        groupLabel: "",
        menus: [
          {
            href: "/app/d/k9buddy",
            label: "K9 Buddy AI",
            icon: Bot,
            isSpecial: true
          }
        ]
      }
    ];
  }

  return []; // Default empty menu for unknown roles
}
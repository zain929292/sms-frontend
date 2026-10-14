// constants/navItems.js
import { LayoutDashboard } from "lucide-react";

// ============================
// 1. ROLES CONFIGURATION
// ============================
const ROLES = {
  ADMIN: "admin",
  DOCTOR: "doctor",
  RECEPTIONIST: "receptionist",
  PHARMACIST: "pharmacist",
  LAB_TECHNICIAN: "lab_technician",
};

const ALL_ROLES = Object.values(ROLES);

// ============================
// 2. NAVIGATION ITEMS DEFINITION
// ============================
const NAV_ITEMS = [
  {
    id: "dashboard",
    to: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    roles: [ROLES.ADMIN, ROLES.DOCTOR, ROLES.RECEPTIONIST, ROLES.PHARMACIST , ROLES.LAB_TECHNICIAN],
  },
];

// ============================
// 3. NAVIGATION GROUPS
// ============================
const NAV_GROUPS = [
  {
    category: "Main",
    icon: LayoutDashboard,
    roles: ALL_ROLES,
    items: ["dashboard"],
  },
];

// ============================
// 4. HELPER FUNCTIONS
// ============================
const navItemsMap = NAV_ITEMS.reduce((acc, item) => {
  acc[item.id] = item;
  return acc;
}, {});

const buildGroupsWithItems = () => {
  return NAV_GROUPS.map((group) => ({
    ...group,
    items: group.items
      .map((id) => navItemsMap[id])
      .filter(Boolean)
      .map((item) => ({
        ...item,
        subItems: undefined,
      })),
  }));
};

const cachedNavGroups = buildGroupsWithItems();

// ============================
// 5. EXPORTED FUNCTIONS
// ============================
export const getUserRole = () => {
  try {
    const userData = localStorage.getItem("user");
    if (userData) {
      const user = JSON.parse(userData);
      return user.role?.toLowerCase() || ROLES.ADMIN;
    }
    return ROLES.ADMIN;
  } catch {
    return ROLES.ADMIN;
  }
};

export const getUser = () => {
  try {
    const userData = localStorage.getItem("user");
    if (userData) {
      return JSON.parse(userData);
    }
    return null;
  } catch {
    return null;
  }
};

export const getAllNavItems = () => NAV_ITEMS;

export const getNavItemsByRole = (role) => {
  if (!role) return [];
  const userRole = role.toLowerCase();
  return NAV_ITEMS.filter((item) => item.roles?.includes(userRole));
};

export const getNavGroupsByRole = (role) => {
  if (!role) return [];
  const userRole = role.toLowerCase();

  return cachedNavGroups
    .filter((group) => group.roles?.includes(userRole))
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => item.roles?.includes(userRole)),
    }))
    .filter((group) => group.items.length > 0);
};

export const hasRouteAccess = (role, routePath) => {
  if (!role || !routePath) return false;
  const userRole = role.toLowerCase();

  const navItem = NAV_ITEMS.find((item) => item.to === routePath);
  if (!navItem) return false;

  return navItem.roles?.includes(userRole) || false;
};

export const getParentItem = () => null;

export const getSubItems = () => [];

export const hasSubItems = () => false;

export const getBreadcrumb = (routePath) => {
  const navItem = NAV_ITEMS.find((item) => item.to === routePath);
  if (!navItem) return [];

  return [{ label: navItem.label, path: navItem.to }];
};

// ============================
// 6. DEFAULT EXPORT
// ============================
export default NAV_ITEMS;
export { NAV_ITEMS as allNavItems, NAV_GROUPS as navGroups };

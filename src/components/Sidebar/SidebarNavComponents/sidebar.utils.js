import { MODULE_CONFIG, PAGE_CONFIG } from "./sidebar.config";

export const formatSidebarData = (modules = []) => {
  return modules
    .filter((module) => module.status === "active")
    .map((module) => ({
      moduleName: module.name,
      icon: MODULE_CONFIG[module.name],

      items: (module.pages || [])
        .filter((page) => page.status === "active")
        .filter((page) => PAGE_CONFIG[page.name])
        .map((page) => ({
          ...PAGE_CONFIG[page.name],
          id: page.id,
          pageName: page.name,
        })),
    }))
    .filter((module) => module.items.length > 0);
};
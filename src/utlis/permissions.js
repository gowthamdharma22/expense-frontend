export const routePermissions = {
  "/template": ["admin"],
  "/data": ["admin"],
  "/expense/:id": ["admin", "employee"],
  "/expense": ["admin", "employee"],
  "/": ["admin", "employee"],
  "/notes/:shopId": ["admin", "employee"],
  "/summary": ["admin", "employee"],
};

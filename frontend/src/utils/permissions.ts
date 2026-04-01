/**
 * Frontend permission checking utilities for Super Admin enforcement
 */

export function isSuperAdmin(accessLevel?: string): boolean {
  return accessLevel === "Super Admin";
}

export function isManagerAdmin(accessLevel?: string): boolean {
  return accessLevel === "Manager Admin";
}

export function canInviteEmployees(accessLevel?: string): boolean {
  return isSuperAdmin(accessLevel);
}

export function canDeleteEmployeeInvites(accessLevel?: string): boolean {
  return isSuperAdmin(accessLevel);
}

export function canUpdateEmployeeStatus(accessLevel?: string): boolean {
  return isSuperAdmin(accessLevel);
}

export function canUpdateSettings(accessLevel?: string): boolean {
  return isSuperAdmin(accessLevel);
}

export function canCreateAdmin(accessLevel?: string): boolean {
  return isSuperAdmin(accessLevel);
}

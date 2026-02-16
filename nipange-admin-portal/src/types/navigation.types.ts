/**
 * Navigation Types
 * Type definitions for navigation structure
 * 
 * Used by: navigation.tsx, Sidebar component
 */

import { ReactNode } from 'react';
import { Module, Permission } from './permissions.types';

/**
 * Navigation item definition
 */
export interface NavigationItem {
  id: string;
  label: string;
  path: string;
  icon: ReactNode;
  module: Module;
  requiredPermissions: Permission[];
  badge?: string | number;
  children?: NavigationItem[];
}

/**
 * Navigation section (group of items)
 */
export interface NavigationSection {
  id: string;
  title?: string;
  items: NavigationItem[];
}

/**
 * Breadcrumb item
 */
export interface BreadcrumbItem {
  label: string;
  path?: string;
  icon?: ReactNode;
}
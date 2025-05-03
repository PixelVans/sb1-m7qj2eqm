import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { supabase } from './supabase';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getLogoUrl() {
  return supabase.storage
    .from('assets')
    .getPublicUrl('logo.jpg')
    .data.publicUrl;
}
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { supabase } from './supabase';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getLogoUrl() {
  return supabase.storage
    .from('assets')
    .getPublicUrl('WheresMySong3d.png')
    
    .data.publicUrl;
}

export function getAssetUrl(fileName: string) {
  return supabase.storage
    .from('assets')
    .getPublicUrl(fileName)
    .data.publicUrl;
}

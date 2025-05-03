export interface Event {
  id: string;
  created_at: string;
  dj_id: string;
  name: string;
  active: boolean;
  start_time?: string | null;
  end_time?: string | null;
  location?: string | null;
}

export interface QRSize {
  label: string;
  size: number;
  scale: number;
  quality: number;
}

export const QR_SIZES = [
  {
    label: 'Small (3")',
    size: 300,
    scale: 2,
    quality: 0.92,
  },
  {
    label: 'Medium (5")',
    size: 500,
    scale: 3,
    quality: 0.95,
  },
  {
    label: 'Large (8")',
    size: 800,
    scale: 4,
    quality: 0.98,
  },
] as const;
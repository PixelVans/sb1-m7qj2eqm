import React, { useState } from 'react';
import { Camera, Loader2, Link as LinkIcon, Instagram, Twitter, Facebook, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from './ui/dialog';
import { toast } from 'sonner';

interface ProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface SocialLinks {
  instagram?: string;
  twitter?: string;
  facebook?: string;
  website?: string;
}

export function ProfileDialog({ open, onOpenChange }: ProfileDialogProps) {
  const { user, signOut } = useAuth();
  const [loading, setLoading] = useState(false);
  const [djName, setDjName] = useState(user?.user_metadata?.dj_name || '');
  const [bio, setBio] = useState(user?.user_metadata?.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.user_metadata?.avatar_url || '');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [socialLinks, setSocialLinks] = useState<SocialLinks>(user?.user_metadata?.social_links || {});

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type and size
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('Invalid file type', {
        description: 'Please upload a JPEG, PNG, or WebP image',
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File too large', {
        description: 'Maximum file size is 5MB',
      });
      return;
    }

    setAvatarFile(file);
    setAvatarUrl(URL.createObjectURL(file));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      let newAvatarUrl = avatarUrl;

      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop();
        const filePath = `${user.id}/${Math.random()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, avatarFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);

        newAvatarUrl = publicUrl;
      }

      const { error } = await supabase.auth.updateUser({
        data: {
          dj_name: djName,
          avatar_url: newAvatarUrl,
          bio,
          social_links: socialLinks,
        },
      });

      if (error) throw error;
      
      toast.success('Profile updated successfully');
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Error updating profile', {
        description: 'Please try again later',
      });
    } finally {
      setLoading(false);
    }
  }

  const handleSocialLinkChange = (key: keyof SocialLinks, value: string) => {
    setSocialLinks(prev => ({ ...prev, [key]: value }));
  };

  const handleSignOut = async () => {
    await signOut();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div className="h-24 w-24 rounded-full overflow-hidden bg-white/10">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt="Profile"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-4xl font-semibold bg-primary/20 text-primary">
                      {djName?.[0] || 'DJ'}
                    </div>
                  )}
                </div>
                <label
                  htmlFor="avatar-upload"
                  className="absolute bottom-0 right-0 p-1 rounded-full bg-primary text-white cursor-pointer hover:bg-primary/90 transition-colors"
                >
                  <Camera className="h-4 w-4" />
                </label>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </div>

              <div className="w-full space-y-2">
                <label className="text-sm font-medium text-foreground">
                  DJ Name
                </label>
                <input
                  type="text"
                  value={djName}
                  onChange={(e) => setDjName(e.target.value)}
                  className="w-full px-3 py-2 rounded-md bg-white/10 border border-white/10 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Enter your DJ name"
                />
              </div>

              <div className="w-full space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Bio
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full px-3 py-2 rounded-md bg-white/10 border border-white/10 text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  placeholder="Tell people about yourself..."
                  rows={3}
                />
              </div>

              <div className="w-full space-y-4">
                <label className="text-sm font-medium text-foreground">
                  Social Links
                </label>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Instagram className="h-5 w-5 text-pink-400" />
                    <input
                      type="url"
                      value={socialLinks.instagram || ''}
                      onChange={(e) => handleSocialLinkChange('instagram', e.target.value)}
                      className="flex-1 px-3 py-2 rounded-md bg-white/10 border border-white/10 text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                      placeholder="Instagram profile URL"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Twitter className="h-5 w-5 text-blue-400" />
                    <input
                      type="url"
                      value={socialLinks.twitter || ''}
                      onChange={(e) => handleSocialLinkChange('twitter', e.target.value)}
                      className="flex-1 px-3 py-2 rounded-md bg-white/10 border border-white/10 text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                      placeholder="Twitter profile URL"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Facebook className="h-5 w-5 text-blue-600" />
                    <input
                      type="url"
                      value={socialLinks.facebook || ''}
                      onChange={(e) => handleSocialLinkChange('facebook', e.target.value)}
                      className="flex-1 px-3 py-2 rounded-md bg-white/10 border border-white/10 text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                      placeholder="Facebook profile URL"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <LinkIcon className="h-5 w-5 text-gray-400" />
                    <input
                      type="url"
                      value={socialLinks.website || ''}
                      onChange={(e) => handleSocialLinkChange('website', e.target.value)}
                      className="flex-1 px-3 py-2 rounded-md bg-white/10 border border-white/10 text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                      placeholder="Personal website URL"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-between sm:gap-0">
            <Button
              type="button"
              variant="destructive"
              onClick={handleSignOut}
              className="w-full sm:w-auto"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
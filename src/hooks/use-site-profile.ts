
'use client';

import { useState, useEffect } from 'react';
import type { SiteProfile } from '@/lib/types';
import { getSiteProfile } from '@/lib/db';
import { useToast } from './use-toast';

const SESSION_STORAGE_KEY = 'site-profile';

export function useSiteProfile() {
  const [profile, setProfile] = useState<SiteProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchProfile() {
      // 1. Try to get data from sessionStorage
      try {
        const cachedProfile = sessionStorage.getItem(SESSION_STORAGE_KEY);
        if (cachedProfile) {
          setProfile(JSON.parse(cachedProfile));
          setIsLoading(false);
          return;
        }
      } catch (error) {
        console.error("Failed to read from sessionStorage:", error);
      }

      // 2. If not in cache, fetch from Firestore
      try {
        const firestoreProfile = await getSiteProfile();
        if (firestoreProfile) {
          setProfile(firestoreProfile);
          // 3. Save to sessionStorage
          try {
            sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(firestoreProfile));
          } catch (error) {
            console.error("Failed to write to sessionStorage:", error);
          }
        }
      } catch (error) {
        console.error("Failed to fetch site profile:", error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Could not load site profile.',
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchProfile();
  }, [toast]);

  return { profile, isLoading };
}

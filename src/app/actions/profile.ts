
'use server';

import { db } from '@/lib/db/sqlite';
import type { SiteProfile } from '@/lib/types';
import { revalidatePath } from 'next/cache';

const SITE_PROFILE_ID = "happymountainnepal";

// Helper to parse JSON safely
function parseJSON(str: string | null) {
    if (!str) return undefined;
    try {
        return JSON.parse(str);
    } catch (e) {
        return undefined;
    }
}

export async function getSiteProfileAction(): Promise<SiteProfile | null> {
    const stmt = db.prepare('SELECT * FROM profile WHERE id = ?');
    const row = stmt.get(SITE_PROFILE_ID) as any;

    if (!row) return null;

    return {
        ...row,
        heroImages: parseJSON(row.heroImages),
        socials: parseJSON(row.socials),
        whyUs: parseJSON(row.whyUs),
        chatbot: parseJSON(row.chatbot),
    } as SiteProfile;
}

export async function updateSiteProfileAction(data: Partial<SiteProfile>) {
    // Check if profile exists
    const existing = await getSiteProfileAction();

    if (!existing) {
        // Create new
        const stmt = db.prepare(`
      INSERT INTO profile (
        id, basePath, reviewCount, contactEmail, phone, address, 
        heroTitle, heroDescription, footerTagline, location, locationUrl, 
        heroImage, heroImages, heroTransitionInterval, socials, whyUs, chatbot
      ) VALUES (
        ?, ?, ?, ?, ?, ?, 
        ?, ?, ?, ?, ?, 
        ?, ?, ?, ?, ?, ?
      )
    `);

        // Merge provided data with defaults if needed (though here we just insert what's given)
        // For a partial update on a non-existent row, we essentially create it.

        stmt.run(
            SITE_PROFILE_ID,
            data.basePath || null,
            data.reviewCount || 0,
            data.contactEmail || null,
            data.phone || null,
            data.address || null,
            data.heroTitle || null,
            data.heroDescription || null,
            data.footerTagline || null,
            data.location || null,
            data.locationUrl || null,
            data.heroImage || null,
            JSON.stringify(data.heroImages || []),
            data.heroTransitionInterval || 5000,
            JSON.stringify(data.socials || {}),
            JSON.stringify(data.whyUs || []),
            JSON.stringify(data.chatbot || {})
        );
    } else {
        // Update existing
        // We need to dynamically build the SET clause or just update all fields merging with existing
        // A simpler approach for SQLite with fixed columns is to just update all valid columns
        // But since 'data' is Partial, we should respect that.

        // However, for typical form submissions, we often send the whole object.
        // Let's implement a merge update.

        const merged = { ...existing, ...data };

        const stmt = db.prepare(`
      UPDATE profile SET
        basePath = ?,
        reviewCount = ?,
        contactEmail = ?,
        phone = ?,
        address = ?,
        heroTitle = ?,
        heroDescription = ?,
        footerTagline = ?,
        location = ?,
        locationUrl = ?,
        heroImage = ?,
        heroImages = ?,
        heroTransitionInterval = ?,
        socials = ?,
        whyUs = ?,
        chatbot = ?
      WHERE id = ?
    `);

        stmt.run(
            merged.basePath || null,
            merged.reviewCount || 0,
            merged.contactEmail || null,
            merged.phone || null,
            merged.address || null,
            merged.heroTitle || null,
            merged.heroDescription || null,
            merged.footerTagline || null,
            merged.location || null,
            merged.locationUrl || null,
            merged.heroImage || null,
            JSON.stringify(merged.heroImages || []),
            merged.heroTransitionInterval || 5000,
            JSON.stringify(merged.socials || {}),
            JSON.stringify(merged.whyUs || []),
            JSON.stringify(merged.chatbot || {}),
            SITE_PROFILE_ID
        );
    }

    revalidatePath('/');
    revalidatePath('/manage/profile');
}

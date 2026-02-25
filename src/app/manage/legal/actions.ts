
'use server';

import { getLegalContent, saveLegalContent } from '@/lib/db/sqlite';
import { revalidatePath } from 'next/cache';

export async function fetchLegalContent(id: 'terms' | 'privacy') {
  return getLegalContent(id);
}

export async function updateLegalContentAction(id: 'terms' | 'privacy', content: string) {
  saveLegalContent(id, content);
  revalidatePath(`/legal/${id === 'terms' ? 'terms' : 'privacy'}`);
  revalidatePath(`/manage/legal/${id === 'terms' ? 'terms' : 'privacy'}`);
  return { success: true };
}

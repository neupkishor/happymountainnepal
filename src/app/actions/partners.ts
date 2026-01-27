
'use server';

import { db } from '@/lib/db/sqlite';
import type { Partner } from '@/lib/types';
import { revalidatePath } from 'next/cache';
import { randomUUID } from 'crypto';

export async function getPartnersAction(): Promise<Partner[]> {
    const stmt = db.prepare('SELECT * FROM partners');
    return stmt.all() as Partner[];
}

export async function getPartnerByIdAction(id: string): Promise<Partner | undefined> {
    const stmt = db.prepare('SELECT * FROM partners WHERE id = ?');
    return stmt.get(id) as Partner | undefined;
}

export async function createPartnerAction(data: Omit<Partner, 'id'>) {
    const id = randomUUID();
    const stmt = db.prepare(`
    INSERT INTO partners (id, name, logo, description, link)
    VALUES (?, ?, ?, ?, ?)
  `);
    stmt.run(id, data.name, data.logo, data.description, data.link || null);
    revalidatePath('/');
    revalidatePath('/manage/partners');
    return id;
}

export async function updatePartnerAction(id: string, data: Omit<Partner, 'id'>) {
    const stmt = db.prepare(`
    UPDATE partners
    SET name = ?, logo = ?, description = ?, link = ?
    WHERE id = ?
  `);
    stmt.run(data.name, data.logo, data.description, data.link || null, id);
    revalidatePath('/');
    revalidatePath('/manage/partners');
}

export async function deletePartnerAction(id: string) {
    const stmt = db.prepare('DELETE FROM partners WHERE id = ?');
    stmt.run(id);
    revalidatePath('/');
    revalidatePath('/manage/partners');
}

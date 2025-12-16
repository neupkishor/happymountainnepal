import { readFile } from 'fs/promises';
import { join } from 'path';
import type { NavLink } from '@/components/layout/HeaderV3Nav';

interface NavigationData {
    header: {
        links: NavLink[];
    };
    footer: {
        links: any[];
    };
}

export async function getNavigationData(): Promise<NavigationData> {
    try {
        const filePath = join(process.cwd(), 'src', 'navigation-components.json');
        const data = await readFile(filePath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error loading navigation data:', error);
        // Return default structure if file doesn't exist
        return {
            header: { links: [] },
            footer: { links: [] }
        };
    }
}

export async function getHeaderLinks(): Promise<NavLink[]> {
    const data = await getNavigationData();
    return data.header.links;
}

export async function getFooterLinks(): Promise<any[]> {
    const data = await getNavigationData();
    return data.footer.links;
}

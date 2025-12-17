
import fs from 'fs/promises';
import path from 'path';
import managerData from '../base/manager.json';
import sessionData from '../base/session.json';
import navigationComponentsData from '../base/navigation-components.json';
import redirectsData from '../base/redirects.json';

// For server-side Node.js environment
const BASE_PATH = path.join(process.cwd(), 'src', 'base');

export async function readBaseFile<T>(file: string): Promise<T> {
    const filePath = path.join(BASE_PATH, file);
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
}

export async function writeBaseFile(file: string, data: any): Promise<void> {
    const filePath = path.join(BASE_PATH, file);
    const dir = path.dirname(filePath);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

export async function baseFileExists(file: string): Promise<boolean> {
    try {
        const filePath = path.join(BASE_PATH, file);
        await fs.access(filePath);
        return true;
    } catch {
        return false;
    }
}

// Functions to make JSON data available in different runtimes
export function getManagerData() {
    return managerData;
}

export function getSessionData() {
    return sessionData;
}

export function getNavigationComponentsData() {
    return navigationComponentsData;
}

export function getRedirectsData() {
    return redirectsData;
}

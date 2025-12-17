import fs from 'fs/promises';
import path from 'path';

/**
 * Base storage path - top-level directory for mutable runtime data
 * This directory is inside src/ for:
 * - Included in build output
 * - Deployed with the application
 * - Works in production (Firebase App Hosting, Vercel, etc.)
 * - Acts as lightweight local DB
 */
const BASE_PATH = path.join(process.cwd(), 'src', 'base');

/**
 * Read a JSON file from the base storage
 * @param file - Relative path to file within base/ (e.g., 'manager.json' or 'settings/app.json')
 * @returns Parsed JSON data
 */
export async function readBaseFile<T>(file: string): Promise<T> {
    const filePath = path.join(BASE_PATH, file);
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
}

/**
 * Write data to a JSON file in base storage
 * @param file - Relative path to file within base/ (e.g., 'manager.json')
 * @param data - Data to write (will be JSON.stringify'd)
 */
export async function writeBaseFile(file: string, data: any): Promise<void> {
    const filePath = path.join(BASE_PATH, file);

    // Ensure directory exists
    const dir = path.dirname(filePath);
    await fs.mkdir(dir, { recursive: true });

    // Write file with pretty formatting
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

/**
 * Check if a file exists in base storage
 * @param file - Relative path to file within base/
 * @returns true if file exists
 */
export async function baseFileExists(file: string): Promise<boolean> {
    try {
        const filePath = path.join(BASE_PATH, file);
        await fs.access(filePath);
        return true;
    } catch {
        return false;
    }
}

/**
 * Delete a file from base storage
 * @param file - Relative path to file within base/
 */
export async function deleteBaseFile(file: string): Promise<void> {
    const filePath = path.join(BASE_PATH, file);
    await fs.unlink(filePath);
}

/**
 * List all files in a base storage directory
 * @param dir - Relative path to directory within base/ (default: root)
 * @returns Array of filenames
 */
export async function listBaseFiles(dir: string = ''): Promise<string[]> {
    const dirPath = path.join(BASE_PATH, dir);
    const files = await fs.readdir(dirPath);
    return files;
}

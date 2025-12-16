import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';

export async function POST(request: NextRequest) {
    try {
        const data = await request.json();

        // Validate the data structure
        if (!data.header || !data.footer) {
            return NextResponse.json(
                { error: 'Invalid data structure' },
                { status: 400 }
            );
        }

        // Write to navigation-components.json in the src folder
        const filePath = join(process.cwd(), 'src', 'navigation-components.json');
        await writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');

        return NextResponse.json({
            success: true,
            message: 'Navigation data saved successfully'
        });
    } catch (error) {
        console.error('Error saving navigation data:', error);
        return NextResponse.json(
            { error: 'Failed to save navigation data' },
            { status: 500 }
        );
    }
}

export async function GET() {
    try {
        const { readFile } = await import('fs/promises');
        const { join } = await import('path');

        const filePath = join(process.cwd(), 'src', 'navigation-components.json');
        const data = await readFile(filePath, 'utf-8');

        return NextResponse.json(JSON.parse(data));
    } catch (error) {
        console.error('Error reading navigation data:', error);
        return NextResponse.json(
            { error: 'Failed to read navigation data' },
            { status: 500 }
        );
    }
}

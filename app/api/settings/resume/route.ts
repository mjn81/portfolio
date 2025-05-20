import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const dataDir = path.resolve(process.cwd(), 'data');
const settingsFilePath = path.join(dataDir, 'settings.json');

interface Settings {
  resumeUrl?: string;
  [key: string]: any;
}

async function readSettings(): Promise<Settings> {
  try {
    await fs.mkdir(dataDir, { recursive: true });
    const data = await fs.readFile(settingsFilePath, 'utf-8');
    return JSON.parse(data);
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      // File doesn't exist, return default settings
      return { resumeUrl: '' };
    }
    console.error('Failed to read settings:', error);
    throw new Error('Failed to read settings.');
  }
}

async function writeSettings(settings: Settings): Promise<void> {
  try {
    await fs.mkdir(dataDir, { recursive: true });
    await fs.writeFile(settingsFilePath, JSON.stringify(settings, null, 2));
  } catch (error) {
    console.error('Failed to write settings:', error);
    throw new Error('Failed to write settings.');
  }
}

export async function GET() {
  try {
    const settings = await readSettings();
    return NextResponse.json({ resumeUrl: settings.resumeUrl || null });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch resume URL.' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { resumeUrl } = await request.json();
    if (typeof resumeUrl !== 'string') {
      return NextResponse.json({ error: 'Invalid resumeUrl provided.' }, { status: 400 });
    }

    const settings = await readSettings();
    settings.resumeUrl = resumeUrl;
    await writeSettings(settings);

    return NextResponse.json({ message: 'Resume URL updated successfully.', resumeUrl });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update resume URL.' }, { status: 500 });
  }
} 
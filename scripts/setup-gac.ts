import * as fs from 'node:fs';
import * as path from 'node:path';

const credentialsJsonString: string | undefined = process.env.GOOGLE_SERVICE_ACCOUNT_CREDENTIALS_JSON;
const credentialsFilePath: string | undefined = process.env.GOOGLE_APPLICATION_CREDENTIALS;

// Early exit if essential environment variables are not set or if JSON string is empty
if (!credentialsFilePath) {
    // console.log("[Startup Script] GOOGLE_APPLICATION_CREDENTIALS environment variable is not set. Skipping service account file creation.");
    process.exit(0); // Exit gracefully, nothing to do
}

if (!credentialsJsonString || credentialsJsonString.trim() === "") {
    // console.log("[Startup Script] GOOGLE_SERVICE_ACCOUNT_CREDENTIALS_JSON environment variable is not set or is empty. Skipping service account file creation.");
    process.exit(0); // Exit gracefully, nothing to do
}

// Resolve the absolute path for the credentials file
// process.cwd() is the directory from which the Node.js process was launched.
// If package.json scripts are run with `pnpm run ...`, cwd is usually the project root.
const projectRoot: string = process.cwd();
const absoluteCredentialsFilePath: string = path.resolve(projectRoot, credentialsFilePath);

try {
    // Check if the directory for the credentials file exists, create it if not.
    const dirName: string = path.dirname(absoluteCredentialsFilePath);
    if (!fs.existsSync(dirName)) {
        fs.mkdirSync(dirName, { recursive: true });
        console.log(`[Startup Script] Created directory: ${dirName}`);
    }

    if (!fs.existsSync(absoluteCredentialsFilePath)) {
        fs.writeFileSync(absoluteCredentialsFilePath, credentialsJsonString, 'utf8');
        console.log(`[Startup Script] Successfully created service account file at: ${absoluteCredentialsFilePath}`);
    } else {
        // console.log(`[Startup Script] Service account file already exists at: ${absoluteCredentialsFilePath}. No action taken.`);
    }
} catch (error: any) { // Explicitly type error or use unknown and check
    console.error(`[Startup Script] Error processing service account file ${absoluteCredentialsFilePath}:`, error);
    process.exit(1); // Exit with an error code
}

process.exit(0); // Successful execution

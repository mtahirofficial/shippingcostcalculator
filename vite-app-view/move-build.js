import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// ESM workaround for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Path to the build output directory
const buildPath = path.join(__dirname, 'dist');

// Destination path for the custom build location
const customBuildPath = path.join(__dirname, '../build');

fs.removeSync(customBuildPath);

// Ensure the custom build directory exists
fs.ensureDirSync(customBuildPath);

// Move the build output to the custom build location
fs.copySync(buildPath, customBuildPath, { overwrite: true });

// Delete the original build folder
fs.removeSync(buildPath);

console.log('Build moved to custom location successfully.');
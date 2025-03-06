// This file serves as the main entry point for the application
// It just forwards to our main.js in the src/main directory
import { app } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Forward to the actual main process file
import './src/main/main.js';
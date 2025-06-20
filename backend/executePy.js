import { fileURLToPath } from 'url';
import path, { join, dirname } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { exec } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);

const outputPath = join(__dirname, 'outputs');

if (!existsSync(outputPath)) {
  mkdirSync(outputPath, { recursive: true });
}

export function executePy(filePath, input = '') {
  return new Promise((resolve, reject) => {
    const executeCommand = `python3 "${filePath}"`;
    
    const childProcess = exec(executeCommand, { 
      timeout: 10000,
      cwd: path.dirname(filePath)
    }, (executeError, executeStdout, executeStderr) => {
      if (executeError) {
        if (executeError.signal === 'SIGTERM') {
          return reject(new Error('Execution timeout (10 seconds exceeded)'));
        }
        return reject(new Error(`Runtime error: ${executeError.message}`));
      }
    
      if (executeStderr && executeStderr.trim() !== '' && (!executeStdout || executeStdout.trim() === '')) {
        return reject(new Error(`Runtime error: ${executeStderr}`));
      }
      
      let result = executeStdout || '';
      if (executeStderr && executeStderr.trim() !== '') {
        result += '\n--- Warnings/Info ---\n' + executeStderr;
      }
      
      resolve(result);
    });
    
    if (input && input.trim() !== '') {
      childProcess.stdin.write(input);
    }
    childProcess.stdin.end();
  });
}
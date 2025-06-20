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

export function executeCpp(filePath, input = '') {
  const jobId = path.basename(filePath).split('.')[0];
  const outfileName = `${jobId}.exe`;
  const outputFilePath = join(outputPath, outfileName);
  
  return new Promise((resolve, reject) => {
    const compileCommand = `g++ "${filePath}" -o "${outputFilePath}"`;
    
    exec(compileCommand, { timeout: 10000 }, (compileError, compileStdout, compileStderr) => {
      if (compileError) {
        if (compileError.signal === 'SIGTERM') {
          return reject(new Error('Compilation timeout (10 seconds exceeded)'));
        }
        return reject(new Error(`Compilation error: ${compileStderr || compileError.message}`));
      }
      
      if (compileStderr && compileStderr.trim() !== '') {
        return reject(new Error(`Compilation error: ${compileStderr}`));
      }
      
      const executeCommand = `"${outputFilePath}"`;
      const childProcess = exec(executeCommand, { 
        timeout: 10000,
        cwd: outputPath 
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
        
        resolve(executeStdout || '');
      });
      
      if (input && input.trim() !== '') {
        childProcess.stdin.write(input);
      }
      childProcess.stdin.end();
    });
  });
}
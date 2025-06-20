import { readFileSync } from 'fs';
import { spawn } from 'child_process';
import path from 'path';
import os from 'os';

const JAVA_HOME = 'C:\\Program Files\\Java\\jdk-24';

function extractClassName(javaCode) {
  const match = javaCode.match(/(?:public\s+)?class\s+(\w+)/);
  return match ? match[1] : 'Main';
}

function getJavaPath(command) {
  const isWindows = os.platform() === 'win32';
  return isWindows ? `${JAVA_HOME}\\bin\\${command}.exe` : command;
}

function runCommand(command, args, cwd, input = '') {
  return new Promise((resolve, reject) => {
    const process = spawn(command, args, { 
      cwd, 
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout: 15000
    });
    
    let stdout = '';
    let stderr = '';
    
    process.stdout.on('data', data => stdout += data);
    process.stderr.on('data', data => stderr += data);
    
    process.on('close', code => {
      if (code !== 0) {
        reject(new Error(stderr || `Process exited with code ${code}`));
      } else {
        resolve(stdout);
      }
    });
    
    process.on('error', err => reject(err));
    
    if (input) {
      process.stdin.write(input);
    }
    process.stdin.end();
  });
}

export async function executeJava(filePath, input = '') {
  const javaCode = readFileSync(filePath, 'utf8');
  const className = extractClassName(javaCode);
  const fileDir = path.dirname(filePath);
  
  await runCommand(
    getJavaPath('javac'), 
    ['--enable-preview', '--release', '24', filePath], 
    fileDir
  );
  
  const output = await runCommand(
    getJavaPath('java'), 
    ['--enable-preview', '-XX:+ShowCodeDetailsInExceptionMessages', className], 
    fileDir, 
    input
  );
  
  return output;
}
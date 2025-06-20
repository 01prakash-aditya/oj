import { existsSync, mkdirSync, writeFileSync } from 'fs';
import path, { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuid } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);

const dirCodes = join(__dirname, 'codes');

if (!existsSync(dirCodes)) {
  mkdirSync(dirCodes, { recursive: true });
}

function extractJavaClassName(javaCode) {
  const classMatch = javaCode.match(/public\s+class\s+(\w+)/);
  if (classMatch) {
    return classMatch[1];
  }
  
  const anyClassMatch = javaCode.match(/class\s+(\w+)/);
  if (anyClassMatch) {
    return anyClassMatch[1];
  }
  
  return 'Main';
}

export function generateFile(language = 'cpp', code) {
  const jobId = uuid();
  
  const extensions = {
    'cpp': 'cpp',
    'c++': 'cpp',
    'python': 'py',
    'python3': 'py',
    'py': 'py',
    'java': 'java'
  };
  
  const extension = extensions[language.toLowerCase()] || language;
  
  let fileName;
  if (language.toLowerCase() === 'java') {
    const className = extractJavaClassName(code);
    fileName = `${className}.${extension}`;
  } else {
    fileName = `${jobId}.${extension}`;
  }
  
  const filePath = join(dirCodes, fileName);
  writeFileSync(filePath, code);
  return filePath;
}
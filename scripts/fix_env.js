import fs from 'fs';
const envPath = './.env';
let content = fs.readFileSync(envPath, 'utf8');
const keyLine = 'GEMINI_API_KEY=AIzaSyClq-VJmbXE48ZtuF4FZ--Z3bB8zsYei_g';
if (!content.includes('GEMINI_API_KEY')) {
    content = content.trim() + '\n' + keyLine + '\n';
} else {
    content = content.replace(/GEMINI_API_KEY=.*/, keyLine);
}
fs.writeFileSync(envPath, content);
console.log('Fixed .env content');

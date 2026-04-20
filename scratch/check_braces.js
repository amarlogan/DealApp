const fs = require('fs');
const content = fs.readFileSync('apps/web/src/app/HomeClient.tsx', 'utf8');

let braceCount = 0;
let parenCount = 0;
let inString = false;
let stringChar = '';

for (let i = 0; i < content.length; i++) {
    const char = content[i];
    if ((char === '"' || char === "'" || char === "`") && content[i-1] !== '\\') {
        if (!inString) {
            inString = true;
            stringChar = char;
        } else if (stringChar === char) {
            inString = false;
        }
    }
    if (!inString) {
        if (char === '{') braceCount++;
        if (char === '}') braceCount--;
        if (char === '(') parenCount++;
        if (char === ')') parenCount--;
    }
}

console.log(`Brace Count: ${braceCount}`);
console.log(`Paren Count: ${parenCount}`);

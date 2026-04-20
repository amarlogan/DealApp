const fs = require('fs');
const content = fs.readFileSync('apps/web/src/app/HomeClient.tsx', 'utf8');

let braceCount = 0;
let parenCount = 0;
let inString = false;
let stringChar = '';

const lines = content.split('\n');
for (let l = 0; l < lines.length; l++) {
    const line = lines[l];
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if ((char === '"' || char === "'" || char === "`") && line[i-1] !== '\\') {
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
    console.log(`${l + 1}: B=${braceCount} P=${parenCount} | ${line.substring(0, 40)}`);
}

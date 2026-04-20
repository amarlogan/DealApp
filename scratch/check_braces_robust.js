const fs = require('fs');
const content = fs.readFileSync('apps/web/src/app/HomeClient.tsx', 'utf8');

let braceCount = 0;
let parenCount = 0;
let inString = false;
let stringChar = '';
let inComment = false;
let inBlockComment = false;

const lines = content.split('\n');
for (let l = 0; l < lines.length; l++) {
    const line = lines[l];
    inComment = false; // Reset line comment
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        const nextChar = line[i+1];
        
        // Handle comments
        if (!inString) {
            if (!inBlockComment && char === '/' && nextChar === '/') {
                inComment = true;
                break; 
            }
            if (!inBlockComment && char === '/' && nextChar === '*') {
                inBlockComment = true;
                i++;
                continue;
            }
            if (inBlockComment && char === '*' && nextChar === '/') {
                inBlockComment = false;
                i++;
                continue;
            }
        }
        
        if (inBlockComment || inComment) continue;

        // Handle strings (including template literals)
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
        } else if (stringChar === '`' && char === '$' && nextChar === '{') {
            // Template literal interpolation starts a brace count
            braceCount++;
            i++; 
            // We need to treat the inside as code, so we temporarily exit string mode
            // Actually, nesting template literals is complex, but let's just count the braces
        }
    }
}

console.log(`Braces: ${braceCount}, Parens: ${parenCount}`);

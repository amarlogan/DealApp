const fs = require('fs');
const path = require('path');

const COMPASS_PATH = path.join(__dirname, '../COMPASS.md');
const APP_DIR = path.join(__dirname, '../apps/web/src/app');

function getRoutes(dir, baseRoute = '') {
    let routes = [];
    const files = fs.readdirSync(dir);

    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            if (file.startsWith('(')) {
                // Route group, skip folder name but recurse
                routes = routes.concat(getRoutes(fullPath, baseRoute));
            } else if (file.startsWith('[')) {
                // Dynamic route
                routes = routes.concat(getRoutes(fullPath, `${baseRoute}/${file}`));
            } else {
                routes = routes.concat(getRoutes(fullPath, `${baseRoute}/${file}`));
            }
        } else if (file === 'page.tsx' || file === 'page.js') {
            routes.push({
                path: baseRoute || '/',
                file: path.relative(path.join(__dirname, '../'), fullPath).replace(/\\/g, '/')
            });
        }
    }
    return routes;
}

function updateCompass() {
    console.log('🔄 Updating Developer Compass...');

    try {
        const routes = getRoutes(APP_DIR);
        const routeSection = routes
            .map(r => `- \`${r.path}\` -> \`${r.file}\``)
            .join('\n');

        let content = fs.readFileSync(COMPASS_PATH, 'utf8');

        // Regex to find and replace the Route Map section
        const regex = /(## 🗺️ Route Map \(Current\)\n)([\s\S]*?)(\n##)/;
        if (regex.test(content)) {
            content = content.replace(regex, `$1${routeSection}$3`);
        }

        fs.writeFileSync(COMPASS_PATH, content);
        console.log('✅ Compass Route Map updated successfully.');
    } catch (error) {
        console.error('❌ Failed to update Compass:', error.message);
    }
}

updateCompass();

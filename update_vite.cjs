const fs = require('fs');
let config = fs.readFileSync('vite.config.ts', 'utf8');
config = config.replace('server: {', "server: {\n    watch: {\n      ignored: ['**/.wrangler/**']\n    },");
fs.writeFileSync('vite.config.ts', config);

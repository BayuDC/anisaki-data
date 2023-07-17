const fs = require('fs/promises');

async function main() {
    const data = {
        message: 'Hello World!',
    };

    await fs.writeFile('./public/data.json', JSON.stringify(data));
}

main();

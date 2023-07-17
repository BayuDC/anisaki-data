const fs = require('fs/promises');
const got = require('got');
const { zones } = require('./config');

async function main() {
    const query = `
    query (
        $page: Int, $perPage: Int, 
    ) {
        data: Page(page: $page, perPage: $perPage) {
            pageInfo {
                total
                perPage
            }
            animes: media(
                type: ANIME,
                format_in: [TV],
                status: RELEASING,
                isAdult: false,
            ) {
                id
                title {
                    romaji
                    english
                    native
                }
                type
                nextAiringEpisode {
                    id
                    episode
                    airingAt
                    timeUntilAiring
                }
                status
                coverImage {
                    large
                }
            }
        }
    }`;

    const animes = [];

    let page = 1;

    while (true) {
        const res = await got
            .post('https://graphql.anilist.co', {
                json: {
                    query,
                    variables: {
                        page,
                        status: 'RELEASING',
                    },
                },
            })
            .json();
        animes.push(...res.data.data.animes);
        if (res.data.data.animes.length < 50) break;
        page++;
    }

    for (const zone of zones) {
        const schedule = [[], [], [], [], [], [], []];

        animes.forEach(anime => {
            if (!anime.nextAiringEpisode) return;
            const date = new Date(0);
            date.setUTCSeconds(anime.nextAiringEpisode.airingAt);
            date.setHours(date.getHours() + zone);
            schedule[date.getDay()].push(anime);
        });

        await fs.writeFile(`./public/data+${zone}.json`, JSON.stringify({ schedule }));
    }
}

main();

const fs = require('fs/promises');
const got = require('got');

async function main() {
    const query = `
    query (
        $page: Int, $perPage: Int, $season: MediaSeason, $seasonYear: Int, $status: MediaStatus
    ) {
        data: Page(page: $page, perPage: $perPage) {
            pageInfo {
                total
                perPage
            }
            animes: media(
                type: ANIME, sort: FAVOURITES_DESC, season: $season, seasonYear: $seasonYear, status: $status,
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
    const variables = {
        page: 1,
        season: 'SUMMER',
        seasonYear: 2023,
        status: 'RELEASING',
    };

    const schedule = [[], [], [], [], [], [], []];

    const res = await got
        .post('https://graphql.anilist.co', {
            json: { query, variables },
        })
        .json();

    res.data.data.animes.forEach(anime => {
        if (!anime.nextAiringEpisode) return;
        const date = new Date(0);
        date.setUTCSeconds(anime.nextAiringEpisode.airingAt);
        schedule[date.getDay()].push(anime);
    });

    await fs.writeFile('./public/data.json', JSON.stringify({ schedule }));
}

main();

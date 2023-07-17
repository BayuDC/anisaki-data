const fs = require('fs/promises');
const got = require('got');

async function main() {
    const query = `
    query (
        $page: Int, $perPage: Int, $season: MediaSeason, $seasonYear: Int, $status: MediaStatus
    ) {
        Page(page: $page, perPage: $perPage) {
            pageInfo {
                total
                perPage
            }
            media(
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

    const res = await got
        .post('https://graphql.anilist.co', {
            json: { query, variables },
        })
        .json();

    console.log(res.data.Page.media);

    await fs.writeFile('./public/data.json', JSON.stringify(res.data.Page.media));
}

main();

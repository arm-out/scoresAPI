import { error, type RequestHandler } from '@sveltejs/kit';

const date = new Date().toISOString().split('T')[0];
const BASKETBALL = `https://api.sofascore.com/api/v1/sport/basketball/scheduled-events/${date}`;
const FOOTBALL = `https://api.sofascore.com/api/v1/sport/american-football/scheduled-events/${date}`

export const GET: RequestHandler = async ({ fetch, params }) => {
    const options = {
        method: 'GET',
        headers: {
          authority: 'api.sofascore.com',
          accept: '*/*',
          'accept-language': 'en-US,en;q=0.9',
          'cache-control': 'no-cache',
          dnt: '1',
          origin: 'https://www.sofascore.com',
          pragma: 'no-cache',
          referer: 'https://www.sofascore.com/',
          'sec-ch-ua': '"Not_A Brand";v="8", "Chromium";v="120"',
          'sec-ch-ua-mobile': '?0',
          'sec-ch-ua-platform': '"macOS"',
          'sec-fetch-dest': 'empty',
          'sec-fetch-mode': 'cors',
          'sec-fetch-site': 'same-site',
          'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
    };

    const res = params.league === 'NBA' ? await fetch(BASKETBALL, options) : await fetch(FOOTBALL, options);
    const games = await res.json();

    let filtered = games.events.filter((game: any) => game.tournament.uniqueTournament.name === params.league);
    let today = filtered.filter((game: any) => new Date(parseInt(game.startTimestamp) * 1000).toLocaleDateString('en-US') === new Date().toLocaleDateString('en-US'));

    // Show previous day games if no games today
    if (today.length == 0) {
        today = filtered
    }
    
    let apiRes = filtered.map((game: any) => ({
        date: new Date(parseInt(game.startTimestamp) * 1000).toLocaleDateString('en-US', { timeZone: 'America/New_York'}),
        today: new Date().toLocaleDateString('en-US', { timeZone: 'America/New_York'}), 
        home: game.homeTeam.shortName,
        away: game.awayTeam.shortName,
        startTime: game.startTimestamp,
        status: game.status.type,
        statusDesc: game.status.description,
        homeScore: game.homeScore.current ? game.homeScore.current : 0,
        awayScore: game.awayScore.current ? game.awayScore.current : 0,
        period: game.lastPeriod ? game.lastPeriod : "",
        periodLength: game.time.periodLength ? game.time.periodLength : 0,
        overtimeLength: game.time.overtimeLength ? game.time.overtimeLength : 0,
        timePlayed: game.time.played ? game.time.played : 0,
    }))


	return new Response(JSON.stringify(apiRes));
};
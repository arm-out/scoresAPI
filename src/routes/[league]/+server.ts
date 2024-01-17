import { error, type RequestHandler } from '@sveltejs/kit';
import puppeteer from 'puppeteer';

const NBA_SCOREBOARD = 'https://www.espn.com/nba/scoreboard';
// const NFL_SCOREBOARD = 'https://www.espn.com/nfl/scoreboard';
const NFL_SCOREBOARD = 'https://www.espn.com/nfl/scoreboard/_/week/1/year/2023/seasontype/3';

export const GET: RequestHandler = async ({ params }) => {
	const browser = await puppeteer.launch({ headless: 'new' });
	const page = await browser.newPage();

	if (params.league === 'nfl') await page.goto(NFL_SCOREBOARD);
	else if (params.league === 'nba') await page.goto(NBA_SCOREBOARD);

	const games = await page.evaluate(() => {
		const gameCard = document.querySelectorAll('section.gameModules');
		// const dateNow = new Date();
		const dateNow = new Date(Date.parse('Sunday, January 14, 2024'));

		for (let i = 0; i < gameCard.length; i++) {
			const date = gameCard[i].querySelector('header h3')!.innerHTML;
			const gameDate = new Date(Date.parse(date));
			if (
				gameDate.getFullYear() != dateNow.getFullYear() ||
				gameDate.getMonth() != dateNow.getMonth() ||
				gameDate.getDate() != dateNow.getDate()
			) {
				continue;
			}

			const scores = gameCard[i].querySelectorAll('div.ScoreboardScoreCell');
			const games = Array.from(scores).map((cell) => {
				const time = cell.querySelector('div.ScoreCell__Time')!.innerHTML;
				const note = cell.querySelector('div.ScoreboardScoreCell__Note')?.innerHTML || '';
				const teams = cell.querySelectorAll('li');

				return {
					time,
					note,
					team1: {
						logo: teams[0].querySelector('img')!.src,
						name: teams[0].querySelector('div.ScoreCell__TeamName')!.innerHTML,
						record: teams[0].querySelector('span.ScoreboardScoreCell__Record')!.innerHTML,
						score: teams[0].querySelector('div.ScoreCell__Score')?.innerHTML || ''
					},
					team2: {
						logo: teams[1].querySelector('img')!.src,
						name: teams[1].querySelector('div.ScoreCell__TeamName')!.innerHTML,
						record: teams[1].querySelector('span.ScoreboardScoreCell__Record')!.innerHTML,
						score: teams[1].querySelector('div.ScoreCell__Score')?.innerHTML || ''
					}
				};
			});

			return { games };
		}
	});

	console.log(games);

	browser.close();
	return new Response(JSON.stringify(games));

	error(404, 'Not found');
};

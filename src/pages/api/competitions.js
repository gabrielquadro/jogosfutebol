export default async function handler(req, res) {
    const { id, matchday, code } = req.query;

    try {
        let url;
        if (matchday && code) {
            url = `http://api.football-data.org/v4/competitions/${code}/matches?matchday=${matchday}`;
        } else if (id) {
            url = `http://api.football-data.org/v4/competitions/${id}/matches`;
        } else if (code) {
            url = `http://api.football-data.org/v4/competitions/${code}/teams`;
        } else {
            url = 'http://api.football-data.org/v4/competitions';
        }

        console.log('Generated URL:', url);

        const response = await fetch(url, {
            headers: { 'X-Auth-Token': '6311a66f5f8746fd8860a5de6173f49f' },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch data');
        }

        const data = await response.json();
        res.status(200).json(data);
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ error: 'Failed to fetch data' });
    }
}
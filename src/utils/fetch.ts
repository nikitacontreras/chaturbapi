export const fetchStatsFromAPI = async (username: string, token: string): Promise<any> => {
	const url = `https://chaturbate.com/affiliates/apistats/?username=${username}&token=${token}`;
	const response = await fetch(url);
	if (!response.ok) {
		throw new Error("Failed to fetch stats");
	}
	return await response.json();
};

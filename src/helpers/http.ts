import axios from 'axios';

export async function fetchEtuoviSite(urls: string[]) {
    try {
        urls.forEach(async (url) => {
            const response = await axios.get(url);

            if (response.status !== 200) {
                throw new Error(
                    `Etuovi location didn't response correctly. Sent status ${response.status}`
                );
            }

            console.log(response);
        });
    } catch (error) {
        console.error(error);
    }
}

import { gmail_v1 } from 'googleapis/build/src/apis/gmail/v1';
import { GaxiosResponse } from 'gaxios';
import { uniq } from 'lodash';

const etuoviLinkRegex = new RegExp(/https:\/\/www\.etuovi\.com\/kohde\/\d+/gm);
const subjectRegex = new RegExp(/Uusia asuntoja vahdiltasi.*/gm);

export function handleMessage(
    message: GaxiosResponse<gmail_v1.Schema$Message>
) {
    const payload = message.data?.payload;
    const id = message.data?.id;

    if (!payload || !id) {
        return;
    }

    const subjectHeader = payload.headers?.find(
        (header) => header.name === 'Subject'
    );

    // Test that the subject is correct so we dont' handle e.g. marketing mail

    if (
        !subjectHeader?.value ||
        !subjectRegex.test(String(subjectHeader.value))
    ) {
        return;
    }

    const htmls = payload.parts?.map((part) => {
        let buff = Buffer.from(String(part.body?.data), 'base64');
        return buff.toString('ascii');
    });
}

/*
 * Return array of unique links in html message
 */
export function parseHTMLMessageForLinks(html: string) {
    const links = [...html.matchAll(etuoviLinkRegex)].map((i) => i[0]);
    return uniq(links);
}

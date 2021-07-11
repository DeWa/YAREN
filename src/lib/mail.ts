import { gmail_v1, google } from 'googleapis';
import * as fs from 'fs';
import * as readline from 'readline';
import * as cron from 'node-cron';
import { OAuth2Client } from 'google-auth-library';

import messageQueueEmitter from './emitter';
import eventEmitter from './emitter';

export interface GCloudCredentials {
    installed: {
        client_id: string;
        project_id: string;
        auth_uri: string;
        token_uri: string;
        auth_provider_x509_cert_url: string;
        client_secret: string;
        redirect_uris: string[];
    };
}

export default class MailChecker {
    private readonly SCOPES = [
        'https://www.googleapis.com/auth/gmail.readonly',
    ];
    private readonly TOKEN_PATH = 'token.json';
    private readonly POLLING_DELAY = 15; // 15 minutes

    private auth: OAuth2Client | undefined;
    private gmail: gmail_v1.Gmail | undefined;

    /**
     * Create an OAuth2 client with the given credentials, and then execute the
     * given callback function.
     * @param {Object} credentials The authorization client credentials.
     * @param {function} callback The callback to call with the authorized client.
     */
    private authorize(
        credentials: GCloudCredentials,
        callback: (oAuth2Client: OAuth2Client) => void
    ) {
        const { client_secret, client_id, redirect_uris } =
            credentials.installed;
        const oAuth2Client = new google.auth.OAuth2(
            client_id,
            client_secret,
            redirect_uris[0]
        );

        // Check if we have previously stored a token.
        fs.readFile(this.TOKEN_PATH, (err, token) => {
            if (err) return this.getNewToken(oAuth2Client, callback);
            oAuth2Client.setCredentials(JSON.parse(String(token)));
            callback(oAuth2Client);
        });
    }
    /**
     * Get and store new token after prompting for user authorization, and then
     * execute the given callback with the authorized OAuth2 client.
     * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
     * @param {getEventsCallback} callback The callback for the authorized client.
     */
    private getNewToken(oAuth2Client: OAuth2Client, callback: any) {
        const authUrl = oAuth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: this.SCOPES,
        });
        console.log('Authorize this app by visiting this url:', authUrl);
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });
        rl.question('Enter the code from that page here: ', (code) => {
            rl.close();
            oAuth2Client.getToken(code, (err, token) => {
                if (err)
                    return console.error('Error retrieving access token', err);
                oAuth2Client.setCredentials(token!);
                // Store the token to disk for later program executions
                fs.writeFile(this.TOKEN_PATH, JSON.stringify(token), (err) => {
                    if (err) return console.error(err);
                    console.log('Token stored to', this.TOKEN_PATH);
                });
                callback(oAuth2Client);
            });
        });
    }

    private startPolling() {
        this.checkEmail();

        cron.schedule(`*/${this.POLLING_DELAY} * * * *`, () => {
            this.checkEmail();
        });
        console.info('Email polling started');
    }

    private async checkEmail() {
        const response = await this.gmail?.users.messages.list({
            userId: 'me',
            includeSpamTrash: false,
            q: 'from:no-reply@etuovi.com is:unread',
        });

        if (!response?.data.messages) {
            console.error('Empty response');
            return;
        }

        const { messages } = response.data;
        if (messages.length > 0) {
            this.getMessages(messages);
        }
    }

    private async setMessageRead(messageId: string) {
        try {
            this.gmail?.users.messages.modify({
                userId: 'me',
                id: messageId,
                requestBody: {
                    removeLabelIds: ['UNREAD'],
                },
            });
        } catch (error) {
            console.error(error);
        }
    }

    private getMessages(messages: gmail_v1.Schema$Message[]) {
        messages.forEach(async (message) => {
            const messageResponse = await this.gmail?.users.messages.get({
                userId: 'me',
                id: message.id!,
            });
            eventEmitter.emit('message', messageResponse);
        });
    }

    start() {
        // The file token.json stores the user's access and refresh tokens, and is
        // created automatically when the authorization flow completes for the first
        // time.
        fs.readFile('credentials.json', (err, content) => {
            if (err)
                return console.log('Error loading client secret file:', err);

            // Authorize a client with credentials, then call the Gmail API.
            this.authorize(
                JSON.parse(String(content)),
                (auth: OAuth2Client) => {
                    this.auth = auth;
                    this.gmail = google.gmail({
                        version: 'v1',
                        auth: this.auth,
                    });
                    this.startPolling();
                }
            );
        });
    }
}

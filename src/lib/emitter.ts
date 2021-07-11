import EventEmitter from 'events';
import { gmail_v1 } from 'googleapis/build/src/apis/gmail/v1';
import { GaxiosResponse } from 'gaxios';

import { handleMessage } from './message';

const eventEmitter = new EventEmitter();

eventEmitter.on(
    'message',
    (message: GaxiosResponse<gmail_v1.Schema$Message>) => {
        handleMessage(message);
    }
);

export default eventEmitter;

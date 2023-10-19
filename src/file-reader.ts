import fs from 'fs';
import axios from 'axios';
import { InvalidJsonFileError } from './errors';

export const getFile = async (filePath: string): Promise<string> => {
    try {
        return await fs.promises.readFile(filePath, { encoding: 'utf-8' });
    } catch (ex) {
        throw new Error(); // TODO
    }
};

export const getJson = async (filePath: string): Promise<object> => {
    const needsDownload = /https?:\/\//.test(filePath);
    try {
        const json = needsDownload ? (await axios.get(filePath)).data : JSON.parse(await getFile(filePath));
        return json;
    } catch (ex) {
        throw new InvalidJsonFileError(filePath, <Error>ex);
    }
};

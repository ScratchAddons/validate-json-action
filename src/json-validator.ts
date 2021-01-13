import path from 'path';
import { getJson } from './file-reader';
import { schemaValidator } from './schema-validator';
import { prettyLog } from './logger';

export interface ValidationResult {
    filePath: string;
    valid: boolean;
}

export const validateJsons = async (
    // sourceDir: string,
    schemaPath: string,
    // jsonRelativePaths: string[]
    jsonAbsolutePaths: string[]
): Promise<ValidationResult[]> => {
    // if (!/https?:\/\//.test(schemaPath)) schemaPath = path.join(sourceDir, schemaPath);
    if (!/https?:\/\//.test(schemaPath)) schemaPath = schemaPath;
    try {
        const schema = await getJson(schemaPath);
        const validatorFunc = await schemaValidator.prepareSchema(schema);
        prettyLog(schemaPath);
        return await Promise.all(
            // jsonRelativePaths.map(async relativePath => {
            jsonAbsolutePaths.map(async absolutePath => {
                // const filePath = path.join(sourceDir, relativePath);
                const filePath = absolutePath;
                try {
                    const jsonData = await getJson(filePath);
                    const result = await schemaValidator.validate(jsonData, validatorFunc);
                    prettyLog(filePath);
                    return { filePath, valid: result };
                } catch (e) {
                    prettyLog(filePath, e);
                    return { filePath, valid: false };
                }
            })
        );
    } catch (err) {
        prettyLog(schemaPath, err);
        return [{ filePath: schemaPath, valid: false }];
    }
};

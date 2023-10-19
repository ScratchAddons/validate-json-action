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
    jsonPaths: string[],
    sourceDir?: string
): Promise<ValidationResult[]> => {
    // if (!/https?:\/\//.test(schemaPath)) schemaPath = path.join(sourceDir, schemaPath);
    if (!/https?:\/\//.test(schemaPath)) schemaPath = sourceDir ? path.join(sourceDir, schemaPath) : schemaPath;
    try {
        const globalSchema = await getJson(schemaPath);
        let globalValidateFunction = await schemaValidator.prepareSchema(globalSchema);
        prettyLog(schemaPath);
        return await Promise.all(
            // jsonRelativePaths.map(async relativePath => {
            jsonPaths.map(async jsonPath => {
                // const filePath = path.join(sourceDir, relativePath);
                const filePath = sourceDir ? path.join(sourceDir, jsonPath) : jsonPath;
                try {
                    const jsonData = await getJson(filePath);
                    let validateFunction = globalValidateFunction
                    if (jsonData?.['$schema']) {
                        const fileSchema = await getJson(jsonData?.['$schema'])
                        validateFunction = await schemaValidator.prepareSchema(fileSchema)
                    }
                    const result = await schemaValidator.validate(jsonData, validateFunction);
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

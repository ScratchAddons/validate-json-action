import * as core from '@actions/core';
import path from 'path';
import { getConfig, verifyConfigValues } from './configuration';
import { validateJsons } from './json-validator';
import { getFile } from './file-reader';
import * as glob from '@actions/glob';

async function run() {
    console.log('hello!');
    try {
        const configuration = getConfig();
        const configurationErrors = verifyConfigValues(configuration);
        if (configurationErrors) {
            configurationErrors.forEach(e => core.error(e));
            core.setFailed('Missing configuration');
            return;
        }

        let jsonRelativePaths: string[];

        if (configuration.JSONS.endsWith('.txt')) {
            jsonRelativePaths = (await getFile(path.join(configuration.GITHUB_WORKSPACE, configuration.JSONS))).split(
                configuration.SEPARATOR
            );
        } else {
            jsonRelativePaths = configuration.JSONS.split(configuration.SEPARATOR);
        }

        core.info(jsonRelativePaths.join('\n'));

        jsonRelativePaths = await (await glob.create(jsonRelativePaths.join('\n'))).glob();

        core.info(jsonRelativePaths.join('\n'));

        const validationResults = await validateJsons(
            configuration.GITHUB_WORKSPACE,
            configuration.SCHEMA,
            jsonRelativePaths
        );

        const invalidJsons = validationResults.filter(res => !res.valid).map(res => res.filePath);

        core.setOutput('INVALID', invalidJsons.length > 0 ? invalidJsons.join(',') : '');

        if (invalidJsons.length > 0) {
            core.setFailed('Failed to validate all JSON files.');
        } else {
            core.info(`✅ All files were validated successfully.`);
        }
    } catch (error) {
        core.setFailed(error.message);
    }
}

run();

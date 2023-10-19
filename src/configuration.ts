import * as core from '@actions/core';

export enum ConfigKey {
    GITHUB_WORKSPACE = 'GITHUB_WORKSPACE',
    SCHEMA = 'SCHEMA',
    JSONS = 'JSONS',
    SEPARATOR = 'SEPARATOR',
}

export type ConfigKeys = keyof typeof ConfigKey;

type KeyMapping = {
    key: ConfigKey;
    setup: 'ENV' | 'INPUT';
    required?: boolean
};

type Config = {
    [key in ConfigKeys]: string;
};

export const configMapping: KeyMapping[] = [
    {
        key: ConfigKey.GITHUB_WORKSPACE,
        setup: 'ENV',
        required: true,
    },
    { key: ConfigKey.SCHEMA, setup: 'INPUT' },
    { key: ConfigKey.JSONS, setup: 'INPUT', required: true },
    { key: ConfigKey.SEPARATOR, setup: 'INPUT', required: true },
];

export function getConfig(): Config {
    let config = {};
    configMapping.forEach(i => {
        let value: string;
        switch (i.setup) {
            case 'ENV':
                value = <string>process.env[ConfigKey[i.key]];
                break;
            case 'INPUT':
                value = core.getInput(ConfigKey[i.key]);
                break;
            default:
                value = '';
                break;
        }
        core.debug(`${ConfigKey[i.key]}: ${value}`);
        config[ConfigKey[i.key]] = value;
    });
    return config as Config;
}

export function verifyConfigValues(config: Config): string[] | undefined {
    let errors: string[] = [];
    Object.keys(config).forEach(key => {
        const mapping = configMapping.find(i => i.key === key);
        if (mapping?.required === true && config[key] === '') {
            errors.push(
                `🚨 Missing ${key} ${mapping!.setup === 'ENV' ? 'environment variable' : mapping!.setup.toLowerCase()}`
            );
        }
    });
    return errors.length > 0 ? errors : undefined;
}

import * as os from 'os';
import * as process from 'process';
import * as path from 'path';
import * as cp from 'child_process';
import { MockedConfig } from './mocks/mocked-config';

let mockedConfig: MockedConfig;
let ip: string;

describe('GitHub action results', () => {
    beforeEach(() => {
        ip = path.join(__dirname, '..', 'lib', 'main.js');
        mockedConfig = new MockedConfig();
    });

    afterEach(() => {
        ip = '';
        mockedConfig.resetAll();
        jest.resetAllMocks();
    });

    test('No errors when all inputs are set and valid', () => {
        // Arrange
        mockedConfig.mockValue('SCHEMA', './__tests__/mocks/schema/valid.json');
        mockedConfig.mockValue('JSONS', './__tests__/mocks/tested-data/valid.json');
        mockedConfig.mockValue('SEPARATOR', ',');

        mockedConfig.set();

        const options: cp.ExecOptions = {
            env: process.env,
        };

        // Act
        const result = cp.execSync(`node ${ip}`, options);

        // Assert
        expect(result.toString()).toContain(`validated successfully`);
    });

    test('Error is thrown when GITHUB_WORKSPACE environment variable is not set', () => {
        // Arrange
        mockedConfig.resetAll();
        mockedConfig.mockValue('SCHEMA', './__tests__/mocks/schema/valid.json');
        mockedConfig.mockValue('JSONS', './__tests__/mocks/tested-data/valid.json');
        mockedConfig.mockValue('SEPARATOR', ',');

        mockedConfig.set();

        const options: cp.ExecOptions = {
            env: process.env,
        };

        try {
            // Act
            cp.execSync(`node ${ip}`, options);
        } catch (ex: any) {
            // Assert
            expect(ex).not.toBeUndefined();
            expect(ex.output).not.toBeUndefined();
            expect(ex.output.toString()).toContain(`Missing GITHUB_WORKSPACE environment variable`);
        }
    });

    test('No errors (by grace) when JSONS input is not set', () => {
        // Arrange
        mockedConfig.mockValue('SCHEMA', './__tests__/mocks/schema/valid.json');
        mockedConfig.mockValue('SEPARATOR', ',');

        mockedConfig.set();

        const options: cp.ExecOptions = {
            env: process.env,
        };

        // Act
        const result = cp.execSync(`node ${ip}`, options);
        // Assert
        expect(result.toString()).toContain(`No JSONS supplied`);
    });

    test('No errors (by grace) when SEPARATOR input is not set', () => {
        // Arrange
        mockedConfig.mockValue('JSONS', './__tests__/mocks/tested-data/valid.json');
        mockedConfig.mockValue('SCHEMA', './__tests__/mocks/schema/valid.json');

        mockedConfig.set();

        const options: cp.ExecOptions = {
            env: process.env,
        };

        // Act
        const result = cp.execSync(`node ${ip}`, options);
        // Assert
        expect(result.toString()).toContain(`validated successfully`);
    });

    test('Error is thrown when GITHUB_WORKSPACE environment variable is empty', () => {
        // Arrange
        mockedConfig.resetAll();
        mockedConfig.mockValue('GITHUB_WORKSPACE', '');
        mockedConfig.mockValue('SCHEMA', './__tests__/mocks/schema/valid.json');
        mockedConfig.mockValue('JSONS', './__tests__/mocks/tested-data/valid.json');
        mockedConfig.mockValue('SEPARATOR', ',');

        mockedConfig.set();

        const options: cp.ExecOptions = {
            env: process.env,
        };

        try {
            // Act
            cp.execSync(`node ${ip}`, options);
        } catch (ex: any) {
            // Assert
            expect(ex).not.toBeUndefined();
            expect(ex.output).not.toBeUndefined();
            expect(ex.output.toString()).toContain(`Missing GITHUB_WORKSPACE environment variable`);
            expect(ex.output.toString()).not.toContain(`Missing SCHEMA input`);
            expect(ex.output.toString()).not.toContain(`Missing JSONS input`);
        }
    });

    test('No errors (by grace) when SCHEMA input is empty', () => {
        // Arrange
        mockedConfig.mockValue('SCHEMA', '');
        mockedConfig.mockValue('JSONS', './__tests__/mocks/tested-data/valid.json');
        mockedConfig.mockValue('SEPARATOR', ',');

        mockedConfig.set();

        const options: cp.ExecOptions = {
            env: process.env,
        };

        // Act
        const result = cp.execSync(`node ${ip}`, options);
        // Assert
        expect(result.toString()).toContain(`validated successfully`);
    });

    test('No errors (by grace) when JSONS input is empty', () => {
        // Arrange
        mockedConfig.mockValue('SCHEMA', './__tests__/mocks/schema/valid.json');
        mockedConfig.mockValue('JSONS', '');
        mockedConfig.mockValue('SEPARATOR', ',');

        mockedConfig.set();

        const options: cp.ExecOptions = {
            env: process.env,
        };

        // Act
        const result = cp.execSync(`node ${ip}`, options);
        // Assert
        expect(result.toString()).toContain(`No JSONS supplied`);
    });

    test('No errors (by grace) when both SCHEMA and JSONS inputs are empty', () => {
        // Arrange
        mockedConfig.mockValue('SCHEMA', '');
        mockedConfig.mockValue('JSONS', '');
        mockedConfig.mockValue('SEPARATOR', ',');

        mockedConfig.set();

        const options: cp.ExecOptions = {
            env: process.env,
        };

        // Act
        const result = cp.execSync(`node ${ip}`, options);
        // Assert
        expect(result.toString()).toContain(`No JSONS supplied`);
    });
});

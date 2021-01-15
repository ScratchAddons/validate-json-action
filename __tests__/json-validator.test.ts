import { validateJsons } from '../src/json-validator';

const validSchemaFile = `schema/valid.json`;
const invalidSchemaFile = `schema/invalid.json`;

const validDataFile = `tested-data/valid.json`;
const invalidDataFile = `tested-data/invalid_by_schema.json`;

const mocks_dir = '__tests__/mocks';

describe('Json validation results', () => {
    test('all successful when all jsons in the list are valid', async () => {
        const results = await validateJsons(validSchemaFile, [validDataFile, validDataFile], mocks_dir);
        expect(results.every(r => r.valid)).toBeTruthy();
        expect(results.every(r => r.filePath === `${mocks_dir}/${validDataFile}`)).toBeTruthy();
    });

    test('only one failure when one json in the list is invalid', async () => {
        const results = await validateJsons(validSchemaFile, [validDataFile, invalidDataFile], mocks_dir);

        const successes = results.filter(r => r.valid);
        expect(successes.length).toEqual(1);
        expect(successes.every(r => r.filePath === `${mocks_dir}/${validDataFile}`)).toBeTruthy();

        const failures = results.filter(r => !r.valid);
        expect(failures.length).toEqual(1);
        expect(failures.every(r => r.filePath === `${mocks_dir}/${invalidDataFile}`)).toBeTruthy();
    });

    test('all failures when all jsons in the list are invalid', async () => {
        const results = await validateJsons(validSchemaFile, [invalidDataFile, invalidDataFile], mocks_dir);
        expect(results.every(r => !r.valid)).toBeTruthy();
        expect(results.every(r => r.filePath === `${mocks_dir}/${invalidDataFile}`)).toBeTruthy();
    });

    test('one failures when schema file are invalid', async () => {
        const results = await validateJsons(invalidSchemaFile, [validDataFile, validDataFile], mocks_dir);
        expect(results).toHaveLength(1);
        expect(results.every(r => !r.valid)).toBeTruthy();
        expect(results.every(r => r.filePath === `${mocks_dir}/${invalidSchemaFile}`)).toBeTruthy();
    });

    test('one failure when no schema file', async () => {
        const results = await validateJsons('', [validDataFile, validDataFile], mocks_dir);
        expect(results).toHaveLength(1);
        expect(results.every(r => !r.valid)).toBeTruthy();
        expect(results.every(r => r.filePath === mocks_dir)).toBeTruthy();
    });

    test('empty when when no jsons in the list', async () => {
        const results = await validateJsons(validSchemaFile, [], mocks_dir);
        expect(results).toHaveLength(0);
    });
});

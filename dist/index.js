module.exports =
/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 5527:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.verifyConfigValues = exports.getConfig = exports.configMapping = exports.ConfigKey = void 0;
const core = __importStar(__webpack_require__(2186));
var ConfigKey;
(function (ConfigKey) {
    ConfigKey["GITHUB_WORKSPACE"] = "GITHUB_WORKSPACE";
    ConfigKey["SCHEMA"] = "SCHEMA";
    ConfigKey["JSONS"] = "JSONS";
    ConfigKey["SEPARATOR"] = "SEPARATOR";
})(ConfigKey = exports.ConfigKey || (exports.ConfigKey = {}));
exports.configMapping = [
    {
        key: ConfigKey.GITHUB_WORKSPACE,
        setup: 'ENV',
    },
    { key: ConfigKey.SCHEMA, setup: 'INPUT' },
    { key: ConfigKey.JSONS, setup: 'INPUT' },
    { key: ConfigKey.SEPARATOR, setup: 'INPUT' },
];
function getConfig() {
    let config = {};
    exports.configMapping.forEach(i => {
        let value;
        switch (i.setup) {
            case 'ENV':
                value = process.env[ConfigKey[i.key]];
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
    return config;
}
exports.getConfig = getConfig;
function verifyConfigValues(config) {
    let errors = [];
    Object.keys(config).forEach(key => {
        if (config[key] === '') {
            const mapping = exports.configMapping.find(i => i.key === key);
            errors.push(`🚨 Missing ${key} ${mapping.setup === 'ENV' ? 'environment variable' : mapping.setup.toLowerCase()}`);
        }
    });
    return errors.length > 0 ? errors : undefined;
}
exports.verifyConfigValues = verifyConfigValues;


/***/ }),

/***/ 9292:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.InvalidJsonError = exports.InvalidSchemaError = exports.InvalidJsonFileError = void 0;
class InvalidJsonFileError extends Error {
    constructor(filePath, innerError) {
        super();
        this.innerError = innerError;
        this.filePath = filePath;
    }
}
exports.InvalidJsonFileError = InvalidJsonFileError;
class InvalidSchemaError extends Error {
    constructor(reason) {
        super();
        this.reason = reason;
    }
}
exports.InvalidSchemaError = InvalidSchemaError;
class InvalidJsonError extends Error {
    constructor(reason, enrichedError) {
        super();
        this.reason = reason;
        this.enrichedError = enrichedError;
    }
}
exports.InvalidJsonError = InvalidJsonError;


/***/ }),

/***/ 362:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getJson = exports.getFile = void 0;
const fs_1 = __importDefault(__webpack_require__(5747));
const axios_1 = __importDefault(__webpack_require__(6545));
const errors_1 = __webpack_require__(9292);
exports.getFile = async (filePath) => {
    try {
        return await fs_1.default.promises.readFile(filePath, { encoding: 'utf-8' });
    }
    catch (ex) {
        throw new Error(); // TODO
    }
};
exports.getJson = async (filePath) => {
    const needsDownload = /https?:\/\//.test(filePath);
    try {
        const json = needsDownload ? (await axios_1.default.get(filePath)).data : JSON.parse(await exports.getFile(filePath));
        return json;
    }
    catch (ex) {
        throw new errors_1.InvalidJsonFileError(filePath, ex);
    }
};


/***/ }),

/***/ 638:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.validateJsons = void 0;
const path_1 = __importDefault(__webpack_require__(5622));
const file_reader_1 = __webpack_require__(362);
const schema_validator_1 = __webpack_require__(1478);
const logger_1 = __webpack_require__(5228);
exports.validateJsons = async (sourceDir, schemaPath, jsonRelativePaths) => {
    if (!/https?:\/\//.test(schemaPath))
        schemaPath = path_1.default.join(sourceDir, schemaPath);
    try {
        const schema = await file_reader_1.getJson(schemaPath);
        const validatorFunc = await schema_validator_1.schemaValidator.prepareSchema(schema);
        logger_1.prettyLog(schemaPath);
        return await Promise.all(jsonRelativePaths.map(async (relativePath) => {
            const filePath = path_1.default.join(sourceDir, relativePath);
            try {
                const jsonData = await file_reader_1.getJson(filePath);
                const result = await schema_validator_1.schemaValidator.validate(jsonData, validatorFunc);
                logger_1.prettyLog(filePath);
                return { filePath, valid: result };
            }
            catch (e) {
                logger_1.prettyLog(filePath, e);
                return { filePath, valid: false };
            }
        }));
    }
    catch (err) {
        logger_1.prettyLog(schemaPath, err);
        return [{ filePath: schemaPath, valid: false }];
    }
};


/***/ }),

/***/ 5228:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.prettyLog = void 0;
const chalk_1 = __importDefault(__webpack_require__(1779));
const errors_1 = __webpack_require__(9292);
exports.prettyLog = (filePath, error) => {
    const prettyFilePath = chalk_1.default `{grey {bold {underline ${filePath}}}}`;
    const prettyMessagePrefix = error ? chalk_1.default `{red {bold ✗}} ` : chalk_1.default `{green {bold ✓}} `;
    let output = `${prettyMessagePrefix}${prettyFilePath}\n`;
    switch (true) {
        case error instanceof errors_1.InvalidSchemaError:
            const schemaErr = error;
            output = `${output}${schemaErr.reason}`;
            break;
        case error instanceof errors_1.InvalidJsonError:
            const jsonErr = error;
            output = `${output}${jsonErr.enrichedError || jsonErr.reason}`;
            break;
        case error instanceof errors_1.InvalidJsonFileError:
            const fileErr = error;
            const reason = fileErr.innerError instanceof Error
                ? `${fileErr.innerError.name}${fileErr.innerError.message}`
                : fileErr.innerError || '';
            output = `${output}${reason}`;
            break;
        case error instanceof Error:
            const err = error;
            output = `${output}${err.name} - ${err.message}\n${err.stack}`;
            break;
        default:
            break;
    }
    console.log(`${output}\n`);
};


/***/ }),

/***/ 3109:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const core = __importStar(__webpack_require__(2186));
const path_1 = __importDefault(__webpack_require__(5622));
const configuration_1 = __webpack_require__(5527);
const json_validator_1 = __webpack_require__(638);
const file_reader_1 = __webpack_require__(362);
const glob = __importStar(__webpack_require__(8090));
async function run() {
    console.log("hello!");
    try {
        const configuration = configuration_1.getConfig();
        const configurationErrors = configuration_1.verifyConfigValues(configuration);
        if (configurationErrors) {
            configurationErrors.forEach(e => core.error(e));
            core.setFailed('Missing configuration');
            return;
        }
        let jsonRelativePaths;
        if (configuration.JSONS.endsWith('.txt')) {
            jsonRelativePaths = (await file_reader_1.getFile(path_1.default.join(configuration.GITHUB_WORKSPACE, configuration.JSONS))).split(configuration.SEPARATOR);
        }
        else {
            jsonRelativePaths = configuration.JSONS.split(configuration.SEPARATOR);
        }
        core.info(jsonRelativePaths.join("\n"));
        jsonRelativePaths = await (await glob.create(jsonRelativePaths.join('\n'))).glob();
        core.info(jsonRelativePaths.join("\n"));
        const validationResults = await json_validator_1.validateJsons(configuration.GITHUB_WORKSPACE, configuration.SCHEMA, jsonRelativePaths);
        const invalidJsons = validationResults.filter(res => !res.valid).map(res => res.filePath);
        core.setOutput('INVALID', invalidJsons.length > 0 ? invalidJsons.join(',') : '');
        if (invalidJsons.length > 0) {
            core.setFailed('Failed to validate all JSON files.');
        }
        else {
            core.info(`✅ All files were validated successfully.`);
        }
    }
    catch (error) {
        core.setFailed(error.message);
    }
}
run();


/***/ }),

/***/ 1478:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.schemaValidator = void 0;
const ajv_1 = __importDefault(__webpack_require__(4941));
const better_ajv_errors_1 = __importDefault(__webpack_require__(1179));
const errors_1 = __webpack_require__(9292);
class SchemaValidator {
    constructor() {
        this.schemaValidator = new ajv_1.default({ allErrors: true, jsonPointers: true, loadSchema: this.loadSchema });
    }
    instance() {
        return this.schemaValidator;
    }
    async prepareSchema(schema) {
        const isSchemaValid = this.schemaValidator.validateSchema(schema);
        if (!isSchemaValid) {
            const errors = this.schemaValidator.errorsText(this.schemaValidator.errors);
            throw new errors_1.InvalidSchemaError(errors);
        }
        return await this.schemaValidator.compileAsync(schema);
    }
    async validate(data, validator) {
        const valid = await validator(data);
        if (!valid) {
            const errors = this.schemaValidator.errorsText(validator.errors);
            const output = better_ajv_errors_1.default(validator.schema, data, validator.errors, { format: 'cli', indent: 4 });
            throw new errors_1.InvalidJsonError(errors, (output || {}));
        }
        return valid;
    }
    async loadSchema() {
        return Promise.resolve(true);
    }
}
exports.schemaValidator = new SchemaValidator();


/***/ }),

/***/ 7351:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const os = __importStar(__webpack_require__(2087));
const utils_1 = __webpack_require__(5278);
/**
 * Commands
 *
 * Command Format:
 *   ::name key=value,key=value::message
 *
 * Examples:
 *   ::warning::This is the message
 *   ::set-env name=MY_VAR::some value
 */
function issueCommand(command, properties, message) {
    const cmd = new Command(command, properties, message);
    process.stdout.write(cmd.toString() + os.EOL);
}
exports.issueCommand = issueCommand;
function issue(name, message = '') {
    issueCommand(name, {}, message);
}
exports.issue = issue;
const CMD_STRING = '::';
class Command {
    constructor(command, properties, message) {
        if (!command) {
            command = 'missing.command';
        }
        this.command = command;
        this.properties = properties;
        this.message = message;
    }
    toString() {
        let cmdStr = CMD_STRING + this.command;
        if (this.properties && Object.keys(this.properties).length > 0) {
            cmdStr += ' ';
            let first = true;
            for (const key in this.properties) {
                if (this.properties.hasOwnProperty(key)) {
                    const val = this.properties[key];
                    if (val) {
                        if (first) {
                            first = false;
                        }
                        else {
                            cmdStr += ',';
                        }
                        cmdStr += `${key}=${escapeProperty(val)}`;
                    }
                }
            }
        }
        cmdStr += `${CMD_STRING}${escapeData(this.message)}`;
        return cmdStr;
    }
}
function escapeData(s) {
    return utils_1.toCommandValue(s)
        .replace(/%/g, '%25')
        .replace(/\r/g, '%0D')
        .replace(/\n/g, '%0A');
}
function escapeProperty(s) {
    return utils_1.toCommandValue(s)
        .replace(/%/g, '%25')
        .replace(/\r/g, '%0D')
        .replace(/\n/g, '%0A')
        .replace(/:/g, '%3A')
        .replace(/,/g, '%2C');
}
//# sourceMappingURL=command.js.map

/***/ }),

/***/ 2186:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const command_1 = __webpack_require__(7351);
const file_command_1 = __webpack_require__(717);
const utils_1 = __webpack_require__(5278);
const os = __importStar(__webpack_require__(2087));
const path = __importStar(__webpack_require__(5622));
/**
 * The code to exit an action
 */
var ExitCode;
(function (ExitCode) {
    /**
     * A code indicating that the action was successful
     */
    ExitCode[ExitCode["Success"] = 0] = "Success";
    /**
     * A code indicating that the action was a failure
     */
    ExitCode[ExitCode["Failure"] = 1] = "Failure";
})(ExitCode = exports.ExitCode || (exports.ExitCode = {}));
//-----------------------------------------------------------------------
// Variables
//-----------------------------------------------------------------------
/**
 * Sets env variable for this action and future actions in the job
 * @param name the name of the variable to set
 * @param val the value of the variable. Non-string values will be converted to a string via JSON.stringify
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function exportVariable(name, val) {
    const convertedVal = utils_1.toCommandValue(val);
    process.env[name] = convertedVal;
    const filePath = process.env['GITHUB_ENV'] || '';
    if (filePath) {
        const delimiter = '_GitHubActionsFileCommandDelimeter_';
        const commandValue = `${name}<<${delimiter}${os.EOL}${convertedVal}${os.EOL}${delimiter}`;
        file_command_1.issueCommand('ENV', commandValue);
    }
    else {
        command_1.issueCommand('set-env', { name }, convertedVal);
    }
}
exports.exportVariable = exportVariable;
/**
 * Registers a secret which will get masked from logs
 * @param secret value of the secret
 */
function setSecret(secret) {
    command_1.issueCommand('add-mask', {}, secret);
}
exports.setSecret = setSecret;
/**
 * Prepends inputPath to the PATH (for this action and future actions)
 * @param inputPath
 */
function addPath(inputPath) {
    const filePath = process.env['GITHUB_PATH'] || '';
    if (filePath) {
        file_command_1.issueCommand('PATH', inputPath);
    }
    else {
        command_1.issueCommand('add-path', {}, inputPath);
    }
    process.env['PATH'] = `${inputPath}${path.delimiter}${process.env['PATH']}`;
}
exports.addPath = addPath;
/**
 * Gets the value of an input.  The value is also trimmed.
 *
 * @param     name     name of the input to get
 * @param     options  optional. See InputOptions.
 * @returns   string
 */
function getInput(name, options) {
    const val = process.env[`INPUT_${name.replace(/ /g, '_').toUpperCase()}`] || '';
    if (options && options.required && !val) {
        throw new Error(`Input required and not supplied: ${name}`);
    }
    return val.trim();
}
exports.getInput = getInput;
/**
 * Sets the value of an output.
 *
 * @param     name     name of the output to set
 * @param     value    value to store. Non-string values will be converted to a string via JSON.stringify
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function setOutput(name, value) {
    command_1.issueCommand('set-output', { name }, value);
}
exports.setOutput = setOutput;
/**
 * Enables or disables the echoing of commands into stdout for the rest of the step.
 * Echoing is disabled by default if ACTIONS_STEP_DEBUG is not set.
 *
 */
function setCommandEcho(enabled) {
    command_1.issue('echo', enabled ? 'on' : 'off');
}
exports.setCommandEcho = setCommandEcho;
//-----------------------------------------------------------------------
// Results
//-----------------------------------------------------------------------
/**
 * Sets the action status to failed.
 * When the action exits it will be with an exit code of 1
 * @param message add error issue message
 */
function setFailed(message) {
    process.exitCode = ExitCode.Failure;
    error(message);
}
exports.setFailed = setFailed;
//-----------------------------------------------------------------------
// Logging Commands
//-----------------------------------------------------------------------
/**
 * Gets whether Actions Step Debug is on or not
 */
function isDebug() {
    return process.env['RUNNER_DEBUG'] === '1';
}
exports.isDebug = isDebug;
/**
 * Writes debug message to user log
 * @param message debug message
 */
function debug(message) {
    command_1.issueCommand('debug', {}, message);
}
exports.debug = debug;
/**
 * Adds an error issue
 * @param message error issue message. Errors will be converted to string via toString()
 */
function error(message) {
    command_1.issue('error', message instanceof Error ? message.toString() : message);
}
exports.error = error;
/**
 * Adds an warning issue
 * @param message warning issue message. Errors will be converted to string via toString()
 */
function warning(message) {
    command_1.issue('warning', message instanceof Error ? message.toString() : message);
}
exports.warning = warning;
/**
 * Writes info to log with console.log.
 * @param message info message
 */
function info(message) {
    process.stdout.write(message + os.EOL);
}
exports.info = info;
/**
 * Begin an output group.
 *
 * Output until the next `groupEnd` will be foldable in this group
 *
 * @param name The name of the output group
 */
function startGroup(name) {
    command_1.issue('group', name);
}
exports.startGroup = startGroup;
/**
 * End an output group.
 */
function endGroup() {
    command_1.issue('endgroup');
}
exports.endGroup = endGroup;
/**
 * Wrap an asynchronous function call in a group.
 *
 * Returns the same type as the function itself.
 *
 * @param name The name of the group
 * @param fn The function to wrap in the group
 */
function group(name, fn) {
    return __awaiter(this, void 0, void 0, function* () {
        startGroup(name);
        let result;
        try {
            result = yield fn();
        }
        finally {
            endGroup();
        }
        return result;
    });
}
exports.group = group;
//-----------------------------------------------------------------------
// Wrapper action state
//-----------------------------------------------------------------------
/**
 * Saves state for current action, the state can only be retrieved by this action's post job execution.
 *
 * @param     name     name of the state to store
 * @param     value    value to store. Non-string values will be converted to a string via JSON.stringify
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function saveState(name, value) {
    command_1.issueCommand('save-state', { name }, value);
}
exports.saveState = saveState;
/**
 * Gets the value of an state set by this action's main execution.
 *
 * @param     name     name of the state to get
 * @returns   string
 */
function getState(name) {
    return process.env[`STATE_${name}`] || '';
}
exports.getState = getState;
//# sourceMappingURL=core.js.map

/***/ }),

/***/ 717:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

// For internal use, subject to change.
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
// We use any as a valid input type
/* eslint-disable @typescript-eslint/no-explicit-any */
const fs = __importStar(__webpack_require__(5747));
const os = __importStar(__webpack_require__(2087));
const utils_1 = __webpack_require__(5278);
function issueCommand(command, message) {
    const filePath = process.env[`GITHUB_${command}`];
    if (!filePath) {
        throw new Error(`Unable to find environment variable for file command ${command}`);
    }
    if (!fs.existsSync(filePath)) {
        throw new Error(`Missing file at path: ${filePath}`);
    }
    fs.appendFileSync(filePath, `${utils_1.toCommandValue(message)}${os.EOL}`, {
        encoding: 'utf8'
    });
}
exports.issueCommand = issueCommand;
//# sourceMappingURL=file-command.js.map

/***/ }),

/***/ 5278:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

// We use any as a valid input type
/* eslint-disable @typescript-eslint/no-explicit-any */
Object.defineProperty(exports, "__esModule", ({ value: true }));
/**
 * Sanitizes an input into a string so it can be passed into issueCommand safely
 * @param input input to sanitize into a string
 */
function toCommandValue(input) {
    if (input === null || input === undefined) {
        return '';
    }
    else if (typeof input === 'string' || input instanceof String) {
        return input;
    }
    return JSON.stringify(input);
}
exports.toCommandValue = toCommandValue;
//# sourceMappingURL=utils.js.map

/***/ }),

/***/ 8090:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const internal_globber_1 = __webpack_require__(8298);
/**
 * Constructs a globber
 *
 * @param patterns  Patterns separated by newlines
 * @param options   Glob options
 */
function create(patterns, options) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield internal_globber_1.DefaultGlobber.create(patterns, options);
    });
}
exports.create = create;
//# sourceMappingURL=glob.js.map

/***/ }),

/***/ 1026:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const core = __importStar(__webpack_require__(2186));
/**
 * Returns a copy with defaults filled in.
 */
function getOptions(copy) {
    const result = {
        followSymbolicLinks: true,
        implicitDescendants: true,
        omitBrokenSymbolicLinks: true
    };
    if (copy) {
        if (typeof copy.followSymbolicLinks === 'boolean') {
            result.followSymbolicLinks = copy.followSymbolicLinks;
            core.debug(`followSymbolicLinks '${result.followSymbolicLinks}'`);
        }
        if (typeof copy.implicitDescendants === 'boolean') {
            result.implicitDescendants = copy.implicitDescendants;
            core.debug(`implicitDescendants '${result.implicitDescendants}'`);
        }
        if (typeof copy.omitBrokenSymbolicLinks === 'boolean') {
            result.omitBrokenSymbolicLinks = copy.omitBrokenSymbolicLinks;
            core.debug(`omitBrokenSymbolicLinks '${result.omitBrokenSymbolicLinks}'`);
        }
    }
    return result;
}
exports.getOptions = getOptions;
//# sourceMappingURL=internal-glob-options-helper.js.map

/***/ }),

/***/ 8298:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __await = (this && this.__await) || function (v) { return this instanceof __await ? (this.v = v, this) : new __await(v); }
var __asyncGenerator = (this && this.__asyncGenerator) || function (thisArg, _arguments, generator) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var g = generator.apply(thisArg, _arguments || []), i, q = [];
    return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i;
    function verb(n) { if (g[n]) i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; }
    function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
    function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
    function fulfill(value) { resume("next", value); }
    function reject(value) { resume("throw", value); }
    function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const core = __importStar(__webpack_require__(2186));
const fs = __importStar(__webpack_require__(5747));
const globOptionsHelper = __importStar(__webpack_require__(1026));
const path = __importStar(__webpack_require__(5622));
const patternHelper = __importStar(__webpack_require__(9005));
const internal_match_kind_1 = __webpack_require__(1063);
const internal_pattern_1 = __webpack_require__(4536);
const internal_search_state_1 = __webpack_require__(9117);
const IS_WINDOWS = process.platform === 'win32';
class DefaultGlobber {
    constructor(options) {
        this.patterns = [];
        this.searchPaths = [];
        this.options = globOptionsHelper.getOptions(options);
    }
    getSearchPaths() {
        // Return a copy
        return this.searchPaths.slice();
    }
    glob() {
        var e_1, _a;
        return __awaiter(this, void 0, void 0, function* () {
            const result = [];
            try {
                for (var _b = __asyncValues(this.globGenerator()), _c; _c = yield _b.next(), !_c.done;) {
                    const itemPath = _c.value;
                    result.push(itemPath);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) yield _a.call(_b);
                }
                finally { if (e_1) throw e_1.error; }
            }
            return result;
        });
    }
    globGenerator() {
        return __asyncGenerator(this, arguments, function* globGenerator_1() {
            // Fill in defaults options
            const options = globOptionsHelper.getOptions(this.options);
            // Implicit descendants?
            const patterns = [];
            for (const pattern of this.patterns) {
                patterns.push(pattern);
                if (options.implicitDescendants &&
                    (pattern.trailingSeparator ||
                        pattern.segments[pattern.segments.length - 1] !== '**')) {
                    patterns.push(new internal_pattern_1.Pattern(pattern.negate, pattern.segments.concat('**')));
                }
            }
            // Push the search paths
            const stack = [];
            for (const searchPath of patternHelper.getSearchPaths(patterns)) {
                core.debug(`Search path '${searchPath}'`);
                // Exists?
                try {
                    // Intentionally using lstat. Detection for broken symlink
                    // will be performed later (if following symlinks).
                    yield __await(fs.promises.lstat(searchPath));
                }
                catch (err) {
                    if (err.code === 'ENOENT') {
                        continue;
                    }
                    throw err;
                }
                stack.unshift(new internal_search_state_1.SearchState(searchPath, 1));
            }
            // Search
            const traversalChain = []; // used to detect cycles
            while (stack.length) {
                // Pop
                const item = stack.pop();
                // Match?
                const match = patternHelper.match(patterns, item.path);
                const partialMatch = !!match || patternHelper.partialMatch(patterns, item.path);
                if (!match && !partialMatch) {
                    continue;
                }
                // Stat
                const stats = yield __await(DefaultGlobber.stat(item, options, traversalChain)
                // Broken symlink, or symlink cycle detected, or no longer exists
                );
                // Broken symlink, or symlink cycle detected, or no longer exists
                if (!stats) {
                    continue;
                }
                // Directory
                if (stats.isDirectory()) {
                    // Matched
                    if (match & internal_match_kind_1.MatchKind.Directory) {
                        yield yield __await(item.path);
                    }
                    // Descend?
                    else if (!partialMatch) {
                        continue;
                    }
                    // Push the child items in reverse
                    const childLevel = item.level + 1;
                    const childItems = (yield __await(fs.promises.readdir(item.path))).map(x => new internal_search_state_1.SearchState(path.join(item.path, x), childLevel));
                    stack.push(...childItems.reverse());
                }
                // File
                else if (match & internal_match_kind_1.MatchKind.File) {
                    yield yield __await(item.path);
                }
            }
        });
    }
    /**
     * Constructs a DefaultGlobber
     */
    static create(patterns, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = new DefaultGlobber(options);
            if (IS_WINDOWS) {
                patterns = patterns.replace(/\r\n/g, '\n');
                patterns = patterns.replace(/\r/g, '\n');
            }
            const lines = patterns.split('\n').map(x => x.trim());
            for (const line of lines) {
                // Empty or comment
                if (!line || line.startsWith('#')) {
                    continue;
                }
                // Pattern
                else {
                    result.patterns.push(new internal_pattern_1.Pattern(line));
                }
            }
            result.searchPaths.push(...patternHelper.getSearchPaths(result.patterns));
            return result;
        });
    }
    static stat(item, options, traversalChain) {
        return __awaiter(this, void 0, void 0, function* () {
            // Note:
            // `stat` returns info about the target of a symlink (or symlink chain)
            // `lstat` returns info about a symlink itself
            let stats;
            if (options.followSymbolicLinks) {
                try {
                    // Use `stat` (following symlinks)
                    stats = yield fs.promises.stat(item.path);
                }
                catch (err) {
                    if (err.code === 'ENOENT') {
                        if (options.omitBrokenSymbolicLinks) {
                            core.debug(`Broken symlink '${item.path}'`);
                            return undefined;
                        }
                        throw new Error(`No information found for the path '${item.path}'. This may indicate a broken symbolic link.`);
                    }
                    throw err;
                }
            }
            else {
                // Use `lstat` (not following symlinks)
                stats = yield fs.promises.lstat(item.path);
            }
            // Note, isDirectory() returns false for the lstat of a symlink
            if (stats.isDirectory() && options.followSymbolicLinks) {
                // Get the realpath
                const realPath = yield fs.promises.realpath(item.path);
                // Fixup the traversal chain to match the item level
                while (traversalChain.length >= item.level) {
                    traversalChain.pop();
                }
                // Test for a cycle
                if (traversalChain.some((x) => x === realPath)) {
                    core.debug(`Symlink cycle detected for path '${item.path}' and realpath '${realPath}'`);
                    return undefined;
                }
                // Update the traversal chain
                traversalChain.push(realPath);
            }
            return stats;
        });
    }
}
exports.DefaultGlobber = DefaultGlobber;
//# sourceMappingURL=internal-globber.js.map

/***/ }),

/***/ 1063:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
/**
 * Indicates whether a pattern matches a path
 */
var MatchKind;
(function (MatchKind) {
    /** Not matched */
    MatchKind[MatchKind["None"] = 0] = "None";
    /** Matched if the path is a directory */
    MatchKind[MatchKind["Directory"] = 1] = "Directory";
    /** Matched if the path is a regular file */
    MatchKind[MatchKind["File"] = 2] = "File";
    /** Matched */
    MatchKind[MatchKind["All"] = 3] = "All";
})(MatchKind = exports.MatchKind || (exports.MatchKind = {}));
//# sourceMappingURL=internal-match-kind.js.map

/***/ }),

/***/ 1849:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const path = __importStar(__webpack_require__(5622));
const assert_1 = __importDefault(__webpack_require__(2357));
const IS_WINDOWS = process.platform === 'win32';
/**
 * Similar to path.dirname except normalizes the path separators and slightly better handling for Windows UNC paths.
 *
 * For example, on Linux/macOS:
 * - `/               => /`
 * - `/hello          => /`
 *
 * For example, on Windows:
 * - `C:\             => C:\`
 * - `C:\hello        => C:\`
 * - `C:              => C:`
 * - `C:hello         => C:`
 * - `\               => \`
 * - `\hello          => \`
 * - `\\hello         => \\hello`
 * - `\\hello\world   => \\hello\world`
 */
function dirname(p) {
    // Normalize slashes and trim unnecessary trailing slash
    p = safeTrimTrailingSeparator(p);
    // Windows UNC root, e.g. \\hello or \\hello\world
    if (IS_WINDOWS && /^\\\\[^\\]+(\\[^\\]+)?$/.test(p)) {
        return p;
    }
    // Get dirname
    let result = path.dirname(p);
    // Trim trailing slash for Windows UNC root, e.g. \\hello\world\
    if (IS_WINDOWS && /^\\\\[^\\]+\\[^\\]+\\$/.test(result)) {
        result = safeTrimTrailingSeparator(result);
    }
    return result;
}
exports.dirname = dirname;
/**
 * Roots the path if not already rooted. On Windows, relative roots like `\`
 * or `C:` are expanded based on the current working directory.
 */
function ensureAbsoluteRoot(root, itemPath) {
    assert_1.default(root, `ensureAbsoluteRoot parameter 'root' must not be empty`);
    assert_1.default(itemPath, `ensureAbsoluteRoot parameter 'itemPath' must not be empty`);
    // Already rooted
    if (hasAbsoluteRoot(itemPath)) {
        return itemPath;
    }
    // Windows
    if (IS_WINDOWS) {
        // Check for itemPath like C: or C:foo
        if (itemPath.match(/^[A-Z]:[^\\/]|^[A-Z]:$/i)) {
            let cwd = process.cwd();
            assert_1.default(cwd.match(/^[A-Z]:\\/i), `Expected current directory to start with an absolute drive root. Actual '${cwd}'`);
            // Drive letter matches cwd? Expand to cwd
            if (itemPath[0].toUpperCase() === cwd[0].toUpperCase()) {
                // Drive only, e.g. C:
                if (itemPath.length === 2) {
                    // Preserve specified drive letter case (upper or lower)
                    return `${itemPath[0]}:\\${cwd.substr(3)}`;
                }
                // Drive + path, e.g. C:foo
                else {
                    if (!cwd.endsWith('\\')) {
                        cwd += '\\';
                    }
                    // Preserve specified drive letter case (upper or lower)
                    return `${itemPath[0]}:\\${cwd.substr(3)}${itemPath.substr(2)}`;
                }
            }
            // Different drive
            else {
                return `${itemPath[0]}:\\${itemPath.substr(2)}`;
            }
        }
        // Check for itemPath like \ or \foo
        else if (normalizeSeparators(itemPath).match(/^\\$|^\\[^\\]/)) {
            const cwd = process.cwd();
            assert_1.default(cwd.match(/^[A-Z]:\\/i), `Expected current directory to start with an absolute drive root. Actual '${cwd}'`);
            return `${cwd[0]}:\\${itemPath.substr(1)}`;
        }
    }
    assert_1.default(hasAbsoluteRoot(root), `ensureAbsoluteRoot parameter 'root' must have an absolute root`);
    // Otherwise ensure root ends with a separator
    if (root.endsWith('/') || (IS_WINDOWS && root.endsWith('\\'))) {
        // Intentionally empty
    }
    else {
        // Append separator
        root += path.sep;
    }
    return root + itemPath;
}
exports.ensureAbsoluteRoot = ensureAbsoluteRoot;
/**
 * On Linux/macOS, true if path starts with `/`. On Windows, true for paths like:
 * `\\hello\share` and `C:\hello` (and using alternate separator).
 */
function hasAbsoluteRoot(itemPath) {
    assert_1.default(itemPath, `hasAbsoluteRoot parameter 'itemPath' must not be empty`);
    // Normalize separators
    itemPath = normalizeSeparators(itemPath);
    // Windows
    if (IS_WINDOWS) {
        // E.g. \\hello\share or C:\hello
        return itemPath.startsWith('\\\\') || /^[A-Z]:\\/i.test(itemPath);
    }
    // E.g. /hello
    return itemPath.startsWith('/');
}
exports.hasAbsoluteRoot = hasAbsoluteRoot;
/**
 * On Linux/macOS, true if path starts with `/`. On Windows, true for paths like:
 * `\`, `\hello`, `\\hello\share`, `C:`, and `C:\hello` (and using alternate separator).
 */
function hasRoot(itemPath) {
    assert_1.default(itemPath, `isRooted parameter 'itemPath' must not be empty`);
    // Normalize separators
    itemPath = normalizeSeparators(itemPath);
    // Windows
    if (IS_WINDOWS) {
        // E.g. \ or \hello or \\hello
        // E.g. C: or C:\hello
        return itemPath.startsWith('\\') || /^[A-Z]:/i.test(itemPath);
    }
    // E.g. /hello
    return itemPath.startsWith('/');
}
exports.hasRoot = hasRoot;
/**
 * Removes redundant slashes and converts `/` to `\` on Windows
 */
function normalizeSeparators(p) {
    p = p || '';
    // Windows
    if (IS_WINDOWS) {
        // Convert slashes on Windows
        p = p.replace(/\//g, '\\');
        // Remove redundant slashes
        const isUnc = /^\\\\+[^\\]/.test(p); // e.g. \\hello
        return (isUnc ? '\\' : '') + p.replace(/\\\\+/g, '\\'); // preserve leading \\ for UNC
    }
    // Remove redundant slashes
    return p.replace(/\/\/+/g, '/');
}
exports.normalizeSeparators = normalizeSeparators;
/**
 * Normalizes the path separators and trims the trailing separator (when safe).
 * For example, `/foo/ => /foo` but `/ => /`
 */
function safeTrimTrailingSeparator(p) {
    // Short-circuit if empty
    if (!p) {
        return '';
    }
    // Normalize separators
    p = normalizeSeparators(p);
    // No trailing slash
    if (!p.endsWith(path.sep)) {
        return p;
    }
    // Check '/' on Linux/macOS and '\' on Windows
    if (p === path.sep) {
        return p;
    }
    // On Windows check if drive root. E.g. C:\
    if (IS_WINDOWS && /^[A-Z]:\\$/i.test(p)) {
        return p;
    }
    // Otherwise trim trailing slash
    return p.substr(0, p.length - 1);
}
exports.safeTrimTrailingSeparator = safeTrimTrailingSeparator;
//# sourceMappingURL=internal-path-helper.js.map

/***/ }),

/***/ 6836:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const path = __importStar(__webpack_require__(5622));
const pathHelper = __importStar(__webpack_require__(1849));
const assert_1 = __importDefault(__webpack_require__(2357));
const IS_WINDOWS = process.platform === 'win32';
/**
 * Helper class for parsing paths into segments
 */
class Path {
    /**
     * Constructs a Path
     * @param itemPath Path or array of segments
     */
    constructor(itemPath) {
        this.segments = [];
        // String
        if (typeof itemPath === 'string') {
            assert_1.default(itemPath, `Parameter 'itemPath' must not be empty`);
            // Normalize slashes and trim unnecessary trailing slash
            itemPath = pathHelper.safeTrimTrailingSeparator(itemPath);
            // Not rooted
            if (!pathHelper.hasRoot(itemPath)) {
                this.segments = itemPath.split(path.sep);
            }
            // Rooted
            else {
                // Add all segments, while not at the root
                let remaining = itemPath;
                let dir = pathHelper.dirname(remaining);
                while (dir !== remaining) {
                    // Add the segment
                    const basename = path.basename(remaining);
                    this.segments.unshift(basename);
                    // Truncate the last segment
                    remaining = dir;
                    dir = pathHelper.dirname(remaining);
                }
                // Remainder is the root
                this.segments.unshift(remaining);
            }
        }
        // Array
        else {
            // Must not be empty
            assert_1.default(itemPath.length > 0, `Parameter 'itemPath' must not be an empty array`);
            // Each segment
            for (let i = 0; i < itemPath.length; i++) {
                let segment = itemPath[i];
                // Must not be empty
                assert_1.default(segment, `Parameter 'itemPath' must not contain any empty segments`);
                // Normalize slashes
                segment = pathHelper.normalizeSeparators(itemPath[i]);
                // Root segment
                if (i === 0 && pathHelper.hasRoot(segment)) {
                    segment = pathHelper.safeTrimTrailingSeparator(segment);
                    assert_1.default(segment === pathHelper.dirname(segment), `Parameter 'itemPath' root segment contains information for multiple segments`);
                    this.segments.push(segment);
                }
                // All other segments
                else {
                    // Must not contain slash
                    assert_1.default(!segment.includes(path.sep), `Parameter 'itemPath' contains unexpected path separators`);
                    this.segments.push(segment);
                }
            }
        }
    }
    /**
     * Converts the path to it's string representation
     */
    toString() {
        // First segment
        let result = this.segments[0];
        // All others
        let skipSlash = result.endsWith(path.sep) || (IS_WINDOWS && /^[A-Z]:$/i.test(result));
        for (let i = 1; i < this.segments.length; i++) {
            if (skipSlash) {
                skipSlash = false;
            }
            else {
                result += path.sep;
            }
            result += this.segments[i];
        }
        return result;
    }
}
exports.Path = Path;
//# sourceMappingURL=internal-path.js.map

/***/ }),

/***/ 9005:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const pathHelper = __importStar(__webpack_require__(1849));
const internal_match_kind_1 = __webpack_require__(1063);
const IS_WINDOWS = process.platform === 'win32';
/**
 * Given an array of patterns, returns an array of paths to search.
 * Duplicates and paths under other included paths are filtered out.
 */
function getSearchPaths(patterns) {
    // Ignore negate patterns
    patterns = patterns.filter(x => !x.negate);
    // Create a map of all search paths
    const searchPathMap = {};
    for (const pattern of patterns) {
        const key = IS_WINDOWS
            ? pattern.searchPath.toUpperCase()
            : pattern.searchPath;
        searchPathMap[key] = 'candidate';
    }
    const result = [];
    for (const pattern of patterns) {
        // Check if already included
        const key = IS_WINDOWS
            ? pattern.searchPath.toUpperCase()
            : pattern.searchPath;
        if (searchPathMap[key] === 'included') {
            continue;
        }
        // Check for an ancestor search path
        let foundAncestor = false;
        let tempKey = key;
        let parent = pathHelper.dirname(tempKey);
        while (parent !== tempKey) {
            if (searchPathMap[parent]) {
                foundAncestor = true;
                break;
            }
            tempKey = parent;
            parent = pathHelper.dirname(tempKey);
        }
        // Include the search pattern in the result
        if (!foundAncestor) {
            result.push(pattern.searchPath);
            searchPathMap[key] = 'included';
        }
    }
    return result;
}
exports.getSearchPaths = getSearchPaths;
/**
 * Matches the patterns against the path
 */
function match(patterns, itemPath) {
    let result = internal_match_kind_1.MatchKind.None;
    for (const pattern of patterns) {
        if (pattern.negate) {
            result &= ~pattern.match(itemPath);
        }
        else {
            result |= pattern.match(itemPath);
        }
    }
    return result;
}
exports.match = match;
/**
 * Checks whether to descend further into the directory
 */
function partialMatch(patterns, itemPath) {
    return patterns.some(x => !x.negate && x.partialMatch(itemPath));
}
exports.partialMatch = partialMatch;
//# sourceMappingURL=internal-pattern-helper.js.map

/***/ }),

/***/ 4536:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const os = __importStar(__webpack_require__(2087));
const path = __importStar(__webpack_require__(5622));
const pathHelper = __importStar(__webpack_require__(1849));
const assert_1 = __importDefault(__webpack_require__(2357));
const minimatch_1 = __webpack_require__(3973);
const internal_match_kind_1 = __webpack_require__(1063);
const internal_path_1 = __webpack_require__(6836);
const IS_WINDOWS = process.platform === 'win32';
class Pattern {
    constructor(patternOrNegate, segments, homedir) {
        /**
         * Indicates whether matches should be excluded from the result set
         */
        this.negate = false;
        // Pattern overload
        let pattern;
        if (typeof patternOrNegate === 'string') {
            pattern = patternOrNegate.trim();
        }
        // Segments overload
        else {
            // Convert to pattern
            segments = segments || [];
            assert_1.default(segments.length, `Parameter 'segments' must not empty`);
            const root = Pattern.getLiteral(segments[0]);
            assert_1.default(root && pathHelper.hasAbsoluteRoot(root), `Parameter 'segments' first element must be a root path`);
            pattern = new internal_path_1.Path(segments).toString().trim();
            if (patternOrNegate) {
                pattern = `!${pattern}`;
            }
        }
        // Negate
        while (pattern.startsWith('!')) {
            this.negate = !this.negate;
            pattern = pattern.substr(1).trim();
        }
        // Normalize slashes and ensures absolute root
        pattern = Pattern.fixupPattern(pattern, homedir);
        // Segments
        this.segments = new internal_path_1.Path(pattern).segments;
        // Trailing slash indicates the pattern should only match directories, not regular files
        this.trailingSeparator = pathHelper
            .normalizeSeparators(pattern)
            .endsWith(path.sep);
        pattern = pathHelper.safeTrimTrailingSeparator(pattern);
        // Search path (literal path prior to the first glob segment)
        let foundGlob = false;
        const searchSegments = this.segments
            .map(x => Pattern.getLiteral(x))
            .filter(x => !foundGlob && !(foundGlob = x === ''));
        this.searchPath = new internal_path_1.Path(searchSegments).toString();
        // Root RegExp (required when determining partial match)
        this.rootRegExp = new RegExp(Pattern.regExpEscape(searchSegments[0]), IS_WINDOWS ? 'i' : '');
        // Create minimatch
        const minimatchOptions = {
            dot: true,
            nobrace: true,
            nocase: IS_WINDOWS,
            nocomment: true,
            noext: true,
            nonegate: true
        };
        pattern = IS_WINDOWS ? pattern.replace(/\\/g, '/') : pattern;
        this.minimatch = new minimatch_1.Minimatch(pattern, minimatchOptions);
    }
    /**
     * Matches the pattern against the specified path
     */
    match(itemPath) {
        // Last segment is globstar?
        if (this.segments[this.segments.length - 1] === '**') {
            // Normalize slashes
            itemPath = pathHelper.normalizeSeparators(itemPath);
            // Append a trailing slash. Otherwise Minimatch will not match the directory immediately
            // preceding the globstar. For example, given the pattern `/foo/**`, Minimatch returns
            // false for `/foo` but returns true for `/foo/`. Append a trailing slash to handle that quirk.
            if (!itemPath.endsWith(path.sep)) {
                // Note, this is safe because the constructor ensures the pattern has an absolute root.
                // For example, formats like C: and C:foo on Windows are resolved to an absolute root.
                itemPath = `${itemPath}${path.sep}`;
            }
        }
        else {
            // Normalize slashes and trim unnecessary trailing slash
            itemPath = pathHelper.safeTrimTrailingSeparator(itemPath);
        }
        // Match
        if (this.minimatch.match(itemPath)) {
            return this.trailingSeparator ? internal_match_kind_1.MatchKind.Directory : internal_match_kind_1.MatchKind.All;
        }
        return internal_match_kind_1.MatchKind.None;
    }
    /**
     * Indicates whether the pattern may match descendants of the specified path
     */
    partialMatch(itemPath) {
        // Normalize slashes and trim unnecessary trailing slash
        itemPath = pathHelper.safeTrimTrailingSeparator(itemPath);
        // matchOne does not handle root path correctly
        if (pathHelper.dirname(itemPath) === itemPath) {
            return this.rootRegExp.test(itemPath);
        }
        return this.minimatch.matchOne(itemPath.split(IS_WINDOWS ? /\\+/ : /\/+/), this.minimatch.set[0], true);
    }
    /**
     * Escapes glob patterns within a path
     */
    static globEscape(s) {
        return (IS_WINDOWS ? s : s.replace(/\\/g, '\\\\')) // escape '\' on Linux/macOS
            .replace(/(\[)(?=[^/]+\])/g, '[[]') // escape '[' when ']' follows within the path segment
            .replace(/\?/g, '[?]') // escape '?'
            .replace(/\*/g, '[*]'); // escape '*'
    }
    /**
     * Normalizes slashes and ensures absolute root
     */
    static fixupPattern(pattern, homedir) {
        // Empty
        assert_1.default(pattern, 'pattern cannot be empty');
        // Must not contain `.` segment, unless first segment
        // Must not contain `..` segment
        const literalSegments = new internal_path_1.Path(pattern).segments.map(x => Pattern.getLiteral(x));
        assert_1.default(literalSegments.every((x, i) => (x !== '.' || i === 0) && x !== '..'), `Invalid pattern '${pattern}'. Relative pathing '.' and '..' is not allowed.`);
        // Must not contain globs in root, e.g. Windows UNC path \\foo\b*r
        assert_1.default(!pathHelper.hasRoot(pattern) || literalSegments[0], `Invalid pattern '${pattern}'. Root segment must not contain globs.`);
        // Normalize slashes
        pattern = pathHelper.normalizeSeparators(pattern);
        // Replace leading `.` segment
        if (pattern === '.' || pattern.startsWith(`.${path.sep}`)) {
            pattern = Pattern.globEscape(process.cwd()) + pattern.substr(1);
        }
        // Replace leading `~` segment
        else if (pattern === '~' || pattern.startsWith(`~${path.sep}`)) {
            homedir = homedir || os.homedir();
            assert_1.default(homedir, 'Unable to determine HOME directory');
            assert_1.default(pathHelper.hasAbsoluteRoot(homedir), `Expected HOME directory to be a rooted path. Actual '${homedir}'`);
            pattern = Pattern.globEscape(homedir) + pattern.substr(1);
        }
        // Replace relative drive root, e.g. pattern is C: or C:foo
        else if (IS_WINDOWS &&
            (pattern.match(/^[A-Z]:$/i) || pattern.match(/^[A-Z]:[^\\]/i))) {
            let root = pathHelper.ensureAbsoluteRoot('C:\\dummy-root', pattern.substr(0, 2));
            if (pattern.length > 2 && !root.endsWith('\\')) {
                root += '\\';
            }
            pattern = Pattern.globEscape(root) + pattern.substr(2);
        }
        // Replace relative root, e.g. pattern is \ or \foo
        else if (IS_WINDOWS && (pattern === '\\' || pattern.match(/^\\[^\\]/))) {
            let root = pathHelper.ensureAbsoluteRoot('C:\\dummy-root', '\\');
            if (!root.endsWith('\\')) {
                root += '\\';
            }
            pattern = Pattern.globEscape(root) + pattern.substr(1);
        }
        // Otherwise ensure absolute root
        else {
            pattern = pathHelper.ensureAbsoluteRoot(Pattern.globEscape(process.cwd()), pattern);
        }
        return pathHelper.normalizeSeparators(pattern);
    }
    /**
     * Attempts to unescape a pattern segment to create a literal path segment.
     * Otherwise returns empty string.
     */
    static getLiteral(segment) {
        let literal = '';
        for (let i = 0; i < segment.length; i++) {
            const c = segment[i];
            // Escape
            if (c === '\\' && !IS_WINDOWS && i + 1 < segment.length) {
                literal += segment[++i];
                continue;
            }
            // Wildcard
            else if (c === '*' || c === '?') {
                return '';
            }
            // Character set
            else if (c === '[' && i + 1 < segment.length) {
                let set = '';
                let closed = -1;
                for (let i2 = i + 1; i2 < segment.length; i2++) {
                    const c2 = segment[i2];
                    // Escape
                    if (c2 === '\\' && !IS_WINDOWS && i2 + 1 < segment.length) {
                        set += segment[++i2];
                        continue;
                    }
                    // Closed
                    else if (c2 === ']') {
                        closed = i2;
                        break;
                    }
                    // Otherwise
                    else {
                        set += c2;
                    }
                }
                // Closed?
                if (closed >= 0) {
                    // Cannot convert
                    if (set.length > 1) {
                        return '';
                    }
                    // Convert to literal
                    if (set) {
                        literal += set;
                        i = closed;
                        continue;
                    }
                }
                // Otherwise fall thru
            }
            // Append
            literal += c;
        }
        return literal;
    }
    /**
     * Escapes regexp special characters
     * https://javascript.info/regexp-escaping
     */
    static regExpEscape(s) {
        return s.replace(/[[\\^$.|?*+()]/g, '\\$&');
    }
}
exports.Pattern = Pattern;
//# sourceMappingURL=internal-pattern.js.map

/***/ }),

/***/ 9117:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
class SearchState {
    constructor(path, level) {
        this.path = path;
        this.level = level;
    }
}
exports.SearchState = SearchState;
//# sourceMappingURL=internal-search-state.js.map

/***/ }),

/***/ 5211:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.codeFrameColumns = codeFrameColumns;
exports.default = _default;

function _highlight() {
  const data = _interopRequireWildcard(__webpack_require__(6860));

  _highlight = function () {
    return data;
  };

  return data;
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

let deprecationWarningShown = false;

function getDefs(chalk) {
  return {
    gutter: chalk.grey,
    marker: chalk.red.bold,
    message: chalk.red.bold
  };
}

const NEWLINE = /\r\n|[\n\r\u2028\u2029]/;

function getMarkerLines(loc, source, opts) {
  const startLoc = Object.assign({
    column: 0,
    line: -1
  }, loc.start);
  const endLoc = Object.assign({}, startLoc, loc.end);
  const {
    linesAbove = 2,
    linesBelow = 3
  } = opts || {};
  const startLine = startLoc.line;
  const startColumn = startLoc.column;
  const endLine = endLoc.line;
  const endColumn = endLoc.column;
  let start = Math.max(startLine - (linesAbove + 1), 0);
  let end = Math.min(source.length, endLine + linesBelow);

  if (startLine === -1) {
    start = 0;
  }

  if (endLine === -1) {
    end = source.length;
  }

  const lineDiff = endLine - startLine;
  const markerLines = {};

  if (lineDiff) {
    for (let i = 0; i <= lineDiff; i++) {
      const lineNumber = i + startLine;

      if (!startColumn) {
        markerLines[lineNumber] = true;
      } else if (i === 0) {
        const sourceLength = source[lineNumber - 1].length;
        markerLines[lineNumber] = [startColumn, sourceLength - startColumn + 1];
      } else if (i === lineDiff) {
        markerLines[lineNumber] = [0, endColumn];
      } else {
        const sourceLength = source[lineNumber - i].length;
        markerLines[lineNumber] = [0, sourceLength];
      }
    }
  } else {
    if (startColumn === endColumn) {
      if (startColumn) {
        markerLines[startLine] = [startColumn, 0];
      } else {
        markerLines[startLine] = true;
      }
    } else {
      markerLines[startLine] = [startColumn, endColumn - startColumn];
    }
  }

  return {
    start,
    end,
    markerLines
  };
}

function codeFrameColumns(rawLines, loc, opts = {}) {
  const highlighted = (opts.highlightCode || opts.forceColor) && (0, _highlight().shouldHighlight)(opts);
  const chalk = (0, _highlight().getChalk)(opts);
  const defs = getDefs(chalk);

  const maybeHighlight = (chalkFn, string) => {
    return highlighted ? chalkFn(string) : string;
  };

  const lines = rawLines.split(NEWLINE);
  const {
    start,
    end,
    markerLines
  } = getMarkerLines(loc, lines, opts);
  const hasColumns = loc.start && typeof loc.start.column === "number";
  const numberMaxWidth = String(end).length;
  const highlightedLines = highlighted ? (0, _highlight().default)(rawLines, opts) : rawLines;
  let frame = highlightedLines.split(NEWLINE).slice(start, end).map((line, index) => {
    const number = start + 1 + index;
    const paddedNumber = ` ${number}`.slice(-numberMaxWidth);
    const gutter = ` ${paddedNumber} | `;
    const hasMarker = markerLines[number];
    const lastMarkerLine = !markerLines[number + 1];

    if (hasMarker) {
      let markerLine = "";

      if (Array.isArray(hasMarker)) {
        const markerSpacing = line.slice(0, Math.max(hasMarker[0] - 1, 0)).replace(/[^\t]/g, " ");
        const numberOfMarkers = hasMarker[1] || 1;
        markerLine = ["\n ", maybeHighlight(defs.gutter, gutter.replace(/\d/g, " ")), markerSpacing, maybeHighlight(defs.marker, "^").repeat(numberOfMarkers)].join("");

        if (lastMarkerLine && opts.message) {
          markerLine += " " + maybeHighlight(defs.message, opts.message);
        }
      }

      return [maybeHighlight(defs.marker, ">"), maybeHighlight(defs.gutter, gutter), line, markerLine].join("");
    } else {
      return ` ${maybeHighlight(defs.gutter, gutter)}${line}`;
    }
  }).join("\n");

  if (opts.message && !hasColumns) {
    frame = `${" ".repeat(numberMaxWidth + 1)}${opts.message}\n${frame}`;
  }

  if (highlighted) {
    return chalk.reset(frame);
  } else {
    return frame;
  }
}

function _default(rawLines, lineNumber, colNumber, opts = {}) {
  if (!deprecationWarningShown) {
    deprecationWarningShown = true;
    const message = "Passing lineNumber and colNumber is deprecated to @babel/code-frame. Please use `codeFrameColumns`.";

    if (process.emitWarning) {
      process.emitWarning(message, "DeprecationWarning");
    } else {
      const deprecationError = new Error(message);
      deprecationError.name = "DeprecationWarning";
      console.warn(new Error(message));
    }
  }

  colNumber = Math.max(colNumber, 0);
  const location = {
    start: {
      column: colNumber,
      line: lineNumber
    }
  };
  return codeFrameColumns(rawLines, location, opts);
}

/***/ }),

/***/ 6860:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.shouldHighlight = shouldHighlight;
exports.getChalk = getChalk;
exports.default = highlight;

function _jsTokens() {
  const data = _interopRequireWildcard(__webpack_require__(1531));

  _jsTokens = function () {
    return data;
  };

  return data;
}

function _esutils() {
  const data = _interopRequireDefault(__webpack_require__(4038));

  _esutils = function () {
    return data;
  };

  return data;
}

function _chalk() {
  const data = _interopRequireDefault(__webpack_require__(1779));

  _chalk = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function getDefs(chalk) {
  return {
    keyword: chalk.cyan,
    capitalized: chalk.yellow,
    jsx_tag: chalk.yellow,
    punctuator: chalk.yellow,
    number: chalk.magenta,
    string: chalk.green,
    regex: chalk.magenta,
    comment: chalk.grey,
    invalid: chalk.white.bgRed.bold
  };
}

const NEWLINE = /\r\n|[\n\r\u2028\u2029]/;
const JSX_TAG = /^[a-z][\w-]*$/i;
const BRACKET = /^[()[\]{}]$/;

function getTokenType(match) {
  const [offset, text] = match.slice(-2);
  const token = (0, _jsTokens().matchToToken)(match);

  if (token.type === "name") {
    if (_esutils().default.keyword.isReservedWordES6(token.value)) {
      return "keyword";
    }

    if (JSX_TAG.test(token.value) && (text[offset - 1] === "<" || text.substr(offset - 2, 2) == "</")) {
      return "jsx_tag";
    }

    if (token.value[0] !== token.value[0].toLowerCase()) {
      return "capitalized";
    }
  }

  if (token.type === "punctuator" && BRACKET.test(token.value)) {
    return "bracket";
  }

  if (token.type === "invalid" && (token.value === "@" || token.value === "#")) {
    return "punctuator";
  }

  return token.type;
}

function highlightTokens(defs, text) {
  return text.replace(_jsTokens().default, function (...args) {
    const type = getTokenType(args);
    const colorize = defs[type];

    if (colorize) {
      return args[0].split(NEWLINE).map(str => colorize(str)).join("\n");
    } else {
      return args[0];
    }
  });
}

function shouldHighlight(options) {
  return _chalk().default.supportsColor || options.forceColor;
}

function getChalk(options) {
  let chalk = _chalk().default;

  if (options.forceColor) {
    chalk = new (_chalk().default.constructor)({
      enabled: true,
      level: 1
    });
  }

  return chalk;
}

function highlight(code, options = {}) {
  if (shouldHighlight(options)) {
    const chalk = getChalk(options);
    const defs = getDefs(chalk);
    return highlightTokens(defs, code);
  } else {
    return code;
  }
}

/***/ }),

/***/ 410:
/***/ ((module) => {

function _inheritsLoose(subClass, superClass) {
  subClass.prototype = Object.create(superClass.prototype);
  subClass.prototype.constructor = subClass;
  subClass.__proto__ = superClass;
}

module.exports = _inheritsLoose;

/***/ }),

/***/ 3298:
/***/ ((module) => {

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {
    "default": obj
  };
}

module.exports = _interopRequireDefault;

/***/ }),

/***/ 4941:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var compileSchema = __webpack_require__(875)
  , resolve = __webpack_require__(3896)
  , Cache = __webpack_require__(3679)
  , SchemaObject = __webpack_require__(7605)
  , stableStringify = __webpack_require__(969)
  , formats = __webpack_require__(6627)
  , rules = __webpack_require__(8561)
  , $dataMetaSchema = __webpack_require__(1412)
  , util = __webpack_require__(6578);

module.exports = Ajv;

Ajv.prototype.validate = validate;
Ajv.prototype.compile = compile;
Ajv.prototype.addSchema = addSchema;
Ajv.prototype.addMetaSchema = addMetaSchema;
Ajv.prototype.validateSchema = validateSchema;
Ajv.prototype.getSchema = getSchema;
Ajv.prototype.removeSchema = removeSchema;
Ajv.prototype.addFormat = addFormat;
Ajv.prototype.errorsText = errorsText;

Ajv.prototype._addSchema = _addSchema;
Ajv.prototype._compile = _compile;

Ajv.prototype.compileAsync = __webpack_require__(890);
var customKeyword = __webpack_require__(3297);
Ajv.prototype.addKeyword = customKeyword.add;
Ajv.prototype.getKeyword = customKeyword.get;
Ajv.prototype.removeKeyword = customKeyword.remove;
Ajv.prototype.validateKeyword = customKeyword.validate;

var errorClasses = __webpack_require__(5726);
Ajv.ValidationError = errorClasses.Validation;
Ajv.MissingRefError = errorClasses.MissingRef;
Ajv.$dataMetaSchema = $dataMetaSchema;

var META_SCHEMA_ID = 'http://json-schema.org/draft-07/schema';

var META_IGNORE_OPTIONS = [ 'removeAdditional', 'useDefaults', 'coerceTypes', 'strictDefaults' ];
var META_SUPPORT_DATA = ['/properties'];

/**
 * Creates validator instance.
 * Usage: `Ajv(opts)`
 * @param {Object} opts optional options
 * @return {Object} ajv instance
 */
function Ajv(opts) {
  if (!(this instanceof Ajv)) return new Ajv(opts);
  opts = this._opts = util.copy(opts) || {};
  setLogger(this);
  this._schemas = {};
  this._refs = {};
  this._fragments = {};
  this._formats = formats(opts.format);

  this._cache = opts.cache || new Cache;
  this._loadingSchemas = {};
  this._compilations = [];
  this.RULES = rules();
  this._getId = chooseGetId(opts);

  opts.loopRequired = opts.loopRequired || Infinity;
  if (opts.errorDataPath == 'property') opts._errorDataPathProperty = true;
  if (opts.serialize === undefined) opts.serialize = stableStringify;
  this._metaOpts = getMetaSchemaOptions(this);

  if (opts.formats) addInitialFormats(this);
  if (opts.keywords) addInitialKeywords(this);
  addDefaultMetaSchema(this);
  if (typeof opts.meta == 'object') this.addMetaSchema(opts.meta);
  if (opts.nullable) this.addKeyword('nullable', {metaSchema: {type: 'boolean'}});
  addInitialSchemas(this);
}



/**
 * Validate data using schema
 * Schema will be compiled and cached (using serialized JSON as key. [fast-json-stable-stringify](https://github.com/epoberezkin/fast-json-stable-stringify) is used to serialize.
 * @this   Ajv
 * @param  {String|Object} schemaKeyRef key, ref or schema object
 * @param  {Any} data to be validated
 * @return {Boolean} validation result. Errors from the last validation will be available in `ajv.errors` (and also in compiled schema: `schema.errors`).
 */
function validate(schemaKeyRef, data) {
  var v;
  if (typeof schemaKeyRef == 'string') {
    v = this.getSchema(schemaKeyRef);
    if (!v) throw new Error('no schema with key or ref "' + schemaKeyRef + '"');
  } else {
    var schemaObj = this._addSchema(schemaKeyRef);
    v = schemaObj.validate || this._compile(schemaObj);
  }

  var valid = v(data);
  if (v.$async !== true) this.errors = v.errors;
  return valid;
}


/**
 * Create validating function for passed schema.
 * @this   Ajv
 * @param  {Object} schema schema object
 * @param  {Boolean} _meta true if schema is a meta-schema. Used internally to compile meta schemas of custom keywords.
 * @return {Function} validating function
 */
function compile(schema, _meta) {
  var schemaObj = this._addSchema(schema, undefined, _meta);
  return schemaObj.validate || this._compile(schemaObj);
}


/**
 * Adds schema to the instance.
 * @this   Ajv
 * @param {Object|Array} schema schema or array of schemas. If array is passed, `key` and other parameters will be ignored.
 * @param {String} key Optional schema key. Can be passed to `validate` method instead of schema object or id/ref. One schema per instance can have empty `id` and `key`.
 * @param {Boolean} _skipValidation true to skip schema validation. Used internally, option validateSchema should be used instead.
 * @param {Boolean} _meta true if schema is a meta-schema. Used internally, addMetaSchema should be used instead.
 * @return {Ajv} this for method chaining
 */
function addSchema(schema, key, _skipValidation, _meta) {
  if (Array.isArray(schema)){
    for (var i=0; i<schema.length; i++) this.addSchema(schema[i], undefined, _skipValidation, _meta);
    return this;
  }
  var id = this._getId(schema);
  if (id !== undefined && typeof id != 'string')
    throw new Error('schema id must be string');
  key = resolve.normalizeId(key || id);
  checkUnique(this, key);
  this._schemas[key] = this._addSchema(schema, _skipValidation, _meta, true);
  return this;
}


/**
 * Add schema that will be used to validate other schemas
 * options in META_IGNORE_OPTIONS are alway set to false
 * @this   Ajv
 * @param {Object} schema schema object
 * @param {String} key optional schema key
 * @param {Boolean} skipValidation true to skip schema validation, can be used to override validateSchema option for meta-schema
 * @return {Ajv} this for method chaining
 */
function addMetaSchema(schema, key, skipValidation) {
  this.addSchema(schema, key, skipValidation, true);
  return this;
}


/**
 * Validate schema
 * @this   Ajv
 * @param {Object} schema schema to validate
 * @param {Boolean} throwOrLogError pass true to throw (or log) an error if invalid
 * @return {Boolean} true if schema is valid
 */
function validateSchema(schema, throwOrLogError) {
  var $schema = schema.$schema;
  if ($schema !== undefined && typeof $schema != 'string')
    throw new Error('$schema must be a string');
  $schema = $schema || this._opts.defaultMeta || defaultMeta(this);
  if (!$schema) {
    this.logger.warn('meta-schema not available');
    this.errors = null;
    return true;
  }
  var valid = this.validate($schema, schema);
  if (!valid && throwOrLogError) {
    var message = 'schema is invalid: ' + this.errorsText();
    if (this._opts.validateSchema == 'log') this.logger.error(message);
    else throw new Error(message);
  }
  return valid;
}


function defaultMeta(self) {
  var meta = self._opts.meta;
  self._opts.defaultMeta = typeof meta == 'object'
                            ? self._getId(meta) || meta
                            : self.getSchema(META_SCHEMA_ID)
                              ? META_SCHEMA_ID
                              : undefined;
  return self._opts.defaultMeta;
}


/**
 * Get compiled schema from the instance by `key` or `ref`.
 * @this   Ajv
 * @param  {String} keyRef `key` that was passed to `addSchema` or full schema reference (`schema.id` or resolved id).
 * @return {Function} schema validating function (with property `schema`).
 */
function getSchema(keyRef) {
  var schemaObj = _getSchemaObj(this, keyRef);
  switch (typeof schemaObj) {
    case 'object': return schemaObj.validate || this._compile(schemaObj);
    case 'string': return this.getSchema(schemaObj);
    case 'undefined': return _getSchemaFragment(this, keyRef);
  }
}


function _getSchemaFragment(self, ref) {
  var res = resolve.schema.call(self, { schema: {} }, ref);
  if (res) {
    var schema = res.schema
      , root = res.root
      , baseId = res.baseId;
    var v = compileSchema.call(self, schema, root, undefined, baseId);
    self._fragments[ref] = new SchemaObject({
      ref: ref,
      fragment: true,
      schema: schema,
      root: root,
      baseId: baseId,
      validate: v
    });
    return v;
  }
}


function _getSchemaObj(self, keyRef) {
  keyRef = resolve.normalizeId(keyRef);
  return self._schemas[keyRef] || self._refs[keyRef] || self._fragments[keyRef];
}


/**
 * Remove cached schema(s).
 * If no parameter is passed all schemas but meta-schemas are removed.
 * If RegExp is passed all schemas with key/id matching pattern but meta-schemas are removed.
 * Even if schema is referenced by other schemas it still can be removed as other schemas have local references.
 * @this   Ajv
 * @param  {String|Object|RegExp} schemaKeyRef key, ref, pattern to match key/ref or schema object
 * @return {Ajv} this for method chaining
 */
function removeSchema(schemaKeyRef) {
  if (schemaKeyRef instanceof RegExp) {
    _removeAllSchemas(this, this._schemas, schemaKeyRef);
    _removeAllSchemas(this, this._refs, schemaKeyRef);
    return this;
  }
  switch (typeof schemaKeyRef) {
    case 'undefined':
      _removeAllSchemas(this, this._schemas);
      _removeAllSchemas(this, this._refs);
      this._cache.clear();
      return this;
    case 'string':
      var schemaObj = _getSchemaObj(this, schemaKeyRef);
      if (schemaObj) this._cache.del(schemaObj.cacheKey);
      delete this._schemas[schemaKeyRef];
      delete this._refs[schemaKeyRef];
      return this;
    case 'object':
      var serialize = this._opts.serialize;
      var cacheKey = serialize ? serialize(schemaKeyRef) : schemaKeyRef;
      this._cache.del(cacheKey);
      var id = this._getId(schemaKeyRef);
      if (id) {
        id = resolve.normalizeId(id);
        delete this._schemas[id];
        delete this._refs[id];
      }
  }
  return this;
}


function _removeAllSchemas(self, schemas, regex) {
  for (var keyRef in schemas) {
    var schemaObj = schemas[keyRef];
    if (!schemaObj.meta && (!regex || regex.test(keyRef))) {
      self._cache.del(schemaObj.cacheKey);
      delete schemas[keyRef];
    }
  }
}


/* @this   Ajv */
function _addSchema(schema, skipValidation, meta, shouldAddSchema) {
  if (typeof schema != 'object' && typeof schema != 'boolean')
    throw new Error('schema should be object or boolean');
  var serialize = this._opts.serialize;
  var cacheKey = serialize ? serialize(schema) : schema;
  var cached = this._cache.get(cacheKey);
  if (cached) return cached;

  shouldAddSchema = shouldAddSchema || this._opts.addUsedSchema !== false;

  var id = resolve.normalizeId(this._getId(schema));
  if (id && shouldAddSchema) checkUnique(this, id);

  var willValidate = this._opts.validateSchema !== false && !skipValidation;
  var recursiveMeta;
  if (willValidate && !(recursiveMeta = id && id == resolve.normalizeId(schema.$schema)))
    this.validateSchema(schema, true);

  var localRefs = resolve.ids.call(this, schema);

  var schemaObj = new SchemaObject({
    id: id,
    schema: schema,
    localRefs: localRefs,
    cacheKey: cacheKey,
    meta: meta
  });

  if (id[0] != '#' && shouldAddSchema) this._refs[id] = schemaObj;
  this._cache.put(cacheKey, schemaObj);

  if (willValidate && recursiveMeta) this.validateSchema(schema, true);

  return schemaObj;
}


/* @this   Ajv */
function _compile(schemaObj, root) {
  if (schemaObj.compiling) {
    schemaObj.validate = callValidate;
    callValidate.schema = schemaObj.schema;
    callValidate.errors = null;
    callValidate.root = root ? root : callValidate;
    if (schemaObj.schema.$async === true)
      callValidate.$async = true;
    return callValidate;
  }
  schemaObj.compiling = true;

  var currentOpts;
  if (schemaObj.meta) {
    currentOpts = this._opts;
    this._opts = this._metaOpts;
  }

  var v;
  try { v = compileSchema.call(this, schemaObj.schema, root, schemaObj.localRefs); }
  catch(e) {
    delete schemaObj.validate;
    throw e;
  }
  finally {
    schemaObj.compiling = false;
    if (schemaObj.meta) this._opts = currentOpts;
  }

  schemaObj.validate = v;
  schemaObj.refs = v.refs;
  schemaObj.refVal = v.refVal;
  schemaObj.root = v.root;
  return v;


  /* @this   {*} - custom context, see passContext option */
  function callValidate() {
    /* jshint validthis: true */
    var _validate = schemaObj.validate;
    var result = _validate.apply(this, arguments);
    callValidate.errors = _validate.errors;
    return result;
  }
}


function chooseGetId(opts) {
  switch (opts.schemaId) {
    case 'auto': return _get$IdOrId;
    case 'id': return _getId;
    default: return _get$Id;
  }
}

/* @this   Ajv */
function _getId(schema) {
  if (schema.$id) this.logger.warn('schema $id ignored', schema.$id);
  return schema.id;
}

/* @this   Ajv */
function _get$Id(schema) {
  if (schema.id) this.logger.warn('schema id ignored', schema.id);
  return schema.$id;
}


function _get$IdOrId(schema) {
  if (schema.$id && schema.id && schema.$id != schema.id)
    throw new Error('schema $id is different from id');
  return schema.$id || schema.id;
}


/**
 * Convert array of error message objects to string
 * @this   Ajv
 * @param  {Array<Object>} errors optional array of validation errors, if not passed errors from the instance are used.
 * @param  {Object} options optional options with properties `separator` and `dataVar`.
 * @return {String} human readable string with all errors descriptions
 */
function errorsText(errors, options) {
  errors = errors || this.errors;
  if (!errors) return 'No errors';
  options = options || {};
  var separator = options.separator === undefined ? ', ' : options.separator;
  var dataVar = options.dataVar === undefined ? 'data' : options.dataVar;

  var text = '';
  for (var i=0; i<errors.length; i++) {
    var e = errors[i];
    if (e) text += dataVar + e.dataPath + ' ' + e.message + separator;
  }
  return text.slice(0, -separator.length);
}


/**
 * Add custom format
 * @this   Ajv
 * @param {String} name format name
 * @param {String|RegExp|Function} format string is converted to RegExp; function should return boolean (true when valid)
 * @return {Ajv} this for method chaining
 */
function addFormat(name, format) {
  if (typeof format == 'string') format = new RegExp(format);
  this._formats[name] = format;
  return this;
}


function addDefaultMetaSchema(self) {
  var $dataSchema;
  if (self._opts.$data) {
    $dataSchema = __webpack_require__(6835);
    self.addMetaSchema($dataSchema, $dataSchema.$id, true);
  }
  if (self._opts.meta === false) return;
  var metaSchema = __webpack_require__(38);
  if (self._opts.$data) metaSchema = $dataMetaSchema(metaSchema, META_SUPPORT_DATA);
  self.addMetaSchema(metaSchema, META_SCHEMA_ID, true);
  self._refs['http://json-schema.org/schema'] = META_SCHEMA_ID;
}


function addInitialSchemas(self) {
  var optsSchemas = self._opts.schemas;
  if (!optsSchemas) return;
  if (Array.isArray(optsSchemas)) self.addSchema(optsSchemas);
  else for (var key in optsSchemas) self.addSchema(optsSchemas[key], key);
}


function addInitialFormats(self) {
  for (var name in self._opts.formats) {
    var format = self._opts.formats[name];
    self.addFormat(name, format);
  }
}


function addInitialKeywords(self) {
  for (var name in self._opts.keywords) {
    var keyword = self._opts.keywords[name];
    self.addKeyword(name, keyword);
  }
}


function checkUnique(self, id) {
  if (self._schemas[id] || self._refs[id])
    throw new Error('schema with key or id "' + id + '" already exists');
}


function getMetaSchemaOptions(self) {
  var metaOpts = util.copy(self._opts);
  for (var i=0; i<META_IGNORE_OPTIONS.length; i++)
    delete metaOpts[META_IGNORE_OPTIONS[i]];
  return metaOpts;
}


function setLogger(self) {
  var logger = self._opts.logger;
  if (logger === false) {
    self.logger = {log: noop, warn: noop, error: noop};
  } else {
    if (logger === undefined) logger = console;
    if (!(typeof logger == 'object' && logger.log && logger.warn && logger.error))
      throw new Error('logger must implement log, warn and error methods');
    self.logger = logger;
  }
}


function noop() {}


/***/ }),

/***/ 3679:
/***/ ((module) => {

"use strict";



var Cache = module.exports = function Cache() {
  this._cache = {};
};


Cache.prototype.put = function Cache_put(key, value) {
  this._cache[key] = value;
};


Cache.prototype.get = function Cache_get(key) {
  return this._cache[key];
};


Cache.prototype.del = function Cache_del(key) {
  delete this._cache[key];
};


Cache.prototype.clear = function Cache_clear() {
  this._cache = {};
};


/***/ }),

/***/ 890:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var MissingRefError = __webpack_require__(5726).MissingRef;

module.exports = compileAsync;


/**
 * Creates validating function for passed schema with asynchronous loading of missing schemas.
 * `loadSchema` option should be a function that accepts schema uri and returns promise that resolves with the schema.
 * @this  Ajv
 * @param {Object}   schema schema object
 * @param {Boolean}  meta optional true to compile meta-schema; this parameter can be skipped
 * @param {Function} callback an optional node-style callback, it is called with 2 parameters: error (or null) and validating function.
 * @return {Promise} promise that resolves with a validating function.
 */
function compileAsync(schema, meta, callback) {
  /* eslint no-shadow: 0 */
  /* global Promise */
  /* jshint validthis: true */
  var self = this;
  if (typeof this._opts.loadSchema != 'function')
    throw new Error('options.loadSchema should be a function');

  if (typeof meta == 'function') {
    callback = meta;
    meta = undefined;
  }

  var p = loadMetaSchemaOf(schema).then(function () {
    var schemaObj = self._addSchema(schema, undefined, meta);
    return schemaObj.validate || _compileAsync(schemaObj);
  });

  if (callback) {
    p.then(
      function(v) { callback(null, v); },
      callback
    );
  }

  return p;


  function loadMetaSchemaOf(sch) {
    var $schema = sch.$schema;
    return $schema && !self.getSchema($schema)
            ? compileAsync.call(self, { $ref: $schema }, true)
            : Promise.resolve();
  }


  function _compileAsync(schemaObj) {
    try { return self._compile(schemaObj); }
    catch(e) {
      if (e instanceof MissingRefError) return loadMissingSchema(e);
      throw e;
    }


    function loadMissingSchema(e) {
      var ref = e.missingSchema;
      if (added(ref)) throw new Error('Schema ' + ref + ' is loaded but ' + e.missingRef + ' cannot be resolved');

      var schemaPromise = self._loadingSchemas[ref];
      if (!schemaPromise) {
        schemaPromise = self._loadingSchemas[ref] = self._opts.loadSchema(ref);
        schemaPromise.then(removePromise, removePromise);
      }

      return schemaPromise.then(function (sch) {
        if (!added(ref)) {
          return loadMetaSchemaOf(sch).then(function () {
            if (!added(ref)) self.addSchema(sch, ref, undefined, meta);
          });
        }
      }).then(function() {
        return _compileAsync(schemaObj);
      });

      function removePromise() {
        delete self._loadingSchemas[ref];
      }

      function added(ref) {
        return self._refs[ref] || self._schemas[ref];
      }
    }
  }
}


/***/ }),

/***/ 5726:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var resolve = __webpack_require__(3896);

module.exports = {
  Validation: errorSubclass(ValidationError),
  MissingRef: errorSubclass(MissingRefError)
};


function ValidationError(errors) {
  this.message = 'validation failed';
  this.errors = errors;
  this.ajv = this.validation = true;
}


MissingRefError.message = function (baseId, ref) {
  return 'can\'t resolve reference ' + ref + ' from id ' + baseId;
};


function MissingRefError(baseId, ref, message) {
  this.message = message || MissingRefError.message(baseId, ref);
  this.missingRef = resolve.url(baseId, ref);
  this.missingSchema = resolve.normalizeId(resolve.fullPath(this.missingRef));
}


function errorSubclass(Subclass) {
  Subclass.prototype = Object.create(Error.prototype);
  Subclass.prototype.constructor = Subclass;
  return Subclass;
}


/***/ }),

/***/ 6627:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var util = __webpack_require__(6578);

var DATE = /^(\d\d\d\d)-(\d\d)-(\d\d)$/;
var DAYS = [0,31,28,31,30,31,30,31,31,30,31,30,31];
var TIME = /^(\d\d):(\d\d):(\d\d)(\.\d+)?(z|[+-]\d\d(?::?\d\d)?)?$/i;
var HOSTNAME = /^(?=.{1,253}\.?$)[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[-0-9a-z]{0,61}[0-9a-z])?)*\.?$/i;
var URI = /^(?:[a-z][a-z0-9+\-.]*:)(?:\/?\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:]|%[0-9a-f]{2})*@)?(?:\[(?:(?:(?:(?:[0-9a-f]{1,4}:){6}|::(?:[0-9a-f]{1,4}:){5}|(?:[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){4}|(?:(?:[0-9a-f]{1,4}:){0,1}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){3}|(?:(?:[0-9a-f]{1,4}:){0,2}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){2}|(?:(?:[0-9a-f]{1,4}:){0,3}[0-9a-f]{1,4})?::[0-9a-f]{1,4}:|(?:(?:[0-9a-f]{1,4}:){0,4}[0-9a-f]{1,4})?::)(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?))|(?:(?:[0-9a-f]{1,4}:){0,5}[0-9a-f]{1,4})?::[0-9a-f]{1,4}|(?:(?:[0-9a-f]{1,4}:){0,6}[0-9a-f]{1,4})?::)|[Vv][0-9a-f]+\.[a-z0-9\-._~!$&'()*+,;=:]+)\]|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)|(?:[a-z0-9\-._~!$&'()*+,;=]|%[0-9a-f]{2})*)(?::\d*)?(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*|\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*)?|(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*)(?:\?(?:[a-z0-9\-._~!$&'()*+,;=:@/?]|%[0-9a-f]{2})*)?(?:#(?:[a-z0-9\-._~!$&'()*+,;=:@/?]|%[0-9a-f]{2})*)?$/i;
var URIREF = /^(?:[a-z][a-z0-9+\-.]*:)?(?:\/?\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:]|%[0-9a-f]{2})*@)?(?:\[(?:(?:(?:(?:[0-9a-f]{1,4}:){6}|::(?:[0-9a-f]{1,4}:){5}|(?:[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){4}|(?:(?:[0-9a-f]{1,4}:){0,1}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){3}|(?:(?:[0-9a-f]{1,4}:){0,2}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){2}|(?:(?:[0-9a-f]{1,4}:){0,3}[0-9a-f]{1,4})?::[0-9a-f]{1,4}:|(?:(?:[0-9a-f]{1,4}:){0,4}[0-9a-f]{1,4})?::)(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?))|(?:(?:[0-9a-f]{1,4}:){0,5}[0-9a-f]{1,4})?::[0-9a-f]{1,4}|(?:(?:[0-9a-f]{1,4}:){0,6}[0-9a-f]{1,4})?::)|[Vv][0-9a-f]+\.[a-z0-9\-._~!$&'()*+,;=:]+)\]|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)|(?:[a-z0-9\-._~!$&'"()*+,;=]|%[0-9a-f]{2})*)(?::\d*)?(?:\/(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})*)*|\/(?:(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})*)*)?|(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})*)*)?(?:\?(?:[a-z0-9\-._~!$&'"()*+,;=:@/?]|%[0-9a-f]{2})*)?(?:#(?:[a-z0-9\-._~!$&'"()*+,;=:@/?]|%[0-9a-f]{2})*)?$/i;
// uri-template: https://tools.ietf.org/html/rfc6570
var URITEMPLATE = /^(?:(?:[^\x00-\x20"'<>%\\^`{|}]|%[0-9a-f]{2})|\{[+#./;?&=,!@|]?(?:[a-z0-9_]|%[0-9a-f]{2})+(?::[1-9][0-9]{0,3}|\*)?(?:,(?:[a-z0-9_]|%[0-9a-f]{2})+(?::[1-9][0-9]{0,3}|\*)?)*\})*$/i;
// For the source: https://gist.github.com/dperini/729294
// For test cases: https://mathiasbynens.be/demo/url-regex
// @todo Delete current URL in favour of the commented out URL rule when this issue is fixed https://github.com/eslint/eslint/issues/7983.
// var URL = /^(?:(?:https?|ftp):\/\/)(?:\S+(?::\S*)?@)?(?:(?!10(?:\.\d{1,3}){3})(?!127(?:\.\d{1,3}){3})(?!169\.254(?:\.\d{1,3}){2})(?!192\.168(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u{00a1}-\u{ffff}0-9]+-)*[a-z\u{00a1}-\u{ffff}0-9]+)(?:\.(?:[a-z\u{00a1}-\u{ffff}0-9]+-)*[a-z\u{00a1}-\u{ffff}0-9]+)*(?:\.(?:[a-z\u{00a1}-\u{ffff}]{2,})))(?::\d{2,5})?(?:\/[^\s]*)?$/iu;
var URL = /^(?:(?:http[s\u017F]?|ftp):\/\/)(?:(?:[\0-\x08\x0E-\x1F!-\x9F\xA1-\u167F\u1681-\u1FFF\u200B-\u2027\u202A-\u202E\u2030-\u205E\u2060-\u2FFF\u3001-\uD7FF\uE000-\uFEFE\uFF00-\uFFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])+(?::(?:[\0-\x08\x0E-\x1F!-\x9F\xA1-\u167F\u1681-\u1FFF\u200B-\u2027\u202A-\u202E\u2030-\u205E\u2060-\u2FFF\u3001-\uD7FF\uE000-\uFEFE\uFF00-\uFFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])*)?@)?(?:(?!10(?:\.[0-9]{1,3}){3})(?!127(?:\.[0-9]{1,3}){3})(?!169\.254(?:\.[0-9]{1,3}){2})(?!192\.168(?:\.[0-9]{1,3}){2})(?!172\.(?:1[6-9]|2[0-9]|3[01])(?:\.[0-9]{1,3}){2})(?:[1-9][0-9]?|1[0-9][0-9]|2[01][0-9]|22[0-3])(?:\.(?:1?[0-9]{1,2}|2[0-4][0-9]|25[0-5])){2}(?:\.(?:[1-9][0-9]?|1[0-9][0-9]|2[0-4][0-9]|25[0-4]))|(?:(?:(?:[0-9a-z\xA1-\uD7FF\uE000-\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])+-)*(?:[0-9a-z\xA1-\uD7FF\uE000-\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])+)(?:\.(?:(?:[0-9a-z\xA1-\uD7FF\uE000-\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])+-)*(?:[0-9a-z\xA1-\uD7FF\uE000-\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])+)*(?:\.(?:(?:[a-z\xA1-\uD7FF\uE000-\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]){2,})))(?::[0-9]{2,5})?(?:\/(?:[\0-\x08\x0E-\x1F!-\x9F\xA1-\u167F\u1681-\u1FFF\u200B-\u2027\u202A-\u202E\u2030-\u205E\u2060-\u2FFF\u3001-\uD7FF\uE000-\uFEFE\uFF00-\uFFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])*)?$/i;
var UUID = /^(?:urn:uuid:)?[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i;
var JSON_POINTER = /^(?:\/(?:[^~/]|~0|~1)*)*$/;
var JSON_POINTER_URI_FRAGMENT = /^#(?:\/(?:[a-z0-9_\-.!$&'()*+,;:=@]|%[0-9a-f]{2}|~0|~1)*)*$/i;
var RELATIVE_JSON_POINTER = /^(?:0|[1-9][0-9]*)(?:#|(?:\/(?:[^~/]|~0|~1)*)*)$/;


module.exports = formats;

function formats(mode) {
  mode = mode == 'full' ? 'full' : 'fast';
  return util.copy(formats[mode]);
}


formats.fast = {
  // date: http://tools.ietf.org/html/rfc3339#section-5.6
  date: /^\d\d\d\d-[0-1]\d-[0-3]\d$/,
  // date-time: http://tools.ietf.org/html/rfc3339#section-5.6
  time: /^(?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)?$/i,
  'date-time': /^\d\d\d\d-[0-1]\d-[0-3]\d[t\s](?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)$/i,
  // uri: https://github.com/mafintosh/is-my-json-valid/blob/master/formats.js
  uri: /^(?:[a-z][a-z0-9+\-.]*:)(?:\/?\/)?[^\s]*$/i,
  'uri-reference': /^(?:(?:[a-z][a-z0-9+\-.]*:)?\/?\/)?(?:[^\\\s#][^\s#]*)?(?:#[^\\\s]*)?$/i,
  'uri-template': URITEMPLATE,
  url: URL,
  // email (sources from jsen validator):
  // http://stackoverflow.com/questions/201323/using-a-regular-expression-to-validate-an-email-address#answer-8829363
  // http://www.w3.org/TR/html5/forms.html#valid-e-mail-address (search for 'willful violation')
  email: /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)*$/i,
  hostname: HOSTNAME,
  // optimized https://www.safaribooksonline.com/library/view/regular-expressions-cookbook/9780596802837/ch07s16.html
  ipv4: /^(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)$/,
  // optimized http://stackoverflow.com/questions/53497/regular-expression-that-matches-valid-ipv6-addresses
  ipv6: /^\s*(?:(?:(?:[0-9a-f]{1,4}:){7}(?:[0-9a-f]{1,4}|:))|(?:(?:[0-9a-f]{1,4}:){6}(?::[0-9a-f]{1,4}|(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(?:(?:[0-9a-f]{1,4}:){5}(?:(?:(?::[0-9a-f]{1,4}){1,2})|:(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(?:(?:[0-9a-f]{1,4}:){4}(?:(?:(?::[0-9a-f]{1,4}){1,3})|(?:(?::[0-9a-f]{1,4})?:(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(?:(?:[0-9a-f]{1,4}:){3}(?:(?:(?::[0-9a-f]{1,4}){1,4})|(?:(?::[0-9a-f]{1,4}){0,2}:(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(?:(?:[0-9a-f]{1,4}:){2}(?:(?:(?::[0-9a-f]{1,4}){1,5})|(?:(?::[0-9a-f]{1,4}){0,3}:(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(?:(?:[0-9a-f]{1,4}:){1}(?:(?:(?::[0-9a-f]{1,4}){1,6})|(?:(?::[0-9a-f]{1,4}){0,4}:(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(?::(?:(?:(?::[0-9a-f]{1,4}){1,7})|(?:(?::[0-9a-f]{1,4}){0,5}:(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(?:%.+)?\s*$/i,
  regex: regex,
  // uuid: http://tools.ietf.org/html/rfc4122
  uuid: UUID,
  // JSON-pointer: https://tools.ietf.org/html/rfc6901
  // uri fragment: https://tools.ietf.org/html/rfc3986#appendix-A
  'json-pointer': JSON_POINTER,
  'json-pointer-uri-fragment': JSON_POINTER_URI_FRAGMENT,
  // relative JSON-pointer: http://tools.ietf.org/html/draft-luff-relative-json-pointer-00
  'relative-json-pointer': RELATIVE_JSON_POINTER
};


formats.full = {
  date: date,
  time: time,
  'date-time': date_time,
  uri: uri,
  'uri-reference': URIREF,
  'uri-template': URITEMPLATE,
  url: URL,
  email: /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i,
  hostname: HOSTNAME,
  ipv4: /^(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)$/,
  ipv6: /^\s*(?:(?:(?:[0-9a-f]{1,4}:){7}(?:[0-9a-f]{1,4}|:))|(?:(?:[0-9a-f]{1,4}:){6}(?::[0-9a-f]{1,4}|(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(?:(?:[0-9a-f]{1,4}:){5}(?:(?:(?::[0-9a-f]{1,4}){1,2})|:(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(?:(?:[0-9a-f]{1,4}:){4}(?:(?:(?::[0-9a-f]{1,4}){1,3})|(?:(?::[0-9a-f]{1,4})?:(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(?:(?:[0-9a-f]{1,4}:){3}(?:(?:(?::[0-9a-f]{1,4}){1,4})|(?:(?::[0-9a-f]{1,4}){0,2}:(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(?:(?:[0-9a-f]{1,4}:){2}(?:(?:(?::[0-9a-f]{1,4}){1,5})|(?:(?::[0-9a-f]{1,4}){0,3}:(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(?:(?:[0-9a-f]{1,4}:){1}(?:(?:(?::[0-9a-f]{1,4}){1,6})|(?:(?::[0-9a-f]{1,4}){0,4}:(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(?::(?:(?:(?::[0-9a-f]{1,4}){1,7})|(?:(?::[0-9a-f]{1,4}){0,5}:(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(?:%.+)?\s*$/i,
  regex: regex,
  uuid: UUID,
  'json-pointer': JSON_POINTER,
  'json-pointer-uri-fragment': JSON_POINTER_URI_FRAGMENT,
  'relative-json-pointer': RELATIVE_JSON_POINTER
};


function isLeapYear(year) {
  // https://tools.ietf.org/html/rfc3339#appendix-C
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}


function date(str) {
  // full-date from http://tools.ietf.org/html/rfc3339#section-5.6
  var matches = str.match(DATE);
  if (!matches) return false;

  var year = +matches[1];
  var month = +matches[2];
  var day = +matches[3];

  return month >= 1 && month <= 12 && day >= 1 &&
          day <= (month == 2 && isLeapYear(year) ? 29 : DAYS[month]);
}


function time(str, full) {
  var matches = str.match(TIME);
  if (!matches) return false;

  var hour = matches[1];
  var minute = matches[2];
  var second = matches[3];
  var timeZone = matches[5];
  return ((hour <= 23 && minute <= 59 && second <= 59) ||
          (hour == 23 && minute == 59 && second == 60)) &&
         (!full || timeZone);
}


var DATE_TIME_SEPARATOR = /t|\s/i;
function date_time(str) {
  // http://tools.ietf.org/html/rfc3339#section-5.6
  var dateTime = str.split(DATE_TIME_SEPARATOR);
  return dateTime.length == 2 && date(dateTime[0]) && time(dateTime[1], true);
}


var NOT_URI_FRAGMENT = /\/|:/;
function uri(str) {
  // http://jmrware.com/articles/2009/uri_regexp/URI_regex.html + optional protocol + required "."
  return NOT_URI_FRAGMENT.test(str) && URI.test(str);
}


var Z_ANCHOR = /[^\\]\\Z/;
function regex(str) {
  if (Z_ANCHOR.test(str)) return false;
  try {
    new RegExp(str);
    return true;
  } catch(e) {
    return false;
  }
}


/***/ }),

/***/ 875:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var resolve = __webpack_require__(3896)
  , util = __webpack_require__(6578)
  , errorClasses = __webpack_require__(5726)
  , stableStringify = __webpack_require__(969);

var validateGenerator = __webpack_require__(9585);

/**
 * Functions below are used inside compiled validations function
 */

var ucs2length = util.ucs2length;
var equal = __webpack_require__(8206);

// this error is thrown by async schemas to return validation errors via exception
var ValidationError = errorClasses.Validation;

module.exports = compile;


/**
 * Compiles schema to validation function
 * @this   Ajv
 * @param  {Object} schema schema object
 * @param  {Object} root object with information about the root schema for this schema
 * @param  {Object} localRefs the hash of local references inside the schema (created by resolve.id), used for inline resolution
 * @param  {String} baseId base ID for IDs in the schema
 * @return {Function} validation function
 */
function compile(schema, root, localRefs, baseId) {
  /* jshint validthis: true, evil: true */
  /* eslint no-shadow: 0 */
  var self = this
    , opts = this._opts
    , refVal = [ undefined ]
    , refs = {}
    , patterns = []
    , patternsHash = {}
    , defaults = []
    , defaultsHash = {}
    , customRules = [];

  root = root || { schema: schema, refVal: refVal, refs: refs };

  var c = checkCompiling.call(this, schema, root, baseId);
  var compilation = this._compilations[c.index];
  if (c.compiling) return (compilation.callValidate = callValidate);

  var formats = this._formats;
  var RULES = this.RULES;

  try {
    var v = localCompile(schema, root, localRefs, baseId);
    compilation.validate = v;
    var cv = compilation.callValidate;
    if (cv) {
      cv.schema = v.schema;
      cv.errors = null;
      cv.refs = v.refs;
      cv.refVal = v.refVal;
      cv.root = v.root;
      cv.$async = v.$async;
      if (opts.sourceCode) cv.source = v.source;
    }
    return v;
  } finally {
    endCompiling.call(this, schema, root, baseId);
  }

  /* @this   {*} - custom context, see passContext option */
  function callValidate() {
    /* jshint validthis: true */
    var validate = compilation.validate;
    var result = validate.apply(this, arguments);
    callValidate.errors = validate.errors;
    return result;
  }

  function localCompile(_schema, _root, localRefs, baseId) {
    var isRoot = !_root || (_root && _root.schema == _schema);
    if (_root.schema != root.schema)
      return compile.call(self, _schema, _root, localRefs, baseId);

    var $async = _schema.$async === true;

    var sourceCode = validateGenerator({
      isTop: true,
      schema: _schema,
      isRoot: isRoot,
      baseId: baseId,
      root: _root,
      schemaPath: '',
      errSchemaPath: '#',
      errorPath: '""',
      MissingRefError: errorClasses.MissingRef,
      RULES: RULES,
      validate: validateGenerator,
      util: util,
      resolve: resolve,
      resolveRef: resolveRef,
      usePattern: usePattern,
      useDefault: useDefault,
      useCustomRule: useCustomRule,
      opts: opts,
      formats: formats,
      logger: self.logger,
      self: self
    });

    sourceCode = vars(refVal, refValCode) + vars(patterns, patternCode)
                   + vars(defaults, defaultCode) + vars(customRules, customRuleCode)
                   + sourceCode;

    if (opts.processCode) sourceCode = opts.processCode(sourceCode, _schema);
    // console.log('\n\n\n *** \n', JSON.stringify(sourceCode));
    var validate;
    try {
      var makeValidate = new Function(
        'self',
        'RULES',
        'formats',
        'root',
        'refVal',
        'defaults',
        'customRules',
        'equal',
        'ucs2length',
        'ValidationError',
        sourceCode
      );

      validate = makeValidate(
        self,
        RULES,
        formats,
        root,
        refVal,
        defaults,
        customRules,
        equal,
        ucs2length,
        ValidationError
      );

      refVal[0] = validate;
    } catch(e) {
      self.logger.error('Error compiling schema, function code:', sourceCode);
      throw e;
    }

    validate.schema = _schema;
    validate.errors = null;
    validate.refs = refs;
    validate.refVal = refVal;
    validate.root = isRoot ? validate : _root;
    if ($async) validate.$async = true;
    if (opts.sourceCode === true) {
      validate.source = {
        code: sourceCode,
        patterns: patterns,
        defaults: defaults
      };
    }

    return validate;
  }

  function resolveRef(baseId, ref, isRoot) {
    ref = resolve.url(baseId, ref);
    var refIndex = refs[ref];
    var _refVal, refCode;
    if (refIndex !== undefined) {
      _refVal = refVal[refIndex];
      refCode = 'refVal[' + refIndex + ']';
      return resolvedRef(_refVal, refCode);
    }
    if (!isRoot && root.refs) {
      var rootRefId = root.refs[ref];
      if (rootRefId !== undefined) {
        _refVal = root.refVal[rootRefId];
        refCode = addLocalRef(ref, _refVal);
        return resolvedRef(_refVal, refCode);
      }
    }

    refCode = addLocalRef(ref);
    var v = resolve.call(self, localCompile, root, ref);
    if (v === undefined) {
      var localSchema = localRefs && localRefs[ref];
      if (localSchema) {
        v = resolve.inlineRef(localSchema, opts.inlineRefs)
            ? localSchema
            : compile.call(self, localSchema, root, localRefs, baseId);
      }
    }

    if (v === undefined) {
      removeLocalRef(ref);
    } else {
      replaceLocalRef(ref, v);
      return resolvedRef(v, refCode);
    }
  }

  function addLocalRef(ref, v) {
    var refId = refVal.length;
    refVal[refId] = v;
    refs[ref] = refId;
    return 'refVal' + refId;
  }

  function removeLocalRef(ref) {
    delete refs[ref];
  }

  function replaceLocalRef(ref, v) {
    var refId = refs[ref];
    refVal[refId] = v;
  }

  function resolvedRef(refVal, code) {
    return typeof refVal == 'object' || typeof refVal == 'boolean'
            ? { code: code, schema: refVal, inline: true }
            : { code: code, $async: refVal && !!refVal.$async };
  }

  function usePattern(regexStr) {
    var index = patternsHash[regexStr];
    if (index === undefined) {
      index = patternsHash[regexStr] = patterns.length;
      patterns[index] = regexStr;
    }
    return 'pattern' + index;
  }

  function useDefault(value) {
    switch (typeof value) {
      case 'boolean':
      case 'number':
        return '' + value;
      case 'string':
        return util.toQuotedString(value);
      case 'object':
        if (value === null) return 'null';
        var valueStr = stableStringify(value);
        var index = defaultsHash[valueStr];
        if (index === undefined) {
          index = defaultsHash[valueStr] = defaults.length;
          defaults[index] = value;
        }
        return 'default' + index;
    }
  }

  function useCustomRule(rule, schema, parentSchema, it) {
    if (self._opts.validateSchema !== false) {
      var deps = rule.definition.dependencies;
      if (deps && !deps.every(function(keyword) {
        return Object.prototype.hasOwnProperty.call(parentSchema, keyword);
      }))
        throw new Error('parent schema must have all required keywords: ' + deps.join(','));

      var validateSchema = rule.definition.validateSchema;
      if (validateSchema) {
        var valid = validateSchema(schema);
        if (!valid) {
          var message = 'keyword schema is invalid: ' + self.errorsText(validateSchema.errors);
          if (self._opts.validateSchema == 'log') self.logger.error(message);
          else throw new Error(message);
        }
      }
    }

    var compile = rule.definition.compile
      , inline = rule.definition.inline
      , macro = rule.definition.macro;

    var validate;
    if (compile) {
      validate = compile.call(self, schema, parentSchema, it);
    } else if (macro) {
      validate = macro.call(self, schema, parentSchema, it);
      if (opts.validateSchema !== false) self.validateSchema(validate, true);
    } else if (inline) {
      validate = inline.call(self, it, rule.keyword, schema, parentSchema);
    } else {
      validate = rule.definition.validate;
      if (!validate) return;
    }

    if (validate === undefined)
      throw new Error('custom keyword "' + rule.keyword + '"failed to compile');

    var index = customRules.length;
    customRules[index] = validate;

    return {
      code: 'customRule' + index,
      validate: validate
    };
  }
}


/**
 * Checks if the schema is currently compiled
 * @this   Ajv
 * @param  {Object} schema schema to compile
 * @param  {Object} root root object
 * @param  {String} baseId base schema ID
 * @return {Object} object with properties "index" (compilation index) and "compiling" (boolean)
 */
function checkCompiling(schema, root, baseId) {
  /* jshint validthis: true */
  var index = compIndex.call(this, schema, root, baseId);
  if (index >= 0) return { index: index, compiling: true };
  index = this._compilations.length;
  this._compilations[index] = {
    schema: schema,
    root: root,
    baseId: baseId
  };
  return { index: index, compiling: false };
}


/**
 * Removes the schema from the currently compiled list
 * @this   Ajv
 * @param  {Object} schema schema to compile
 * @param  {Object} root root object
 * @param  {String} baseId base schema ID
 */
function endCompiling(schema, root, baseId) {
  /* jshint validthis: true */
  var i = compIndex.call(this, schema, root, baseId);
  if (i >= 0) this._compilations.splice(i, 1);
}


/**
 * Index of schema compilation in the currently compiled list
 * @this   Ajv
 * @param  {Object} schema schema to compile
 * @param  {Object} root root object
 * @param  {String} baseId base schema ID
 * @return {Integer} compilation index
 */
function compIndex(schema, root, baseId) {
  /* jshint validthis: true */
  for (var i=0; i<this._compilations.length; i++) {
    var c = this._compilations[i];
    if (c.schema == schema && c.root == root && c.baseId == baseId) return i;
  }
  return -1;
}


function patternCode(i, patterns) {
  return 'var pattern' + i + ' = new RegExp(' + util.toQuotedString(patterns[i]) + ');';
}


function defaultCode(i) {
  return 'var default' + i + ' = defaults[' + i + '];';
}


function refValCode(i, refVal) {
  return refVal[i] === undefined ? '' : 'var refVal' + i + ' = refVal[' + i + '];';
}


function customRuleCode(i) {
  return 'var customRule' + i + ' = customRules[' + i + '];';
}


function vars(arr, statement) {
  if (!arr.length) return '';
  var code = '';
  for (var i=0; i<arr.length; i++)
    code += statement(i, arr);
  return code;
}


/***/ }),

/***/ 3896:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var URI = __webpack_require__(20)
  , equal = __webpack_require__(8206)
  , util = __webpack_require__(6578)
  , SchemaObject = __webpack_require__(7605)
  , traverse = __webpack_require__(2533);

module.exports = resolve;

resolve.normalizeId = normalizeId;
resolve.fullPath = getFullPath;
resolve.url = resolveUrl;
resolve.ids = resolveIds;
resolve.inlineRef = inlineRef;
resolve.schema = resolveSchema;

/**
 * [resolve and compile the references ($ref)]
 * @this   Ajv
 * @param  {Function} compile reference to schema compilation funciton (localCompile)
 * @param  {Object} root object with information about the root schema for the current schema
 * @param  {String} ref reference to resolve
 * @return {Object|Function} schema object (if the schema can be inlined) or validation function
 */
function resolve(compile, root, ref) {
  /* jshint validthis: true */
  var refVal = this._refs[ref];
  if (typeof refVal == 'string') {
    if (this._refs[refVal]) refVal = this._refs[refVal];
    else return resolve.call(this, compile, root, refVal);
  }

  refVal = refVal || this._schemas[ref];
  if (refVal instanceof SchemaObject) {
    return inlineRef(refVal.schema, this._opts.inlineRefs)
            ? refVal.schema
            : refVal.validate || this._compile(refVal);
  }

  var res = resolveSchema.call(this, root, ref);
  var schema, v, baseId;
  if (res) {
    schema = res.schema;
    root = res.root;
    baseId = res.baseId;
  }

  if (schema instanceof SchemaObject) {
    v = schema.validate || compile.call(this, schema.schema, root, undefined, baseId);
  } else if (schema !== undefined) {
    v = inlineRef(schema, this._opts.inlineRefs)
        ? schema
        : compile.call(this, schema, root, undefined, baseId);
  }

  return v;
}


/**
 * Resolve schema, its root and baseId
 * @this Ajv
 * @param  {Object} root root object with properties schema, refVal, refs
 * @param  {String} ref  reference to resolve
 * @return {Object} object with properties schema, root, baseId
 */
function resolveSchema(root, ref) {
  /* jshint validthis: true */
  var p = URI.parse(ref)
    , refPath = _getFullPath(p)
    , baseId = getFullPath(this._getId(root.schema));
  if (Object.keys(root.schema).length === 0 || refPath !== baseId) {
    var id = normalizeId(refPath);
    var refVal = this._refs[id];
    if (typeof refVal == 'string') {
      return resolveRecursive.call(this, root, refVal, p);
    } else if (refVal instanceof SchemaObject) {
      if (!refVal.validate) this._compile(refVal);
      root = refVal;
    } else {
      refVal = this._schemas[id];
      if (refVal instanceof SchemaObject) {
        if (!refVal.validate) this._compile(refVal);
        if (id == normalizeId(ref))
          return { schema: refVal, root: root, baseId: baseId };
        root = refVal;
      } else {
        return;
      }
    }
    if (!root.schema) return;
    baseId = getFullPath(this._getId(root.schema));
  }
  return getJsonPointer.call(this, p, baseId, root.schema, root);
}


/* @this Ajv */
function resolveRecursive(root, ref, parsedRef) {
  /* jshint validthis: true */
  var res = resolveSchema.call(this, root, ref);
  if (res) {
    var schema = res.schema;
    var baseId = res.baseId;
    root = res.root;
    var id = this._getId(schema);
    if (id) baseId = resolveUrl(baseId, id);
    return getJsonPointer.call(this, parsedRef, baseId, schema, root);
  }
}


var PREVENT_SCOPE_CHANGE = util.toHash(['properties', 'patternProperties', 'enum', 'dependencies', 'definitions']);
/* @this Ajv */
function getJsonPointer(parsedRef, baseId, schema, root) {
  /* jshint validthis: true */
  parsedRef.fragment = parsedRef.fragment || '';
  if (parsedRef.fragment.slice(0,1) != '/') return;
  var parts = parsedRef.fragment.split('/');

  for (var i = 1; i < parts.length; i++) {
    var part = parts[i];
    if (part) {
      part = util.unescapeFragment(part);
      schema = schema[part];
      if (schema === undefined) break;
      var id;
      if (!PREVENT_SCOPE_CHANGE[part]) {
        id = this._getId(schema);
        if (id) baseId = resolveUrl(baseId, id);
        if (schema.$ref) {
          var $ref = resolveUrl(baseId, schema.$ref);
          var res = resolveSchema.call(this, root, $ref);
          if (res) {
            schema = res.schema;
            root = res.root;
            baseId = res.baseId;
          }
        }
      }
    }
  }
  if (schema !== undefined && schema !== root.schema)
    return { schema: schema, root: root, baseId: baseId };
}


var SIMPLE_INLINED = util.toHash([
  'type', 'format', 'pattern',
  'maxLength', 'minLength',
  'maxProperties', 'minProperties',
  'maxItems', 'minItems',
  'maximum', 'minimum',
  'uniqueItems', 'multipleOf',
  'required', 'enum'
]);
function inlineRef(schema, limit) {
  if (limit === false) return false;
  if (limit === undefined || limit === true) return checkNoRef(schema);
  else if (limit) return countKeys(schema) <= limit;
}


function checkNoRef(schema) {
  var item;
  if (Array.isArray(schema)) {
    for (var i=0; i<schema.length; i++) {
      item = schema[i];
      if (typeof item == 'object' && !checkNoRef(item)) return false;
    }
  } else {
    for (var key in schema) {
      if (key == '$ref') return false;
      item = schema[key];
      if (typeof item == 'object' && !checkNoRef(item)) return false;
    }
  }
  return true;
}


function countKeys(schema) {
  var count = 0, item;
  if (Array.isArray(schema)) {
    for (var i=0; i<schema.length; i++) {
      item = schema[i];
      if (typeof item == 'object') count += countKeys(item);
      if (count == Infinity) return Infinity;
    }
  } else {
    for (var key in schema) {
      if (key == '$ref') return Infinity;
      if (SIMPLE_INLINED[key]) {
        count++;
      } else {
        item = schema[key];
        if (typeof item == 'object') count += countKeys(item) + 1;
        if (count == Infinity) return Infinity;
      }
    }
  }
  return count;
}


function getFullPath(id, normalize) {
  if (normalize !== false) id = normalizeId(id);
  var p = URI.parse(id);
  return _getFullPath(p);
}


function _getFullPath(p) {
  return URI.serialize(p).split('#')[0] + '#';
}


var TRAILING_SLASH_HASH = /#\/?$/;
function normalizeId(id) {
  return id ? id.replace(TRAILING_SLASH_HASH, '') : '';
}


function resolveUrl(baseId, id) {
  id = normalizeId(id);
  return URI.resolve(baseId, id);
}


/* @this Ajv */
function resolveIds(schema) {
  var schemaId = normalizeId(this._getId(schema));
  var baseIds = {'': schemaId};
  var fullPaths = {'': getFullPath(schemaId, false)};
  var localRefs = {};
  var self = this;

  traverse(schema, {allKeys: true}, function(sch, jsonPtr, rootSchema, parentJsonPtr, parentKeyword, parentSchema, keyIndex) {
    if (jsonPtr === '') return;
    var id = self._getId(sch);
    var baseId = baseIds[parentJsonPtr];
    var fullPath = fullPaths[parentJsonPtr] + '/' + parentKeyword;
    if (keyIndex !== undefined)
      fullPath += '/' + (typeof keyIndex == 'number' ? keyIndex : util.escapeFragment(keyIndex));

    if (typeof id == 'string') {
      id = baseId = normalizeId(baseId ? URI.resolve(baseId, id) : id);

      var refVal = self._refs[id];
      if (typeof refVal == 'string') refVal = self._refs[refVal];
      if (refVal && refVal.schema) {
        if (!equal(sch, refVal.schema))
          throw new Error('id "' + id + '" resolves to more than one schema');
      } else if (id != normalizeId(fullPath)) {
        if (id[0] == '#') {
          if (localRefs[id] && !equal(sch, localRefs[id]))
            throw new Error('id "' + id + '" resolves to more than one schema');
          localRefs[id] = sch;
        } else {
          self._refs[id] = fullPath;
        }
      }
    }
    baseIds[jsonPtr] = baseId;
    fullPaths[jsonPtr] = fullPath;
  });

  return localRefs;
}


/***/ }),

/***/ 8561:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var ruleModules = __webpack_require__(5810)
  , toHash = __webpack_require__(6578).toHash;

module.exports = function rules() {
  var RULES = [
    { type: 'number',
      rules: [ { 'maximum': ['exclusiveMaximum'] },
               { 'minimum': ['exclusiveMinimum'] }, 'multipleOf', 'format'] },
    { type: 'string',
      rules: [ 'maxLength', 'minLength', 'pattern', 'format' ] },
    { type: 'array',
      rules: [ 'maxItems', 'minItems', 'items', 'contains', 'uniqueItems' ] },
    { type: 'object',
      rules: [ 'maxProperties', 'minProperties', 'required', 'dependencies', 'propertyNames',
               { 'properties': ['additionalProperties', 'patternProperties'] } ] },
    { rules: [ '$ref', 'const', 'enum', 'not', 'anyOf', 'oneOf', 'allOf', 'if' ] }
  ];

  var ALL = [ 'type', '$comment' ];
  var KEYWORDS = [
    '$schema', '$id', 'id', '$data', '$async', 'title',
    'description', 'default', 'definitions',
    'examples', 'readOnly', 'writeOnly',
    'contentMediaType', 'contentEncoding',
    'additionalItems', 'then', 'else'
  ];
  var TYPES = [ 'number', 'integer', 'string', 'array', 'object', 'boolean', 'null' ];
  RULES.all = toHash(ALL);
  RULES.types = toHash(TYPES);

  RULES.forEach(function (group) {
    group.rules = group.rules.map(function (keyword) {
      var implKeywords;
      if (typeof keyword == 'object') {
        var key = Object.keys(keyword)[0];
        implKeywords = keyword[key];
        keyword = key;
        implKeywords.forEach(function (k) {
          ALL.push(k);
          RULES.all[k] = true;
        });
      }
      ALL.push(keyword);
      var rule = RULES.all[keyword] = {
        keyword: keyword,
        code: ruleModules[keyword],
        implements: implKeywords
      };
      return rule;
    });

    RULES.all.$comment = {
      keyword: '$comment',
      code: ruleModules.$comment
    };

    if (group.type) RULES.types[group.type] = group;
  });

  RULES.keywords = toHash(ALL.concat(KEYWORDS));
  RULES.custom = {};

  return RULES;
};


/***/ }),

/***/ 7605:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var util = __webpack_require__(6578);

module.exports = SchemaObject;

function SchemaObject(obj) {
  util.copy(obj, this);
}


/***/ }),

/***/ 4580:
/***/ ((module) => {

"use strict";


// https://mathiasbynens.be/notes/javascript-encoding
// https://github.com/bestiejs/punycode.js - punycode.ucs2.decode
module.exports = function ucs2length(str) {
  var length = 0
    , len = str.length
    , pos = 0
    , value;
  while (pos < len) {
    length++;
    value = str.charCodeAt(pos++);
    if (value >= 0xD800 && value <= 0xDBFF && pos < len) {
      // high surrogate, and there is a next character
      value = str.charCodeAt(pos);
      if ((value & 0xFC00) == 0xDC00) pos++; // low surrogate
    }
  }
  return length;
};


/***/ }),

/***/ 6578:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";



module.exports = {
  copy: copy,
  checkDataType: checkDataType,
  checkDataTypes: checkDataTypes,
  coerceToTypes: coerceToTypes,
  toHash: toHash,
  getProperty: getProperty,
  escapeQuotes: escapeQuotes,
  equal: __webpack_require__(8206),
  ucs2length: __webpack_require__(4580),
  varOccurences: varOccurences,
  varReplace: varReplace,
  schemaHasRules: schemaHasRules,
  schemaHasRulesExcept: schemaHasRulesExcept,
  schemaUnknownRules: schemaUnknownRules,
  toQuotedString: toQuotedString,
  getPathExpr: getPathExpr,
  getPath: getPath,
  getData: getData,
  unescapeFragment: unescapeFragment,
  unescapeJsonPointer: unescapeJsonPointer,
  escapeFragment: escapeFragment,
  escapeJsonPointer: escapeJsonPointer
};


function copy(o, to) {
  to = to || {};
  for (var key in o) to[key] = o[key];
  return to;
}


function checkDataType(dataType, data, strictNumbers, negate) {
  var EQUAL = negate ? ' !== ' : ' === '
    , AND = negate ? ' || ' : ' && '
    , OK = negate ? '!' : ''
    , NOT = negate ? '' : '!';
  switch (dataType) {
    case 'null': return data + EQUAL + 'null';
    case 'array': return OK + 'Array.isArray(' + data + ')';
    case 'object': return '(' + OK + data + AND +
                          'typeof ' + data + EQUAL + '"object"' + AND +
                          NOT + 'Array.isArray(' + data + '))';
    case 'integer': return '(typeof ' + data + EQUAL + '"number"' + AND +
                           NOT + '(' + data + ' % 1)' +
                           AND + data + EQUAL + data +
                           (strictNumbers ? (AND + OK + 'isFinite(' + data + ')') : '') + ')';
    case 'number': return '(typeof ' + data + EQUAL + '"' + dataType + '"' +
                          (strictNumbers ? (AND + OK + 'isFinite(' + data + ')') : '') + ')';
    default: return 'typeof ' + data + EQUAL + '"' + dataType + '"';
  }
}


function checkDataTypes(dataTypes, data, strictNumbers) {
  switch (dataTypes.length) {
    case 1: return checkDataType(dataTypes[0], data, strictNumbers, true);
    default:
      var code = '';
      var types = toHash(dataTypes);
      if (types.array && types.object) {
        code = types.null ? '(': '(!' + data + ' || ';
        code += 'typeof ' + data + ' !== "object")';
        delete types.null;
        delete types.array;
        delete types.object;
      }
      if (types.number) delete types.integer;
      for (var t in types)
        code += (code ? ' && ' : '' ) + checkDataType(t, data, strictNumbers, true);

      return code;
  }
}


var COERCE_TO_TYPES = toHash([ 'string', 'number', 'integer', 'boolean', 'null' ]);
function coerceToTypes(optionCoerceTypes, dataTypes) {
  if (Array.isArray(dataTypes)) {
    var types = [];
    for (var i=0; i<dataTypes.length; i++) {
      var t = dataTypes[i];
      if (COERCE_TO_TYPES[t]) types[types.length] = t;
      else if (optionCoerceTypes === 'array' && t === 'array') types[types.length] = t;
    }
    if (types.length) return types;
  } else if (COERCE_TO_TYPES[dataTypes]) {
    return [dataTypes];
  } else if (optionCoerceTypes === 'array' && dataTypes === 'array') {
    return ['array'];
  }
}


function toHash(arr) {
  var hash = {};
  for (var i=0; i<arr.length; i++) hash[arr[i]] = true;
  return hash;
}


var IDENTIFIER = /^[a-z$_][a-z$_0-9]*$/i;
var SINGLE_QUOTE = /'|\\/g;
function getProperty(key) {
  return typeof key == 'number'
          ? '[' + key + ']'
          : IDENTIFIER.test(key)
            ? '.' + key
            : "['" + escapeQuotes(key) + "']";
}


function escapeQuotes(str) {
  return str.replace(SINGLE_QUOTE, '\\$&')
            .replace(/\n/g, '\\n')
            .replace(/\r/g, '\\r')
            .replace(/\f/g, '\\f')
            .replace(/\t/g, '\\t');
}


function varOccurences(str, dataVar) {
  dataVar += '[^0-9]';
  var matches = str.match(new RegExp(dataVar, 'g'));
  return matches ? matches.length : 0;
}


function varReplace(str, dataVar, expr) {
  dataVar += '([^0-9])';
  expr = expr.replace(/\$/g, '$$$$');
  return str.replace(new RegExp(dataVar, 'g'), expr + '$1');
}


function schemaHasRules(schema, rules) {
  if (typeof schema == 'boolean') return !schema;
  for (var key in schema) if (rules[key]) return true;
}


function schemaHasRulesExcept(schema, rules, exceptKeyword) {
  if (typeof schema == 'boolean') return !schema && exceptKeyword != 'not';
  for (var key in schema) if (key != exceptKeyword && rules[key]) return true;
}


function schemaUnknownRules(schema, rules) {
  if (typeof schema == 'boolean') return;
  for (var key in schema) if (!rules[key]) return key;
}


function toQuotedString(str) {
  return '\'' + escapeQuotes(str) + '\'';
}


function getPathExpr(currentPath, expr, jsonPointers, isNumber) {
  var path = jsonPointers // false by default
              ? '\'/\' + ' + expr + (isNumber ? '' : '.replace(/~/g, \'~0\').replace(/\\//g, \'~1\')')
              : (isNumber ? '\'[\' + ' + expr + ' + \']\'' : '\'[\\\'\' + ' + expr + ' + \'\\\']\'');
  return joinPaths(currentPath, path);
}


function getPath(currentPath, prop, jsonPointers) {
  var path = jsonPointers // false by default
              ? toQuotedString('/' + escapeJsonPointer(prop))
              : toQuotedString(getProperty(prop));
  return joinPaths(currentPath, path);
}


var JSON_POINTER = /^\/(?:[^~]|~0|~1)*$/;
var RELATIVE_JSON_POINTER = /^([0-9]+)(#|\/(?:[^~]|~0|~1)*)?$/;
function getData($data, lvl, paths) {
  var up, jsonPointer, data, matches;
  if ($data === '') return 'rootData';
  if ($data[0] == '/') {
    if (!JSON_POINTER.test($data)) throw new Error('Invalid JSON-pointer: ' + $data);
    jsonPointer = $data;
    data = 'rootData';
  } else {
    matches = $data.match(RELATIVE_JSON_POINTER);
    if (!matches) throw new Error('Invalid JSON-pointer: ' + $data);
    up = +matches[1];
    jsonPointer = matches[2];
    if (jsonPointer == '#') {
      if (up >= lvl) throw new Error('Cannot access property/index ' + up + ' levels up, current level is ' + lvl);
      return paths[lvl - up];
    }

    if (up > lvl) throw new Error('Cannot access data ' + up + ' levels up, current level is ' + lvl);
    data = 'data' + ((lvl - up) || '');
    if (!jsonPointer) return data;
  }

  var expr = data;
  var segments = jsonPointer.split('/');
  for (var i=0; i<segments.length; i++) {
    var segment = segments[i];
    if (segment) {
      data += getProperty(unescapeJsonPointer(segment));
      expr += ' && ' + data;
    }
  }
  return expr;
}


function joinPaths (a, b) {
  if (a == '""') return b;
  return (a + ' + ' + b).replace(/([^\\])' \+ '/g, '$1');
}


function unescapeFragment(str) {
  return unescapeJsonPointer(decodeURIComponent(str));
}


function escapeFragment(str) {
  return encodeURIComponent(escapeJsonPointer(str));
}


function escapeJsonPointer(str) {
  return str.replace(/~/g, '~0').replace(/\//g, '~1');
}


function unescapeJsonPointer(str) {
  return str.replace(/~1/g, '/').replace(/~0/g, '~');
}


/***/ }),

/***/ 1412:
/***/ ((module) => {

"use strict";


var KEYWORDS = [
  'multipleOf',
  'maximum',
  'exclusiveMaximum',
  'minimum',
  'exclusiveMinimum',
  'maxLength',
  'minLength',
  'pattern',
  'additionalItems',
  'maxItems',
  'minItems',
  'uniqueItems',
  'maxProperties',
  'minProperties',
  'required',
  'additionalProperties',
  'enum',
  'format',
  'const'
];

module.exports = function (metaSchema, keywordsJsonPointers) {
  for (var i=0; i<keywordsJsonPointers.length; i++) {
    metaSchema = JSON.parse(JSON.stringify(metaSchema));
    var segments = keywordsJsonPointers[i].split('/');
    var keywords = metaSchema;
    var j;
    for (j=1; j<segments.length; j++)
      keywords = keywords[segments[j]];

    for (j=0; j<KEYWORDS.length; j++) {
      var key = KEYWORDS[j];
      var schema = keywords[key];
      if (schema) {
        keywords[key] = {
          anyOf: [
            schema,
            { $ref: 'https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/data.json#' }
          ]
        };
      }
    }
  }

  return metaSchema;
};


/***/ }),

/***/ 458:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var metaSchema = __webpack_require__(38);

module.exports = {
  $id: 'https://github.com/ajv-validator/ajv/blob/master/lib/definition_schema.js',
  definitions: {
    simpleTypes: metaSchema.definitions.simpleTypes
  },
  type: 'object',
  dependencies: {
    schema: ['validate'],
    $data: ['validate'],
    statements: ['inline'],
    valid: {not: {required: ['macro']}}
  },
  properties: {
    type: metaSchema.properties.type,
    schema: {type: 'boolean'},
    statements: {type: 'boolean'},
    dependencies: {
      type: 'array',
      items: {type: 'string'}
    },
    metaSchema: {type: 'object'},
    modifying: {type: 'boolean'},
    valid: {type: 'boolean'},
    $data: {type: 'boolean'},
    async: {type: 'boolean'},
    errors: {
      anyOf: [
        {type: 'boolean'},
        {const: 'full'}
      ]
    }
  }
};


/***/ }),

/***/ 7404:
/***/ ((module) => {

"use strict";

module.exports = function generate__limit(it, $keyword, $ruleType) {
  var out = ' ';
  var $lvl = it.level;
  var $dataLvl = it.dataLevel;
  var $schema = it.schema[$keyword];
  var $schemaPath = it.schemaPath + it.util.getProperty($keyword);
  var $errSchemaPath = it.errSchemaPath + '/' + $keyword;
  var $breakOnError = !it.opts.allErrors;
  var $errorKeyword;
  var $data = 'data' + ($dataLvl || '');
  var $isData = it.opts.$data && $schema && $schema.$data,
    $schemaValue;
  if ($isData) {
    out += ' var schema' + ($lvl) + ' = ' + (it.util.getData($schema.$data, $dataLvl, it.dataPathArr)) + '; ';
    $schemaValue = 'schema' + $lvl;
  } else {
    $schemaValue = $schema;
  }
  var $isMax = $keyword == 'maximum',
    $exclusiveKeyword = $isMax ? 'exclusiveMaximum' : 'exclusiveMinimum',
    $schemaExcl = it.schema[$exclusiveKeyword],
    $isDataExcl = it.opts.$data && $schemaExcl && $schemaExcl.$data,
    $op = $isMax ? '<' : '>',
    $notOp = $isMax ? '>' : '<',
    $errorKeyword = undefined;
  if (!($isData || typeof $schema == 'number' || $schema === undefined)) {
    throw new Error($keyword + ' must be number');
  }
  if (!($isDataExcl || $schemaExcl === undefined || typeof $schemaExcl == 'number' || typeof $schemaExcl == 'boolean')) {
    throw new Error($exclusiveKeyword + ' must be number or boolean');
  }
  if ($isDataExcl) {
    var $schemaValueExcl = it.util.getData($schemaExcl.$data, $dataLvl, it.dataPathArr),
      $exclusive = 'exclusive' + $lvl,
      $exclType = 'exclType' + $lvl,
      $exclIsNumber = 'exclIsNumber' + $lvl,
      $opExpr = 'op' + $lvl,
      $opStr = '\' + ' + $opExpr + ' + \'';
    out += ' var schemaExcl' + ($lvl) + ' = ' + ($schemaValueExcl) + '; ';
    $schemaValueExcl = 'schemaExcl' + $lvl;
    out += ' var ' + ($exclusive) + '; var ' + ($exclType) + ' = typeof ' + ($schemaValueExcl) + '; if (' + ($exclType) + ' != \'boolean\' && ' + ($exclType) + ' != \'undefined\' && ' + ($exclType) + ' != \'number\') { ';
    var $errorKeyword = $exclusiveKeyword;
    var $$outStack = $$outStack || [];
    $$outStack.push(out);
    out = ''; /* istanbul ignore else */
    if (it.createErrors !== false) {
      out += ' { keyword: \'' + ($errorKeyword || '_exclusiveLimit') + '\' , dataPath: (dataPath || \'\') + ' + (it.errorPath) + ' , schemaPath: ' + (it.util.toQuotedString($errSchemaPath)) + ' , params: {} ';
      if (it.opts.messages !== false) {
        out += ' , message: \'' + ($exclusiveKeyword) + ' should be boolean\' ';
      }
      if (it.opts.verbose) {
        out += ' , schema: validate.schema' + ($schemaPath) + ' , parentSchema: validate.schema' + (it.schemaPath) + ' , data: ' + ($data) + ' ';
      }
      out += ' } ';
    } else {
      out += ' {} ';
    }
    var __err = out;
    out = $$outStack.pop();
    if (!it.compositeRule && $breakOnError) {
      /* istanbul ignore if */
      if (it.async) {
        out += ' throw new ValidationError([' + (__err) + ']); ';
      } else {
        out += ' validate.errors = [' + (__err) + ']; return false; ';
      }
    } else {
      out += ' var err = ' + (__err) + ';  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ';
    }
    out += ' } else if ( ';
    if ($isData) {
      out += ' (' + ($schemaValue) + ' !== undefined && typeof ' + ($schemaValue) + ' != \'number\') || ';
    }
    out += ' ' + ($exclType) + ' == \'number\' ? ( (' + ($exclusive) + ' = ' + ($schemaValue) + ' === undefined || ' + ($schemaValueExcl) + ' ' + ($op) + '= ' + ($schemaValue) + ') ? ' + ($data) + ' ' + ($notOp) + '= ' + ($schemaValueExcl) + ' : ' + ($data) + ' ' + ($notOp) + ' ' + ($schemaValue) + ' ) : ( (' + ($exclusive) + ' = ' + ($schemaValueExcl) + ' === true) ? ' + ($data) + ' ' + ($notOp) + '= ' + ($schemaValue) + ' : ' + ($data) + ' ' + ($notOp) + ' ' + ($schemaValue) + ' ) || ' + ($data) + ' !== ' + ($data) + ') { var op' + ($lvl) + ' = ' + ($exclusive) + ' ? \'' + ($op) + '\' : \'' + ($op) + '=\'; ';
    if ($schema === undefined) {
      $errorKeyword = $exclusiveKeyword;
      $errSchemaPath = it.errSchemaPath + '/' + $exclusiveKeyword;
      $schemaValue = $schemaValueExcl;
      $isData = $isDataExcl;
    }
  } else {
    var $exclIsNumber = typeof $schemaExcl == 'number',
      $opStr = $op;
    if ($exclIsNumber && $isData) {
      var $opExpr = '\'' + $opStr + '\'';
      out += ' if ( ';
      if ($isData) {
        out += ' (' + ($schemaValue) + ' !== undefined && typeof ' + ($schemaValue) + ' != \'number\') || ';
      }
      out += ' ( ' + ($schemaValue) + ' === undefined || ' + ($schemaExcl) + ' ' + ($op) + '= ' + ($schemaValue) + ' ? ' + ($data) + ' ' + ($notOp) + '= ' + ($schemaExcl) + ' : ' + ($data) + ' ' + ($notOp) + ' ' + ($schemaValue) + ' ) || ' + ($data) + ' !== ' + ($data) + ') { ';
    } else {
      if ($exclIsNumber && $schema === undefined) {
        $exclusive = true;
        $errorKeyword = $exclusiveKeyword;
        $errSchemaPath = it.errSchemaPath + '/' + $exclusiveKeyword;
        $schemaValue = $schemaExcl;
        $notOp += '=';
      } else {
        if ($exclIsNumber) $schemaValue = Math[$isMax ? 'min' : 'max']($schemaExcl, $schema);
        if ($schemaExcl === ($exclIsNumber ? $schemaValue : true)) {
          $exclusive = true;
          $errorKeyword = $exclusiveKeyword;
          $errSchemaPath = it.errSchemaPath + '/' + $exclusiveKeyword;
          $notOp += '=';
        } else {
          $exclusive = false;
          $opStr += '=';
        }
      }
      var $opExpr = '\'' + $opStr + '\'';
      out += ' if ( ';
      if ($isData) {
        out += ' (' + ($schemaValue) + ' !== undefined && typeof ' + ($schemaValue) + ' != \'number\') || ';
      }
      out += ' ' + ($data) + ' ' + ($notOp) + ' ' + ($schemaValue) + ' || ' + ($data) + ' !== ' + ($data) + ') { ';
    }
  }
  $errorKeyword = $errorKeyword || $keyword;
  var $$outStack = $$outStack || [];
  $$outStack.push(out);
  out = ''; /* istanbul ignore else */
  if (it.createErrors !== false) {
    out += ' { keyword: \'' + ($errorKeyword || '_limit') + '\' , dataPath: (dataPath || \'\') + ' + (it.errorPath) + ' , schemaPath: ' + (it.util.toQuotedString($errSchemaPath)) + ' , params: { comparison: ' + ($opExpr) + ', limit: ' + ($schemaValue) + ', exclusive: ' + ($exclusive) + ' } ';
    if (it.opts.messages !== false) {
      out += ' , message: \'should be ' + ($opStr) + ' ';
      if ($isData) {
        out += '\' + ' + ($schemaValue);
      } else {
        out += '' + ($schemaValue) + '\'';
      }
    }
    if (it.opts.verbose) {
      out += ' , schema:  ';
      if ($isData) {
        out += 'validate.schema' + ($schemaPath);
      } else {
        out += '' + ($schema);
      }
      out += '         , parentSchema: validate.schema' + (it.schemaPath) + ' , data: ' + ($data) + ' ';
    }
    out += ' } ';
  } else {
    out += ' {} ';
  }
  var __err = out;
  out = $$outStack.pop();
  if (!it.compositeRule && $breakOnError) {
    /* istanbul ignore if */
    if (it.async) {
      out += ' throw new ValidationError([' + (__err) + ']); ';
    } else {
      out += ' validate.errors = [' + (__err) + ']; return false; ';
    }
  } else {
    out += ' var err = ' + (__err) + ';  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ';
  }
  out += ' } ';
  if ($breakOnError) {
    out += ' else { ';
  }
  return out;
}


/***/ }),

/***/ 4683:
/***/ ((module) => {

"use strict";

module.exports = function generate__limitItems(it, $keyword, $ruleType) {
  var out = ' ';
  var $lvl = it.level;
  var $dataLvl = it.dataLevel;
  var $schema = it.schema[$keyword];
  var $schemaPath = it.schemaPath + it.util.getProperty($keyword);
  var $errSchemaPath = it.errSchemaPath + '/' + $keyword;
  var $breakOnError = !it.opts.allErrors;
  var $errorKeyword;
  var $data = 'data' + ($dataLvl || '');
  var $isData = it.opts.$data && $schema && $schema.$data,
    $schemaValue;
  if ($isData) {
    out += ' var schema' + ($lvl) + ' = ' + (it.util.getData($schema.$data, $dataLvl, it.dataPathArr)) + '; ';
    $schemaValue = 'schema' + $lvl;
  } else {
    $schemaValue = $schema;
  }
  if (!($isData || typeof $schema == 'number')) {
    throw new Error($keyword + ' must be number');
  }
  var $op = $keyword == 'maxItems' ? '>' : '<';
  out += 'if ( ';
  if ($isData) {
    out += ' (' + ($schemaValue) + ' !== undefined && typeof ' + ($schemaValue) + ' != \'number\') || ';
  }
  out += ' ' + ($data) + '.length ' + ($op) + ' ' + ($schemaValue) + ') { ';
  var $errorKeyword = $keyword;
  var $$outStack = $$outStack || [];
  $$outStack.push(out);
  out = ''; /* istanbul ignore else */
  if (it.createErrors !== false) {
    out += ' { keyword: \'' + ($errorKeyword || '_limitItems') + '\' , dataPath: (dataPath || \'\') + ' + (it.errorPath) + ' , schemaPath: ' + (it.util.toQuotedString($errSchemaPath)) + ' , params: { limit: ' + ($schemaValue) + ' } ';
    if (it.opts.messages !== false) {
      out += ' , message: \'should NOT have ';
      if ($keyword == 'maxItems') {
        out += 'more';
      } else {
        out += 'fewer';
      }
      out += ' than ';
      if ($isData) {
        out += '\' + ' + ($schemaValue) + ' + \'';
      } else {
        out += '' + ($schema);
      }
      out += ' items\' ';
    }
    if (it.opts.verbose) {
      out += ' , schema:  ';
      if ($isData) {
        out += 'validate.schema' + ($schemaPath);
      } else {
        out += '' + ($schema);
      }
      out += '         , parentSchema: validate.schema' + (it.schemaPath) + ' , data: ' + ($data) + ' ';
    }
    out += ' } ';
  } else {
    out += ' {} ';
  }
  var __err = out;
  out = $$outStack.pop();
  if (!it.compositeRule && $breakOnError) {
    /* istanbul ignore if */
    if (it.async) {
      out += ' throw new ValidationError([' + (__err) + ']); ';
    } else {
      out += ' validate.errors = [' + (__err) + ']; return false; ';
    }
  } else {
    out += ' var err = ' + (__err) + ';  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ';
  }
  out += '} ';
  if ($breakOnError) {
    out += ' else { ';
  }
  return out;
}


/***/ }),

/***/ 2114:
/***/ ((module) => {

"use strict";

module.exports = function generate__limitLength(it, $keyword, $ruleType) {
  var out = ' ';
  var $lvl = it.level;
  var $dataLvl = it.dataLevel;
  var $schema = it.schema[$keyword];
  var $schemaPath = it.schemaPath + it.util.getProperty($keyword);
  var $errSchemaPath = it.errSchemaPath + '/' + $keyword;
  var $breakOnError = !it.opts.allErrors;
  var $errorKeyword;
  var $data = 'data' + ($dataLvl || '');
  var $isData = it.opts.$data && $schema && $schema.$data,
    $schemaValue;
  if ($isData) {
    out += ' var schema' + ($lvl) + ' = ' + (it.util.getData($schema.$data, $dataLvl, it.dataPathArr)) + '; ';
    $schemaValue = 'schema' + $lvl;
  } else {
    $schemaValue = $schema;
  }
  if (!($isData || typeof $schema == 'number')) {
    throw new Error($keyword + ' must be number');
  }
  var $op = $keyword == 'maxLength' ? '>' : '<';
  out += 'if ( ';
  if ($isData) {
    out += ' (' + ($schemaValue) + ' !== undefined && typeof ' + ($schemaValue) + ' != \'number\') || ';
  }
  if (it.opts.unicode === false) {
    out += ' ' + ($data) + '.length ';
  } else {
    out += ' ucs2length(' + ($data) + ') ';
  }
  out += ' ' + ($op) + ' ' + ($schemaValue) + ') { ';
  var $errorKeyword = $keyword;
  var $$outStack = $$outStack || [];
  $$outStack.push(out);
  out = ''; /* istanbul ignore else */
  if (it.createErrors !== false) {
    out += ' { keyword: \'' + ($errorKeyword || '_limitLength') + '\' , dataPath: (dataPath || \'\') + ' + (it.errorPath) + ' , schemaPath: ' + (it.util.toQuotedString($errSchemaPath)) + ' , params: { limit: ' + ($schemaValue) + ' } ';
    if (it.opts.messages !== false) {
      out += ' , message: \'should NOT be ';
      if ($keyword == 'maxLength') {
        out += 'longer';
      } else {
        out += 'shorter';
      }
      out += ' than ';
      if ($isData) {
        out += '\' + ' + ($schemaValue) + ' + \'';
      } else {
        out += '' + ($schema);
      }
      out += ' characters\' ';
    }
    if (it.opts.verbose) {
      out += ' , schema:  ';
      if ($isData) {
        out += 'validate.schema' + ($schemaPath);
      } else {
        out += '' + ($schema);
      }
      out += '         , parentSchema: validate.schema' + (it.schemaPath) + ' , data: ' + ($data) + ' ';
    }
    out += ' } ';
  } else {
    out += ' {} ';
  }
  var __err = out;
  out = $$outStack.pop();
  if (!it.compositeRule && $breakOnError) {
    /* istanbul ignore if */
    if (it.async) {
      out += ' throw new ValidationError([' + (__err) + ']); ';
    } else {
      out += ' validate.errors = [' + (__err) + ']; return false; ';
    }
  } else {
    out += ' var err = ' + (__err) + ';  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ';
  }
  out += '} ';
  if ($breakOnError) {
    out += ' else { ';
  }
  return out;
}


/***/ }),

/***/ 1142:
/***/ ((module) => {

"use strict";

module.exports = function generate__limitProperties(it, $keyword, $ruleType) {
  var out = ' ';
  var $lvl = it.level;
  var $dataLvl = it.dataLevel;
  var $schema = it.schema[$keyword];
  var $schemaPath = it.schemaPath + it.util.getProperty($keyword);
  var $errSchemaPath = it.errSchemaPath + '/' + $keyword;
  var $breakOnError = !it.opts.allErrors;
  var $errorKeyword;
  var $data = 'data' + ($dataLvl || '');
  var $isData = it.opts.$data && $schema && $schema.$data,
    $schemaValue;
  if ($isData) {
    out += ' var schema' + ($lvl) + ' = ' + (it.util.getData($schema.$data, $dataLvl, it.dataPathArr)) + '; ';
    $schemaValue = 'schema' + $lvl;
  } else {
    $schemaValue = $schema;
  }
  if (!($isData || typeof $schema == 'number')) {
    throw new Error($keyword + ' must be number');
  }
  var $op = $keyword == 'maxProperties' ? '>' : '<';
  out += 'if ( ';
  if ($isData) {
    out += ' (' + ($schemaValue) + ' !== undefined && typeof ' + ($schemaValue) + ' != \'number\') || ';
  }
  out += ' Object.keys(' + ($data) + ').length ' + ($op) + ' ' + ($schemaValue) + ') { ';
  var $errorKeyword = $keyword;
  var $$outStack = $$outStack || [];
  $$outStack.push(out);
  out = ''; /* istanbul ignore else */
  if (it.createErrors !== false) {
    out += ' { keyword: \'' + ($errorKeyword || '_limitProperties') + '\' , dataPath: (dataPath || \'\') + ' + (it.errorPath) + ' , schemaPath: ' + (it.util.toQuotedString($errSchemaPath)) + ' , params: { limit: ' + ($schemaValue) + ' } ';
    if (it.opts.messages !== false) {
      out += ' , message: \'should NOT have ';
      if ($keyword == 'maxProperties') {
        out += 'more';
      } else {
        out += 'fewer';
      }
      out += ' than ';
      if ($isData) {
        out += '\' + ' + ($schemaValue) + ' + \'';
      } else {
        out += '' + ($schema);
      }
      out += ' properties\' ';
    }
    if (it.opts.verbose) {
      out += ' , schema:  ';
      if ($isData) {
        out += 'validate.schema' + ($schemaPath);
      } else {
        out += '' + ($schema);
      }
      out += '         , parentSchema: validate.schema' + (it.schemaPath) + ' , data: ' + ($data) + ' ';
    }
    out += ' } ';
  } else {
    out += ' {} ';
  }
  var __err = out;
  out = $$outStack.pop();
  if (!it.compositeRule && $breakOnError) {
    /* istanbul ignore if */
    if (it.async) {
      out += ' throw new ValidationError([' + (__err) + ']); ';
    } else {
      out += ' validate.errors = [' + (__err) + ']; return false; ';
    }
  } else {
    out += ' var err = ' + (__err) + ';  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ';
  }
  out += '} ';
  if ($breakOnError) {
    out += ' else { ';
  }
  return out;
}


/***/ }),

/***/ 9443:
/***/ ((module) => {

"use strict";

module.exports = function generate_allOf(it, $keyword, $ruleType) {
  var out = ' ';
  var $schema = it.schema[$keyword];
  var $schemaPath = it.schemaPath + it.util.getProperty($keyword);
  var $errSchemaPath = it.errSchemaPath + '/' + $keyword;
  var $breakOnError = !it.opts.allErrors;
  var $it = it.util.copy(it);
  var $closingBraces = '';
  $it.level++;
  var $nextValid = 'valid' + $it.level;
  var $currentBaseId = $it.baseId,
    $allSchemasEmpty = true;
  var arr1 = $schema;
  if (arr1) {
    var $sch, $i = -1,
      l1 = arr1.length - 1;
    while ($i < l1) {
      $sch = arr1[$i += 1];
      if ((it.opts.strictKeywords ? (typeof $sch == 'object' && Object.keys($sch).length > 0) || $sch === false : it.util.schemaHasRules($sch, it.RULES.all))) {
        $allSchemasEmpty = false;
        $it.schema = $sch;
        $it.schemaPath = $schemaPath + '[' + $i + ']';
        $it.errSchemaPath = $errSchemaPath + '/' + $i;
        out += '  ' + (it.validate($it)) + ' ';
        $it.baseId = $currentBaseId;
        if ($breakOnError) {
          out += ' if (' + ($nextValid) + ') { ';
          $closingBraces += '}';
        }
      }
    }
  }
  if ($breakOnError) {
    if ($allSchemasEmpty) {
      out += ' if (true) { ';
    } else {
      out += ' ' + ($closingBraces.slice(0, -1)) + ' ';
    }
  }
  return out;
}


/***/ }),

/***/ 3093:
/***/ ((module) => {

"use strict";

module.exports = function generate_anyOf(it, $keyword, $ruleType) {
  var out = ' ';
  var $lvl = it.level;
  var $dataLvl = it.dataLevel;
  var $schema = it.schema[$keyword];
  var $schemaPath = it.schemaPath + it.util.getProperty($keyword);
  var $errSchemaPath = it.errSchemaPath + '/' + $keyword;
  var $breakOnError = !it.opts.allErrors;
  var $data = 'data' + ($dataLvl || '');
  var $valid = 'valid' + $lvl;
  var $errs = 'errs__' + $lvl;
  var $it = it.util.copy(it);
  var $closingBraces = '';
  $it.level++;
  var $nextValid = 'valid' + $it.level;
  var $noEmptySchema = $schema.every(function($sch) {
    return (it.opts.strictKeywords ? (typeof $sch == 'object' && Object.keys($sch).length > 0) || $sch === false : it.util.schemaHasRules($sch, it.RULES.all));
  });
  if ($noEmptySchema) {
    var $currentBaseId = $it.baseId;
    out += ' var ' + ($errs) + ' = errors; var ' + ($valid) + ' = false;  ';
    var $wasComposite = it.compositeRule;
    it.compositeRule = $it.compositeRule = true;
    var arr1 = $schema;
    if (arr1) {
      var $sch, $i = -1,
        l1 = arr1.length - 1;
      while ($i < l1) {
        $sch = arr1[$i += 1];
        $it.schema = $sch;
        $it.schemaPath = $schemaPath + '[' + $i + ']';
        $it.errSchemaPath = $errSchemaPath + '/' + $i;
        out += '  ' + (it.validate($it)) + ' ';
        $it.baseId = $currentBaseId;
        out += ' ' + ($valid) + ' = ' + ($valid) + ' || ' + ($nextValid) + '; if (!' + ($valid) + ') { ';
        $closingBraces += '}';
      }
    }
    it.compositeRule = $it.compositeRule = $wasComposite;
    out += ' ' + ($closingBraces) + ' if (!' + ($valid) + ') {   var err =   '; /* istanbul ignore else */
    if (it.createErrors !== false) {
      out += ' { keyword: \'' + ('anyOf') + '\' , dataPath: (dataPath || \'\') + ' + (it.errorPath) + ' , schemaPath: ' + (it.util.toQuotedString($errSchemaPath)) + ' , params: {} ';
      if (it.opts.messages !== false) {
        out += ' , message: \'should match some schema in anyOf\' ';
      }
      if (it.opts.verbose) {
        out += ' , schema: validate.schema' + ($schemaPath) + ' , parentSchema: validate.schema' + (it.schemaPath) + ' , data: ' + ($data) + ' ';
      }
      out += ' } ';
    } else {
      out += ' {} ';
    }
    out += ';  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ';
    if (!it.compositeRule && $breakOnError) {
      /* istanbul ignore if */
      if (it.async) {
        out += ' throw new ValidationError(vErrors); ';
      } else {
        out += ' validate.errors = vErrors; return false; ';
      }
    }
    out += ' } else {  errors = ' + ($errs) + '; if (vErrors !== null) { if (' + ($errs) + ') vErrors.length = ' + ($errs) + '; else vErrors = null; } ';
    if (it.opts.allErrors) {
      out += ' } ';
    }
  } else {
    if ($breakOnError) {
      out += ' if (true) { ';
    }
  }
  return out;
}


/***/ }),

/***/ 134:
/***/ ((module) => {

"use strict";

module.exports = function generate_comment(it, $keyword, $ruleType) {
  var out = ' ';
  var $schema = it.schema[$keyword];
  var $errSchemaPath = it.errSchemaPath + '/' + $keyword;
  var $breakOnError = !it.opts.allErrors;
  var $comment = it.util.toQuotedString($schema);
  if (it.opts.$comment === true) {
    out += ' console.log(' + ($comment) + ');';
  } else if (typeof it.opts.$comment == 'function') {
    out += ' self._opts.$comment(' + ($comment) + ', ' + (it.util.toQuotedString($errSchemaPath)) + ', validate.root.schema);';
  }
  return out;
}


/***/ }),

/***/ 1661:
/***/ ((module) => {

"use strict";

module.exports = function generate_const(it, $keyword, $ruleType) {
  var out = ' ';
  var $lvl = it.level;
  var $dataLvl = it.dataLevel;
  var $schema = it.schema[$keyword];
  var $schemaPath = it.schemaPath + it.util.getProperty($keyword);
  var $errSchemaPath = it.errSchemaPath + '/' + $keyword;
  var $breakOnError = !it.opts.allErrors;
  var $data = 'data' + ($dataLvl || '');
  var $valid = 'valid' + $lvl;
  var $isData = it.opts.$data && $schema && $schema.$data,
    $schemaValue;
  if ($isData) {
    out += ' var schema' + ($lvl) + ' = ' + (it.util.getData($schema.$data, $dataLvl, it.dataPathArr)) + '; ';
    $schemaValue = 'schema' + $lvl;
  } else {
    $schemaValue = $schema;
  }
  if (!$isData) {
    out += ' var schema' + ($lvl) + ' = validate.schema' + ($schemaPath) + ';';
  }
  out += 'var ' + ($valid) + ' = equal(' + ($data) + ', schema' + ($lvl) + '); if (!' + ($valid) + ') {   ';
  var $$outStack = $$outStack || [];
  $$outStack.push(out);
  out = ''; /* istanbul ignore else */
  if (it.createErrors !== false) {
    out += ' { keyword: \'' + ('const') + '\' , dataPath: (dataPath || \'\') + ' + (it.errorPath) + ' , schemaPath: ' + (it.util.toQuotedString($errSchemaPath)) + ' , params: { allowedValue: schema' + ($lvl) + ' } ';
    if (it.opts.messages !== false) {
      out += ' , message: \'should be equal to constant\' ';
    }
    if (it.opts.verbose) {
      out += ' , schema: validate.schema' + ($schemaPath) + ' , parentSchema: validate.schema' + (it.schemaPath) + ' , data: ' + ($data) + ' ';
    }
    out += ' } ';
  } else {
    out += ' {} ';
  }
  var __err = out;
  out = $$outStack.pop();
  if (!it.compositeRule && $breakOnError) {
    /* istanbul ignore if */
    if (it.async) {
      out += ' throw new ValidationError([' + (__err) + ']); ';
    } else {
      out += ' validate.errors = [' + (__err) + ']; return false; ';
    }
  } else {
    out += ' var err = ' + (__err) + ';  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ';
  }
  out += ' }';
  if ($breakOnError) {
    out += ' else { ';
  }
  return out;
}


/***/ }),

/***/ 5964:
/***/ ((module) => {

"use strict";

module.exports = function generate_contains(it, $keyword, $ruleType) {
  var out = ' ';
  var $lvl = it.level;
  var $dataLvl = it.dataLevel;
  var $schema = it.schema[$keyword];
  var $schemaPath = it.schemaPath + it.util.getProperty($keyword);
  var $errSchemaPath = it.errSchemaPath + '/' + $keyword;
  var $breakOnError = !it.opts.allErrors;
  var $data = 'data' + ($dataLvl || '');
  var $valid = 'valid' + $lvl;
  var $errs = 'errs__' + $lvl;
  var $it = it.util.copy(it);
  var $closingBraces = '';
  $it.level++;
  var $nextValid = 'valid' + $it.level;
  var $idx = 'i' + $lvl,
    $dataNxt = $it.dataLevel = it.dataLevel + 1,
    $nextData = 'data' + $dataNxt,
    $currentBaseId = it.baseId,
    $nonEmptySchema = (it.opts.strictKeywords ? (typeof $schema == 'object' && Object.keys($schema).length > 0) || $schema === false : it.util.schemaHasRules($schema, it.RULES.all));
  out += 'var ' + ($errs) + ' = errors;var ' + ($valid) + ';';
  if ($nonEmptySchema) {
    var $wasComposite = it.compositeRule;
    it.compositeRule = $it.compositeRule = true;
    $it.schema = $schema;
    $it.schemaPath = $schemaPath;
    $it.errSchemaPath = $errSchemaPath;
    out += ' var ' + ($nextValid) + ' = false; for (var ' + ($idx) + ' = 0; ' + ($idx) + ' < ' + ($data) + '.length; ' + ($idx) + '++) { ';
    $it.errorPath = it.util.getPathExpr(it.errorPath, $idx, it.opts.jsonPointers, true);
    var $passData = $data + '[' + $idx + ']';
    $it.dataPathArr[$dataNxt] = $idx;
    var $code = it.validate($it);
    $it.baseId = $currentBaseId;
    if (it.util.varOccurences($code, $nextData) < 2) {
      out += ' ' + (it.util.varReplace($code, $nextData, $passData)) + ' ';
    } else {
      out += ' var ' + ($nextData) + ' = ' + ($passData) + '; ' + ($code) + ' ';
    }
    out += ' if (' + ($nextValid) + ') break; }  ';
    it.compositeRule = $it.compositeRule = $wasComposite;
    out += ' ' + ($closingBraces) + ' if (!' + ($nextValid) + ') {';
  } else {
    out += ' if (' + ($data) + '.length == 0) {';
  }
  var $$outStack = $$outStack || [];
  $$outStack.push(out);
  out = ''; /* istanbul ignore else */
  if (it.createErrors !== false) {
    out += ' { keyword: \'' + ('contains') + '\' , dataPath: (dataPath || \'\') + ' + (it.errorPath) + ' , schemaPath: ' + (it.util.toQuotedString($errSchemaPath)) + ' , params: {} ';
    if (it.opts.messages !== false) {
      out += ' , message: \'should contain a valid item\' ';
    }
    if (it.opts.verbose) {
      out += ' , schema: validate.schema' + ($schemaPath) + ' , parentSchema: validate.schema' + (it.schemaPath) + ' , data: ' + ($data) + ' ';
    }
    out += ' } ';
  } else {
    out += ' {} ';
  }
  var __err = out;
  out = $$outStack.pop();
  if (!it.compositeRule && $breakOnError) {
    /* istanbul ignore if */
    if (it.async) {
      out += ' throw new ValidationError([' + (__err) + ']); ';
    } else {
      out += ' validate.errors = [' + (__err) + ']; return false; ';
    }
  } else {
    out += ' var err = ' + (__err) + ';  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ';
  }
  out += ' } else { ';
  if ($nonEmptySchema) {
    out += '  errors = ' + ($errs) + '; if (vErrors !== null) { if (' + ($errs) + ') vErrors.length = ' + ($errs) + '; else vErrors = null; } ';
  }
  if (it.opts.allErrors) {
    out += ' } ';
  }
  return out;
}


/***/ }),

/***/ 5912:
/***/ ((module) => {

"use strict";

module.exports = function generate_custom(it, $keyword, $ruleType) {
  var out = ' ';
  var $lvl = it.level;
  var $dataLvl = it.dataLevel;
  var $schema = it.schema[$keyword];
  var $schemaPath = it.schemaPath + it.util.getProperty($keyword);
  var $errSchemaPath = it.errSchemaPath + '/' + $keyword;
  var $breakOnError = !it.opts.allErrors;
  var $errorKeyword;
  var $data = 'data' + ($dataLvl || '');
  var $valid = 'valid' + $lvl;
  var $errs = 'errs__' + $lvl;
  var $isData = it.opts.$data && $schema && $schema.$data,
    $schemaValue;
  if ($isData) {
    out += ' var schema' + ($lvl) + ' = ' + (it.util.getData($schema.$data, $dataLvl, it.dataPathArr)) + '; ';
    $schemaValue = 'schema' + $lvl;
  } else {
    $schemaValue = $schema;
  }
  var $rule = this,
    $definition = 'definition' + $lvl,
    $rDef = $rule.definition,
    $closingBraces = '';
  var $compile, $inline, $macro, $ruleValidate, $validateCode;
  if ($isData && $rDef.$data) {
    $validateCode = 'keywordValidate' + $lvl;
    var $validateSchema = $rDef.validateSchema;
    out += ' var ' + ($definition) + ' = RULES.custom[\'' + ($keyword) + '\'].definition; var ' + ($validateCode) + ' = ' + ($definition) + '.validate;';
  } else {
    $ruleValidate = it.useCustomRule($rule, $schema, it.schema, it);
    if (!$ruleValidate) return;
    $schemaValue = 'validate.schema' + $schemaPath;
    $validateCode = $ruleValidate.code;
    $compile = $rDef.compile;
    $inline = $rDef.inline;
    $macro = $rDef.macro;
  }
  var $ruleErrs = $validateCode + '.errors',
    $i = 'i' + $lvl,
    $ruleErr = 'ruleErr' + $lvl,
    $asyncKeyword = $rDef.async;
  if ($asyncKeyword && !it.async) throw new Error('async keyword in sync schema');
  if (!($inline || $macro)) {
    out += '' + ($ruleErrs) + ' = null;';
  }
  out += 'var ' + ($errs) + ' = errors;var ' + ($valid) + ';';
  if ($isData && $rDef.$data) {
    $closingBraces += '}';
    out += ' if (' + ($schemaValue) + ' === undefined) { ' + ($valid) + ' = true; } else { ';
    if ($validateSchema) {
      $closingBraces += '}';
      out += ' ' + ($valid) + ' = ' + ($definition) + '.validateSchema(' + ($schemaValue) + '); if (' + ($valid) + ') { ';
    }
  }
  if ($inline) {
    if ($rDef.statements) {
      out += ' ' + ($ruleValidate.validate) + ' ';
    } else {
      out += ' ' + ($valid) + ' = ' + ($ruleValidate.validate) + '; ';
    }
  } else if ($macro) {
    var $it = it.util.copy(it);
    var $closingBraces = '';
    $it.level++;
    var $nextValid = 'valid' + $it.level;
    $it.schema = $ruleValidate.validate;
    $it.schemaPath = '';
    var $wasComposite = it.compositeRule;
    it.compositeRule = $it.compositeRule = true;
    var $code = it.validate($it).replace(/validate\.schema/g, $validateCode);
    it.compositeRule = $it.compositeRule = $wasComposite;
    out += ' ' + ($code);
  } else {
    var $$outStack = $$outStack || [];
    $$outStack.push(out);
    out = '';
    out += '  ' + ($validateCode) + '.call( ';
    if (it.opts.passContext) {
      out += 'this';
    } else {
      out += 'self';
    }
    if ($compile || $rDef.schema === false) {
      out += ' , ' + ($data) + ' ';
    } else {
      out += ' , ' + ($schemaValue) + ' , ' + ($data) + ' , validate.schema' + (it.schemaPath) + ' ';
    }
    out += ' , (dataPath || \'\')';
    if (it.errorPath != '""') {
      out += ' + ' + (it.errorPath);
    }
    var $parentData = $dataLvl ? 'data' + (($dataLvl - 1) || '') : 'parentData',
      $parentDataProperty = $dataLvl ? it.dataPathArr[$dataLvl] : 'parentDataProperty';
    out += ' , ' + ($parentData) + ' , ' + ($parentDataProperty) + ' , rootData )  ';
    var def_callRuleValidate = out;
    out = $$outStack.pop();
    if ($rDef.errors === false) {
      out += ' ' + ($valid) + ' = ';
      if ($asyncKeyword) {
        out += 'await ';
      }
      out += '' + (def_callRuleValidate) + '; ';
    } else {
      if ($asyncKeyword) {
        $ruleErrs = 'customErrors' + $lvl;
        out += ' var ' + ($ruleErrs) + ' = null; try { ' + ($valid) + ' = await ' + (def_callRuleValidate) + '; } catch (e) { ' + ($valid) + ' = false; if (e instanceof ValidationError) ' + ($ruleErrs) + ' = e.errors; else throw e; } ';
      } else {
        out += ' ' + ($ruleErrs) + ' = null; ' + ($valid) + ' = ' + (def_callRuleValidate) + '; ';
      }
    }
  }
  if ($rDef.modifying) {
    out += ' if (' + ($parentData) + ') ' + ($data) + ' = ' + ($parentData) + '[' + ($parentDataProperty) + '];';
  }
  out += '' + ($closingBraces);
  if ($rDef.valid) {
    if ($breakOnError) {
      out += ' if (true) { ';
    }
  } else {
    out += ' if ( ';
    if ($rDef.valid === undefined) {
      out += ' !';
      if ($macro) {
        out += '' + ($nextValid);
      } else {
        out += '' + ($valid);
      }
    } else {
      out += ' ' + (!$rDef.valid) + ' ';
    }
    out += ') { ';
    $errorKeyword = $rule.keyword;
    var $$outStack = $$outStack || [];
    $$outStack.push(out);
    out = '';
    var $$outStack = $$outStack || [];
    $$outStack.push(out);
    out = ''; /* istanbul ignore else */
    if (it.createErrors !== false) {
      out += ' { keyword: \'' + ($errorKeyword || 'custom') + '\' , dataPath: (dataPath || \'\') + ' + (it.errorPath) + ' , schemaPath: ' + (it.util.toQuotedString($errSchemaPath)) + ' , params: { keyword: \'' + ($rule.keyword) + '\' } ';
      if (it.opts.messages !== false) {
        out += ' , message: \'should pass "' + ($rule.keyword) + '" keyword validation\' ';
      }
      if (it.opts.verbose) {
        out += ' , schema: validate.schema' + ($schemaPath) + ' , parentSchema: validate.schema' + (it.schemaPath) + ' , data: ' + ($data) + ' ';
      }
      out += ' } ';
    } else {
      out += ' {} ';
    }
    var __err = out;
    out = $$outStack.pop();
    if (!it.compositeRule && $breakOnError) {
      /* istanbul ignore if */
      if (it.async) {
        out += ' throw new ValidationError([' + (__err) + ']); ';
      } else {
        out += ' validate.errors = [' + (__err) + ']; return false; ';
      }
    } else {
      out += ' var err = ' + (__err) + ';  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ';
    }
    var def_customError = out;
    out = $$outStack.pop();
    if ($inline) {
      if ($rDef.errors) {
        if ($rDef.errors != 'full') {
          out += '  for (var ' + ($i) + '=' + ($errs) + '; ' + ($i) + '<errors; ' + ($i) + '++) { var ' + ($ruleErr) + ' = vErrors[' + ($i) + ']; if (' + ($ruleErr) + '.dataPath === undefined) ' + ($ruleErr) + '.dataPath = (dataPath || \'\') + ' + (it.errorPath) + '; if (' + ($ruleErr) + '.schemaPath === undefined) { ' + ($ruleErr) + '.schemaPath = "' + ($errSchemaPath) + '"; } ';
          if (it.opts.verbose) {
            out += ' ' + ($ruleErr) + '.schema = ' + ($schemaValue) + '; ' + ($ruleErr) + '.data = ' + ($data) + '; ';
          }
          out += ' } ';
        }
      } else {
        if ($rDef.errors === false) {
          out += ' ' + (def_customError) + ' ';
        } else {
          out += ' if (' + ($errs) + ' == errors) { ' + (def_customError) + ' } else {  for (var ' + ($i) + '=' + ($errs) + '; ' + ($i) + '<errors; ' + ($i) + '++) { var ' + ($ruleErr) + ' = vErrors[' + ($i) + ']; if (' + ($ruleErr) + '.dataPath === undefined) ' + ($ruleErr) + '.dataPath = (dataPath || \'\') + ' + (it.errorPath) + '; if (' + ($ruleErr) + '.schemaPath === undefined) { ' + ($ruleErr) + '.schemaPath = "' + ($errSchemaPath) + '"; } ';
          if (it.opts.verbose) {
            out += ' ' + ($ruleErr) + '.schema = ' + ($schemaValue) + '; ' + ($ruleErr) + '.data = ' + ($data) + '; ';
          }
          out += ' } } ';
        }
      }
    } else if ($macro) {
      out += '   var err =   '; /* istanbul ignore else */
      if (it.createErrors !== false) {
        out += ' { keyword: \'' + ($errorKeyword || 'custom') + '\' , dataPath: (dataPath || \'\') + ' + (it.errorPath) + ' , schemaPath: ' + (it.util.toQuotedString($errSchemaPath)) + ' , params: { keyword: \'' + ($rule.keyword) + '\' } ';
        if (it.opts.messages !== false) {
          out += ' , message: \'should pass "' + ($rule.keyword) + '" keyword validation\' ';
        }
        if (it.opts.verbose) {
          out += ' , schema: validate.schema' + ($schemaPath) + ' , parentSchema: validate.schema' + (it.schemaPath) + ' , data: ' + ($data) + ' ';
        }
        out += ' } ';
      } else {
        out += ' {} ';
      }
      out += ';  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ';
      if (!it.compositeRule && $breakOnError) {
        /* istanbul ignore if */
        if (it.async) {
          out += ' throw new ValidationError(vErrors); ';
        } else {
          out += ' validate.errors = vErrors; return false; ';
        }
      }
    } else {
      if ($rDef.errors === false) {
        out += ' ' + (def_customError) + ' ';
      } else {
        out += ' if (Array.isArray(' + ($ruleErrs) + ')) { if (vErrors === null) vErrors = ' + ($ruleErrs) + '; else vErrors = vErrors.concat(' + ($ruleErrs) + '); errors = vErrors.length;  for (var ' + ($i) + '=' + ($errs) + '; ' + ($i) + '<errors; ' + ($i) + '++) { var ' + ($ruleErr) + ' = vErrors[' + ($i) + ']; if (' + ($ruleErr) + '.dataPath === undefined) ' + ($ruleErr) + '.dataPath = (dataPath || \'\') + ' + (it.errorPath) + ';  ' + ($ruleErr) + '.schemaPath = "' + ($errSchemaPath) + '";  ';
        if (it.opts.verbose) {
          out += ' ' + ($ruleErr) + '.schema = ' + ($schemaValue) + '; ' + ($ruleErr) + '.data = ' + ($data) + '; ';
        }
        out += ' } } else { ' + (def_customError) + ' } ';
      }
    }
    out += ' } ';
    if ($breakOnError) {
      out += ' else { ';
    }
  }
  return out;
}


/***/ }),

/***/ 2591:
/***/ ((module) => {

"use strict";

module.exports = function generate_dependencies(it, $keyword, $ruleType) {
  var out = ' ';
  var $lvl = it.level;
  var $dataLvl = it.dataLevel;
  var $schema = it.schema[$keyword];
  var $schemaPath = it.schemaPath + it.util.getProperty($keyword);
  var $errSchemaPath = it.errSchemaPath + '/' + $keyword;
  var $breakOnError = !it.opts.allErrors;
  var $data = 'data' + ($dataLvl || '');
  var $errs = 'errs__' + $lvl;
  var $it = it.util.copy(it);
  var $closingBraces = '';
  $it.level++;
  var $nextValid = 'valid' + $it.level;
  var $schemaDeps = {},
    $propertyDeps = {},
    $ownProperties = it.opts.ownProperties;
  for ($property in $schema) {
    if ($property == '__proto__') continue;
    var $sch = $schema[$property];
    var $deps = Array.isArray($sch) ? $propertyDeps : $schemaDeps;
    $deps[$property] = $sch;
  }
  out += 'var ' + ($errs) + ' = errors;';
  var $currentErrorPath = it.errorPath;
  out += 'var missing' + ($lvl) + ';';
  for (var $property in $propertyDeps) {
    $deps = $propertyDeps[$property];
    if ($deps.length) {
      out += ' if ( ' + ($data) + (it.util.getProperty($property)) + ' !== undefined ';
      if ($ownProperties) {
        out += ' && Object.prototype.hasOwnProperty.call(' + ($data) + ', \'' + (it.util.escapeQuotes($property)) + '\') ';
      }
      if ($breakOnError) {
        out += ' && ( ';
        var arr1 = $deps;
        if (arr1) {
          var $propertyKey, $i = -1,
            l1 = arr1.length - 1;
          while ($i < l1) {
            $propertyKey = arr1[$i += 1];
            if ($i) {
              out += ' || ';
            }
            var $prop = it.util.getProperty($propertyKey),
              $useData = $data + $prop;
            out += ' ( ( ' + ($useData) + ' === undefined ';
            if ($ownProperties) {
              out += ' || ! Object.prototype.hasOwnProperty.call(' + ($data) + ', \'' + (it.util.escapeQuotes($propertyKey)) + '\') ';
            }
            out += ') && (missing' + ($lvl) + ' = ' + (it.util.toQuotedString(it.opts.jsonPointers ? $propertyKey : $prop)) + ') ) ';
          }
        }
        out += ')) {  ';
        var $propertyPath = 'missing' + $lvl,
          $missingProperty = '\' + ' + $propertyPath + ' + \'';
        if (it.opts._errorDataPathProperty) {
          it.errorPath = it.opts.jsonPointers ? it.util.getPathExpr($currentErrorPath, $propertyPath, true) : $currentErrorPath + ' + ' + $propertyPath;
        }
        var $$outStack = $$outStack || [];
        $$outStack.push(out);
        out = ''; /* istanbul ignore else */
        if (it.createErrors !== false) {
          out += ' { keyword: \'' + ('dependencies') + '\' , dataPath: (dataPath || \'\') + ' + (it.errorPath) + ' , schemaPath: ' + (it.util.toQuotedString($errSchemaPath)) + ' , params: { property: \'' + (it.util.escapeQuotes($property)) + '\', missingProperty: \'' + ($missingProperty) + '\', depsCount: ' + ($deps.length) + ', deps: \'' + (it.util.escapeQuotes($deps.length == 1 ? $deps[0] : $deps.join(", "))) + '\' } ';
          if (it.opts.messages !== false) {
            out += ' , message: \'should have ';
            if ($deps.length == 1) {
              out += 'property ' + (it.util.escapeQuotes($deps[0]));
            } else {
              out += 'properties ' + (it.util.escapeQuotes($deps.join(", ")));
            }
            out += ' when property ' + (it.util.escapeQuotes($property)) + ' is present\' ';
          }
          if (it.opts.verbose) {
            out += ' , schema: validate.schema' + ($schemaPath) + ' , parentSchema: validate.schema' + (it.schemaPath) + ' , data: ' + ($data) + ' ';
          }
          out += ' } ';
        } else {
          out += ' {} ';
        }
        var __err = out;
        out = $$outStack.pop();
        if (!it.compositeRule && $breakOnError) {
          /* istanbul ignore if */
          if (it.async) {
            out += ' throw new ValidationError([' + (__err) + ']); ';
          } else {
            out += ' validate.errors = [' + (__err) + ']; return false; ';
          }
        } else {
          out += ' var err = ' + (__err) + ';  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ';
        }
      } else {
        out += ' ) { ';
        var arr2 = $deps;
        if (arr2) {
          var $propertyKey, i2 = -1,
            l2 = arr2.length - 1;
          while (i2 < l2) {
            $propertyKey = arr2[i2 += 1];
            var $prop = it.util.getProperty($propertyKey),
              $missingProperty = it.util.escapeQuotes($propertyKey),
              $useData = $data + $prop;
            if (it.opts._errorDataPathProperty) {
              it.errorPath = it.util.getPath($currentErrorPath, $propertyKey, it.opts.jsonPointers);
            }
            out += ' if ( ' + ($useData) + ' === undefined ';
            if ($ownProperties) {
              out += ' || ! Object.prototype.hasOwnProperty.call(' + ($data) + ', \'' + (it.util.escapeQuotes($propertyKey)) + '\') ';
            }
            out += ') {  var err =   '; /* istanbul ignore else */
            if (it.createErrors !== false) {
              out += ' { keyword: \'' + ('dependencies') + '\' , dataPath: (dataPath || \'\') + ' + (it.errorPath) + ' , schemaPath: ' + (it.util.toQuotedString($errSchemaPath)) + ' , params: { property: \'' + (it.util.escapeQuotes($property)) + '\', missingProperty: \'' + ($missingProperty) + '\', depsCount: ' + ($deps.length) + ', deps: \'' + (it.util.escapeQuotes($deps.length == 1 ? $deps[0] : $deps.join(", "))) + '\' } ';
              if (it.opts.messages !== false) {
                out += ' , message: \'should have ';
                if ($deps.length == 1) {
                  out += 'property ' + (it.util.escapeQuotes($deps[0]));
                } else {
                  out += 'properties ' + (it.util.escapeQuotes($deps.join(", ")));
                }
                out += ' when property ' + (it.util.escapeQuotes($property)) + ' is present\' ';
              }
              if (it.opts.verbose) {
                out += ' , schema: validate.schema' + ($schemaPath) + ' , parentSchema: validate.schema' + (it.schemaPath) + ' , data: ' + ($data) + ' ';
              }
              out += ' } ';
            } else {
              out += ' {} ';
            }
            out += ';  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; } ';
          }
        }
      }
      out += ' }   ';
      if ($breakOnError) {
        $closingBraces += '}';
        out += ' else { ';
      }
    }
  }
  it.errorPath = $currentErrorPath;
  var $currentBaseId = $it.baseId;
  for (var $property in $schemaDeps) {
    var $sch = $schemaDeps[$property];
    if ((it.opts.strictKeywords ? (typeof $sch == 'object' && Object.keys($sch).length > 0) || $sch === false : it.util.schemaHasRules($sch, it.RULES.all))) {
      out += ' ' + ($nextValid) + ' = true; if ( ' + ($data) + (it.util.getProperty($property)) + ' !== undefined ';
      if ($ownProperties) {
        out += ' && Object.prototype.hasOwnProperty.call(' + ($data) + ', \'' + (it.util.escapeQuotes($property)) + '\') ';
      }
      out += ') { ';
      $it.schema = $sch;
      $it.schemaPath = $schemaPath + it.util.getProperty($property);
      $it.errSchemaPath = $errSchemaPath + '/' + it.util.escapeFragment($property);
      out += '  ' + (it.validate($it)) + ' ';
      $it.baseId = $currentBaseId;
      out += ' }  ';
      if ($breakOnError) {
        out += ' if (' + ($nextValid) + ') { ';
        $closingBraces += '}';
      }
    }
  }
  if ($breakOnError) {
    out += '   ' + ($closingBraces) + ' if (' + ($errs) + ' == errors) {';
  }
  return out;
}


/***/ }),

/***/ 163:
/***/ ((module) => {

"use strict";

module.exports = function generate_enum(it, $keyword, $ruleType) {
  var out = ' ';
  var $lvl = it.level;
  var $dataLvl = it.dataLevel;
  var $schema = it.schema[$keyword];
  var $schemaPath = it.schemaPath + it.util.getProperty($keyword);
  var $errSchemaPath = it.errSchemaPath + '/' + $keyword;
  var $breakOnError = !it.opts.allErrors;
  var $data = 'data' + ($dataLvl || '');
  var $valid = 'valid' + $lvl;
  var $isData = it.opts.$data && $schema && $schema.$data,
    $schemaValue;
  if ($isData) {
    out += ' var schema' + ($lvl) + ' = ' + (it.util.getData($schema.$data, $dataLvl, it.dataPathArr)) + '; ';
    $schemaValue = 'schema' + $lvl;
  } else {
    $schemaValue = $schema;
  }
  var $i = 'i' + $lvl,
    $vSchema = 'schema' + $lvl;
  if (!$isData) {
    out += ' var ' + ($vSchema) + ' = validate.schema' + ($schemaPath) + ';';
  }
  out += 'var ' + ($valid) + ';';
  if ($isData) {
    out += ' if (schema' + ($lvl) + ' === undefined) ' + ($valid) + ' = true; else if (!Array.isArray(schema' + ($lvl) + ')) ' + ($valid) + ' = false; else {';
  }
  out += '' + ($valid) + ' = false;for (var ' + ($i) + '=0; ' + ($i) + '<' + ($vSchema) + '.length; ' + ($i) + '++) if (equal(' + ($data) + ', ' + ($vSchema) + '[' + ($i) + '])) { ' + ($valid) + ' = true; break; }';
  if ($isData) {
    out += '  }  ';
  }
  out += ' if (!' + ($valid) + ') {   ';
  var $$outStack = $$outStack || [];
  $$outStack.push(out);
  out = ''; /* istanbul ignore else */
  if (it.createErrors !== false) {
    out += ' { keyword: \'' + ('enum') + '\' , dataPath: (dataPath || \'\') + ' + (it.errorPath) + ' , schemaPath: ' + (it.util.toQuotedString($errSchemaPath)) + ' , params: { allowedValues: schema' + ($lvl) + ' } ';
    if (it.opts.messages !== false) {
      out += ' , message: \'should be equal to one of the allowed values\' ';
    }
    if (it.opts.verbose) {
      out += ' , schema: validate.schema' + ($schemaPath) + ' , parentSchema: validate.schema' + (it.schemaPath) + ' , data: ' + ($data) + ' ';
    }
    out += ' } ';
  } else {
    out += ' {} ';
  }
  var __err = out;
  out = $$outStack.pop();
  if (!it.compositeRule && $breakOnError) {
    /* istanbul ignore if */
    if (it.async) {
      out += ' throw new ValidationError([' + (__err) + ']); ';
    } else {
      out += ' validate.errors = [' + (__err) + ']; return false; ';
    }
  } else {
    out += ' var err = ' + (__err) + ';  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ';
  }
  out += ' }';
  if ($breakOnError) {
    out += ' else { ';
  }
  return out;
}


/***/ }),

/***/ 3847:
/***/ ((module) => {

"use strict";

module.exports = function generate_format(it, $keyword, $ruleType) {
  var out = ' ';
  var $lvl = it.level;
  var $dataLvl = it.dataLevel;
  var $schema = it.schema[$keyword];
  var $schemaPath = it.schemaPath + it.util.getProperty($keyword);
  var $errSchemaPath = it.errSchemaPath + '/' + $keyword;
  var $breakOnError = !it.opts.allErrors;
  var $data = 'data' + ($dataLvl || '');
  if (it.opts.format === false) {
    if ($breakOnError) {
      out += ' if (true) { ';
    }
    return out;
  }
  var $isData = it.opts.$data && $schema && $schema.$data,
    $schemaValue;
  if ($isData) {
    out += ' var schema' + ($lvl) + ' = ' + (it.util.getData($schema.$data, $dataLvl, it.dataPathArr)) + '; ';
    $schemaValue = 'schema' + $lvl;
  } else {
    $schemaValue = $schema;
  }
  var $unknownFormats = it.opts.unknownFormats,
    $allowUnknown = Array.isArray($unknownFormats);
  if ($isData) {
    var $format = 'format' + $lvl,
      $isObject = 'isObject' + $lvl,
      $formatType = 'formatType' + $lvl;
    out += ' var ' + ($format) + ' = formats[' + ($schemaValue) + ']; var ' + ($isObject) + ' = typeof ' + ($format) + ' == \'object\' && !(' + ($format) + ' instanceof RegExp) && ' + ($format) + '.validate; var ' + ($formatType) + ' = ' + ($isObject) + ' && ' + ($format) + '.type || \'string\'; if (' + ($isObject) + ') { ';
    if (it.async) {
      out += ' var async' + ($lvl) + ' = ' + ($format) + '.async; ';
    }
    out += ' ' + ($format) + ' = ' + ($format) + '.validate; } if (  ';
    if ($isData) {
      out += ' (' + ($schemaValue) + ' !== undefined && typeof ' + ($schemaValue) + ' != \'string\') || ';
    }
    out += ' (';
    if ($unknownFormats != 'ignore') {
      out += ' (' + ($schemaValue) + ' && !' + ($format) + ' ';
      if ($allowUnknown) {
        out += ' && self._opts.unknownFormats.indexOf(' + ($schemaValue) + ') == -1 ';
      }
      out += ') || ';
    }
    out += ' (' + ($format) + ' && ' + ($formatType) + ' == \'' + ($ruleType) + '\' && !(typeof ' + ($format) + ' == \'function\' ? ';
    if (it.async) {
      out += ' (async' + ($lvl) + ' ? await ' + ($format) + '(' + ($data) + ') : ' + ($format) + '(' + ($data) + ')) ';
    } else {
      out += ' ' + ($format) + '(' + ($data) + ') ';
    }
    out += ' : ' + ($format) + '.test(' + ($data) + '))))) {';
  } else {
    var $format = it.formats[$schema];
    if (!$format) {
      if ($unknownFormats == 'ignore') {
        it.logger.warn('unknown format "' + $schema + '" ignored in schema at path "' + it.errSchemaPath + '"');
        if ($breakOnError) {
          out += ' if (true) { ';
        }
        return out;
      } else if ($allowUnknown && $unknownFormats.indexOf($schema) >= 0) {
        if ($breakOnError) {
          out += ' if (true) { ';
        }
        return out;
      } else {
        throw new Error('unknown format "' + $schema + '" is used in schema at path "' + it.errSchemaPath + '"');
      }
    }
    var $isObject = typeof $format == 'object' && !($format instanceof RegExp) && $format.validate;
    var $formatType = $isObject && $format.type || 'string';
    if ($isObject) {
      var $async = $format.async === true;
      $format = $format.validate;
    }
    if ($formatType != $ruleType) {
      if ($breakOnError) {
        out += ' if (true) { ';
      }
      return out;
    }
    if ($async) {
      if (!it.async) throw new Error('async format in sync schema');
      var $formatRef = 'formats' + it.util.getProperty($schema) + '.validate';
      out += ' if (!(await ' + ($formatRef) + '(' + ($data) + '))) { ';
    } else {
      out += ' if (! ';
      var $formatRef = 'formats' + it.util.getProperty($schema);
      if ($isObject) $formatRef += '.validate';
      if (typeof $format == 'function') {
        out += ' ' + ($formatRef) + '(' + ($data) + ') ';
      } else {
        out += ' ' + ($formatRef) + '.test(' + ($data) + ') ';
      }
      out += ') { ';
    }
  }
  var $$outStack = $$outStack || [];
  $$outStack.push(out);
  out = ''; /* istanbul ignore else */
  if (it.createErrors !== false) {
    out += ' { keyword: \'' + ('format') + '\' , dataPath: (dataPath || \'\') + ' + (it.errorPath) + ' , schemaPath: ' + (it.util.toQuotedString($errSchemaPath)) + ' , params: { format:  ';
    if ($isData) {
      out += '' + ($schemaValue);
    } else {
      out += '' + (it.util.toQuotedString($schema));
    }
    out += '  } ';
    if (it.opts.messages !== false) {
      out += ' , message: \'should match format "';
      if ($isData) {
        out += '\' + ' + ($schemaValue) + ' + \'';
      } else {
        out += '' + (it.util.escapeQuotes($schema));
      }
      out += '"\' ';
    }
    if (it.opts.verbose) {
      out += ' , schema:  ';
      if ($isData) {
        out += 'validate.schema' + ($schemaPath);
      } else {
        out += '' + (it.util.toQuotedString($schema));
      }
      out += '         , parentSchema: validate.schema' + (it.schemaPath) + ' , data: ' + ($data) + ' ';
    }
    out += ' } ';
  } else {
    out += ' {} ';
  }
  var __err = out;
  out = $$outStack.pop();
  if (!it.compositeRule && $breakOnError) {
    /* istanbul ignore if */
    if (it.async) {
      out += ' throw new ValidationError([' + (__err) + ']); ';
    } else {
      out += ' validate.errors = [' + (__err) + ']; return false; ';
    }
  } else {
    out += ' var err = ' + (__err) + ';  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ';
  }
  out += ' } ';
  if ($breakOnError) {
    out += ' else { ';
  }
  return out;
}


/***/ }),

/***/ 862:
/***/ ((module) => {

"use strict";

module.exports = function generate_if(it, $keyword, $ruleType) {
  var out = ' ';
  var $lvl = it.level;
  var $dataLvl = it.dataLevel;
  var $schema = it.schema[$keyword];
  var $schemaPath = it.schemaPath + it.util.getProperty($keyword);
  var $errSchemaPath = it.errSchemaPath + '/' + $keyword;
  var $breakOnError = !it.opts.allErrors;
  var $data = 'data' + ($dataLvl || '');
  var $valid = 'valid' + $lvl;
  var $errs = 'errs__' + $lvl;
  var $it = it.util.copy(it);
  $it.level++;
  var $nextValid = 'valid' + $it.level;
  var $thenSch = it.schema['then'],
    $elseSch = it.schema['else'],
    $thenPresent = $thenSch !== undefined && (it.opts.strictKeywords ? (typeof $thenSch == 'object' && Object.keys($thenSch).length > 0) || $thenSch === false : it.util.schemaHasRules($thenSch, it.RULES.all)),
    $elsePresent = $elseSch !== undefined && (it.opts.strictKeywords ? (typeof $elseSch == 'object' && Object.keys($elseSch).length > 0) || $elseSch === false : it.util.schemaHasRules($elseSch, it.RULES.all)),
    $currentBaseId = $it.baseId;
  if ($thenPresent || $elsePresent) {
    var $ifClause;
    $it.createErrors = false;
    $it.schema = $schema;
    $it.schemaPath = $schemaPath;
    $it.errSchemaPath = $errSchemaPath;
    out += ' var ' + ($errs) + ' = errors; var ' + ($valid) + ' = true;  ';
    var $wasComposite = it.compositeRule;
    it.compositeRule = $it.compositeRule = true;
    out += '  ' + (it.validate($it)) + ' ';
    $it.baseId = $currentBaseId;
    $it.createErrors = true;
    out += '  errors = ' + ($errs) + '; if (vErrors !== null) { if (' + ($errs) + ') vErrors.length = ' + ($errs) + '; else vErrors = null; }  ';
    it.compositeRule = $it.compositeRule = $wasComposite;
    if ($thenPresent) {
      out += ' if (' + ($nextValid) + ') {  ';
      $it.schema = it.schema['then'];
      $it.schemaPath = it.schemaPath + '.then';
      $it.errSchemaPath = it.errSchemaPath + '/then';
      out += '  ' + (it.validate($it)) + ' ';
      $it.baseId = $currentBaseId;
      out += ' ' + ($valid) + ' = ' + ($nextValid) + '; ';
      if ($thenPresent && $elsePresent) {
        $ifClause = 'ifClause' + $lvl;
        out += ' var ' + ($ifClause) + ' = \'then\'; ';
      } else {
        $ifClause = '\'then\'';
      }
      out += ' } ';
      if ($elsePresent) {
        out += ' else { ';
      }
    } else {
      out += ' if (!' + ($nextValid) + ') { ';
    }
    if ($elsePresent) {
      $it.schema = it.schema['else'];
      $it.schemaPath = it.schemaPath + '.else';
      $it.errSchemaPath = it.errSchemaPath + '/else';
      out += '  ' + (it.validate($it)) + ' ';
      $it.baseId = $currentBaseId;
      out += ' ' + ($valid) + ' = ' + ($nextValid) + '; ';
      if ($thenPresent && $elsePresent) {
        $ifClause = 'ifClause' + $lvl;
        out += ' var ' + ($ifClause) + ' = \'else\'; ';
      } else {
        $ifClause = '\'else\'';
      }
      out += ' } ';
    }
    out += ' if (!' + ($valid) + ') {   var err =   '; /* istanbul ignore else */
    if (it.createErrors !== false) {
      out += ' { keyword: \'' + ('if') + '\' , dataPath: (dataPath || \'\') + ' + (it.errorPath) + ' , schemaPath: ' + (it.util.toQuotedString($errSchemaPath)) + ' , params: { failingKeyword: ' + ($ifClause) + ' } ';
      if (it.opts.messages !== false) {
        out += ' , message: \'should match "\' + ' + ($ifClause) + ' + \'" schema\' ';
      }
      if (it.opts.verbose) {
        out += ' , schema: validate.schema' + ($schemaPath) + ' , parentSchema: validate.schema' + (it.schemaPath) + ' , data: ' + ($data) + ' ';
      }
      out += ' } ';
    } else {
      out += ' {} ';
    }
    out += ';  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ';
    if (!it.compositeRule && $breakOnError) {
      /* istanbul ignore if */
      if (it.async) {
        out += ' throw new ValidationError(vErrors); ';
      } else {
        out += ' validate.errors = vErrors; return false; ';
      }
    }
    out += ' }   ';
    if ($breakOnError) {
      out += ' else { ';
    }
  } else {
    if ($breakOnError) {
      out += ' if (true) { ';
    }
  }
  return out;
}


/***/ }),

/***/ 5810:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


//all requires must be explicit because browserify won't work with dynamic requires
module.exports = {
  '$ref': __webpack_require__(2393),
  allOf: __webpack_require__(9443),
  anyOf: __webpack_require__(3093),
  '$comment': __webpack_require__(134),
  const: __webpack_require__(1661),
  contains: __webpack_require__(5964),
  dependencies: __webpack_require__(2591),
  'enum': __webpack_require__(163),
  format: __webpack_require__(3847),
  'if': __webpack_require__(862),
  items: __webpack_require__(4408),
  maximum: __webpack_require__(7404),
  minimum: __webpack_require__(7404),
  maxItems: __webpack_require__(4683),
  minItems: __webpack_require__(4683),
  maxLength: __webpack_require__(2114),
  minLength: __webpack_require__(2114),
  maxProperties: __webpack_require__(1142),
  minProperties: __webpack_require__(1142),
  multipleOf: __webpack_require__(9772),
  not: __webpack_require__(750),
  oneOf: __webpack_require__(6106),
  pattern: __webpack_require__(3912),
  properties: __webpack_require__(2924),
  propertyNames: __webpack_require__(9195),
  required: __webpack_require__(8420),
  uniqueItems: __webpack_require__(4995),
  validate: __webpack_require__(9585)
};


/***/ }),

/***/ 4408:
/***/ ((module) => {

"use strict";

module.exports = function generate_items(it, $keyword, $ruleType) {
  var out = ' ';
  var $lvl = it.level;
  var $dataLvl = it.dataLevel;
  var $schema = it.schema[$keyword];
  var $schemaPath = it.schemaPath + it.util.getProperty($keyword);
  var $errSchemaPath = it.errSchemaPath + '/' + $keyword;
  var $breakOnError = !it.opts.allErrors;
  var $data = 'data' + ($dataLvl || '');
  var $valid = 'valid' + $lvl;
  var $errs = 'errs__' + $lvl;
  var $it = it.util.copy(it);
  var $closingBraces = '';
  $it.level++;
  var $nextValid = 'valid' + $it.level;
  var $idx = 'i' + $lvl,
    $dataNxt = $it.dataLevel = it.dataLevel + 1,
    $nextData = 'data' + $dataNxt,
    $currentBaseId = it.baseId;
  out += 'var ' + ($errs) + ' = errors;var ' + ($valid) + ';';
  if (Array.isArray($schema)) {
    var $additionalItems = it.schema.additionalItems;
    if ($additionalItems === false) {
      out += ' ' + ($valid) + ' = ' + ($data) + '.length <= ' + ($schema.length) + '; ';
      var $currErrSchemaPath = $errSchemaPath;
      $errSchemaPath = it.errSchemaPath + '/additionalItems';
      out += '  if (!' + ($valid) + ') {   ';
      var $$outStack = $$outStack || [];
      $$outStack.push(out);
      out = ''; /* istanbul ignore else */
      if (it.createErrors !== false) {
        out += ' { keyword: \'' + ('additionalItems') + '\' , dataPath: (dataPath || \'\') + ' + (it.errorPath) + ' , schemaPath: ' + (it.util.toQuotedString($errSchemaPath)) + ' , params: { limit: ' + ($schema.length) + ' } ';
        if (it.opts.messages !== false) {
          out += ' , message: \'should NOT have more than ' + ($schema.length) + ' items\' ';
        }
        if (it.opts.verbose) {
          out += ' , schema: false , parentSchema: validate.schema' + (it.schemaPath) + ' , data: ' + ($data) + ' ';
        }
        out += ' } ';
      } else {
        out += ' {} ';
      }
      var __err = out;
      out = $$outStack.pop();
      if (!it.compositeRule && $breakOnError) {
        /* istanbul ignore if */
        if (it.async) {
          out += ' throw new ValidationError([' + (__err) + ']); ';
        } else {
          out += ' validate.errors = [' + (__err) + ']; return false; ';
        }
      } else {
        out += ' var err = ' + (__err) + ';  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ';
      }
      out += ' } ';
      $errSchemaPath = $currErrSchemaPath;
      if ($breakOnError) {
        $closingBraces += '}';
        out += ' else { ';
      }
    }
    var arr1 = $schema;
    if (arr1) {
      var $sch, $i = -1,
        l1 = arr1.length - 1;
      while ($i < l1) {
        $sch = arr1[$i += 1];
        if ((it.opts.strictKeywords ? (typeof $sch == 'object' && Object.keys($sch).length > 0) || $sch === false : it.util.schemaHasRules($sch, it.RULES.all))) {
          out += ' ' + ($nextValid) + ' = true; if (' + ($data) + '.length > ' + ($i) + ') { ';
          var $passData = $data + '[' + $i + ']';
          $it.schema = $sch;
          $it.schemaPath = $schemaPath + '[' + $i + ']';
          $it.errSchemaPath = $errSchemaPath + '/' + $i;
          $it.errorPath = it.util.getPathExpr(it.errorPath, $i, it.opts.jsonPointers, true);
          $it.dataPathArr[$dataNxt] = $i;
          var $code = it.validate($it);
          $it.baseId = $currentBaseId;
          if (it.util.varOccurences($code, $nextData) < 2) {
            out += ' ' + (it.util.varReplace($code, $nextData, $passData)) + ' ';
          } else {
            out += ' var ' + ($nextData) + ' = ' + ($passData) + '; ' + ($code) + ' ';
          }
          out += ' }  ';
          if ($breakOnError) {
            out += ' if (' + ($nextValid) + ') { ';
            $closingBraces += '}';
          }
        }
      }
    }
    if (typeof $additionalItems == 'object' && (it.opts.strictKeywords ? (typeof $additionalItems == 'object' && Object.keys($additionalItems).length > 0) || $additionalItems === false : it.util.schemaHasRules($additionalItems, it.RULES.all))) {
      $it.schema = $additionalItems;
      $it.schemaPath = it.schemaPath + '.additionalItems';
      $it.errSchemaPath = it.errSchemaPath + '/additionalItems';
      out += ' ' + ($nextValid) + ' = true; if (' + ($data) + '.length > ' + ($schema.length) + ') {  for (var ' + ($idx) + ' = ' + ($schema.length) + '; ' + ($idx) + ' < ' + ($data) + '.length; ' + ($idx) + '++) { ';
      $it.errorPath = it.util.getPathExpr(it.errorPath, $idx, it.opts.jsonPointers, true);
      var $passData = $data + '[' + $idx + ']';
      $it.dataPathArr[$dataNxt] = $idx;
      var $code = it.validate($it);
      $it.baseId = $currentBaseId;
      if (it.util.varOccurences($code, $nextData) < 2) {
        out += ' ' + (it.util.varReplace($code, $nextData, $passData)) + ' ';
      } else {
        out += ' var ' + ($nextData) + ' = ' + ($passData) + '; ' + ($code) + ' ';
      }
      if ($breakOnError) {
        out += ' if (!' + ($nextValid) + ') break; ';
      }
      out += ' } }  ';
      if ($breakOnError) {
        out += ' if (' + ($nextValid) + ') { ';
        $closingBraces += '}';
      }
    }
  } else if ((it.opts.strictKeywords ? (typeof $schema == 'object' && Object.keys($schema).length > 0) || $schema === false : it.util.schemaHasRules($schema, it.RULES.all))) {
    $it.schema = $schema;
    $it.schemaPath = $schemaPath;
    $it.errSchemaPath = $errSchemaPath;
    out += '  for (var ' + ($idx) + ' = ' + (0) + '; ' + ($idx) + ' < ' + ($data) + '.length; ' + ($idx) + '++) { ';
    $it.errorPath = it.util.getPathExpr(it.errorPath, $idx, it.opts.jsonPointers, true);
    var $passData = $data + '[' + $idx + ']';
    $it.dataPathArr[$dataNxt] = $idx;
    var $code = it.validate($it);
    $it.baseId = $currentBaseId;
    if (it.util.varOccurences($code, $nextData) < 2) {
      out += ' ' + (it.util.varReplace($code, $nextData, $passData)) + ' ';
    } else {
      out += ' var ' + ($nextData) + ' = ' + ($passData) + '; ' + ($code) + ' ';
    }
    if ($breakOnError) {
      out += ' if (!' + ($nextValid) + ') break; ';
    }
    out += ' }';
  }
  if ($breakOnError) {
    out += ' ' + ($closingBraces) + ' if (' + ($errs) + ' == errors) {';
  }
  return out;
}


/***/ }),

/***/ 9772:
/***/ ((module) => {

"use strict";

module.exports = function generate_multipleOf(it, $keyword, $ruleType) {
  var out = ' ';
  var $lvl = it.level;
  var $dataLvl = it.dataLevel;
  var $schema = it.schema[$keyword];
  var $schemaPath = it.schemaPath + it.util.getProperty($keyword);
  var $errSchemaPath = it.errSchemaPath + '/' + $keyword;
  var $breakOnError = !it.opts.allErrors;
  var $data = 'data' + ($dataLvl || '');
  var $isData = it.opts.$data && $schema && $schema.$data,
    $schemaValue;
  if ($isData) {
    out += ' var schema' + ($lvl) + ' = ' + (it.util.getData($schema.$data, $dataLvl, it.dataPathArr)) + '; ';
    $schemaValue = 'schema' + $lvl;
  } else {
    $schemaValue = $schema;
  }
  if (!($isData || typeof $schema == 'number')) {
    throw new Error($keyword + ' must be number');
  }
  out += 'var division' + ($lvl) + ';if (';
  if ($isData) {
    out += ' ' + ($schemaValue) + ' !== undefined && ( typeof ' + ($schemaValue) + ' != \'number\' || ';
  }
  out += ' (division' + ($lvl) + ' = ' + ($data) + ' / ' + ($schemaValue) + ', ';
  if (it.opts.multipleOfPrecision) {
    out += ' Math.abs(Math.round(division' + ($lvl) + ') - division' + ($lvl) + ') > 1e-' + (it.opts.multipleOfPrecision) + ' ';
  } else {
    out += ' division' + ($lvl) + ' !== parseInt(division' + ($lvl) + ') ';
  }
  out += ' ) ';
  if ($isData) {
    out += '  )  ';
  }
  out += ' ) {   ';
  var $$outStack = $$outStack || [];
  $$outStack.push(out);
  out = ''; /* istanbul ignore else */
  if (it.createErrors !== false) {
    out += ' { keyword: \'' + ('multipleOf') + '\' , dataPath: (dataPath || \'\') + ' + (it.errorPath) + ' , schemaPath: ' + (it.util.toQuotedString($errSchemaPath)) + ' , params: { multipleOf: ' + ($schemaValue) + ' } ';
    if (it.opts.messages !== false) {
      out += ' , message: \'should be multiple of ';
      if ($isData) {
        out += '\' + ' + ($schemaValue);
      } else {
        out += '' + ($schemaValue) + '\'';
      }
    }
    if (it.opts.verbose) {
      out += ' , schema:  ';
      if ($isData) {
        out += 'validate.schema' + ($schemaPath);
      } else {
        out += '' + ($schema);
      }
      out += '         , parentSchema: validate.schema' + (it.schemaPath) + ' , data: ' + ($data) + ' ';
    }
    out += ' } ';
  } else {
    out += ' {} ';
  }
  var __err = out;
  out = $$outStack.pop();
  if (!it.compositeRule && $breakOnError) {
    /* istanbul ignore if */
    if (it.async) {
      out += ' throw new ValidationError([' + (__err) + ']); ';
    } else {
      out += ' validate.errors = [' + (__err) + ']; return false; ';
    }
  } else {
    out += ' var err = ' + (__err) + ';  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ';
  }
  out += '} ';
  if ($breakOnError) {
    out += ' else { ';
  }
  return out;
}


/***/ }),

/***/ 750:
/***/ ((module) => {

"use strict";

module.exports = function generate_not(it, $keyword, $ruleType) {
  var out = ' ';
  var $lvl = it.level;
  var $dataLvl = it.dataLevel;
  var $schema = it.schema[$keyword];
  var $schemaPath = it.schemaPath + it.util.getProperty($keyword);
  var $errSchemaPath = it.errSchemaPath + '/' + $keyword;
  var $breakOnError = !it.opts.allErrors;
  var $data = 'data' + ($dataLvl || '');
  var $errs = 'errs__' + $lvl;
  var $it = it.util.copy(it);
  $it.level++;
  var $nextValid = 'valid' + $it.level;
  if ((it.opts.strictKeywords ? (typeof $schema == 'object' && Object.keys($schema).length > 0) || $schema === false : it.util.schemaHasRules($schema, it.RULES.all))) {
    $it.schema = $schema;
    $it.schemaPath = $schemaPath;
    $it.errSchemaPath = $errSchemaPath;
    out += ' var ' + ($errs) + ' = errors;  ';
    var $wasComposite = it.compositeRule;
    it.compositeRule = $it.compositeRule = true;
    $it.createErrors = false;
    var $allErrorsOption;
    if ($it.opts.allErrors) {
      $allErrorsOption = $it.opts.allErrors;
      $it.opts.allErrors = false;
    }
    out += ' ' + (it.validate($it)) + ' ';
    $it.createErrors = true;
    if ($allErrorsOption) $it.opts.allErrors = $allErrorsOption;
    it.compositeRule = $it.compositeRule = $wasComposite;
    out += ' if (' + ($nextValid) + ') {   ';
    var $$outStack = $$outStack || [];
    $$outStack.push(out);
    out = ''; /* istanbul ignore else */
    if (it.createErrors !== false) {
      out += ' { keyword: \'' + ('not') + '\' , dataPath: (dataPath || \'\') + ' + (it.errorPath) + ' , schemaPath: ' + (it.util.toQuotedString($errSchemaPath)) + ' , params: {} ';
      if (it.opts.messages !== false) {
        out += ' , message: \'should NOT be valid\' ';
      }
      if (it.opts.verbose) {
        out += ' , schema: validate.schema' + ($schemaPath) + ' , parentSchema: validate.schema' + (it.schemaPath) + ' , data: ' + ($data) + ' ';
      }
      out += ' } ';
    } else {
      out += ' {} ';
    }
    var __err = out;
    out = $$outStack.pop();
    if (!it.compositeRule && $breakOnError) {
      /* istanbul ignore if */
      if (it.async) {
        out += ' throw new ValidationError([' + (__err) + ']); ';
      } else {
        out += ' validate.errors = [' + (__err) + ']; return false; ';
      }
    } else {
      out += ' var err = ' + (__err) + ';  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ';
    }
    out += ' } else {  errors = ' + ($errs) + '; if (vErrors !== null) { if (' + ($errs) + ') vErrors.length = ' + ($errs) + '; else vErrors = null; } ';
    if (it.opts.allErrors) {
      out += ' } ';
    }
  } else {
    out += '  var err =   '; /* istanbul ignore else */
    if (it.createErrors !== false) {
      out += ' { keyword: \'' + ('not') + '\' , dataPath: (dataPath || \'\') + ' + (it.errorPath) + ' , schemaPath: ' + (it.util.toQuotedString($errSchemaPath)) + ' , params: {} ';
      if (it.opts.messages !== false) {
        out += ' , message: \'should NOT be valid\' ';
      }
      if (it.opts.verbose) {
        out += ' , schema: validate.schema' + ($schemaPath) + ' , parentSchema: validate.schema' + (it.schemaPath) + ' , data: ' + ($data) + ' ';
      }
      out += ' } ';
    } else {
      out += ' {} ';
    }
    out += ';  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ';
    if ($breakOnError) {
      out += ' if (false) { ';
    }
  }
  return out;
}


/***/ }),

/***/ 6106:
/***/ ((module) => {

"use strict";

module.exports = function generate_oneOf(it, $keyword, $ruleType) {
  var out = ' ';
  var $lvl = it.level;
  var $dataLvl = it.dataLevel;
  var $schema = it.schema[$keyword];
  var $schemaPath = it.schemaPath + it.util.getProperty($keyword);
  var $errSchemaPath = it.errSchemaPath + '/' + $keyword;
  var $breakOnError = !it.opts.allErrors;
  var $data = 'data' + ($dataLvl || '');
  var $valid = 'valid' + $lvl;
  var $errs = 'errs__' + $lvl;
  var $it = it.util.copy(it);
  var $closingBraces = '';
  $it.level++;
  var $nextValid = 'valid' + $it.level;
  var $currentBaseId = $it.baseId,
    $prevValid = 'prevValid' + $lvl,
    $passingSchemas = 'passingSchemas' + $lvl;
  out += 'var ' + ($errs) + ' = errors , ' + ($prevValid) + ' = false , ' + ($valid) + ' = false , ' + ($passingSchemas) + ' = null; ';
  var $wasComposite = it.compositeRule;
  it.compositeRule = $it.compositeRule = true;
  var arr1 = $schema;
  if (arr1) {
    var $sch, $i = -1,
      l1 = arr1.length - 1;
    while ($i < l1) {
      $sch = arr1[$i += 1];
      if ((it.opts.strictKeywords ? (typeof $sch == 'object' && Object.keys($sch).length > 0) || $sch === false : it.util.schemaHasRules($sch, it.RULES.all))) {
        $it.schema = $sch;
        $it.schemaPath = $schemaPath + '[' + $i + ']';
        $it.errSchemaPath = $errSchemaPath + '/' + $i;
        out += '  ' + (it.validate($it)) + ' ';
        $it.baseId = $currentBaseId;
      } else {
        out += ' var ' + ($nextValid) + ' = true; ';
      }
      if ($i) {
        out += ' if (' + ($nextValid) + ' && ' + ($prevValid) + ') { ' + ($valid) + ' = false; ' + ($passingSchemas) + ' = [' + ($passingSchemas) + ', ' + ($i) + ']; } else { ';
        $closingBraces += '}';
      }
      out += ' if (' + ($nextValid) + ') { ' + ($valid) + ' = ' + ($prevValid) + ' = true; ' + ($passingSchemas) + ' = ' + ($i) + '; }';
    }
  }
  it.compositeRule = $it.compositeRule = $wasComposite;
  out += '' + ($closingBraces) + 'if (!' + ($valid) + ') {   var err =   '; /* istanbul ignore else */
  if (it.createErrors !== false) {
    out += ' { keyword: \'' + ('oneOf') + '\' , dataPath: (dataPath || \'\') + ' + (it.errorPath) + ' , schemaPath: ' + (it.util.toQuotedString($errSchemaPath)) + ' , params: { passingSchemas: ' + ($passingSchemas) + ' } ';
    if (it.opts.messages !== false) {
      out += ' , message: \'should match exactly one schema in oneOf\' ';
    }
    if (it.opts.verbose) {
      out += ' , schema: validate.schema' + ($schemaPath) + ' , parentSchema: validate.schema' + (it.schemaPath) + ' , data: ' + ($data) + ' ';
    }
    out += ' } ';
  } else {
    out += ' {} ';
  }
  out += ';  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ';
  if (!it.compositeRule && $breakOnError) {
    /* istanbul ignore if */
    if (it.async) {
      out += ' throw new ValidationError(vErrors); ';
    } else {
      out += ' validate.errors = vErrors; return false; ';
    }
  }
  out += '} else {  errors = ' + ($errs) + '; if (vErrors !== null) { if (' + ($errs) + ') vErrors.length = ' + ($errs) + '; else vErrors = null; }';
  if (it.opts.allErrors) {
    out += ' } ';
  }
  return out;
}


/***/ }),

/***/ 3912:
/***/ ((module) => {

"use strict";

module.exports = function generate_pattern(it, $keyword, $ruleType) {
  var out = ' ';
  var $lvl = it.level;
  var $dataLvl = it.dataLevel;
  var $schema = it.schema[$keyword];
  var $schemaPath = it.schemaPath + it.util.getProperty($keyword);
  var $errSchemaPath = it.errSchemaPath + '/' + $keyword;
  var $breakOnError = !it.opts.allErrors;
  var $data = 'data' + ($dataLvl || '');
  var $isData = it.opts.$data && $schema && $schema.$data,
    $schemaValue;
  if ($isData) {
    out += ' var schema' + ($lvl) + ' = ' + (it.util.getData($schema.$data, $dataLvl, it.dataPathArr)) + '; ';
    $schemaValue = 'schema' + $lvl;
  } else {
    $schemaValue = $schema;
  }
  var $regexp = $isData ? '(new RegExp(' + $schemaValue + '))' : it.usePattern($schema);
  out += 'if ( ';
  if ($isData) {
    out += ' (' + ($schemaValue) + ' !== undefined && typeof ' + ($schemaValue) + ' != \'string\') || ';
  }
  out += ' !' + ($regexp) + '.test(' + ($data) + ') ) {   ';
  var $$outStack = $$outStack || [];
  $$outStack.push(out);
  out = ''; /* istanbul ignore else */
  if (it.createErrors !== false) {
    out += ' { keyword: \'' + ('pattern') + '\' , dataPath: (dataPath || \'\') + ' + (it.errorPath) + ' , schemaPath: ' + (it.util.toQuotedString($errSchemaPath)) + ' , params: { pattern:  ';
    if ($isData) {
      out += '' + ($schemaValue);
    } else {
      out += '' + (it.util.toQuotedString($schema));
    }
    out += '  } ';
    if (it.opts.messages !== false) {
      out += ' , message: \'should match pattern "';
      if ($isData) {
        out += '\' + ' + ($schemaValue) + ' + \'';
      } else {
        out += '' + (it.util.escapeQuotes($schema));
      }
      out += '"\' ';
    }
    if (it.opts.verbose) {
      out += ' , schema:  ';
      if ($isData) {
        out += 'validate.schema' + ($schemaPath);
      } else {
        out += '' + (it.util.toQuotedString($schema));
      }
      out += '         , parentSchema: validate.schema' + (it.schemaPath) + ' , data: ' + ($data) + ' ';
    }
    out += ' } ';
  } else {
    out += ' {} ';
  }
  var __err = out;
  out = $$outStack.pop();
  if (!it.compositeRule && $breakOnError) {
    /* istanbul ignore if */
    if (it.async) {
      out += ' throw new ValidationError([' + (__err) + ']); ';
    } else {
      out += ' validate.errors = [' + (__err) + ']; return false; ';
    }
  } else {
    out += ' var err = ' + (__err) + ';  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ';
  }
  out += '} ';
  if ($breakOnError) {
    out += ' else { ';
  }
  return out;
}


/***/ }),

/***/ 2924:
/***/ ((module) => {

"use strict";

module.exports = function generate_properties(it, $keyword, $ruleType) {
  var out = ' ';
  var $lvl = it.level;
  var $dataLvl = it.dataLevel;
  var $schema = it.schema[$keyword];
  var $schemaPath = it.schemaPath + it.util.getProperty($keyword);
  var $errSchemaPath = it.errSchemaPath + '/' + $keyword;
  var $breakOnError = !it.opts.allErrors;
  var $data = 'data' + ($dataLvl || '');
  var $errs = 'errs__' + $lvl;
  var $it = it.util.copy(it);
  var $closingBraces = '';
  $it.level++;
  var $nextValid = 'valid' + $it.level;
  var $key = 'key' + $lvl,
    $idx = 'idx' + $lvl,
    $dataNxt = $it.dataLevel = it.dataLevel + 1,
    $nextData = 'data' + $dataNxt,
    $dataProperties = 'dataProperties' + $lvl;
  var $schemaKeys = Object.keys($schema || {}).filter(notProto),
    $pProperties = it.schema.patternProperties || {},
    $pPropertyKeys = Object.keys($pProperties).filter(notProto),
    $aProperties = it.schema.additionalProperties,
    $someProperties = $schemaKeys.length || $pPropertyKeys.length,
    $noAdditional = $aProperties === false,
    $additionalIsSchema = typeof $aProperties == 'object' && Object.keys($aProperties).length,
    $removeAdditional = it.opts.removeAdditional,
    $checkAdditional = $noAdditional || $additionalIsSchema || $removeAdditional,
    $ownProperties = it.opts.ownProperties,
    $currentBaseId = it.baseId;
  var $required = it.schema.required;
  if ($required && !(it.opts.$data && $required.$data) && $required.length < it.opts.loopRequired) {
    var $requiredHash = it.util.toHash($required);
  }

  function notProto(p) {
    return p !== '__proto__';
  }
  out += 'var ' + ($errs) + ' = errors;var ' + ($nextValid) + ' = true;';
  if ($ownProperties) {
    out += ' var ' + ($dataProperties) + ' = undefined;';
  }
  if ($checkAdditional) {
    if ($ownProperties) {
      out += ' ' + ($dataProperties) + ' = ' + ($dataProperties) + ' || Object.keys(' + ($data) + '); for (var ' + ($idx) + '=0; ' + ($idx) + '<' + ($dataProperties) + '.length; ' + ($idx) + '++) { var ' + ($key) + ' = ' + ($dataProperties) + '[' + ($idx) + ']; ';
    } else {
      out += ' for (var ' + ($key) + ' in ' + ($data) + ') { ';
    }
    if ($someProperties) {
      out += ' var isAdditional' + ($lvl) + ' = !(false ';
      if ($schemaKeys.length) {
        if ($schemaKeys.length > 8) {
          out += ' || validate.schema' + ($schemaPath) + '.hasOwnProperty(' + ($key) + ') ';
        } else {
          var arr1 = $schemaKeys;
          if (arr1) {
            var $propertyKey, i1 = -1,
              l1 = arr1.length - 1;
            while (i1 < l1) {
              $propertyKey = arr1[i1 += 1];
              out += ' || ' + ($key) + ' == ' + (it.util.toQuotedString($propertyKey)) + ' ';
            }
          }
        }
      }
      if ($pPropertyKeys.length) {
        var arr2 = $pPropertyKeys;
        if (arr2) {
          var $pProperty, $i = -1,
            l2 = arr2.length - 1;
          while ($i < l2) {
            $pProperty = arr2[$i += 1];
            out += ' || ' + (it.usePattern($pProperty)) + '.test(' + ($key) + ') ';
          }
        }
      }
      out += ' ); if (isAdditional' + ($lvl) + ') { ';
    }
    if ($removeAdditional == 'all') {
      out += ' delete ' + ($data) + '[' + ($key) + ']; ';
    } else {
      var $currentErrorPath = it.errorPath;
      var $additionalProperty = '\' + ' + $key + ' + \'';
      if (it.opts._errorDataPathProperty) {
        it.errorPath = it.util.getPathExpr(it.errorPath, $key, it.opts.jsonPointers);
      }
      if ($noAdditional) {
        if ($removeAdditional) {
          out += ' delete ' + ($data) + '[' + ($key) + ']; ';
        } else {
          out += ' ' + ($nextValid) + ' = false; ';
          var $currErrSchemaPath = $errSchemaPath;
          $errSchemaPath = it.errSchemaPath + '/additionalProperties';
          var $$outStack = $$outStack || [];
          $$outStack.push(out);
          out = ''; /* istanbul ignore else */
          if (it.createErrors !== false) {
            out += ' { keyword: \'' + ('additionalProperties') + '\' , dataPath: (dataPath || \'\') + ' + (it.errorPath) + ' , schemaPath: ' + (it.util.toQuotedString($errSchemaPath)) + ' , params: { additionalProperty: \'' + ($additionalProperty) + '\' } ';
            if (it.opts.messages !== false) {
              out += ' , message: \'';
              if (it.opts._errorDataPathProperty) {
                out += 'is an invalid additional property';
              } else {
                out += 'should NOT have additional properties';
              }
              out += '\' ';
            }
            if (it.opts.verbose) {
              out += ' , schema: false , parentSchema: validate.schema' + (it.schemaPath) + ' , data: ' + ($data) + ' ';
            }
            out += ' } ';
          } else {
            out += ' {} ';
          }
          var __err = out;
          out = $$outStack.pop();
          if (!it.compositeRule && $breakOnError) {
            /* istanbul ignore if */
            if (it.async) {
              out += ' throw new ValidationError([' + (__err) + ']); ';
            } else {
              out += ' validate.errors = [' + (__err) + ']; return false; ';
            }
          } else {
            out += ' var err = ' + (__err) + ';  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ';
          }
          $errSchemaPath = $currErrSchemaPath;
          if ($breakOnError) {
            out += ' break; ';
          }
        }
      } else if ($additionalIsSchema) {
        if ($removeAdditional == 'failing') {
          out += ' var ' + ($errs) + ' = errors;  ';
          var $wasComposite = it.compositeRule;
          it.compositeRule = $it.compositeRule = true;
          $it.schema = $aProperties;
          $it.schemaPath = it.schemaPath + '.additionalProperties';
          $it.errSchemaPath = it.errSchemaPath + '/additionalProperties';
          $it.errorPath = it.opts._errorDataPathProperty ? it.errorPath : it.util.getPathExpr(it.errorPath, $key, it.opts.jsonPointers);
          var $passData = $data + '[' + $key + ']';
          $it.dataPathArr[$dataNxt] = $key;
          var $code = it.validate($it);
          $it.baseId = $currentBaseId;
          if (it.util.varOccurences($code, $nextData) < 2) {
            out += ' ' + (it.util.varReplace($code, $nextData, $passData)) + ' ';
          } else {
            out += ' var ' + ($nextData) + ' = ' + ($passData) + '; ' + ($code) + ' ';
          }
          out += ' if (!' + ($nextValid) + ') { errors = ' + ($errs) + '; if (validate.errors !== null) { if (errors) validate.errors.length = errors; else validate.errors = null; } delete ' + ($data) + '[' + ($key) + ']; }  ';
          it.compositeRule = $it.compositeRule = $wasComposite;
        } else {
          $it.schema = $aProperties;
          $it.schemaPath = it.schemaPath + '.additionalProperties';
          $it.errSchemaPath = it.errSchemaPath + '/additionalProperties';
          $it.errorPath = it.opts._errorDataPathProperty ? it.errorPath : it.util.getPathExpr(it.errorPath, $key, it.opts.jsonPointers);
          var $passData = $data + '[' + $key + ']';
          $it.dataPathArr[$dataNxt] = $key;
          var $code = it.validate($it);
          $it.baseId = $currentBaseId;
          if (it.util.varOccurences($code, $nextData) < 2) {
            out += ' ' + (it.util.varReplace($code, $nextData, $passData)) + ' ';
          } else {
            out += ' var ' + ($nextData) + ' = ' + ($passData) + '; ' + ($code) + ' ';
          }
          if ($breakOnError) {
            out += ' if (!' + ($nextValid) + ') break; ';
          }
        }
      }
      it.errorPath = $currentErrorPath;
    }
    if ($someProperties) {
      out += ' } ';
    }
    out += ' }  ';
    if ($breakOnError) {
      out += ' if (' + ($nextValid) + ') { ';
      $closingBraces += '}';
    }
  }
  var $useDefaults = it.opts.useDefaults && !it.compositeRule;
  if ($schemaKeys.length) {
    var arr3 = $schemaKeys;
    if (arr3) {
      var $propertyKey, i3 = -1,
        l3 = arr3.length - 1;
      while (i3 < l3) {
        $propertyKey = arr3[i3 += 1];
        var $sch = $schema[$propertyKey];
        if ((it.opts.strictKeywords ? (typeof $sch == 'object' && Object.keys($sch).length > 0) || $sch === false : it.util.schemaHasRules($sch, it.RULES.all))) {
          var $prop = it.util.getProperty($propertyKey),
            $passData = $data + $prop,
            $hasDefault = $useDefaults && $sch.default !== undefined;
          $it.schema = $sch;
          $it.schemaPath = $schemaPath + $prop;
          $it.errSchemaPath = $errSchemaPath + '/' + it.util.escapeFragment($propertyKey);
          $it.errorPath = it.util.getPath(it.errorPath, $propertyKey, it.opts.jsonPointers);
          $it.dataPathArr[$dataNxt] = it.util.toQuotedString($propertyKey);
          var $code = it.validate($it);
          $it.baseId = $currentBaseId;
          if (it.util.varOccurences($code, $nextData) < 2) {
            $code = it.util.varReplace($code, $nextData, $passData);
            var $useData = $passData;
          } else {
            var $useData = $nextData;
            out += ' var ' + ($nextData) + ' = ' + ($passData) + '; ';
          }
          if ($hasDefault) {
            out += ' ' + ($code) + ' ';
          } else {
            if ($requiredHash && $requiredHash[$propertyKey]) {
              out += ' if ( ' + ($useData) + ' === undefined ';
              if ($ownProperties) {
                out += ' || ! Object.prototype.hasOwnProperty.call(' + ($data) + ', \'' + (it.util.escapeQuotes($propertyKey)) + '\') ';
              }
              out += ') { ' + ($nextValid) + ' = false; ';
              var $currentErrorPath = it.errorPath,
                $currErrSchemaPath = $errSchemaPath,
                $missingProperty = it.util.escapeQuotes($propertyKey);
              if (it.opts._errorDataPathProperty) {
                it.errorPath = it.util.getPath($currentErrorPath, $propertyKey, it.opts.jsonPointers);
              }
              $errSchemaPath = it.errSchemaPath + '/required';
              var $$outStack = $$outStack || [];
              $$outStack.push(out);
              out = ''; /* istanbul ignore else */
              if (it.createErrors !== false) {
                out += ' { keyword: \'' + ('required') + '\' , dataPath: (dataPath || \'\') + ' + (it.errorPath) + ' , schemaPath: ' + (it.util.toQuotedString($errSchemaPath)) + ' , params: { missingProperty: \'' + ($missingProperty) + '\' } ';
                if (it.opts.messages !== false) {
                  out += ' , message: \'';
                  if (it.opts._errorDataPathProperty) {
                    out += 'is a required property';
                  } else {
                    out += 'should have required property \\\'' + ($missingProperty) + '\\\'';
                  }
                  out += '\' ';
                }
                if (it.opts.verbose) {
                  out += ' , schema: validate.schema' + ($schemaPath) + ' , parentSchema: validate.schema' + (it.schemaPath) + ' , data: ' + ($data) + ' ';
                }
                out += ' } ';
              } else {
                out += ' {} ';
              }
              var __err = out;
              out = $$outStack.pop();
              if (!it.compositeRule && $breakOnError) {
                /* istanbul ignore if */
                if (it.async) {
                  out += ' throw new ValidationError([' + (__err) + ']); ';
                } else {
                  out += ' validate.errors = [' + (__err) + ']; return false; ';
                }
              } else {
                out += ' var err = ' + (__err) + ';  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ';
              }
              $errSchemaPath = $currErrSchemaPath;
              it.errorPath = $currentErrorPath;
              out += ' } else { ';
            } else {
              if ($breakOnError) {
                out += ' if ( ' + ($useData) + ' === undefined ';
                if ($ownProperties) {
                  out += ' || ! Object.prototype.hasOwnProperty.call(' + ($data) + ', \'' + (it.util.escapeQuotes($propertyKey)) + '\') ';
                }
                out += ') { ' + ($nextValid) + ' = true; } else { ';
              } else {
                out += ' if (' + ($useData) + ' !== undefined ';
                if ($ownProperties) {
                  out += ' &&   Object.prototype.hasOwnProperty.call(' + ($data) + ', \'' + (it.util.escapeQuotes($propertyKey)) + '\') ';
                }
                out += ' ) { ';
              }
            }
            out += ' ' + ($code) + ' } ';
          }
        }
        if ($breakOnError) {
          out += ' if (' + ($nextValid) + ') { ';
          $closingBraces += '}';
        }
      }
    }
  }
  if ($pPropertyKeys.length) {
    var arr4 = $pPropertyKeys;
    if (arr4) {
      var $pProperty, i4 = -1,
        l4 = arr4.length - 1;
      while (i4 < l4) {
        $pProperty = arr4[i4 += 1];
        var $sch = $pProperties[$pProperty];
        if ((it.opts.strictKeywords ? (typeof $sch == 'object' && Object.keys($sch).length > 0) || $sch === false : it.util.schemaHasRules($sch, it.RULES.all))) {
          $it.schema = $sch;
          $it.schemaPath = it.schemaPath + '.patternProperties' + it.util.getProperty($pProperty);
          $it.errSchemaPath = it.errSchemaPath + '/patternProperties/' + it.util.escapeFragment($pProperty);
          if ($ownProperties) {
            out += ' ' + ($dataProperties) + ' = ' + ($dataProperties) + ' || Object.keys(' + ($data) + '); for (var ' + ($idx) + '=0; ' + ($idx) + '<' + ($dataProperties) + '.length; ' + ($idx) + '++) { var ' + ($key) + ' = ' + ($dataProperties) + '[' + ($idx) + ']; ';
          } else {
            out += ' for (var ' + ($key) + ' in ' + ($data) + ') { ';
          }
          out += ' if (' + (it.usePattern($pProperty)) + '.test(' + ($key) + ')) { ';
          $it.errorPath = it.util.getPathExpr(it.errorPath, $key, it.opts.jsonPointers);
          var $passData = $data + '[' + $key + ']';
          $it.dataPathArr[$dataNxt] = $key;
          var $code = it.validate($it);
          $it.baseId = $currentBaseId;
          if (it.util.varOccurences($code, $nextData) < 2) {
            out += ' ' + (it.util.varReplace($code, $nextData, $passData)) + ' ';
          } else {
            out += ' var ' + ($nextData) + ' = ' + ($passData) + '; ' + ($code) + ' ';
          }
          if ($breakOnError) {
            out += ' if (!' + ($nextValid) + ') break; ';
          }
          out += ' } ';
          if ($breakOnError) {
            out += ' else ' + ($nextValid) + ' = true; ';
          }
          out += ' }  ';
          if ($breakOnError) {
            out += ' if (' + ($nextValid) + ') { ';
            $closingBraces += '}';
          }
        }
      }
    }
  }
  if ($breakOnError) {
    out += ' ' + ($closingBraces) + ' if (' + ($errs) + ' == errors) {';
  }
  return out;
}


/***/ }),

/***/ 9195:
/***/ ((module) => {

"use strict";

module.exports = function generate_propertyNames(it, $keyword, $ruleType) {
  var out = ' ';
  var $lvl = it.level;
  var $dataLvl = it.dataLevel;
  var $schema = it.schema[$keyword];
  var $schemaPath = it.schemaPath + it.util.getProperty($keyword);
  var $errSchemaPath = it.errSchemaPath + '/' + $keyword;
  var $breakOnError = !it.opts.allErrors;
  var $data = 'data' + ($dataLvl || '');
  var $errs = 'errs__' + $lvl;
  var $it = it.util.copy(it);
  var $closingBraces = '';
  $it.level++;
  var $nextValid = 'valid' + $it.level;
  out += 'var ' + ($errs) + ' = errors;';
  if ((it.opts.strictKeywords ? (typeof $schema == 'object' && Object.keys($schema).length > 0) || $schema === false : it.util.schemaHasRules($schema, it.RULES.all))) {
    $it.schema = $schema;
    $it.schemaPath = $schemaPath;
    $it.errSchemaPath = $errSchemaPath;
    var $key = 'key' + $lvl,
      $idx = 'idx' + $lvl,
      $i = 'i' + $lvl,
      $invalidName = '\' + ' + $key + ' + \'',
      $dataNxt = $it.dataLevel = it.dataLevel + 1,
      $nextData = 'data' + $dataNxt,
      $dataProperties = 'dataProperties' + $lvl,
      $ownProperties = it.opts.ownProperties,
      $currentBaseId = it.baseId;
    if ($ownProperties) {
      out += ' var ' + ($dataProperties) + ' = undefined; ';
    }
    if ($ownProperties) {
      out += ' ' + ($dataProperties) + ' = ' + ($dataProperties) + ' || Object.keys(' + ($data) + '); for (var ' + ($idx) + '=0; ' + ($idx) + '<' + ($dataProperties) + '.length; ' + ($idx) + '++) { var ' + ($key) + ' = ' + ($dataProperties) + '[' + ($idx) + ']; ';
    } else {
      out += ' for (var ' + ($key) + ' in ' + ($data) + ') { ';
    }
    out += ' var startErrs' + ($lvl) + ' = errors; ';
    var $passData = $key;
    var $wasComposite = it.compositeRule;
    it.compositeRule = $it.compositeRule = true;
    var $code = it.validate($it);
    $it.baseId = $currentBaseId;
    if (it.util.varOccurences($code, $nextData) < 2) {
      out += ' ' + (it.util.varReplace($code, $nextData, $passData)) + ' ';
    } else {
      out += ' var ' + ($nextData) + ' = ' + ($passData) + '; ' + ($code) + ' ';
    }
    it.compositeRule = $it.compositeRule = $wasComposite;
    out += ' if (!' + ($nextValid) + ') { for (var ' + ($i) + '=startErrs' + ($lvl) + '; ' + ($i) + '<errors; ' + ($i) + '++) { vErrors[' + ($i) + '].propertyName = ' + ($key) + '; }   var err =   '; /* istanbul ignore else */
    if (it.createErrors !== false) {
      out += ' { keyword: \'' + ('propertyNames') + '\' , dataPath: (dataPath || \'\') + ' + (it.errorPath) + ' , schemaPath: ' + (it.util.toQuotedString($errSchemaPath)) + ' , params: { propertyName: \'' + ($invalidName) + '\' } ';
      if (it.opts.messages !== false) {
        out += ' , message: \'property name \\\'' + ($invalidName) + '\\\' is invalid\' ';
      }
      if (it.opts.verbose) {
        out += ' , schema: validate.schema' + ($schemaPath) + ' , parentSchema: validate.schema' + (it.schemaPath) + ' , data: ' + ($data) + ' ';
      }
      out += ' } ';
    } else {
      out += ' {} ';
    }
    out += ';  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ';
    if (!it.compositeRule && $breakOnError) {
      /* istanbul ignore if */
      if (it.async) {
        out += ' throw new ValidationError(vErrors); ';
      } else {
        out += ' validate.errors = vErrors; return false; ';
      }
    }
    if ($breakOnError) {
      out += ' break; ';
    }
    out += ' } }';
  }
  if ($breakOnError) {
    out += ' ' + ($closingBraces) + ' if (' + ($errs) + ' == errors) {';
  }
  return out;
}


/***/ }),

/***/ 2393:
/***/ ((module) => {

"use strict";

module.exports = function generate_ref(it, $keyword, $ruleType) {
  var out = ' ';
  var $lvl = it.level;
  var $dataLvl = it.dataLevel;
  var $schema = it.schema[$keyword];
  var $errSchemaPath = it.errSchemaPath + '/' + $keyword;
  var $breakOnError = !it.opts.allErrors;
  var $data = 'data' + ($dataLvl || '');
  var $valid = 'valid' + $lvl;
  var $async, $refCode;
  if ($schema == '#' || $schema == '#/') {
    if (it.isRoot) {
      $async = it.async;
      $refCode = 'validate';
    } else {
      $async = it.root.schema.$async === true;
      $refCode = 'root.refVal[0]';
    }
  } else {
    var $refVal = it.resolveRef(it.baseId, $schema, it.isRoot);
    if ($refVal === undefined) {
      var $message = it.MissingRefError.message(it.baseId, $schema);
      if (it.opts.missingRefs == 'fail') {
        it.logger.error($message);
        var $$outStack = $$outStack || [];
        $$outStack.push(out);
        out = ''; /* istanbul ignore else */
        if (it.createErrors !== false) {
          out += ' { keyword: \'' + ('$ref') + '\' , dataPath: (dataPath || \'\') + ' + (it.errorPath) + ' , schemaPath: ' + (it.util.toQuotedString($errSchemaPath)) + ' , params: { ref: \'' + (it.util.escapeQuotes($schema)) + '\' } ';
          if (it.opts.messages !== false) {
            out += ' , message: \'can\\\'t resolve reference ' + (it.util.escapeQuotes($schema)) + '\' ';
          }
          if (it.opts.verbose) {
            out += ' , schema: ' + (it.util.toQuotedString($schema)) + ' , parentSchema: validate.schema' + (it.schemaPath) + ' , data: ' + ($data) + ' ';
          }
          out += ' } ';
        } else {
          out += ' {} ';
        }
        var __err = out;
        out = $$outStack.pop();
        if (!it.compositeRule && $breakOnError) {
          /* istanbul ignore if */
          if (it.async) {
            out += ' throw new ValidationError([' + (__err) + ']); ';
          } else {
            out += ' validate.errors = [' + (__err) + ']; return false; ';
          }
        } else {
          out += ' var err = ' + (__err) + ';  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ';
        }
        if ($breakOnError) {
          out += ' if (false) { ';
        }
      } else if (it.opts.missingRefs == 'ignore') {
        it.logger.warn($message);
        if ($breakOnError) {
          out += ' if (true) { ';
        }
      } else {
        throw new it.MissingRefError(it.baseId, $schema, $message);
      }
    } else if ($refVal.inline) {
      var $it = it.util.copy(it);
      $it.level++;
      var $nextValid = 'valid' + $it.level;
      $it.schema = $refVal.schema;
      $it.schemaPath = '';
      $it.errSchemaPath = $schema;
      var $code = it.validate($it).replace(/validate\.schema/g, $refVal.code);
      out += ' ' + ($code) + ' ';
      if ($breakOnError) {
        out += ' if (' + ($nextValid) + ') { ';
      }
    } else {
      $async = $refVal.$async === true || (it.async && $refVal.$async !== false);
      $refCode = $refVal.code;
    }
  }
  if ($refCode) {
    var $$outStack = $$outStack || [];
    $$outStack.push(out);
    out = '';
    if (it.opts.passContext) {
      out += ' ' + ($refCode) + '.call(this, ';
    } else {
      out += ' ' + ($refCode) + '( ';
    }
    out += ' ' + ($data) + ', (dataPath || \'\')';
    if (it.errorPath != '""') {
      out += ' + ' + (it.errorPath);
    }
    var $parentData = $dataLvl ? 'data' + (($dataLvl - 1) || '') : 'parentData',
      $parentDataProperty = $dataLvl ? it.dataPathArr[$dataLvl] : 'parentDataProperty';
    out += ' , ' + ($parentData) + ' , ' + ($parentDataProperty) + ', rootData)  ';
    var __callValidate = out;
    out = $$outStack.pop();
    if ($async) {
      if (!it.async) throw new Error('async schema referenced by sync schema');
      if ($breakOnError) {
        out += ' var ' + ($valid) + '; ';
      }
      out += ' try { await ' + (__callValidate) + '; ';
      if ($breakOnError) {
        out += ' ' + ($valid) + ' = true; ';
      }
      out += ' } catch (e) { if (!(e instanceof ValidationError)) throw e; if (vErrors === null) vErrors = e.errors; else vErrors = vErrors.concat(e.errors); errors = vErrors.length; ';
      if ($breakOnError) {
        out += ' ' + ($valid) + ' = false; ';
      }
      out += ' } ';
      if ($breakOnError) {
        out += ' if (' + ($valid) + ') { ';
      }
    } else {
      out += ' if (!' + (__callValidate) + ') { if (vErrors === null) vErrors = ' + ($refCode) + '.errors; else vErrors = vErrors.concat(' + ($refCode) + '.errors); errors = vErrors.length; } ';
      if ($breakOnError) {
        out += ' else { ';
      }
    }
  }
  return out;
}


/***/ }),

/***/ 8420:
/***/ ((module) => {

"use strict";

module.exports = function generate_required(it, $keyword, $ruleType) {
  var out = ' ';
  var $lvl = it.level;
  var $dataLvl = it.dataLevel;
  var $schema = it.schema[$keyword];
  var $schemaPath = it.schemaPath + it.util.getProperty($keyword);
  var $errSchemaPath = it.errSchemaPath + '/' + $keyword;
  var $breakOnError = !it.opts.allErrors;
  var $data = 'data' + ($dataLvl || '');
  var $valid = 'valid' + $lvl;
  var $isData = it.opts.$data && $schema && $schema.$data,
    $schemaValue;
  if ($isData) {
    out += ' var schema' + ($lvl) + ' = ' + (it.util.getData($schema.$data, $dataLvl, it.dataPathArr)) + '; ';
    $schemaValue = 'schema' + $lvl;
  } else {
    $schemaValue = $schema;
  }
  var $vSchema = 'schema' + $lvl;
  if (!$isData) {
    if ($schema.length < it.opts.loopRequired && it.schema.properties && Object.keys(it.schema.properties).length) {
      var $required = [];
      var arr1 = $schema;
      if (arr1) {
        var $property, i1 = -1,
          l1 = arr1.length - 1;
        while (i1 < l1) {
          $property = arr1[i1 += 1];
          var $propertySch = it.schema.properties[$property];
          if (!($propertySch && (it.opts.strictKeywords ? (typeof $propertySch == 'object' && Object.keys($propertySch).length > 0) || $propertySch === false : it.util.schemaHasRules($propertySch, it.RULES.all)))) {
            $required[$required.length] = $property;
          }
        }
      }
    } else {
      var $required = $schema;
    }
  }
  if ($isData || $required.length) {
    var $currentErrorPath = it.errorPath,
      $loopRequired = $isData || $required.length >= it.opts.loopRequired,
      $ownProperties = it.opts.ownProperties;
    if ($breakOnError) {
      out += ' var missing' + ($lvl) + '; ';
      if ($loopRequired) {
        if (!$isData) {
          out += ' var ' + ($vSchema) + ' = validate.schema' + ($schemaPath) + '; ';
        }
        var $i = 'i' + $lvl,
          $propertyPath = 'schema' + $lvl + '[' + $i + ']',
          $missingProperty = '\' + ' + $propertyPath + ' + \'';
        if (it.opts._errorDataPathProperty) {
          it.errorPath = it.util.getPathExpr($currentErrorPath, $propertyPath, it.opts.jsonPointers);
        }
        out += ' var ' + ($valid) + ' = true; ';
        if ($isData) {
          out += ' if (schema' + ($lvl) + ' === undefined) ' + ($valid) + ' = true; else if (!Array.isArray(schema' + ($lvl) + ')) ' + ($valid) + ' = false; else {';
        }
        out += ' for (var ' + ($i) + ' = 0; ' + ($i) + ' < ' + ($vSchema) + '.length; ' + ($i) + '++) { ' + ($valid) + ' = ' + ($data) + '[' + ($vSchema) + '[' + ($i) + ']] !== undefined ';
        if ($ownProperties) {
          out += ' &&   Object.prototype.hasOwnProperty.call(' + ($data) + ', ' + ($vSchema) + '[' + ($i) + ']) ';
        }
        out += '; if (!' + ($valid) + ') break; } ';
        if ($isData) {
          out += '  }  ';
        }
        out += '  if (!' + ($valid) + ') {   ';
        var $$outStack = $$outStack || [];
        $$outStack.push(out);
        out = ''; /* istanbul ignore else */
        if (it.createErrors !== false) {
          out += ' { keyword: \'' + ('required') + '\' , dataPath: (dataPath || \'\') + ' + (it.errorPath) + ' , schemaPath: ' + (it.util.toQuotedString($errSchemaPath)) + ' , params: { missingProperty: \'' + ($missingProperty) + '\' } ';
          if (it.opts.messages !== false) {
            out += ' , message: \'';
            if (it.opts._errorDataPathProperty) {
              out += 'is a required property';
            } else {
              out += 'should have required property \\\'' + ($missingProperty) + '\\\'';
            }
            out += '\' ';
          }
          if (it.opts.verbose) {
            out += ' , schema: validate.schema' + ($schemaPath) + ' , parentSchema: validate.schema' + (it.schemaPath) + ' , data: ' + ($data) + ' ';
          }
          out += ' } ';
        } else {
          out += ' {} ';
        }
        var __err = out;
        out = $$outStack.pop();
        if (!it.compositeRule && $breakOnError) {
          /* istanbul ignore if */
          if (it.async) {
            out += ' throw new ValidationError([' + (__err) + ']); ';
          } else {
            out += ' validate.errors = [' + (__err) + ']; return false; ';
          }
        } else {
          out += ' var err = ' + (__err) + ';  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ';
        }
        out += ' } else { ';
      } else {
        out += ' if ( ';
        var arr2 = $required;
        if (arr2) {
          var $propertyKey, $i = -1,
            l2 = arr2.length - 1;
          while ($i < l2) {
            $propertyKey = arr2[$i += 1];
            if ($i) {
              out += ' || ';
            }
            var $prop = it.util.getProperty($propertyKey),
              $useData = $data + $prop;
            out += ' ( ( ' + ($useData) + ' === undefined ';
            if ($ownProperties) {
              out += ' || ! Object.prototype.hasOwnProperty.call(' + ($data) + ', \'' + (it.util.escapeQuotes($propertyKey)) + '\') ';
            }
            out += ') && (missing' + ($lvl) + ' = ' + (it.util.toQuotedString(it.opts.jsonPointers ? $propertyKey : $prop)) + ') ) ';
          }
        }
        out += ') {  ';
        var $propertyPath = 'missing' + $lvl,
          $missingProperty = '\' + ' + $propertyPath + ' + \'';
        if (it.opts._errorDataPathProperty) {
          it.errorPath = it.opts.jsonPointers ? it.util.getPathExpr($currentErrorPath, $propertyPath, true) : $currentErrorPath + ' + ' + $propertyPath;
        }
        var $$outStack = $$outStack || [];
        $$outStack.push(out);
        out = ''; /* istanbul ignore else */
        if (it.createErrors !== false) {
          out += ' { keyword: \'' + ('required') + '\' , dataPath: (dataPath || \'\') + ' + (it.errorPath) + ' , schemaPath: ' + (it.util.toQuotedString($errSchemaPath)) + ' , params: { missingProperty: \'' + ($missingProperty) + '\' } ';
          if (it.opts.messages !== false) {
            out += ' , message: \'';
            if (it.opts._errorDataPathProperty) {
              out += 'is a required property';
            } else {
              out += 'should have required property \\\'' + ($missingProperty) + '\\\'';
            }
            out += '\' ';
          }
          if (it.opts.verbose) {
            out += ' , schema: validate.schema' + ($schemaPath) + ' , parentSchema: validate.schema' + (it.schemaPath) + ' , data: ' + ($data) + ' ';
          }
          out += ' } ';
        } else {
          out += ' {} ';
        }
        var __err = out;
        out = $$outStack.pop();
        if (!it.compositeRule && $breakOnError) {
          /* istanbul ignore if */
          if (it.async) {
            out += ' throw new ValidationError([' + (__err) + ']); ';
          } else {
            out += ' validate.errors = [' + (__err) + ']; return false; ';
          }
        } else {
          out += ' var err = ' + (__err) + ';  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ';
        }
        out += ' } else { ';
      }
    } else {
      if ($loopRequired) {
        if (!$isData) {
          out += ' var ' + ($vSchema) + ' = validate.schema' + ($schemaPath) + '; ';
        }
        var $i = 'i' + $lvl,
          $propertyPath = 'schema' + $lvl + '[' + $i + ']',
          $missingProperty = '\' + ' + $propertyPath + ' + \'';
        if (it.opts._errorDataPathProperty) {
          it.errorPath = it.util.getPathExpr($currentErrorPath, $propertyPath, it.opts.jsonPointers);
        }
        if ($isData) {
          out += ' if (' + ($vSchema) + ' && !Array.isArray(' + ($vSchema) + ')) {  var err =   '; /* istanbul ignore else */
          if (it.createErrors !== false) {
            out += ' { keyword: \'' + ('required') + '\' , dataPath: (dataPath || \'\') + ' + (it.errorPath) + ' , schemaPath: ' + (it.util.toQuotedString($errSchemaPath)) + ' , params: { missingProperty: \'' + ($missingProperty) + '\' } ';
            if (it.opts.messages !== false) {
              out += ' , message: \'';
              if (it.opts._errorDataPathProperty) {
                out += 'is a required property';
              } else {
                out += 'should have required property \\\'' + ($missingProperty) + '\\\'';
              }
              out += '\' ';
            }
            if (it.opts.verbose) {
              out += ' , schema: validate.schema' + ($schemaPath) + ' , parentSchema: validate.schema' + (it.schemaPath) + ' , data: ' + ($data) + ' ';
            }
            out += ' } ';
          } else {
            out += ' {} ';
          }
          out += ';  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; } else if (' + ($vSchema) + ' !== undefined) { ';
        }
        out += ' for (var ' + ($i) + ' = 0; ' + ($i) + ' < ' + ($vSchema) + '.length; ' + ($i) + '++) { if (' + ($data) + '[' + ($vSchema) + '[' + ($i) + ']] === undefined ';
        if ($ownProperties) {
          out += ' || ! Object.prototype.hasOwnProperty.call(' + ($data) + ', ' + ($vSchema) + '[' + ($i) + ']) ';
        }
        out += ') {  var err =   '; /* istanbul ignore else */
        if (it.createErrors !== false) {
          out += ' { keyword: \'' + ('required') + '\' , dataPath: (dataPath || \'\') + ' + (it.errorPath) + ' , schemaPath: ' + (it.util.toQuotedString($errSchemaPath)) + ' , params: { missingProperty: \'' + ($missingProperty) + '\' } ';
          if (it.opts.messages !== false) {
            out += ' , message: \'';
            if (it.opts._errorDataPathProperty) {
              out += 'is a required property';
            } else {
              out += 'should have required property \\\'' + ($missingProperty) + '\\\'';
            }
            out += '\' ';
          }
          if (it.opts.verbose) {
            out += ' , schema: validate.schema' + ($schemaPath) + ' , parentSchema: validate.schema' + (it.schemaPath) + ' , data: ' + ($data) + ' ';
          }
          out += ' } ';
        } else {
          out += ' {} ';
        }
        out += ';  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; } } ';
        if ($isData) {
          out += '  }  ';
        }
      } else {
        var arr3 = $required;
        if (arr3) {
          var $propertyKey, i3 = -1,
            l3 = arr3.length - 1;
          while (i3 < l3) {
            $propertyKey = arr3[i3 += 1];
            var $prop = it.util.getProperty($propertyKey),
              $missingProperty = it.util.escapeQuotes($propertyKey),
              $useData = $data + $prop;
            if (it.opts._errorDataPathProperty) {
              it.errorPath = it.util.getPath($currentErrorPath, $propertyKey, it.opts.jsonPointers);
            }
            out += ' if ( ' + ($useData) + ' === undefined ';
            if ($ownProperties) {
              out += ' || ! Object.prototype.hasOwnProperty.call(' + ($data) + ', \'' + (it.util.escapeQuotes($propertyKey)) + '\') ';
            }
            out += ') {  var err =   '; /* istanbul ignore else */
            if (it.createErrors !== false) {
              out += ' { keyword: \'' + ('required') + '\' , dataPath: (dataPath || \'\') + ' + (it.errorPath) + ' , schemaPath: ' + (it.util.toQuotedString($errSchemaPath)) + ' , params: { missingProperty: \'' + ($missingProperty) + '\' } ';
              if (it.opts.messages !== false) {
                out += ' , message: \'';
                if (it.opts._errorDataPathProperty) {
                  out += 'is a required property';
                } else {
                  out += 'should have required property \\\'' + ($missingProperty) + '\\\'';
                }
                out += '\' ';
              }
              if (it.opts.verbose) {
                out += ' , schema: validate.schema' + ($schemaPath) + ' , parentSchema: validate.schema' + (it.schemaPath) + ' , data: ' + ($data) + ' ';
              }
              out += ' } ';
            } else {
              out += ' {} ';
            }
            out += ';  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; } ';
          }
        }
      }
    }
    it.errorPath = $currentErrorPath;
  } else if ($breakOnError) {
    out += ' if (true) {';
  }
  return out;
}


/***/ }),

/***/ 4995:
/***/ ((module) => {

"use strict";

module.exports = function generate_uniqueItems(it, $keyword, $ruleType) {
  var out = ' ';
  var $lvl = it.level;
  var $dataLvl = it.dataLevel;
  var $schema = it.schema[$keyword];
  var $schemaPath = it.schemaPath + it.util.getProperty($keyword);
  var $errSchemaPath = it.errSchemaPath + '/' + $keyword;
  var $breakOnError = !it.opts.allErrors;
  var $data = 'data' + ($dataLvl || '');
  var $valid = 'valid' + $lvl;
  var $isData = it.opts.$data && $schema && $schema.$data,
    $schemaValue;
  if ($isData) {
    out += ' var schema' + ($lvl) + ' = ' + (it.util.getData($schema.$data, $dataLvl, it.dataPathArr)) + '; ';
    $schemaValue = 'schema' + $lvl;
  } else {
    $schemaValue = $schema;
  }
  if (($schema || $isData) && it.opts.uniqueItems !== false) {
    if ($isData) {
      out += ' var ' + ($valid) + '; if (' + ($schemaValue) + ' === false || ' + ($schemaValue) + ' === undefined) ' + ($valid) + ' = true; else if (typeof ' + ($schemaValue) + ' != \'boolean\') ' + ($valid) + ' = false; else { ';
    }
    out += ' var i = ' + ($data) + '.length , ' + ($valid) + ' = true , j; if (i > 1) { ';
    var $itemType = it.schema.items && it.schema.items.type,
      $typeIsArray = Array.isArray($itemType);
    if (!$itemType || $itemType == 'object' || $itemType == 'array' || ($typeIsArray && ($itemType.indexOf('object') >= 0 || $itemType.indexOf('array') >= 0))) {
      out += ' outer: for (;i--;) { for (j = i; j--;) { if (equal(' + ($data) + '[i], ' + ($data) + '[j])) { ' + ($valid) + ' = false; break outer; } } } ';
    } else {
      out += ' var itemIndices = {}, item; for (;i--;) { var item = ' + ($data) + '[i]; ';
      var $method = 'checkDataType' + ($typeIsArray ? 's' : '');
      out += ' if (' + (it.util[$method]($itemType, 'item', it.opts.strictNumbers, true)) + ') continue; ';
      if ($typeIsArray) {
        out += ' if (typeof item == \'string\') item = \'"\' + item; ';
      }
      out += ' if (typeof itemIndices[item] == \'number\') { ' + ($valid) + ' = false; j = itemIndices[item]; break; } itemIndices[item] = i; } ';
    }
    out += ' } ';
    if ($isData) {
      out += '  }  ';
    }
    out += ' if (!' + ($valid) + ') {   ';
    var $$outStack = $$outStack || [];
    $$outStack.push(out);
    out = ''; /* istanbul ignore else */
    if (it.createErrors !== false) {
      out += ' { keyword: \'' + ('uniqueItems') + '\' , dataPath: (dataPath || \'\') + ' + (it.errorPath) + ' , schemaPath: ' + (it.util.toQuotedString($errSchemaPath)) + ' , params: { i: i, j: j } ';
      if (it.opts.messages !== false) {
        out += ' , message: \'should NOT have duplicate items (items ## \' + j + \' and \' + i + \' are identical)\' ';
      }
      if (it.opts.verbose) {
        out += ' , schema:  ';
        if ($isData) {
          out += 'validate.schema' + ($schemaPath);
        } else {
          out += '' + ($schema);
        }
        out += '         , parentSchema: validate.schema' + (it.schemaPath) + ' , data: ' + ($data) + ' ';
      }
      out += ' } ';
    } else {
      out += ' {} ';
    }
    var __err = out;
    out = $$outStack.pop();
    if (!it.compositeRule && $breakOnError) {
      /* istanbul ignore if */
      if (it.async) {
        out += ' throw new ValidationError([' + (__err) + ']); ';
      } else {
        out += ' validate.errors = [' + (__err) + ']; return false; ';
      }
    } else {
      out += ' var err = ' + (__err) + ';  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ';
    }
    out += ' } ';
    if ($breakOnError) {
      out += ' else { ';
    }
  } else {
    if ($breakOnError) {
      out += ' if (true) { ';
    }
  }
  return out;
}


/***/ }),

/***/ 9585:
/***/ ((module) => {

"use strict";

module.exports = function generate_validate(it, $keyword, $ruleType) {
  var out = '';
  var $async = it.schema.$async === true,
    $refKeywords = it.util.schemaHasRulesExcept(it.schema, it.RULES.all, '$ref'),
    $id = it.self._getId(it.schema);
  if (it.opts.strictKeywords) {
    var $unknownKwd = it.util.schemaUnknownRules(it.schema, it.RULES.keywords);
    if ($unknownKwd) {
      var $keywordsMsg = 'unknown keyword: ' + $unknownKwd;
      if (it.opts.strictKeywords === 'log') it.logger.warn($keywordsMsg);
      else throw new Error($keywordsMsg);
    }
  }
  if (it.isTop) {
    out += ' var validate = ';
    if ($async) {
      it.async = true;
      out += 'async ';
    }
    out += 'function(data, dataPath, parentData, parentDataProperty, rootData) { \'use strict\'; ';
    if ($id && (it.opts.sourceCode || it.opts.processCode)) {
      out += ' ' + ('/\*# sourceURL=' + $id + ' */') + ' ';
    }
  }
  if (typeof it.schema == 'boolean' || !($refKeywords || it.schema.$ref)) {
    var $keyword = 'false schema';
    var $lvl = it.level;
    var $dataLvl = it.dataLevel;
    var $schema = it.schema[$keyword];
    var $schemaPath = it.schemaPath + it.util.getProperty($keyword);
    var $errSchemaPath = it.errSchemaPath + '/' + $keyword;
    var $breakOnError = !it.opts.allErrors;
    var $errorKeyword;
    var $data = 'data' + ($dataLvl || '');
    var $valid = 'valid' + $lvl;
    if (it.schema === false) {
      if (it.isTop) {
        $breakOnError = true;
      } else {
        out += ' var ' + ($valid) + ' = false; ';
      }
      var $$outStack = $$outStack || [];
      $$outStack.push(out);
      out = ''; /* istanbul ignore else */
      if (it.createErrors !== false) {
        out += ' { keyword: \'' + ($errorKeyword || 'false schema') + '\' , dataPath: (dataPath || \'\') + ' + (it.errorPath) + ' , schemaPath: ' + (it.util.toQuotedString($errSchemaPath)) + ' , params: {} ';
        if (it.opts.messages !== false) {
          out += ' , message: \'boolean schema is false\' ';
        }
        if (it.opts.verbose) {
          out += ' , schema: false , parentSchema: validate.schema' + (it.schemaPath) + ' , data: ' + ($data) + ' ';
        }
        out += ' } ';
      } else {
        out += ' {} ';
      }
      var __err = out;
      out = $$outStack.pop();
      if (!it.compositeRule && $breakOnError) {
        /* istanbul ignore if */
        if (it.async) {
          out += ' throw new ValidationError([' + (__err) + ']); ';
        } else {
          out += ' validate.errors = [' + (__err) + ']; return false; ';
        }
      } else {
        out += ' var err = ' + (__err) + ';  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ';
      }
    } else {
      if (it.isTop) {
        if ($async) {
          out += ' return data; ';
        } else {
          out += ' validate.errors = null; return true; ';
        }
      } else {
        out += ' var ' + ($valid) + ' = true; ';
      }
    }
    if (it.isTop) {
      out += ' }; return validate; ';
    }
    return out;
  }
  if (it.isTop) {
    var $top = it.isTop,
      $lvl = it.level = 0,
      $dataLvl = it.dataLevel = 0,
      $data = 'data';
    it.rootId = it.resolve.fullPath(it.self._getId(it.root.schema));
    it.baseId = it.baseId || it.rootId;
    delete it.isTop;
    it.dataPathArr = [""];
    if (it.schema.default !== undefined && it.opts.useDefaults && it.opts.strictDefaults) {
      var $defaultMsg = 'default is ignored in the schema root';
      if (it.opts.strictDefaults === 'log') it.logger.warn($defaultMsg);
      else throw new Error($defaultMsg);
    }
    out += ' var vErrors = null; ';
    out += ' var errors = 0;     ';
    out += ' if (rootData === undefined) rootData = data; ';
  } else {
    var $lvl = it.level,
      $dataLvl = it.dataLevel,
      $data = 'data' + ($dataLvl || '');
    if ($id) it.baseId = it.resolve.url(it.baseId, $id);
    if ($async && !it.async) throw new Error('async schema in sync schema');
    out += ' var errs_' + ($lvl) + ' = errors;';
  }
  var $valid = 'valid' + $lvl,
    $breakOnError = !it.opts.allErrors,
    $closingBraces1 = '',
    $closingBraces2 = '';
  var $errorKeyword;
  var $typeSchema = it.schema.type,
    $typeIsArray = Array.isArray($typeSchema);
  if ($typeSchema && it.opts.nullable && it.schema.nullable === true) {
    if ($typeIsArray) {
      if ($typeSchema.indexOf('null') == -1) $typeSchema = $typeSchema.concat('null');
    } else if ($typeSchema != 'null') {
      $typeSchema = [$typeSchema, 'null'];
      $typeIsArray = true;
    }
  }
  if ($typeIsArray && $typeSchema.length == 1) {
    $typeSchema = $typeSchema[0];
    $typeIsArray = false;
  }
  if (it.schema.$ref && $refKeywords) {
    if (it.opts.extendRefs == 'fail') {
      throw new Error('$ref: validation keywords used in schema at path "' + it.errSchemaPath + '" (see option extendRefs)');
    } else if (it.opts.extendRefs !== true) {
      $refKeywords = false;
      it.logger.warn('$ref: keywords ignored in schema at path "' + it.errSchemaPath + '"');
    }
  }
  if (it.schema.$comment && it.opts.$comment) {
    out += ' ' + (it.RULES.all.$comment.code(it, '$comment'));
  }
  if ($typeSchema) {
    if (it.opts.coerceTypes) {
      var $coerceToTypes = it.util.coerceToTypes(it.opts.coerceTypes, $typeSchema);
    }
    var $rulesGroup = it.RULES.types[$typeSchema];
    if ($coerceToTypes || $typeIsArray || $rulesGroup === true || ($rulesGroup && !$shouldUseGroup($rulesGroup))) {
      var $schemaPath = it.schemaPath + '.type',
        $errSchemaPath = it.errSchemaPath + '/type';
      var $schemaPath = it.schemaPath + '.type',
        $errSchemaPath = it.errSchemaPath + '/type',
        $method = $typeIsArray ? 'checkDataTypes' : 'checkDataType';
      out += ' if (' + (it.util[$method]($typeSchema, $data, it.opts.strictNumbers, true)) + ') { ';
      if ($coerceToTypes) {
        var $dataType = 'dataType' + $lvl,
          $coerced = 'coerced' + $lvl;
        out += ' var ' + ($dataType) + ' = typeof ' + ($data) + '; var ' + ($coerced) + ' = undefined; ';
        if (it.opts.coerceTypes == 'array') {
          out += ' if (' + ($dataType) + ' == \'object\' && Array.isArray(' + ($data) + ') && ' + ($data) + '.length == 1) { ' + ($data) + ' = ' + ($data) + '[0]; ' + ($dataType) + ' = typeof ' + ($data) + '; if (' + (it.util.checkDataType(it.schema.type, $data, it.opts.strictNumbers)) + ') ' + ($coerced) + ' = ' + ($data) + '; } ';
        }
        out += ' if (' + ($coerced) + ' !== undefined) ; ';
        var arr1 = $coerceToTypes;
        if (arr1) {
          var $type, $i = -1,
            l1 = arr1.length - 1;
          while ($i < l1) {
            $type = arr1[$i += 1];
            if ($type == 'string') {
              out += ' else if (' + ($dataType) + ' == \'number\' || ' + ($dataType) + ' == \'boolean\') ' + ($coerced) + ' = \'\' + ' + ($data) + '; else if (' + ($data) + ' === null) ' + ($coerced) + ' = \'\'; ';
            } else if ($type == 'number' || $type == 'integer') {
              out += ' else if (' + ($dataType) + ' == \'boolean\' || ' + ($data) + ' === null || (' + ($dataType) + ' == \'string\' && ' + ($data) + ' && ' + ($data) + ' == +' + ($data) + ' ';
              if ($type == 'integer') {
                out += ' && !(' + ($data) + ' % 1)';
              }
              out += ')) ' + ($coerced) + ' = +' + ($data) + '; ';
            } else if ($type == 'boolean') {
              out += ' else if (' + ($data) + ' === \'false\' || ' + ($data) + ' === 0 || ' + ($data) + ' === null) ' + ($coerced) + ' = false; else if (' + ($data) + ' === \'true\' || ' + ($data) + ' === 1) ' + ($coerced) + ' = true; ';
            } else if ($type == 'null') {
              out += ' else if (' + ($data) + ' === \'\' || ' + ($data) + ' === 0 || ' + ($data) + ' === false) ' + ($coerced) + ' = null; ';
            } else if (it.opts.coerceTypes == 'array' && $type == 'array') {
              out += ' else if (' + ($dataType) + ' == \'string\' || ' + ($dataType) + ' == \'number\' || ' + ($dataType) + ' == \'boolean\' || ' + ($data) + ' == null) ' + ($coerced) + ' = [' + ($data) + ']; ';
            }
          }
        }
        out += ' else {   ';
        var $$outStack = $$outStack || [];
        $$outStack.push(out);
        out = ''; /* istanbul ignore else */
        if (it.createErrors !== false) {
          out += ' { keyword: \'' + ($errorKeyword || 'type') + '\' , dataPath: (dataPath || \'\') + ' + (it.errorPath) + ' , schemaPath: ' + (it.util.toQuotedString($errSchemaPath)) + ' , params: { type: \'';
          if ($typeIsArray) {
            out += '' + ($typeSchema.join(","));
          } else {
            out += '' + ($typeSchema);
          }
          out += '\' } ';
          if (it.opts.messages !== false) {
            out += ' , message: \'should be ';
            if ($typeIsArray) {
              out += '' + ($typeSchema.join(","));
            } else {
              out += '' + ($typeSchema);
            }
            out += '\' ';
          }
          if (it.opts.verbose) {
            out += ' , schema: validate.schema' + ($schemaPath) + ' , parentSchema: validate.schema' + (it.schemaPath) + ' , data: ' + ($data) + ' ';
          }
          out += ' } ';
        } else {
          out += ' {} ';
        }
        var __err = out;
        out = $$outStack.pop();
        if (!it.compositeRule && $breakOnError) {
          /* istanbul ignore if */
          if (it.async) {
            out += ' throw new ValidationError([' + (__err) + ']); ';
          } else {
            out += ' validate.errors = [' + (__err) + ']; return false; ';
          }
        } else {
          out += ' var err = ' + (__err) + ';  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ';
        }
        out += ' } if (' + ($coerced) + ' !== undefined) {  ';
        var $parentData = $dataLvl ? 'data' + (($dataLvl - 1) || '') : 'parentData',
          $parentDataProperty = $dataLvl ? it.dataPathArr[$dataLvl] : 'parentDataProperty';
        out += ' ' + ($data) + ' = ' + ($coerced) + '; ';
        if (!$dataLvl) {
          out += 'if (' + ($parentData) + ' !== undefined)';
        }
        out += ' ' + ($parentData) + '[' + ($parentDataProperty) + '] = ' + ($coerced) + '; } ';
      } else {
        var $$outStack = $$outStack || [];
        $$outStack.push(out);
        out = ''; /* istanbul ignore else */
        if (it.createErrors !== false) {
          out += ' { keyword: \'' + ($errorKeyword || 'type') + '\' , dataPath: (dataPath || \'\') + ' + (it.errorPath) + ' , schemaPath: ' + (it.util.toQuotedString($errSchemaPath)) + ' , params: { type: \'';
          if ($typeIsArray) {
            out += '' + ($typeSchema.join(","));
          } else {
            out += '' + ($typeSchema);
          }
          out += '\' } ';
          if (it.opts.messages !== false) {
            out += ' , message: \'should be ';
            if ($typeIsArray) {
              out += '' + ($typeSchema.join(","));
            } else {
              out += '' + ($typeSchema);
            }
            out += '\' ';
          }
          if (it.opts.verbose) {
            out += ' , schema: validate.schema' + ($schemaPath) + ' , parentSchema: validate.schema' + (it.schemaPath) + ' , data: ' + ($data) + ' ';
          }
          out += ' } ';
        } else {
          out += ' {} ';
        }
        var __err = out;
        out = $$outStack.pop();
        if (!it.compositeRule && $breakOnError) {
          /* istanbul ignore if */
          if (it.async) {
            out += ' throw new ValidationError([' + (__err) + ']); ';
          } else {
            out += ' validate.errors = [' + (__err) + ']; return false; ';
          }
        } else {
          out += ' var err = ' + (__err) + ';  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ';
        }
      }
      out += ' } ';
    }
  }
  if (it.schema.$ref && !$refKeywords) {
    out += ' ' + (it.RULES.all.$ref.code(it, '$ref')) + ' ';
    if ($breakOnError) {
      out += ' } if (errors === ';
      if ($top) {
        out += '0';
      } else {
        out += 'errs_' + ($lvl);
      }
      out += ') { ';
      $closingBraces2 += '}';
    }
  } else {
    var arr2 = it.RULES;
    if (arr2) {
      var $rulesGroup, i2 = -1,
        l2 = arr2.length - 1;
      while (i2 < l2) {
        $rulesGroup = arr2[i2 += 1];
        if ($shouldUseGroup($rulesGroup)) {
          if ($rulesGroup.type) {
            out += ' if (' + (it.util.checkDataType($rulesGroup.type, $data, it.opts.strictNumbers)) + ') { ';
          }
          if (it.opts.useDefaults) {
            if ($rulesGroup.type == 'object' && it.schema.properties) {
              var $schema = it.schema.properties,
                $schemaKeys = Object.keys($schema);
              var arr3 = $schemaKeys;
              if (arr3) {
                var $propertyKey, i3 = -1,
                  l3 = arr3.length - 1;
                while (i3 < l3) {
                  $propertyKey = arr3[i3 += 1];
                  var $sch = $schema[$propertyKey];
                  if ($sch.default !== undefined) {
                    var $passData = $data + it.util.getProperty($propertyKey);
                    if (it.compositeRule) {
                      if (it.opts.strictDefaults) {
                        var $defaultMsg = 'default is ignored for: ' + $passData;
                        if (it.opts.strictDefaults === 'log') it.logger.warn($defaultMsg);
                        else throw new Error($defaultMsg);
                      }
                    } else {
                      out += ' if (' + ($passData) + ' === undefined ';
                      if (it.opts.useDefaults == 'empty') {
                        out += ' || ' + ($passData) + ' === null || ' + ($passData) + ' === \'\' ';
                      }
                      out += ' ) ' + ($passData) + ' = ';
                      if (it.opts.useDefaults == 'shared') {
                        out += ' ' + (it.useDefault($sch.default)) + ' ';
                      } else {
                        out += ' ' + (JSON.stringify($sch.default)) + ' ';
                      }
                      out += '; ';
                    }
                  }
                }
              }
            } else if ($rulesGroup.type == 'array' && Array.isArray(it.schema.items)) {
              var arr4 = it.schema.items;
              if (arr4) {
                var $sch, $i = -1,
                  l4 = arr4.length - 1;
                while ($i < l4) {
                  $sch = arr4[$i += 1];
                  if ($sch.default !== undefined) {
                    var $passData = $data + '[' + $i + ']';
                    if (it.compositeRule) {
                      if (it.opts.strictDefaults) {
                        var $defaultMsg = 'default is ignored for: ' + $passData;
                        if (it.opts.strictDefaults === 'log') it.logger.warn($defaultMsg);
                        else throw new Error($defaultMsg);
                      }
                    } else {
                      out += ' if (' + ($passData) + ' === undefined ';
                      if (it.opts.useDefaults == 'empty') {
                        out += ' || ' + ($passData) + ' === null || ' + ($passData) + ' === \'\' ';
                      }
                      out += ' ) ' + ($passData) + ' = ';
                      if (it.opts.useDefaults == 'shared') {
                        out += ' ' + (it.useDefault($sch.default)) + ' ';
                      } else {
                        out += ' ' + (JSON.stringify($sch.default)) + ' ';
                      }
                      out += '; ';
                    }
                  }
                }
              }
            }
          }
          var arr5 = $rulesGroup.rules;
          if (arr5) {
            var $rule, i5 = -1,
              l5 = arr5.length - 1;
            while (i5 < l5) {
              $rule = arr5[i5 += 1];
              if ($shouldUseRule($rule)) {
                var $code = $rule.code(it, $rule.keyword, $rulesGroup.type);
                if ($code) {
                  out += ' ' + ($code) + ' ';
                  if ($breakOnError) {
                    $closingBraces1 += '}';
                  }
                }
              }
            }
          }
          if ($breakOnError) {
            out += ' ' + ($closingBraces1) + ' ';
            $closingBraces1 = '';
          }
          if ($rulesGroup.type) {
            out += ' } ';
            if ($typeSchema && $typeSchema === $rulesGroup.type && !$coerceToTypes) {
              out += ' else { ';
              var $schemaPath = it.schemaPath + '.type',
                $errSchemaPath = it.errSchemaPath + '/type';
              var $$outStack = $$outStack || [];
              $$outStack.push(out);
              out = ''; /* istanbul ignore else */
              if (it.createErrors !== false) {
                out += ' { keyword: \'' + ($errorKeyword || 'type') + '\' , dataPath: (dataPath || \'\') + ' + (it.errorPath) + ' , schemaPath: ' + (it.util.toQuotedString($errSchemaPath)) + ' , params: { type: \'';
                if ($typeIsArray) {
                  out += '' + ($typeSchema.join(","));
                } else {
                  out += '' + ($typeSchema);
                }
                out += '\' } ';
                if (it.opts.messages !== false) {
                  out += ' , message: \'should be ';
                  if ($typeIsArray) {
                    out += '' + ($typeSchema.join(","));
                  } else {
                    out += '' + ($typeSchema);
                  }
                  out += '\' ';
                }
                if (it.opts.verbose) {
                  out += ' , schema: validate.schema' + ($schemaPath) + ' , parentSchema: validate.schema' + (it.schemaPath) + ' , data: ' + ($data) + ' ';
                }
                out += ' } ';
              } else {
                out += ' {} ';
              }
              var __err = out;
              out = $$outStack.pop();
              if (!it.compositeRule && $breakOnError) {
                /* istanbul ignore if */
                if (it.async) {
                  out += ' throw new ValidationError([' + (__err) + ']); ';
                } else {
                  out += ' validate.errors = [' + (__err) + ']; return false; ';
                }
              } else {
                out += ' var err = ' + (__err) + ';  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ';
              }
              out += ' } ';
            }
          }
          if ($breakOnError) {
            out += ' if (errors === ';
            if ($top) {
              out += '0';
            } else {
              out += 'errs_' + ($lvl);
            }
            out += ') { ';
            $closingBraces2 += '}';
          }
        }
      }
    }
  }
  if ($breakOnError) {
    out += ' ' + ($closingBraces2) + ' ';
  }
  if ($top) {
    if ($async) {
      out += ' if (errors === 0) return data;           ';
      out += ' else throw new ValidationError(vErrors); ';
    } else {
      out += ' validate.errors = vErrors; ';
      out += ' return errors === 0;       ';
    }
    out += ' }; return validate;';
  } else {
    out += ' var ' + ($valid) + ' = errors === errs_' + ($lvl) + ';';
  }

  function $shouldUseGroup($rulesGroup) {
    var rules = $rulesGroup.rules;
    for (var i = 0; i < rules.length; i++)
      if ($shouldUseRule(rules[i])) return true;
  }

  function $shouldUseRule($rule) {
    return it.schema[$rule.keyword] !== undefined || ($rule.implements && $ruleImplementsSomeKeyword($rule));
  }

  function $ruleImplementsSomeKeyword($rule) {
    var impl = $rule.implements;
    for (var i = 0; i < impl.length; i++)
      if (it.schema[impl[i]] !== undefined) return true;
  }
  return out;
}


/***/ }),

/***/ 3297:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var IDENTIFIER = /^[a-z_$][a-z0-9_$-]*$/i;
var customRuleCode = __webpack_require__(5912);
var definitionSchema = __webpack_require__(458);

module.exports = {
  add: addKeyword,
  get: getKeyword,
  remove: removeKeyword,
  validate: validateKeyword
};


/**
 * Define custom keyword
 * @this  Ajv
 * @param {String} keyword custom keyword, should be unique (including different from all standard, custom and macro keywords).
 * @param {Object} definition keyword definition object with properties `type` (type(s) which the keyword applies to), `validate` or `compile`.
 * @return {Ajv} this for method chaining
 */
function addKeyword(keyword, definition) {
  /* jshint validthis: true */
  /* eslint no-shadow: 0 */
  var RULES = this.RULES;
  if (RULES.keywords[keyword])
    throw new Error('Keyword ' + keyword + ' is already defined');

  if (!IDENTIFIER.test(keyword))
    throw new Error('Keyword ' + keyword + ' is not a valid identifier');

  if (definition) {
    this.validateKeyword(definition, true);

    var dataType = definition.type;
    if (Array.isArray(dataType)) {
      for (var i=0; i<dataType.length; i++)
        _addRule(keyword, dataType[i], definition);
    } else {
      _addRule(keyword, dataType, definition);
    }

    var metaSchema = definition.metaSchema;
    if (metaSchema) {
      if (definition.$data && this._opts.$data) {
        metaSchema = {
          anyOf: [
            metaSchema,
            { '$ref': 'https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/data.json#' }
          ]
        };
      }
      definition.validateSchema = this.compile(metaSchema, true);
    }
  }

  RULES.keywords[keyword] = RULES.all[keyword] = true;


  function _addRule(keyword, dataType, definition) {
    var ruleGroup;
    for (var i=0; i<RULES.length; i++) {
      var rg = RULES[i];
      if (rg.type == dataType) {
        ruleGroup = rg;
        break;
      }
    }

    if (!ruleGroup) {
      ruleGroup = { type: dataType, rules: [] };
      RULES.push(ruleGroup);
    }

    var rule = {
      keyword: keyword,
      definition: definition,
      custom: true,
      code: customRuleCode,
      implements: definition.implements
    };
    ruleGroup.rules.push(rule);
    RULES.custom[keyword] = rule;
  }

  return this;
}


/**
 * Get keyword
 * @this  Ajv
 * @param {String} keyword pre-defined or custom keyword.
 * @return {Object|Boolean} custom keyword definition, `true` if it is a predefined keyword, `false` otherwise.
 */
function getKeyword(keyword) {
  /* jshint validthis: true */
  var rule = this.RULES.custom[keyword];
  return rule ? rule.definition : this.RULES.keywords[keyword] || false;
}


/**
 * Remove keyword
 * @this  Ajv
 * @param {String} keyword pre-defined or custom keyword.
 * @return {Ajv} this for method chaining
 */
function removeKeyword(keyword) {
  /* jshint validthis: true */
  var RULES = this.RULES;
  delete RULES.keywords[keyword];
  delete RULES.all[keyword];
  delete RULES.custom[keyword];
  for (var i=0; i<RULES.length; i++) {
    var rules = RULES[i].rules;
    for (var j=0; j<rules.length; j++) {
      if (rules[j].keyword == keyword) {
        rules.splice(j, 1);
        break;
      }
    }
  }
  return this;
}


/**
 * Validate keyword definition
 * @this  Ajv
 * @param {Object} definition keyword definition object.
 * @param {Boolean} throwError true to throw exception if definition is invalid
 * @return {boolean} validation result
 */
function validateKeyword(definition, throwError) {
  validateKeyword.errors = null;
  var v = this._validateKeyword = this._validateKeyword
                                  || this.compile(definitionSchema, true);

  if (v(definition)) return true;
  validateKeyword.errors = v.errors;
  if (throwError)
    throw new Error('custom keyword definition is invalid: '  + this.errorsText(v.errors));
  else
    return false;
}


/***/ }),

/***/ 2068:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/* module decorator */ module = __webpack_require__.nmd(module);

const colorConvert = __webpack_require__(6931);

const wrapAnsi16 = (fn, offset) => function () {
	const code = fn.apply(colorConvert, arguments);
	return `\u001B[${code + offset}m`;
};

const wrapAnsi256 = (fn, offset) => function () {
	const code = fn.apply(colorConvert, arguments);
	return `\u001B[${38 + offset};5;${code}m`;
};

const wrapAnsi16m = (fn, offset) => function () {
	const rgb = fn.apply(colorConvert, arguments);
	return `\u001B[${38 + offset};2;${rgb[0]};${rgb[1]};${rgb[2]}m`;
};

function assembleStyles() {
	const codes = new Map();
	const styles = {
		modifier: {
			reset: [0, 0],
			// 21 isn't widely supported and 22 does the same thing
			bold: [1, 22],
			dim: [2, 22],
			italic: [3, 23],
			underline: [4, 24],
			inverse: [7, 27],
			hidden: [8, 28],
			strikethrough: [9, 29]
		},
		color: {
			black: [30, 39],
			red: [31, 39],
			green: [32, 39],
			yellow: [33, 39],
			blue: [34, 39],
			magenta: [35, 39],
			cyan: [36, 39],
			white: [37, 39],
			gray: [90, 39],

			// Bright color
			redBright: [91, 39],
			greenBright: [92, 39],
			yellowBright: [93, 39],
			blueBright: [94, 39],
			magentaBright: [95, 39],
			cyanBright: [96, 39],
			whiteBright: [97, 39]
		},
		bgColor: {
			bgBlack: [40, 49],
			bgRed: [41, 49],
			bgGreen: [42, 49],
			bgYellow: [43, 49],
			bgBlue: [44, 49],
			bgMagenta: [45, 49],
			bgCyan: [46, 49],
			bgWhite: [47, 49],

			// Bright color
			bgBlackBright: [100, 49],
			bgRedBright: [101, 49],
			bgGreenBright: [102, 49],
			bgYellowBright: [103, 49],
			bgBlueBright: [104, 49],
			bgMagentaBright: [105, 49],
			bgCyanBright: [106, 49],
			bgWhiteBright: [107, 49]
		}
	};

	// Fix humans
	styles.color.grey = styles.color.gray;

	for (const groupName of Object.keys(styles)) {
		const group = styles[groupName];

		for (const styleName of Object.keys(group)) {
			const style = group[styleName];

			styles[styleName] = {
				open: `\u001B[${style[0]}m`,
				close: `\u001B[${style[1]}m`
			};

			group[styleName] = styles[styleName];

			codes.set(style[0], style[1]);
		}

		Object.defineProperty(styles, groupName, {
			value: group,
			enumerable: false
		});

		Object.defineProperty(styles, 'codes', {
			value: codes,
			enumerable: false
		});
	}

	const ansi2ansi = n => n;
	const rgb2rgb = (r, g, b) => [r, g, b];

	styles.color.close = '\u001B[39m';
	styles.bgColor.close = '\u001B[49m';

	styles.color.ansi = {
		ansi: wrapAnsi16(ansi2ansi, 0)
	};
	styles.color.ansi256 = {
		ansi256: wrapAnsi256(ansi2ansi, 0)
	};
	styles.color.ansi16m = {
		rgb: wrapAnsi16m(rgb2rgb, 0)
	};

	styles.bgColor.ansi = {
		ansi: wrapAnsi16(ansi2ansi, 10)
	};
	styles.bgColor.ansi256 = {
		ansi256: wrapAnsi256(ansi2ansi, 10)
	};
	styles.bgColor.ansi16m = {
		rgb: wrapAnsi16m(rgb2rgb, 10)
	};

	for (let key of Object.keys(colorConvert)) {
		if (typeof colorConvert[key] !== 'object') {
			continue;
		}

		const suite = colorConvert[key];

		if (key === 'ansi16') {
			key = 'ansi';
		}

		if ('ansi16' in suite) {
			styles.color.ansi[key] = wrapAnsi16(suite.ansi16, 0);
			styles.bgColor.ansi[key] = wrapAnsi16(suite.ansi16, 10);
		}

		if ('ansi256' in suite) {
			styles.color.ansi256[key] = wrapAnsi256(suite.ansi256, 0);
			styles.bgColor.ansi256[key] = wrapAnsi256(suite.ansi256, 10);
		}

		if ('rgb' in suite) {
			styles.color.ansi16m[key] = wrapAnsi16m(suite.rgb, 0);
			styles.bgColor.ansi16m[key] = wrapAnsi16m(suite.rgb, 10);
		}
	}

	return styles;
}

// Make the export immutable
Object.defineProperty(module, 'exports', {
	enumerable: true,
	get: assembleStyles
});


/***/ }),

/***/ 6545:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = __webpack_require__(2618);

/***/ }),

/***/ 8104:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(328);
var settle = __webpack_require__(3211);
var buildFullPath = __webpack_require__(1934);
var buildURL = __webpack_require__(646);
var http = __webpack_require__(8605);
var https = __webpack_require__(7211);
var httpFollow = __webpack_require__(7707).http;
var httpsFollow = __webpack_require__(7707).https;
var url = __webpack_require__(8835);
var zlib = __webpack_require__(8761);
var pkg = __webpack_require__(696);
var createError = __webpack_require__(5226);
var enhanceError = __webpack_require__(1516);

var isHttps = /https:?/;

/**
 *
 * @param {http.ClientRequestArgs} options
 * @param {AxiosProxyConfig} proxy
 * @param {string} location
 */
function setProxy(options, proxy, location) {
  options.hostname = proxy.host;
  options.host = proxy.host;
  options.port = proxy.port;
  options.path = location;

  // Basic proxy authorization
  if (proxy.auth) {
    var base64 = Buffer.from(proxy.auth.username + ':' + proxy.auth.password, 'utf8').toString('base64');
    options.headers['Proxy-Authorization'] = 'Basic ' + base64;
  }

  // If a proxy is used, any redirects must also pass through the proxy
  options.beforeRedirect = function beforeRedirect(redirection) {
    redirection.headers.host = redirection.host;
    setProxy(redirection, proxy, redirection.href);
  };
}

/*eslint consistent-return:0*/
module.exports = function httpAdapter(config) {
  return new Promise(function dispatchHttpRequest(resolvePromise, rejectPromise) {
    var resolve = function resolve(value) {
      resolvePromise(value);
    };
    var reject = function reject(value) {
      rejectPromise(value);
    };
    var data = config.data;
    var headers = config.headers;

    // Set User-Agent (required by some servers)
    // Only set header if it hasn't been set in config
    // See https://github.com/axios/axios/issues/69
    if (!headers['User-Agent'] && !headers['user-agent']) {
      headers['User-Agent'] = 'axios/' + pkg.version;
    }

    if (data && !utils.isStream(data)) {
      if (Buffer.isBuffer(data)) {
        // Nothing to do...
      } else if (utils.isArrayBuffer(data)) {
        data = Buffer.from(new Uint8Array(data));
      } else if (utils.isString(data)) {
        data = Buffer.from(data, 'utf-8');
      } else {
        return reject(createError(
          'Data after transformation must be a string, an ArrayBuffer, a Buffer, or a Stream',
          config
        ));
      }

      // Add Content-Length header if data exists
      headers['Content-Length'] = data.length;
    }

    // HTTP basic authentication
    var auth = undefined;
    if (config.auth) {
      var username = config.auth.username || '';
      var password = config.auth.password || '';
      auth = username + ':' + password;
    }

    // Parse url
    var fullPath = buildFullPath(config.baseURL, config.url);
    var parsed = url.parse(fullPath);
    var protocol = parsed.protocol || 'http:';

    if (!auth && parsed.auth) {
      var urlAuth = parsed.auth.split(':');
      var urlUsername = urlAuth[0] || '';
      var urlPassword = urlAuth[1] || '';
      auth = urlUsername + ':' + urlPassword;
    }

    if (auth) {
      delete headers.Authorization;
    }

    var isHttpsRequest = isHttps.test(protocol);
    var agent = isHttpsRequest ? config.httpsAgent : config.httpAgent;

    var options = {
      path: buildURL(parsed.path, config.params, config.paramsSerializer).replace(/^\?/, ''),
      method: config.method.toUpperCase(),
      headers: headers,
      agent: agent,
      agents: { http: config.httpAgent, https: config.httpsAgent },
      auth: auth
    };

    if (config.socketPath) {
      options.socketPath = config.socketPath;
    } else {
      options.hostname = parsed.hostname;
      options.port = parsed.port;
    }

    var proxy = config.proxy;
    if (!proxy && proxy !== false) {
      var proxyEnv = protocol.slice(0, -1) + '_proxy';
      var proxyUrl = process.env[proxyEnv] || process.env[proxyEnv.toUpperCase()];
      if (proxyUrl) {
        var parsedProxyUrl = url.parse(proxyUrl);
        var noProxyEnv = process.env.no_proxy || process.env.NO_PROXY;
        var shouldProxy = true;

        if (noProxyEnv) {
          var noProxy = noProxyEnv.split(',').map(function trim(s) {
            return s.trim();
          });

          shouldProxy = !noProxy.some(function proxyMatch(proxyElement) {
            if (!proxyElement) {
              return false;
            }
            if (proxyElement === '*') {
              return true;
            }
            if (proxyElement[0] === '.' &&
                parsed.hostname.substr(parsed.hostname.length - proxyElement.length) === proxyElement) {
              return true;
            }

            return parsed.hostname === proxyElement;
          });
        }

        if (shouldProxy) {
          proxy = {
            host: parsedProxyUrl.hostname,
            port: parsedProxyUrl.port,
            protocol: parsedProxyUrl.protocol
          };

          if (parsedProxyUrl.auth) {
            var proxyUrlAuth = parsedProxyUrl.auth.split(':');
            proxy.auth = {
              username: proxyUrlAuth[0],
              password: proxyUrlAuth[1]
            };
          }
        }
      }
    }

    if (proxy) {
      options.headers.host = parsed.hostname + (parsed.port ? ':' + parsed.port : '');
      setProxy(options, proxy, protocol + '//' + parsed.hostname + (parsed.port ? ':' + parsed.port : '') + options.path);
    }

    var transport;
    var isHttpsProxy = isHttpsRequest && (proxy ? isHttps.test(proxy.protocol) : true);
    if (config.transport) {
      transport = config.transport;
    } else if (config.maxRedirects === 0) {
      transport = isHttpsProxy ? https : http;
    } else {
      if (config.maxRedirects) {
        options.maxRedirects = config.maxRedirects;
      }
      transport = isHttpsProxy ? httpsFollow : httpFollow;
    }

    if (config.maxBodyLength > -1) {
      options.maxBodyLength = config.maxBodyLength;
    }

    // Create the request
    var req = transport.request(options, function handleResponse(res) {
      if (req.aborted) return;

      // uncompress the response body transparently if required
      var stream = res;

      // return the last request in case of redirects
      var lastRequest = res.req || req;


      // if no content, is HEAD request or decompress disabled we should not decompress
      if (res.statusCode !== 204 && lastRequest.method !== 'HEAD' && config.decompress !== false) {
        switch (res.headers['content-encoding']) {
        /*eslint default-case:0*/
        case 'gzip':
        case 'compress':
        case 'deflate':
        // add the unzipper to the body stream processing pipeline
          stream = stream.pipe(zlib.createUnzip());

          // remove the content-encoding in order to not confuse downstream operations
          delete res.headers['content-encoding'];
          break;
        }
      }

      var response = {
        status: res.statusCode,
        statusText: res.statusMessage,
        headers: res.headers,
        config: config,
        request: lastRequest
      };

      if (config.responseType === 'stream') {
        response.data = stream;
        settle(resolve, reject, response);
      } else {
        var responseBuffer = [];
        stream.on('data', function handleStreamData(chunk) {
          responseBuffer.push(chunk);

          // make sure the content length is not over the maxContentLength if specified
          if (config.maxContentLength > -1 && Buffer.concat(responseBuffer).length > config.maxContentLength) {
            stream.destroy();
            reject(createError('maxContentLength size of ' + config.maxContentLength + ' exceeded',
              config, null, lastRequest));
          }
        });

        stream.on('error', function handleStreamError(err) {
          if (req.aborted) return;
          reject(enhanceError(err, config, null, lastRequest));
        });

        stream.on('end', function handleStreamEnd() {
          var responseData = Buffer.concat(responseBuffer);
          if (config.responseType !== 'arraybuffer') {
            responseData = responseData.toString(config.responseEncoding);
            if (!config.responseEncoding || config.responseEncoding === 'utf8') {
              responseData = utils.stripBOM(responseData);
            }
          }

          response.data = responseData;
          settle(resolve, reject, response);
        });
      }
    });

    // Handle errors
    req.on('error', function handleRequestError(err) {
      if (req.aborted && err.code !== 'ERR_FR_TOO_MANY_REDIRECTS') return;
      reject(enhanceError(err, config, null, req));
    });

    // Handle request timeout
    if (config.timeout) {
      // Sometime, the response will be very slow, and does not respond, the connect event will be block by event loop system.
      // And timer callback will be fired, and abort() will be invoked before connection, then get "socket hang up" and code ECONNRESET.
      // At this time, if we have a large number of request, nodejs will hang up some socket on background. and the number will up and up.
      // And then these socket which be hang up will devoring CPU little by little.
      // ClientRequest.setTimeout will be fired on the specify milliseconds, and can make sure that abort() will be fired after connect.
      req.setTimeout(config.timeout, function handleRequestTimeout() {
        req.abort();
        reject(createError('timeout of ' + config.timeout + 'ms exceeded', config, 'ECONNABORTED', req));
      });
    }

    if (config.cancelToken) {
      // Handle cancellation
      config.cancelToken.promise.then(function onCanceled(cancel) {
        if (req.aborted) return;

        req.abort();
        reject(cancel);
      });
    }

    // Send the request
    if (utils.isStream(data)) {
      data.on('error', function handleStreamError(err) {
        reject(enhanceError(err, config, null, req));
      }).pipe(req);
    } else {
      req.end(data);
    }
  });
};


/***/ }),

/***/ 3454:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(328);
var settle = __webpack_require__(3211);
var cookies = __webpack_require__(1545);
var buildURL = __webpack_require__(646);
var buildFullPath = __webpack_require__(1934);
var parseHeaders = __webpack_require__(6455);
var isURLSameOrigin = __webpack_require__(3608);
var createError = __webpack_require__(5226);

module.exports = function xhrAdapter(config) {
  return new Promise(function dispatchXhrRequest(resolve, reject) {
    var requestData = config.data;
    var requestHeaders = config.headers;

    if (utils.isFormData(requestData)) {
      delete requestHeaders['Content-Type']; // Let the browser set it
    }

    var request = new XMLHttpRequest();

    // HTTP basic authentication
    if (config.auth) {
      var username = config.auth.username || '';
      var password = config.auth.password ? unescape(encodeURIComponent(config.auth.password)) : '';
      requestHeaders.Authorization = 'Basic ' + btoa(username + ':' + password);
    }

    var fullPath = buildFullPath(config.baseURL, config.url);
    request.open(config.method.toUpperCase(), buildURL(fullPath, config.params, config.paramsSerializer), true);

    // Set the request timeout in MS
    request.timeout = config.timeout;

    // Listen for ready state
    request.onreadystatechange = function handleLoad() {
      if (!request || request.readyState !== 4) {
        return;
      }

      // The request errored out and we didn't get a response, this will be
      // handled by onerror instead
      // With one exception: request that using file: protocol, most browsers
      // will return status as 0 even though it's a successful request
      if (request.status === 0 && !(request.responseURL && request.responseURL.indexOf('file:') === 0)) {
        return;
      }

      // Prepare the response
      var responseHeaders = 'getAllResponseHeaders' in request ? parseHeaders(request.getAllResponseHeaders()) : null;
      var responseData = !config.responseType || config.responseType === 'text' ? request.responseText : request.response;
      var response = {
        data: responseData,
        status: request.status,
        statusText: request.statusText,
        headers: responseHeaders,
        config: config,
        request: request
      };

      settle(resolve, reject, response);

      // Clean up request
      request = null;
    };

    // Handle browser request cancellation (as opposed to a manual cancellation)
    request.onabort = function handleAbort() {
      if (!request) {
        return;
      }

      reject(createError('Request aborted', config, 'ECONNABORTED', request));

      // Clean up request
      request = null;
    };

    // Handle low level network errors
    request.onerror = function handleError() {
      // Real errors are hidden from us by the browser
      // onerror should only fire if it's a network error
      reject(createError('Network Error', config, null, request));

      // Clean up request
      request = null;
    };

    // Handle timeout
    request.ontimeout = function handleTimeout() {
      var timeoutErrorMessage = 'timeout of ' + config.timeout + 'ms exceeded';
      if (config.timeoutErrorMessage) {
        timeoutErrorMessage = config.timeoutErrorMessage;
      }
      reject(createError(timeoutErrorMessage, config, 'ECONNABORTED',
        request));

      // Clean up request
      request = null;
    };

    // Add xsrf header
    // This is only done if running in a standard browser environment.
    // Specifically not if we're in a web worker, or react-native.
    if (utils.isStandardBrowserEnv()) {
      // Add xsrf header
      var xsrfValue = (config.withCredentials || isURLSameOrigin(fullPath)) && config.xsrfCookieName ?
        cookies.read(config.xsrfCookieName) :
        undefined;

      if (xsrfValue) {
        requestHeaders[config.xsrfHeaderName] = xsrfValue;
      }
    }

    // Add headers to the request
    if ('setRequestHeader' in request) {
      utils.forEach(requestHeaders, function setRequestHeader(val, key) {
        if (typeof requestData === 'undefined' && key.toLowerCase() === 'content-type') {
          // Remove Content-Type if data is undefined
          delete requestHeaders[key];
        } else {
          // Otherwise add header to the request
          request.setRequestHeader(key, val);
        }
      });
    }

    // Add withCredentials to request if needed
    if (!utils.isUndefined(config.withCredentials)) {
      request.withCredentials = !!config.withCredentials;
    }

    // Add responseType to request if needed
    if (config.responseType) {
      try {
        request.responseType = config.responseType;
      } catch (e) {
        // Expected DOMException thrown by browsers not compatible XMLHttpRequest Level 2.
        // But, this can be suppressed for 'json' type as it can be parsed by default 'transformResponse' function.
        if (config.responseType !== 'json') {
          throw e;
        }
      }
    }

    // Handle progress if needed
    if (typeof config.onDownloadProgress === 'function') {
      request.addEventListener('progress', config.onDownloadProgress);
    }

    // Not all browsers support upload events
    if (typeof config.onUploadProgress === 'function' && request.upload) {
      request.upload.addEventListener('progress', config.onUploadProgress);
    }

    if (config.cancelToken) {
      // Handle cancellation
      config.cancelToken.promise.then(function onCanceled(cancel) {
        if (!request) {
          return;
        }

        request.abort();
        reject(cancel);
        // Clean up request
        request = null;
      });
    }

    if (!requestData) {
      requestData = null;
    }

    // Send the request
    request.send(requestData);
  });
};


/***/ }),

/***/ 2618:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(328);
var bind = __webpack_require__(7065);
var Axios = __webpack_require__(8178);
var mergeConfig = __webpack_require__(4831);
var defaults = __webpack_require__(8190);

/**
 * Create an instance of Axios
 *
 * @param {Object} defaultConfig The default config for the instance
 * @return {Axios} A new instance of Axios
 */
function createInstance(defaultConfig) {
  var context = new Axios(defaultConfig);
  var instance = bind(Axios.prototype.request, context);

  // Copy axios.prototype to instance
  utils.extend(instance, Axios.prototype, context);

  // Copy context to instance
  utils.extend(instance, context);

  return instance;
}

// Create the default instance to be exported
var axios = createInstance(defaults);

// Expose Axios class to allow class inheritance
axios.Axios = Axios;

// Factory for creating new instances
axios.create = function create(instanceConfig) {
  return createInstance(mergeConfig(axios.defaults, instanceConfig));
};

// Expose Cancel & CancelToken
axios.Cancel = __webpack_require__(8875);
axios.CancelToken = __webpack_require__(1587);
axios.isCancel = __webpack_require__(4057);

// Expose all/spread
axios.all = function all(promises) {
  return Promise.all(promises);
};
axios.spread = __webpack_require__(4850);

// Expose isAxiosError
axios.isAxiosError = __webpack_require__(650);

module.exports = axios;

// Allow use of default import syntax in TypeScript
module.exports.default = axios;


/***/ }),

/***/ 8875:
/***/ ((module) => {

"use strict";


/**
 * A `Cancel` is an object that is thrown when an operation is canceled.
 *
 * @class
 * @param {string=} message The message.
 */
function Cancel(message) {
  this.message = message;
}

Cancel.prototype.toString = function toString() {
  return 'Cancel' + (this.message ? ': ' + this.message : '');
};

Cancel.prototype.__CANCEL__ = true;

module.exports = Cancel;


/***/ }),

/***/ 1587:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var Cancel = __webpack_require__(8875);

/**
 * A `CancelToken` is an object that can be used to request cancellation of an operation.
 *
 * @class
 * @param {Function} executor The executor function.
 */
function CancelToken(executor) {
  if (typeof executor !== 'function') {
    throw new TypeError('executor must be a function.');
  }

  var resolvePromise;
  this.promise = new Promise(function promiseExecutor(resolve) {
    resolvePromise = resolve;
  });

  var token = this;
  executor(function cancel(message) {
    if (token.reason) {
      // Cancellation has already been requested
      return;
    }

    token.reason = new Cancel(message);
    resolvePromise(token.reason);
  });
}

/**
 * Throws a `Cancel` if cancellation has been requested.
 */
CancelToken.prototype.throwIfRequested = function throwIfRequested() {
  if (this.reason) {
    throw this.reason;
  }
};

/**
 * Returns an object that contains a new `CancelToken` and a function that, when called,
 * cancels the `CancelToken`.
 */
CancelToken.source = function source() {
  var cancel;
  var token = new CancelToken(function executor(c) {
    cancel = c;
  });
  return {
    token: token,
    cancel: cancel
  };
};

module.exports = CancelToken;


/***/ }),

/***/ 4057:
/***/ ((module) => {

"use strict";


module.exports = function isCancel(value) {
  return !!(value && value.__CANCEL__);
};


/***/ }),

/***/ 8178:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(328);
var buildURL = __webpack_require__(646);
var InterceptorManager = __webpack_require__(3214);
var dispatchRequest = __webpack_require__(5062);
var mergeConfig = __webpack_require__(4831);

/**
 * Create a new instance of Axios
 *
 * @param {Object} instanceConfig The default config for the instance
 */
function Axios(instanceConfig) {
  this.defaults = instanceConfig;
  this.interceptors = {
    request: new InterceptorManager(),
    response: new InterceptorManager()
  };
}

/**
 * Dispatch a request
 *
 * @param {Object} config The config specific for this request (merged with this.defaults)
 */
Axios.prototype.request = function request(config) {
  /*eslint no-param-reassign:0*/
  // Allow for axios('example/url'[, config]) a la fetch API
  if (typeof config === 'string') {
    config = arguments[1] || {};
    config.url = arguments[0];
  } else {
    config = config || {};
  }

  config = mergeConfig(this.defaults, config);

  // Set config.method
  if (config.method) {
    config.method = config.method.toLowerCase();
  } else if (this.defaults.method) {
    config.method = this.defaults.method.toLowerCase();
  } else {
    config.method = 'get';
  }

  // Hook up interceptors middleware
  var chain = [dispatchRequest, undefined];
  var promise = Promise.resolve(config);

  this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
    chain.unshift(interceptor.fulfilled, interceptor.rejected);
  });

  this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
    chain.push(interceptor.fulfilled, interceptor.rejected);
  });

  while (chain.length) {
    promise = promise.then(chain.shift(), chain.shift());
  }

  return promise;
};

Axios.prototype.getUri = function getUri(config) {
  config = mergeConfig(this.defaults, config);
  return buildURL(config.url, config.params, config.paramsSerializer).replace(/^\?/, '');
};

// Provide aliases for supported request methods
utils.forEach(['delete', 'get', 'head', 'options'], function forEachMethodNoData(method) {
  /*eslint func-names:0*/
  Axios.prototype[method] = function(url, config) {
    return this.request(mergeConfig(config || {}, {
      method: method,
      url: url,
      data: (config || {}).data
    }));
  };
});

utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
  /*eslint func-names:0*/
  Axios.prototype[method] = function(url, data, config) {
    return this.request(mergeConfig(config || {}, {
      method: method,
      url: url,
      data: data
    }));
  };
});

module.exports = Axios;


/***/ }),

/***/ 3214:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(328);

function InterceptorManager() {
  this.handlers = [];
}

/**
 * Add a new interceptor to the stack
 *
 * @param {Function} fulfilled The function to handle `then` for a `Promise`
 * @param {Function} rejected The function to handle `reject` for a `Promise`
 *
 * @return {Number} An ID used to remove interceptor later
 */
InterceptorManager.prototype.use = function use(fulfilled, rejected) {
  this.handlers.push({
    fulfilled: fulfilled,
    rejected: rejected
  });
  return this.handlers.length - 1;
};

/**
 * Remove an interceptor from the stack
 *
 * @param {Number} id The ID that was returned by `use`
 */
InterceptorManager.prototype.eject = function eject(id) {
  if (this.handlers[id]) {
    this.handlers[id] = null;
  }
};

/**
 * Iterate over all the registered interceptors
 *
 * This method is particularly useful for skipping over any
 * interceptors that may have become `null` calling `eject`.
 *
 * @param {Function} fn The function to call for each interceptor
 */
InterceptorManager.prototype.forEach = function forEach(fn) {
  utils.forEach(this.handlers, function forEachHandler(h) {
    if (h !== null) {
      fn(h);
    }
  });
};

module.exports = InterceptorManager;


/***/ }),

/***/ 1934:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var isAbsoluteURL = __webpack_require__(1301);
var combineURLs = __webpack_require__(7189);

/**
 * Creates a new URL by combining the baseURL with the requestedURL,
 * only when the requestedURL is not already an absolute URL.
 * If the requestURL is absolute, this function returns the requestedURL untouched.
 *
 * @param {string} baseURL The base URL
 * @param {string} requestedURL Absolute or relative URL to combine
 * @returns {string} The combined full path
 */
module.exports = function buildFullPath(baseURL, requestedURL) {
  if (baseURL && !isAbsoluteURL(requestedURL)) {
    return combineURLs(baseURL, requestedURL);
  }
  return requestedURL;
};


/***/ }),

/***/ 5226:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var enhanceError = __webpack_require__(1516);

/**
 * Create an Error with the specified message, config, error code, request and response.
 *
 * @param {string} message The error message.
 * @param {Object} config The config.
 * @param {string} [code] The error code (for example, 'ECONNABORTED').
 * @param {Object} [request] The request.
 * @param {Object} [response] The response.
 * @returns {Error} The created error.
 */
module.exports = function createError(message, config, code, request, response) {
  var error = new Error(message);
  return enhanceError(error, config, code, request, response);
};


/***/ }),

/***/ 5062:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(328);
var transformData = __webpack_require__(9812);
var isCancel = __webpack_require__(4057);
var defaults = __webpack_require__(8190);

/**
 * Throws a `Cancel` if cancellation has been requested.
 */
function throwIfCancellationRequested(config) {
  if (config.cancelToken) {
    config.cancelToken.throwIfRequested();
  }
}

/**
 * Dispatch a request to the server using the configured adapter.
 *
 * @param {object} config The config that is to be used for the request
 * @returns {Promise} The Promise to be fulfilled
 */
module.exports = function dispatchRequest(config) {
  throwIfCancellationRequested(config);

  // Ensure headers exist
  config.headers = config.headers || {};

  // Transform request data
  config.data = transformData(
    config.data,
    config.headers,
    config.transformRequest
  );

  // Flatten headers
  config.headers = utils.merge(
    config.headers.common || {},
    config.headers[config.method] || {},
    config.headers
  );

  utils.forEach(
    ['delete', 'get', 'head', 'post', 'put', 'patch', 'common'],
    function cleanHeaderConfig(method) {
      delete config.headers[method];
    }
  );

  var adapter = config.adapter || defaults.adapter;

  return adapter(config).then(function onAdapterResolution(response) {
    throwIfCancellationRequested(config);

    // Transform response data
    response.data = transformData(
      response.data,
      response.headers,
      config.transformResponse
    );

    return response;
  }, function onAdapterRejection(reason) {
    if (!isCancel(reason)) {
      throwIfCancellationRequested(config);

      // Transform response data
      if (reason && reason.response) {
        reason.response.data = transformData(
          reason.response.data,
          reason.response.headers,
          config.transformResponse
        );
      }
    }

    return Promise.reject(reason);
  });
};


/***/ }),

/***/ 1516:
/***/ ((module) => {

"use strict";


/**
 * Update an Error with the specified config, error code, and response.
 *
 * @param {Error} error The error to update.
 * @param {Object} config The config.
 * @param {string} [code] The error code (for example, 'ECONNABORTED').
 * @param {Object} [request] The request.
 * @param {Object} [response] The response.
 * @returns {Error} The error.
 */
module.exports = function enhanceError(error, config, code, request, response) {
  error.config = config;
  if (code) {
    error.code = code;
  }

  error.request = request;
  error.response = response;
  error.isAxiosError = true;

  error.toJSON = function toJSON() {
    return {
      // Standard
      message: this.message,
      name: this.name,
      // Microsoft
      description: this.description,
      number: this.number,
      // Mozilla
      fileName: this.fileName,
      lineNumber: this.lineNumber,
      columnNumber: this.columnNumber,
      stack: this.stack,
      // Axios
      config: this.config,
      code: this.code
    };
  };
  return error;
};


/***/ }),

/***/ 4831:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(328);

/**
 * Config-specific merge-function which creates a new config-object
 * by merging two configuration objects together.
 *
 * @param {Object} config1
 * @param {Object} config2
 * @returns {Object} New object resulting from merging config2 to config1
 */
module.exports = function mergeConfig(config1, config2) {
  // eslint-disable-next-line no-param-reassign
  config2 = config2 || {};
  var config = {};

  var valueFromConfig2Keys = ['url', 'method', 'data'];
  var mergeDeepPropertiesKeys = ['headers', 'auth', 'proxy', 'params'];
  var defaultToConfig2Keys = [
    'baseURL', 'transformRequest', 'transformResponse', 'paramsSerializer',
    'timeout', 'timeoutMessage', 'withCredentials', 'adapter', 'responseType', 'xsrfCookieName',
    'xsrfHeaderName', 'onUploadProgress', 'onDownloadProgress', 'decompress',
    'maxContentLength', 'maxBodyLength', 'maxRedirects', 'transport', 'httpAgent',
    'httpsAgent', 'cancelToken', 'socketPath', 'responseEncoding'
  ];
  var directMergeKeys = ['validateStatus'];

  function getMergedValue(target, source) {
    if (utils.isPlainObject(target) && utils.isPlainObject(source)) {
      return utils.merge(target, source);
    } else if (utils.isPlainObject(source)) {
      return utils.merge({}, source);
    } else if (utils.isArray(source)) {
      return source.slice();
    }
    return source;
  }

  function mergeDeepProperties(prop) {
    if (!utils.isUndefined(config2[prop])) {
      config[prop] = getMergedValue(config1[prop], config2[prop]);
    } else if (!utils.isUndefined(config1[prop])) {
      config[prop] = getMergedValue(undefined, config1[prop]);
    }
  }

  utils.forEach(valueFromConfig2Keys, function valueFromConfig2(prop) {
    if (!utils.isUndefined(config2[prop])) {
      config[prop] = getMergedValue(undefined, config2[prop]);
    }
  });

  utils.forEach(mergeDeepPropertiesKeys, mergeDeepProperties);

  utils.forEach(defaultToConfig2Keys, function defaultToConfig2(prop) {
    if (!utils.isUndefined(config2[prop])) {
      config[prop] = getMergedValue(undefined, config2[prop]);
    } else if (!utils.isUndefined(config1[prop])) {
      config[prop] = getMergedValue(undefined, config1[prop]);
    }
  });

  utils.forEach(directMergeKeys, function merge(prop) {
    if (prop in config2) {
      config[prop] = getMergedValue(config1[prop], config2[prop]);
    } else if (prop in config1) {
      config[prop] = getMergedValue(undefined, config1[prop]);
    }
  });

  var axiosKeys = valueFromConfig2Keys
    .concat(mergeDeepPropertiesKeys)
    .concat(defaultToConfig2Keys)
    .concat(directMergeKeys);

  var otherKeys = Object
    .keys(config1)
    .concat(Object.keys(config2))
    .filter(function filterAxiosKeys(key) {
      return axiosKeys.indexOf(key) === -1;
    });

  utils.forEach(otherKeys, mergeDeepProperties);

  return config;
};


/***/ }),

/***/ 3211:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var createError = __webpack_require__(5226);

/**
 * Resolve or reject a Promise based on response status.
 *
 * @param {Function} resolve A function that resolves the promise.
 * @param {Function} reject A function that rejects the promise.
 * @param {object} response The response.
 */
module.exports = function settle(resolve, reject, response) {
  var validateStatus = response.config.validateStatus;
  if (!response.status || !validateStatus || validateStatus(response.status)) {
    resolve(response);
  } else {
    reject(createError(
      'Request failed with status code ' + response.status,
      response.config,
      null,
      response.request,
      response
    ));
  }
};


/***/ }),

/***/ 9812:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(328);

/**
 * Transform the data for a request or a response
 *
 * @param {Object|String} data The data to be transformed
 * @param {Array} headers The headers for the request or response
 * @param {Array|Function} fns A single function or Array of functions
 * @returns {*} The resulting transformed data
 */
module.exports = function transformData(data, headers, fns) {
  /*eslint no-param-reassign:0*/
  utils.forEach(fns, function transform(fn) {
    data = fn(data, headers);
  });

  return data;
};


/***/ }),

/***/ 8190:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(328);
var normalizeHeaderName = __webpack_require__(6240);

var DEFAULT_CONTENT_TYPE = {
  'Content-Type': 'application/x-www-form-urlencoded'
};

function setContentTypeIfUnset(headers, value) {
  if (!utils.isUndefined(headers) && utils.isUndefined(headers['Content-Type'])) {
    headers['Content-Type'] = value;
  }
}

function getDefaultAdapter() {
  var adapter;
  if (typeof XMLHttpRequest !== 'undefined') {
    // For browsers use XHR adapter
    adapter = __webpack_require__(3454);
  } else if (typeof process !== 'undefined' && Object.prototype.toString.call(process) === '[object process]') {
    // For node use HTTP adapter
    adapter = __webpack_require__(8104);
  }
  return adapter;
}

var defaults = {
  adapter: getDefaultAdapter(),

  transformRequest: [function transformRequest(data, headers) {
    normalizeHeaderName(headers, 'Accept');
    normalizeHeaderName(headers, 'Content-Type');
    if (utils.isFormData(data) ||
      utils.isArrayBuffer(data) ||
      utils.isBuffer(data) ||
      utils.isStream(data) ||
      utils.isFile(data) ||
      utils.isBlob(data)
    ) {
      return data;
    }
    if (utils.isArrayBufferView(data)) {
      return data.buffer;
    }
    if (utils.isURLSearchParams(data)) {
      setContentTypeIfUnset(headers, 'application/x-www-form-urlencoded;charset=utf-8');
      return data.toString();
    }
    if (utils.isObject(data)) {
      setContentTypeIfUnset(headers, 'application/json;charset=utf-8');
      return JSON.stringify(data);
    }
    return data;
  }],

  transformResponse: [function transformResponse(data) {
    /*eslint no-param-reassign:0*/
    if (typeof data === 'string') {
      try {
        data = JSON.parse(data);
      } catch (e) { /* Ignore */ }
    }
    return data;
  }],

  /**
   * A timeout in milliseconds to abort a request. If set to 0 (default) a
   * timeout is not created.
   */
  timeout: 0,

  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',

  maxContentLength: -1,
  maxBodyLength: -1,

  validateStatus: function validateStatus(status) {
    return status >= 200 && status < 300;
  }
};

defaults.headers = {
  common: {
    'Accept': 'application/json, text/plain, */*'
  }
};

utils.forEach(['delete', 'get', 'head'], function forEachMethodNoData(method) {
  defaults.headers[method] = {};
});

utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
  defaults.headers[method] = utils.merge(DEFAULT_CONTENT_TYPE);
});

module.exports = defaults;


/***/ }),

/***/ 7065:
/***/ ((module) => {

"use strict";


module.exports = function bind(fn, thisArg) {
  return function wrap() {
    var args = new Array(arguments.length);
    for (var i = 0; i < args.length; i++) {
      args[i] = arguments[i];
    }
    return fn.apply(thisArg, args);
  };
};


/***/ }),

/***/ 646:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(328);

function encode(val) {
  return encodeURIComponent(val).
    replace(/%3A/gi, ':').
    replace(/%24/g, '$').
    replace(/%2C/gi, ',').
    replace(/%20/g, '+').
    replace(/%5B/gi, '[').
    replace(/%5D/gi, ']');
}

/**
 * Build a URL by appending params to the end
 *
 * @param {string} url The base of the url (e.g., http://www.google.com)
 * @param {object} [params] The params to be appended
 * @returns {string} The formatted url
 */
module.exports = function buildURL(url, params, paramsSerializer) {
  /*eslint no-param-reassign:0*/
  if (!params) {
    return url;
  }

  var serializedParams;
  if (paramsSerializer) {
    serializedParams = paramsSerializer(params);
  } else if (utils.isURLSearchParams(params)) {
    serializedParams = params.toString();
  } else {
    var parts = [];

    utils.forEach(params, function serialize(val, key) {
      if (val === null || typeof val === 'undefined') {
        return;
      }

      if (utils.isArray(val)) {
        key = key + '[]';
      } else {
        val = [val];
      }

      utils.forEach(val, function parseValue(v) {
        if (utils.isDate(v)) {
          v = v.toISOString();
        } else if (utils.isObject(v)) {
          v = JSON.stringify(v);
        }
        parts.push(encode(key) + '=' + encode(v));
      });
    });

    serializedParams = parts.join('&');
  }

  if (serializedParams) {
    var hashmarkIndex = url.indexOf('#');
    if (hashmarkIndex !== -1) {
      url = url.slice(0, hashmarkIndex);
    }

    url += (url.indexOf('?') === -1 ? '?' : '&') + serializedParams;
  }

  return url;
};


/***/ }),

/***/ 7189:
/***/ ((module) => {

"use strict";


/**
 * Creates a new URL by combining the specified URLs
 *
 * @param {string} baseURL The base URL
 * @param {string} relativeURL The relative URL
 * @returns {string} The combined URL
 */
module.exports = function combineURLs(baseURL, relativeURL) {
  return relativeURL
    ? baseURL.replace(/\/+$/, '') + '/' + relativeURL.replace(/^\/+/, '')
    : baseURL;
};


/***/ }),

/***/ 1545:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(328);

module.exports = (
  utils.isStandardBrowserEnv() ?

  // Standard browser envs support document.cookie
    (function standardBrowserEnv() {
      return {
        write: function write(name, value, expires, path, domain, secure) {
          var cookie = [];
          cookie.push(name + '=' + encodeURIComponent(value));

          if (utils.isNumber(expires)) {
            cookie.push('expires=' + new Date(expires).toGMTString());
          }

          if (utils.isString(path)) {
            cookie.push('path=' + path);
          }

          if (utils.isString(domain)) {
            cookie.push('domain=' + domain);
          }

          if (secure === true) {
            cookie.push('secure');
          }

          document.cookie = cookie.join('; ');
        },

        read: function read(name) {
          var match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
          return (match ? decodeURIComponent(match[3]) : null);
        },

        remove: function remove(name) {
          this.write(name, '', Date.now() - 86400000);
        }
      };
    })() :

  // Non standard browser env (web workers, react-native) lack needed support.
    (function nonStandardBrowserEnv() {
      return {
        write: function write() {},
        read: function read() { return null; },
        remove: function remove() {}
      };
    })()
);


/***/ }),

/***/ 1301:
/***/ ((module) => {

"use strict";


/**
 * Determines whether the specified URL is absolute
 *
 * @param {string} url The URL to test
 * @returns {boolean} True if the specified URL is absolute, otherwise false
 */
module.exports = function isAbsoluteURL(url) {
  // A URL is considered absolute if it begins with "<scheme>://" or "//" (protocol-relative URL).
  // RFC 3986 defines scheme name as a sequence of characters beginning with a letter and followed
  // by any combination of letters, digits, plus, period, or hyphen.
  return /^([a-z][a-z\d\+\-\.]*:)?\/\//i.test(url);
};


/***/ }),

/***/ 650:
/***/ ((module) => {

"use strict";


/**
 * Determines whether the payload is an error thrown by Axios
 *
 * @param {*} payload The value to test
 * @returns {boolean} True if the payload is an error thrown by Axios, otherwise false
 */
module.exports = function isAxiosError(payload) {
  return (typeof payload === 'object') && (payload.isAxiosError === true);
};


/***/ }),

/***/ 3608:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(328);

module.exports = (
  utils.isStandardBrowserEnv() ?

  // Standard browser envs have full support of the APIs needed to test
  // whether the request URL is of the same origin as current location.
    (function standardBrowserEnv() {
      var msie = /(msie|trident)/i.test(navigator.userAgent);
      var urlParsingNode = document.createElement('a');
      var originURL;

      /**
    * Parse a URL to discover it's components
    *
    * @param {String} url The URL to be parsed
    * @returns {Object}
    */
      function resolveURL(url) {
        var href = url;

        if (msie) {
        // IE needs attribute set twice to normalize properties
          urlParsingNode.setAttribute('href', href);
          href = urlParsingNode.href;
        }

        urlParsingNode.setAttribute('href', href);

        // urlParsingNode provides the UrlUtils interface - http://url.spec.whatwg.org/#urlutils
        return {
          href: urlParsingNode.href,
          protocol: urlParsingNode.protocol ? urlParsingNode.protocol.replace(/:$/, '') : '',
          host: urlParsingNode.host,
          search: urlParsingNode.search ? urlParsingNode.search.replace(/^\?/, '') : '',
          hash: urlParsingNode.hash ? urlParsingNode.hash.replace(/^#/, '') : '',
          hostname: urlParsingNode.hostname,
          port: urlParsingNode.port,
          pathname: (urlParsingNode.pathname.charAt(0) === '/') ?
            urlParsingNode.pathname :
            '/' + urlParsingNode.pathname
        };
      }

      originURL = resolveURL(window.location.href);

      /**
    * Determine if a URL shares the same origin as the current location
    *
    * @param {String} requestURL The URL to test
    * @returns {boolean} True if URL shares the same origin, otherwise false
    */
      return function isURLSameOrigin(requestURL) {
        var parsed = (utils.isString(requestURL)) ? resolveURL(requestURL) : requestURL;
        return (parsed.protocol === originURL.protocol &&
            parsed.host === originURL.host);
      };
    })() :

  // Non standard browser envs (web workers, react-native) lack needed support.
    (function nonStandardBrowserEnv() {
      return function isURLSameOrigin() {
        return true;
      };
    })()
);


/***/ }),

/***/ 6240:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(328);

module.exports = function normalizeHeaderName(headers, normalizedName) {
  utils.forEach(headers, function processHeader(value, name) {
    if (name !== normalizedName && name.toUpperCase() === normalizedName.toUpperCase()) {
      headers[normalizedName] = value;
      delete headers[name];
    }
  });
};


/***/ }),

/***/ 6455:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var utils = __webpack_require__(328);

// Headers whose duplicates are ignored by node
// c.f. https://nodejs.org/api/http.html#http_message_headers
var ignoreDuplicateOf = [
  'age', 'authorization', 'content-length', 'content-type', 'etag',
  'expires', 'from', 'host', 'if-modified-since', 'if-unmodified-since',
  'last-modified', 'location', 'max-forwards', 'proxy-authorization',
  'referer', 'retry-after', 'user-agent'
];

/**
 * Parse headers into an object
 *
 * ```
 * Date: Wed, 27 Aug 2014 08:58:49 GMT
 * Content-Type: application/json
 * Connection: keep-alive
 * Transfer-Encoding: chunked
 * ```
 *
 * @param {String} headers Headers needing to be parsed
 * @returns {Object} Headers parsed into an object
 */
module.exports = function parseHeaders(headers) {
  var parsed = {};
  var key;
  var val;
  var i;

  if (!headers) { return parsed; }

  utils.forEach(headers.split('\n'), function parser(line) {
    i = line.indexOf(':');
    key = utils.trim(line.substr(0, i)).toLowerCase();
    val = utils.trim(line.substr(i + 1));

    if (key) {
      if (parsed[key] && ignoreDuplicateOf.indexOf(key) >= 0) {
        return;
      }
      if (key === 'set-cookie') {
        parsed[key] = (parsed[key] ? parsed[key] : []).concat([val]);
      } else {
        parsed[key] = parsed[key] ? parsed[key] + ', ' + val : val;
      }
    }
  });

  return parsed;
};


/***/ }),

/***/ 4850:
/***/ ((module) => {

"use strict";


/**
 * Syntactic sugar for invoking a function and expanding an array for arguments.
 *
 * Common use case would be to use `Function.prototype.apply`.
 *
 *  ```js
 *  function f(x, y, z) {}
 *  var args = [1, 2, 3];
 *  f.apply(null, args);
 *  ```
 *
 * With `spread` this example can be re-written.
 *
 *  ```js
 *  spread(function(x, y, z) {})([1, 2, 3]);
 *  ```
 *
 * @param {Function} callback
 * @returns {Function}
 */
module.exports = function spread(callback) {
  return function wrap(arr) {
    return callback.apply(null, arr);
  };
};


/***/ }),

/***/ 328:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var bind = __webpack_require__(7065);

/*global toString:true*/

// utils is a library of generic helper functions non-specific to axios

var toString = Object.prototype.toString;

/**
 * Determine if a value is an Array
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an Array, otherwise false
 */
function isArray(val) {
  return toString.call(val) === '[object Array]';
}

/**
 * Determine if a value is undefined
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if the value is undefined, otherwise false
 */
function isUndefined(val) {
  return typeof val === 'undefined';
}

/**
 * Determine if a value is a Buffer
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Buffer, otherwise false
 */
function isBuffer(val) {
  return val !== null && !isUndefined(val) && val.constructor !== null && !isUndefined(val.constructor)
    && typeof val.constructor.isBuffer === 'function' && val.constructor.isBuffer(val);
}

/**
 * Determine if a value is an ArrayBuffer
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an ArrayBuffer, otherwise false
 */
function isArrayBuffer(val) {
  return toString.call(val) === '[object ArrayBuffer]';
}

/**
 * Determine if a value is a FormData
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an FormData, otherwise false
 */
function isFormData(val) {
  return (typeof FormData !== 'undefined') && (val instanceof FormData);
}

/**
 * Determine if a value is a view on an ArrayBuffer
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a view on an ArrayBuffer, otherwise false
 */
function isArrayBufferView(val) {
  var result;
  if ((typeof ArrayBuffer !== 'undefined') && (ArrayBuffer.isView)) {
    result = ArrayBuffer.isView(val);
  } else {
    result = (val) && (val.buffer) && (val.buffer instanceof ArrayBuffer);
  }
  return result;
}

/**
 * Determine if a value is a String
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a String, otherwise false
 */
function isString(val) {
  return typeof val === 'string';
}

/**
 * Determine if a value is a Number
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Number, otherwise false
 */
function isNumber(val) {
  return typeof val === 'number';
}

/**
 * Determine if a value is an Object
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an Object, otherwise false
 */
function isObject(val) {
  return val !== null && typeof val === 'object';
}

/**
 * Determine if a value is a plain Object
 *
 * @param {Object} val The value to test
 * @return {boolean} True if value is a plain Object, otherwise false
 */
function isPlainObject(val) {
  if (toString.call(val) !== '[object Object]') {
    return false;
  }

  var prototype = Object.getPrototypeOf(val);
  return prototype === null || prototype === Object.prototype;
}

/**
 * Determine if a value is a Date
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Date, otherwise false
 */
function isDate(val) {
  return toString.call(val) === '[object Date]';
}

/**
 * Determine if a value is a File
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a File, otherwise false
 */
function isFile(val) {
  return toString.call(val) === '[object File]';
}

/**
 * Determine if a value is a Blob
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Blob, otherwise false
 */
function isBlob(val) {
  return toString.call(val) === '[object Blob]';
}

/**
 * Determine if a value is a Function
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Function, otherwise false
 */
function isFunction(val) {
  return toString.call(val) === '[object Function]';
}

/**
 * Determine if a value is a Stream
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Stream, otherwise false
 */
function isStream(val) {
  return isObject(val) && isFunction(val.pipe);
}

/**
 * Determine if a value is a URLSearchParams object
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a URLSearchParams object, otherwise false
 */
function isURLSearchParams(val) {
  return typeof URLSearchParams !== 'undefined' && val instanceof URLSearchParams;
}

/**
 * Trim excess whitespace off the beginning and end of a string
 *
 * @param {String} str The String to trim
 * @returns {String} The String freed of excess whitespace
 */
function trim(str) {
  return str.replace(/^\s*/, '').replace(/\s*$/, '');
}

/**
 * Determine if we're running in a standard browser environment
 *
 * This allows axios to run in a web worker, and react-native.
 * Both environments support XMLHttpRequest, but not fully standard globals.
 *
 * web workers:
 *  typeof window -> undefined
 *  typeof document -> undefined
 *
 * react-native:
 *  navigator.product -> 'ReactNative'
 * nativescript
 *  navigator.product -> 'NativeScript' or 'NS'
 */
function isStandardBrowserEnv() {
  if (typeof navigator !== 'undefined' && (navigator.product === 'ReactNative' ||
                                           navigator.product === 'NativeScript' ||
                                           navigator.product === 'NS')) {
    return false;
  }
  return (
    typeof window !== 'undefined' &&
    typeof document !== 'undefined'
  );
}

/**
 * Iterate over an Array or an Object invoking a function for each item.
 *
 * If `obj` is an Array callback will be called passing
 * the value, index, and complete array for each item.
 *
 * If 'obj' is an Object callback will be called passing
 * the value, key, and complete object for each property.
 *
 * @param {Object|Array} obj The object to iterate
 * @param {Function} fn The callback to invoke for each item
 */
function forEach(obj, fn) {
  // Don't bother if no value provided
  if (obj === null || typeof obj === 'undefined') {
    return;
  }

  // Force an array if not already something iterable
  if (typeof obj !== 'object') {
    /*eslint no-param-reassign:0*/
    obj = [obj];
  }

  if (isArray(obj)) {
    // Iterate over array values
    for (var i = 0, l = obj.length; i < l; i++) {
      fn.call(null, obj[i], i, obj);
    }
  } else {
    // Iterate over object keys
    for (var key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        fn.call(null, obj[key], key, obj);
      }
    }
  }
}

/**
 * Accepts varargs expecting each argument to be an object, then
 * immutably merges the properties of each object and returns result.
 *
 * When multiple objects contain the same key the later object in
 * the arguments list will take precedence.
 *
 * Example:
 *
 * ```js
 * var result = merge({foo: 123}, {foo: 456});
 * console.log(result.foo); // outputs 456
 * ```
 *
 * @param {Object} obj1 Object to merge
 * @returns {Object} Result of all merge properties
 */
function merge(/* obj1, obj2, obj3, ... */) {
  var result = {};
  function assignValue(val, key) {
    if (isPlainObject(result[key]) && isPlainObject(val)) {
      result[key] = merge(result[key], val);
    } else if (isPlainObject(val)) {
      result[key] = merge({}, val);
    } else if (isArray(val)) {
      result[key] = val.slice();
    } else {
      result[key] = val;
    }
  }

  for (var i = 0, l = arguments.length; i < l; i++) {
    forEach(arguments[i], assignValue);
  }
  return result;
}

/**
 * Extends object a by mutably adding to it the properties of object b.
 *
 * @param {Object} a The object to be extended
 * @param {Object} b The object to copy properties from
 * @param {Object} thisArg The object to bind function to
 * @return {Object} The resulting value of object a
 */
function extend(a, b, thisArg) {
  forEach(b, function assignValue(val, key) {
    if (thisArg && typeof val === 'function') {
      a[key] = bind(val, thisArg);
    } else {
      a[key] = val;
    }
  });
  return a;
}

/**
 * Remove byte order marker. This catches EF BB BF (the UTF-8 BOM)
 *
 * @param {string} content with BOM
 * @return {string} content value without BOM
 */
function stripBOM(content) {
  if (content.charCodeAt(0) === 0xFEFF) {
    content = content.slice(1);
  }
  return content;
}

module.exports = {
  isArray: isArray,
  isArrayBuffer: isArrayBuffer,
  isBuffer: isBuffer,
  isFormData: isFormData,
  isArrayBufferView: isArrayBufferView,
  isString: isString,
  isNumber: isNumber,
  isObject: isObject,
  isPlainObject: isPlainObject,
  isUndefined: isUndefined,
  isDate: isDate,
  isFile: isFile,
  isBlob: isBlob,
  isFunction: isFunction,
  isStream: isStream,
  isURLSearchParams: isURLSearchParams,
  isStandardBrowserEnv: isStandardBrowserEnv,
  forEach: forEach,
  merge: merge,
  extend: extend,
  trim: trim,
  stripBOM: stripBOM
};


/***/ }),

/***/ 9417:
/***/ ((module) => {

"use strict";

module.exports = balanced;
function balanced(a, b, str) {
  if (a instanceof RegExp) a = maybeMatch(a, str);
  if (b instanceof RegExp) b = maybeMatch(b, str);

  var r = range(a, b, str);

  return r && {
    start: r[0],
    end: r[1],
    pre: str.slice(0, r[0]),
    body: str.slice(r[0] + a.length, r[1]),
    post: str.slice(r[1] + b.length)
  };
}

function maybeMatch(reg, str) {
  var m = str.match(reg);
  return m ? m[0] : null;
}

balanced.range = range;
function range(a, b, str) {
  var begs, beg, left, right, result;
  var ai = str.indexOf(a);
  var bi = str.indexOf(b, ai + 1);
  var i = ai;

  if (ai >= 0 && bi > 0) {
    begs = [];
    left = str.length;

    while (i >= 0 && !result) {
      if (i == ai) {
        begs.push(i);
        ai = str.indexOf(a, i + 1);
      } else if (begs.length == 1) {
        result = [ begs.pop(), bi ];
      } else {
        beg = begs.pop();
        if (beg < left) {
          left = beg;
          right = bi;
        }

        bi = str.indexOf(b, i + 1);
      }

      i = ai < bi && ai >= 0 ? ai : bi;
    }

    if (begs.length) {
      result = [ left, right ];
    }
  }

  return result;
}


/***/ }),

/***/ 1179:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var ver = process.versions.node;
var majorVer = parseInt(ver.split('.')[0], 10);

if (majorVer < 4) {
  // eslint-disable-next-line no-console
  console.error(
    'Node version ' +
      ver +
      ' is not supported, please use Node.js 4.0 or higher.'
  );
  process.exit(1);
} else if (majorVer < 8) {
  module.exports = __webpack_require__(1914);
} else {
  module.exports = __webpack_require__(6506);
}


/***/ }),

/***/ 6726:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


__webpack_require__(5588);

__webpack_require__(7168);

__webpack_require__(7465);

__webpack_require__(6049);

__webpack_require__(1236);

__webpack_require__(5841);

__webpack_require__(1592);

__webpack_require__(9600);

__webpack_require__(2343);

exports.__esModule = true;
exports.makeTree = makeTree;
exports.filterRedundantErrors = filterRedundantErrors;
exports.createErrorInstances = createErrorInstances;
exports.default = void 0;

var _utils = __webpack_require__(351);

var _validationErrors = __webpack_require__(8357);

var JSON_POINTERS_REGEX = /\/[\w_-]+(\/\d+)?/g; // Make a tree of errors from ajv errors array

function makeTree(ajvErrors) {
  if (ajvErrors === void 0) {
    ajvErrors = [];
  }

  var root = {
    children: {}
  };
  ajvErrors.forEach(function (ajvError) {
    var dataPath = ajvError.dataPath; // `dataPath === ''` is root

    var paths = dataPath === '' ? [''] : dataPath.match(JSON_POINTERS_REGEX);
    paths && paths.reduce(function (obj, path, i) {
      obj.children[path] = obj.children[path] || {
        children: {},
        errors: []
      };

      if (i === paths.length - 1) {
        obj.children[path].errors.push(ajvError);
      }

      return obj.children[path];
    }, root);
  });
  return root;
}

function filterRedundantErrors(root, parent, key) {
  /**
   * If there is a `required` error then we can just skip everythig else.
   * And, also `required` should have more priority than `anyOf`. @see #8
   */
  (0, _utils.getErrors)(root).forEach(function (error) {
    if ((0, _utils.isRequiredError)(error)) {
      root.errors = [error];
      root.children = {};
    }
  });
  /**
   * If there is an `anyOf` error that means we have more meaningful errors
   * inside children. So we will just remove all errors from this level.
   *
   * If there are no children, then we don't delete the errors since we should
   * have at least one error to report.
   */

  if ((0, _utils.getErrors)(root).some(_utils.isAnyOfError)) {
    if (Object.keys(root.children).length > 0) {
      delete root.errors;
    }
  }
  /**
   * If all errors are `enum` and siblings have any error then we can safely
   * ignore the node.
   *
   * **CAUTION**
   * Need explicit `root.errors` check because `[].every(fn) === true`
   * https://en.wikipedia.org/wiki/Vacuous_truth#Vacuous_truths_in_mathematics
   */


  if (root.errors && root.errors.length && (0, _utils.getErrors)(root).every(_utils.isEnumError)) {
    if ((0, _utils.getSiblings)(parent)(root) // Remove any reference which becomes `undefined` later
    .filter(_utils.notUndefined).some(_utils.getErrors)) {
      delete parent.children[key];
    }
  }

  Object.entries(root.children).forEach(function (_ref) {
    var key = _ref[0],
        child = _ref[1];
    return filterRedundantErrors(child, root, key);
  });
}

function createErrorInstances(root, options) {
  var errors = (0, _utils.getErrors)(root);

  if (errors.length && errors.every(_utils.isEnumError)) {
    var uniqueValues = new Set((0, _utils.concatAll)([])(errors.map(function (e) {
      return e.params.allowedValues;
    })));
    var allowedValues = [].concat(uniqueValues);
    var error = errors[0];
    return [new _validationErrors.EnumValidationError(Object.assign({}, error, {
      params: {
        allowedValues
      }
    }), options)];
  } else {
    return (0, _utils.concatAll)(errors.reduce(function (ret, error) {
      switch (error.keyword) {
        case 'additionalProperties':
          return ret.concat(new _validationErrors.AdditionalPropValidationError(error, options));

        case 'required':
          return ret.concat(new _validationErrors.RequiredValidationError(error, options));

        default:
          return ret.concat(new _validationErrors.DefaultValidationError(error, options));
      }
    }, []))((0, _utils.getChildren)(root).map(function (child) {
      return createErrorInstances(child, options);
    }));
  }
}

var _default = function _default(ajvErrors, options) {
  var tree = makeTree(ajvErrors || []);
  filterRedundantErrors(tree);
  return createErrorInstances(tree, options);
};

exports.default = _default;

/***/ }),

/***/ 1914:
/***/ ((module, exports, __webpack_require__) => {

"use strict";


var _interopRequireDefault = __webpack_require__(3298);

__webpack_require__(6049);

exports.__esModule = true;
exports.default = void 0;

var _jsonToAst = _interopRequireDefault(__webpack_require__(6675));

var _helpers = _interopRequireDefault(__webpack_require__(6726));

var _default = function _default(schema, data, errors, options) {
  if (options === void 0) {
    options = {};
  }

  var _options = options,
      _options$format = _options.format,
      format = _options$format === void 0 ? 'cli' : _options$format,
      _options$indent = _options.indent,
      indent = _options$indent === void 0 ? null : _options$indent;
  var jsonRaw = JSON.stringify(data, null, indent);
  var jsonAst = (0, _jsonToAst.default)(jsonRaw, {
    loc: true
  });

  var customErrorToText = function customErrorToText(error) {
    return error.print().join('\n');
  };

  var customErrorToStructure = function customErrorToStructure(error) {
    return error.getError();
  };

  var customErrors = (0, _helpers.default)(errors, {
    data,
    schema,
    jsonAst,
    jsonRaw
  });

  if (format === 'cli') {
    return customErrors.map(customErrorToText).join('\n\n');
  } else {
    return customErrors.map(customErrorToStructure);
  }
};

exports.default = _default;
module.exports = exports.default;

/***/ }),

/***/ 6490:
/***/ ((module, exports, __webpack_require__) => {

"use strict";


__webpack_require__(7168);

exports.__esModule = true;
exports.default = getDecoratedDataPath;

var _utils = __webpack_require__(474);

function getDecoratedDataPath(jsonAst, dataPath) {
  var decoratedPath = '';
  (0, _utils.getPointers)(dataPath).reduce(function (obj, pointer) {
    switch (obj.type) {
      case 'Object':
        {
          decoratedPath += `/${pointer}`;
          var filtered = obj.children.filter(function (child) {
            return child.key.value === pointer;
          });

          if (filtered.length !== 1) {
            throw new Error(`Couldn't find property ${pointer} of ${dataPath}`);
          }

          return filtered[0].value;
        }

      case 'Array':
        decoratedPath += `/${pointer}${getTypeName(obj.children[pointer])}`;
        return obj.children[pointer];

      default:
        // eslint-disable-next-line no-console
        console.log(obj);
    }
  }, jsonAst);
  return decoratedPath;
}

function getTypeName(obj) {
  if (!obj || !obj.children) {
    return '';
  }

  var type = obj.children.filter(function (child) {
    child && child.key && child.key.value === 'type';
  });

  if (!type.length) {
    return '';
  }

  return type[0].value && `:${type[0].value.value}` || '';
}

module.exports = exports.default;

/***/ }),

/***/ 3686:
/***/ ((module, exports, __webpack_require__) => {

"use strict";


__webpack_require__(7168);

exports.__esModule = true;
exports.default = getMetaFromPath;

var _utils = __webpack_require__(474);

function getMetaFromPath(jsonAst, dataPath, isIdentifierLocation) {
  var pointers = (0, _utils.getPointers)(dataPath);
  var lastPointerIndex = pointers.length - 1;
  return pointers.reduce(function (obj, pointer, idx) {
    switch (obj.type) {
      case 'Object':
        {
          var filtered = obj.children.filter(function (child) {
            return child.key.value === pointer;
          });

          if (filtered.length !== 1) {
            throw new Error(`Couldn't find property ${pointer} of ${dataPath}`);
          }

          var _filtered$ = filtered[0],
              key = _filtered$.key,
              value = _filtered$.value;
          return isIdentifierLocation && idx === lastPointerIndex ? key : value;
        }

      case 'Array':
        return obj.children[pointer];

      default:
        // eslint-disable-next-line no-console
        console.log(obj);
    }
  }, jsonAst);
}

module.exports = exports.default;

/***/ }),

/***/ 7547:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


var _interopRequireDefault = __webpack_require__(3298);

exports.__esModule = true;
exports.getDecoratedDataPath = exports.getMetaFromPath = void 0;

var _getMetaFromPath = _interopRequireDefault(__webpack_require__(3686));

exports.getMetaFromPath = _getMetaFromPath.default;

var _getDecoratedDataPath = _interopRequireDefault(__webpack_require__(6490));

exports.getDecoratedDataPath = _getDecoratedDataPath.default;

/***/ }),

/***/ 474:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


__webpack_require__(6882);

__webpack_require__(3652);

exports.__esModule = true;
exports.getPointers = void 0;

// TODO: Better error handling
var getPointers = function getPointers(dataPath) {
  var pointers = dataPath.split('/').slice(1);

  for (var index in pointers) {
    pointers[index] = pointers[index].split('~1').join('/').split('~0').join('~');
  }

  return pointers;
};

exports.getPointers = getPointers;

/***/ }),

/***/ 351:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


__webpack_require__(5588);

__webpack_require__(7168);

__webpack_require__(1607);

exports.__esModule = true;
exports.concatAll = exports.getSiblings = exports.getChildren = exports.getErrors = exports.isEnumError = exports.isAnyOfError = exports.isRequiredError = exports.notUndefined = void 0;

// @flow

/*::
import type { Error, Node } from './types';
*/
// Basic
var eq = function eq(x) {
  return function (y) {
    return x === y;
  };
};

var not = function not(fn) {
  return function (x) {
    return !fn(x);
  };
}; // https://github.com/facebook/flow/issues/2221


var getValues =
/*::<Obj: Object>*/
function getValues(o
/*: Obj*/
) {
  return (
    /*: $ReadOnlyArray<$Values<Obj>>*/
    Object.values(o)
  );
};

var notUndefined = function notUndefined(x
/*: mixed*/
) {
  return x !== undefined;
}; // Error


exports.notUndefined = notUndefined;

var isXError = function isXError(x) {
  return function (error
  /*: Error */
  ) {
    return error.keyword === x;
  };
};

var isRequiredError = isXError('required');
exports.isRequiredError = isRequiredError;
var isAnyOfError = isXError('anyOf');
exports.isAnyOfError = isAnyOfError;
var isEnumError = isXError('enum');
exports.isEnumError = isEnumError;

var getErrors = function getErrors(node
/*: Node*/
) {
  return node && node.errors || [];
}; // Node


exports.getErrors = getErrors;

var getChildren = function getChildren(node
/*: Node*/
) {
  return (
    /*: $ReadOnlyArray<Node>*/
    node && getValues(node.children) || []
  );
};

exports.getChildren = getChildren;

var getSiblings = function getSiblings(parent
/*: Node*/
) {
  return function (node
  /*: Node*/
  ) {
    return (
      /*: $ReadOnlyArray<Node>*/
      getChildren(parent).filter(not(eq(node)))
    );
  };
};

exports.getSiblings = getSiblings;

var concatAll =
/*::<T>*/
function concatAll(xs
/*: $ReadOnlyArray<T>*/
) {
  return function (ys
  /*: $ReadOnlyArray<T>*/
  ) {
    return (
      /*: $ReadOnlyArray<T>*/
      ys.reduce(function (zs, z) {
        return zs.concat(z);
      }, xs)
    );
  };
};

exports.concatAll = concatAll;

/***/ }),

/***/ 4743:
/***/ ((module, exports, __webpack_require__) => {

"use strict";


var _interopRequireDefault = __webpack_require__(3298);

__webpack_require__(5588);

__webpack_require__(1236);

exports.__esModule = true;
exports.default = void 0;

var _inheritsLoose2 = _interopRequireDefault(__webpack_require__(410));

var _chalk = _interopRequireDefault(__webpack_require__(1779));

var _base = _interopRequireDefault(__webpack_require__(3120));

var AdditionalPropValidationError =
/*#__PURE__*/
function (_BaseValidationError) {
  (0, _inheritsLoose2.default)(AdditionalPropValidationError, _BaseValidationError);

  function AdditionalPropValidationError() {
    var _this;

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _BaseValidationError.call.apply(_BaseValidationError, [this].concat(args)) || this;
    _this.options.isIdentifierLocation = true;
    return _this;
  }

  var _proto = AdditionalPropValidationError.prototype;

  _proto.print = function print() {
    var _this$options = this.options,
        message = _this$options.message,
        dataPath = _this$options.dataPath,
        params = _this$options.params;
    var output = [_chalk.default`{red {bold ADDTIONAL PROPERTY} ${message}}\n`];
    return output.concat(this.getCodeFrame(_chalk.default`😲  {magentaBright ${params.additionalProperty}} is not expected to be here!`, `${dataPath}/${params.additionalProperty}`));
  };

  _proto.getError = function getError() {
    var _this$options2 = this.options,
        params = _this$options2.params,
        dataPath = _this$options2.dataPath;
    return Object.assign({}, this.getLocation(`${dataPath}/${params.additionalProperty}`), {
      error: `${this.getDecoratedPath(dataPath)} Property ${params.additionalProperty} is not expected to be here`,
      path: dataPath
    });
  };

  return AdditionalPropValidationError;
}(_base.default);

exports.default = AdditionalPropValidationError;
module.exports = exports.default;

/***/ }),

/***/ 3120:
/***/ ((module, exports, __webpack_require__) => {

"use strict";


exports.__esModule = true;
exports.default = void 0;

var _codeFrame = __webpack_require__(5211);

var _json = __webpack_require__(7547);

var BaseValidationError =
/*#__PURE__*/
function () {
  function BaseValidationError(options, _ref) {
    if (options === void 0) {
      options = {
        isIdentifierLocation: false
      };
    }

    var data = _ref.data,
        schema = _ref.schema,
        jsonAst = _ref.jsonAst,
        jsonRaw = _ref.jsonRaw;
    this.options = options;
    this.data = data;
    this.schema = schema;
    this.jsonAst = jsonAst;
    this.jsonRaw = jsonRaw;
  }

  var _proto = BaseValidationError.prototype;

  _proto.getLocation = function getLocation(dataPath) {
    if (dataPath === void 0) {
      dataPath = this.options.dataPath;
    }

    var _this$options = this.options,
        isIdentifierLocation = _this$options.isIdentifierLocation,
        isSkipEndLocation = _this$options.isSkipEndLocation;

    var _getMetaFromPath = (0, _json.getMetaFromPath)(this.jsonAst, dataPath, isIdentifierLocation),
        loc = _getMetaFromPath.loc;

    return {
      start: loc.start,
      end: isSkipEndLocation ? undefined : loc.end
    };
  };

  _proto.getDecoratedPath = function getDecoratedPath(dataPath) {
    if (dataPath === void 0) {
      dataPath = this.options.dataPath;
    }

    var decoratedPath = (0, _json.getDecoratedDataPath)(this.jsonAst, dataPath);
    return decoratedPath;
  };

  _proto.getCodeFrame = function getCodeFrame(message, dataPath) {
    if (dataPath === void 0) {
      dataPath = this.options.dataPath;
    }

    return (0, _codeFrame.codeFrameColumns)(this.jsonRaw, this.getLocation(dataPath), {
      highlightCode: true,
      message
    });
  };

  _proto.print = function print() {
    throw new Error(`Implement the 'print' method inside ${this.constructor.name}!`);
  };

  _proto.getError = function getError() {
    throw new Error(`Implement the 'getError' method inside ${this.constructor.name}!`);
  };

  return BaseValidationError;
}();

exports.default = BaseValidationError;
module.exports = exports.default;

/***/ }),

/***/ 5558:
/***/ ((module, exports, __webpack_require__) => {

"use strict";


var _interopRequireDefault = __webpack_require__(3298);

__webpack_require__(5588);

__webpack_require__(1236);

exports.__esModule = true;
exports.default = void 0;

var _inheritsLoose2 = _interopRequireDefault(__webpack_require__(410));

var _chalk = _interopRequireDefault(__webpack_require__(1779));

var _base = _interopRequireDefault(__webpack_require__(3120));

var DefaultValidationError =
/*#__PURE__*/
function (_BaseValidationError) {
  (0, _inheritsLoose2.default)(DefaultValidationError, _BaseValidationError);

  function DefaultValidationError() {
    return _BaseValidationError.apply(this, arguments) || this;
  }

  var _proto = DefaultValidationError.prototype;

  _proto.print = function print() {
    var _this$options = this.options,
        keyword = _this$options.keyword,
        message = _this$options.message;
    var output = [_chalk.default`{red {bold ${keyword.toUpperCase()}} ${message}}\n`];
    return output.concat(this.getCodeFrame(_chalk.default`👈🏽  {magentaBright ${keyword}} ${message}`));
  };

  _proto.getError = function getError() {
    var _this$options2 = this.options,
        keyword = _this$options2.keyword,
        message = _this$options2.message,
        dataPath = _this$options2.dataPath;
    return Object.assign({}, this.getLocation(), {
      error: `${this.getDecoratedPath(dataPath)}: ${keyword} ${message}`,
      path: dataPath
    });
  };

  return DefaultValidationError;
}(_base.default);

exports.default = DefaultValidationError;
module.exports = exports.default;

/***/ }),

/***/ 2329:
/***/ ((module, exports, __webpack_require__) => {

"use strict";


var _interopRequireDefault = __webpack_require__(3298);

__webpack_require__(5588);

__webpack_require__(6049);

__webpack_require__(6206);

__webpack_require__(1236);

__webpack_require__(1592);

__webpack_require__(7604);

exports.__esModule = true;
exports.default = void 0;

var _inheritsLoose2 = _interopRequireDefault(__webpack_require__(410));

var _chalk = _interopRequireDefault(__webpack_require__(1779));

var _leven = _interopRequireDefault(__webpack_require__(9232));

var _jsonpointer = _interopRequireDefault(__webpack_require__(7571));

var _base = _interopRequireDefault(__webpack_require__(3120));

var EnumValidationError =
/*#__PURE__*/
function (_BaseValidationError) {
  (0, _inheritsLoose2.default)(EnumValidationError, _BaseValidationError);

  function EnumValidationError() {
    return _BaseValidationError.apply(this, arguments) || this;
  }

  var _proto = EnumValidationError.prototype;

  _proto.print = function print() {
    var _this$options = this.options,
        message = _this$options.message,
        allowedValues = _this$options.params.allowedValues;
    var bestMatch = this.findBestMatch();
    var output = [_chalk.default`{red {bold ENUM} ${message}}`, _chalk.default`{red (${allowedValues.join(', ')})}\n`];
    return output.concat(this.getCodeFrame(bestMatch !== null ? _chalk.default`👈🏽  Did you mean {magentaBright ${bestMatch}} here?` : _chalk.default`👈🏽  Unexpected value, should be equal to one of the allowed values`));
  };

  _proto.getError = function getError() {
    var _this$options2 = this.options,
        message = _this$options2.message,
        dataPath = _this$options2.dataPath,
        params = _this$options2.params;
    var bestMatch = this.findBestMatch();
    var output = Object.assign({}, this.getLocation(), {
      error: `${this.getDecoratedPath(dataPath)} ${message}: ${params.allowedValues.join(', ')}`,
      path: dataPath
    });

    if (bestMatch !== null) {
      output.suggestion = `Did you mean ${bestMatch}?`;
    }

    return output;
  };

  _proto.findBestMatch = function findBestMatch() {
    var _this$options3 = this.options,
        dataPath = _this$options3.dataPath,
        allowedValues = _this$options3.params.allowedValues;
    var currentValue = dataPath === '' ? this.data : _jsonpointer.default.get(this.data, dataPath);

    if (!currentValue) {
      return null;
    }

    var bestMatch = allowedValues.map(function (value) {
      return {
        value,
        weight: (0, _leven.default)(value, currentValue.toString())
      };
    }).sort(function (x, y) {
      return x.weight > y.weight ? 1 : x.weight < y.weight ? -1 : 0;
    })[0];
    return allowedValues.length === 1 || bestMatch.weight < bestMatch.value.length ? bestMatch.value : null;
  };

  return EnumValidationError;
}(_base.default);

exports.default = EnumValidationError;
module.exports = exports.default;

/***/ }),

/***/ 8357:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


var _interopRequireDefault = __webpack_require__(3298);

exports.__esModule = true;
exports.DefaultValidationError = exports.EnumValidationError = exports.AdditionalPropValidationError = exports.RequiredValidationError = void 0;

var _required = _interopRequireDefault(__webpack_require__(3309));

exports.RequiredValidationError = _required.default;

var _additionalProp = _interopRequireDefault(__webpack_require__(4743));

exports.AdditionalPropValidationError = _additionalProp.default;

var _enum = _interopRequireDefault(__webpack_require__(2329));

exports.EnumValidationError = _enum.default;

var _default = _interopRequireDefault(__webpack_require__(5558));

exports.DefaultValidationError = _default.default;

/***/ }),

/***/ 3309:
/***/ ((module, exports, __webpack_require__) => {

"use strict";


var _interopRequireDefault = __webpack_require__(3298);

__webpack_require__(5588);

__webpack_require__(1236);

exports.__esModule = true;
exports.default = void 0;

var _inheritsLoose2 = _interopRequireDefault(__webpack_require__(410));

var _chalk = _interopRequireDefault(__webpack_require__(1779));

var _base = _interopRequireDefault(__webpack_require__(3120));

var RequiredValidationError =
/*#__PURE__*/
function (_BaseValidationError) {
  (0, _inheritsLoose2.default)(RequiredValidationError, _BaseValidationError);

  function RequiredValidationError() {
    return _BaseValidationError.apply(this, arguments) || this;
  }

  var _proto = RequiredValidationError.prototype;

  _proto.getLocation = function getLocation(dataPath) {
    if (dataPath === void 0) {
      dataPath = this.options.dataPath;
    }

    var _BaseValidationError$ = _BaseValidationError.prototype.getLocation.call(this, dataPath),
        start = _BaseValidationError$.start;

    return {
      start
    };
  };

  _proto.print = function print() {
    var _this$options = this.options,
        message = _this$options.message,
        params = _this$options.params;
    var output = [_chalk.default`{red {bold REQUIRED} ${message}}\n`];
    return output.concat(this.getCodeFrame(_chalk.default`☹️  {magentaBright ${params.missingProperty}} is missing here!`));
  };

  _proto.getError = function getError() {
    var _this$options2 = this.options,
        message = _this$options2.message,
        dataPath = _this$options2.dataPath;
    return Object.assign({}, this.getLocation(), {
      error: `${this.getDecoratedPath(dataPath)} ${message}`,
      path: dataPath
    });
  };

  return RequiredValidationError;
}(_base.default);

exports.default = RequiredValidationError;
module.exports = exports.default;

/***/ }),

/***/ 8151:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


__webpack_require__(7465);

exports.__esModule = true;
exports.makeTree = makeTree;
exports.filterRedundantErrors = filterRedundantErrors;
exports.createErrorInstances = createErrorInstances;
exports.default = void 0;

var _utils = __webpack_require__(3391);

var _validationErrors = __webpack_require__(8441);

const JSON_POINTERS_REGEX = /\/[\w_-]+(\/\d+)?/g; // Make a tree of errors from ajv errors array

function makeTree(ajvErrors = []) {
  const root = {
    children: {}
  };
  ajvErrors.forEach(ajvError => {
    const {
      dataPath
    } = ajvError; // `dataPath === ''` is root

    const paths = dataPath === '' ? [''] : dataPath.match(JSON_POINTERS_REGEX);
    paths && paths.reduce((obj, path, i) => {
      obj.children[path] = obj.children[path] || {
        children: {},
        errors: []
      };

      if (i === paths.length - 1) {
        obj.children[path].errors.push(ajvError);
      }

      return obj.children[path];
    }, root);
  });
  return root;
}

function filterRedundantErrors(root, parent, key) {
  /**
   * If there is a `required` error then we can just skip everythig else.
   * And, also `required` should have more priority than `anyOf`. @see #8
   */
  (0, _utils.getErrors)(root).forEach(error => {
    if ((0, _utils.isRequiredError)(error)) {
      root.errors = [error];
      root.children = {};
    }
  });
  /**
   * If there is an `anyOf` error that means we have more meaningful errors
   * inside children. So we will just remove all errors from this level.
   *
   * If there are no children, then we don't delete the errors since we should
   * have at least one error to report.
   */

  if ((0, _utils.getErrors)(root).some(_utils.isAnyOfError)) {
    if (Object.keys(root.children).length > 0) {
      delete root.errors;
    }
  }
  /**
   * If all errors are `enum` and siblings have any error then we can safely
   * ignore the node.
   *
   * **CAUTION**
   * Need explicit `root.errors` check because `[].every(fn) === true`
   * https://en.wikipedia.org/wiki/Vacuous_truth#Vacuous_truths_in_mathematics
   */


  if (root.errors && root.errors.length && (0, _utils.getErrors)(root).every(_utils.isEnumError)) {
    if ((0, _utils.getSiblings)(parent)(root) // Remove any reference which becomes `undefined` later
    .filter(_utils.notUndefined).some(_utils.getErrors)) {
      delete parent.children[key];
    }
  }

  Object.entries(root.children).forEach(([key, child]) => filterRedundantErrors(child, root, key));
}

function createErrorInstances(root, options) {
  const errors = (0, _utils.getErrors)(root);

  if (errors.length && errors.every(_utils.isEnumError)) {
    const uniqueValues = new Set((0, _utils.concatAll)([])(errors.map(e => e.params.allowedValues)));
    const allowedValues = [...uniqueValues];
    const error = errors[0];
    return [new _validationErrors.EnumValidationError(Object.assign({}, error, {
      params: {
        allowedValues
      }
    }), options)];
  } else {
    return (0, _utils.concatAll)(errors.reduce((ret, error) => {
      switch (error.keyword) {
        case 'additionalProperties':
          return ret.concat(new _validationErrors.AdditionalPropValidationError(error, options));

        case 'required':
          return ret.concat(new _validationErrors.RequiredValidationError(error, options));

        default:
          return ret.concat(new _validationErrors.DefaultValidationError(error, options));
      }
    }, []))((0, _utils.getChildren)(root).map(child => createErrorInstances(child, options)));
  }
}

var _default = (ajvErrors, options) => {
  const tree = makeTree(ajvErrors || []);
  filterRedundantErrors(tree);
  return createErrorInstances(tree, options);
};

exports.default = _default;

/***/ }),

/***/ 6506:
/***/ ((module, exports, __webpack_require__) => {

"use strict";


exports.__esModule = true;
exports.default = void 0;

var _jsonToAst = _interopRequireDefault(__webpack_require__(6675));

var _helpers = _interopRequireDefault(__webpack_require__(8151));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default = (schema, data, errors, options = {}) => {
  const {
    format = 'cli',
    indent = null
  } = options;
  const jsonRaw = JSON.stringify(data, null, indent);
  const jsonAst = (0, _jsonToAst.default)(jsonRaw, {
    loc: true
  });

  const customErrorToText = error => error.print().join('\n');

  const customErrorToStructure = error => error.getError();

  const customErrors = (0, _helpers.default)(errors, {
    data,
    schema,
    jsonAst,
    jsonRaw
  });

  if (format === 'cli') {
    return customErrors.map(customErrorToText).join('\n\n');
  } else {
    return customErrors.map(customErrorToStructure);
  }
};

exports.default = _default;
module.exports = exports.default;

/***/ }),

/***/ 9469:
/***/ ((module, exports, __webpack_require__) => {

"use strict";


exports.__esModule = true;
exports.default = getDecoratedDataPath;

var _utils = __webpack_require__(3226);

function getDecoratedDataPath(jsonAst, dataPath) {
  let decoratedPath = '';
  (0, _utils.getPointers)(dataPath).reduce((obj, pointer) => {
    switch (obj.type) {
      case 'Object':
        {
          decoratedPath += `/${pointer}`;
          const filtered = obj.children.filter(child => child.key.value === pointer);

          if (filtered.length !== 1) {
            throw new Error(`Couldn't find property ${pointer} of ${dataPath}`);
          }

          return filtered[0].value;
        }

      case 'Array':
        decoratedPath += `/${pointer}${getTypeName(obj.children[pointer])}`;
        return obj.children[pointer];

      default:
        // eslint-disable-next-line no-console
        console.log(obj);
    }
  }, jsonAst);
  return decoratedPath;
}

function getTypeName(obj) {
  if (!obj || !obj.children) {
    return '';
  }

  const type = obj.children.filter(child => {
    child && child.key && child.key.value === 'type';
  });

  if (!type.length) {
    return '';
  }

  return type[0].value && `:${type[0].value.value}` || '';
}

module.exports = exports.default;

/***/ }),

/***/ 8931:
/***/ ((module, exports, __webpack_require__) => {

"use strict";


exports.__esModule = true;
exports.default = getMetaFromPath;

var _utils = __webpack_require__(3226);

function getMetaFromPath(jsonAst, dataPath, isIdentifierLocation) {
  const pointers = (0, _utils.getPointers)(dataPath);
  const lastPointerIndex = pointers.length - 1;
  return pointers.reduce((obj, pointer, idx) => {
    switch (obj.type) {
      case 'Object':
        {
          const filtered = obj.children.filter(child => child.key.value === pointer);

          if (filtered.length !== 1) {
            throw new Error(`Couldn't find property ${pointer} of ${dataPath}`);
          }

          const {
            key,
            value
          } = filtered[0];
          return isIdentifierLocation && idx === lastPointerIndex ? key : value;
        }

      case 'Array':
        return obj.children[pointer];

      default:
        // eslint-disable-next-line no-console
        console.log(obj);
    }
  }, jsonAst);
}

module.exports = exports.default;

/***/ }),

/***/ 6432:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


exports.__esModule = true;
exports.getDecoratedDataPath = exports.getMetaFromPath = void 0;

var _getMetaFromPath = _interopRequireDefault(__webpack_require__(8931));

exports.getMetaFromPath = _getMetaFromPath.default;

var _getDecoratedDataPath = _interopRequireDefault(__webpack_require__(9469));

exports.getDecoratedDataPath = _getDecoratedDataPath.default;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/***/ }),

/***/ 3226:
/***/ ((__unused_webpack_module, exports) => {

"use strict";


exports.__esModule = true;
exports.getPointers = void 0;

// TODO: Better error handling
const getPointers = dataPath => {
  const pointers = dataPath.split('/').slice(1);

  for (const index in pointers) {
    pointers[index] = pointers[index].split('~1').join('/').split('~0').join('~');
  }

  return pointers;
};

exports.getPointers = getPointers;

/***/ }),

/***/ 3391:
/***/ ((__unused_webpack_module, exports) => {

"use strict";


exports.__esModule = true;
exports.concatAll = exports.getSiblings = exports.getChildren = exports.getErrors = exports.isEnumError = exports.isAnyOfError = exports.isRequiredError = exports.notUndefined = void 0;

// @flow

/*::
import type { Error, Node } from './types';
*/
// Basic
const eq = x => y => x === y;

const not = fn => x => !fn(x); // https://github.com/facebook/flow/issues/2221


const getValues =
/*::<Obj: Object>*/
(o
/*: Obj*/
) =>
/*: $ReadOnlyArray<$Values<Obj>>*/
Object.values(o);

const notUndefined = (x
/*: mixed*/
) => x !== undefined; // Error


exports.notUndefined = notUndefined;

const isXError = x => (error
/*: Error */
) => error.keyword === x;

const isRequiredError = isXError('required');
exports.isRequiredError = isRequiredError;
const isAnyOfError = isXError('anyOf');
exports.isAnyOfError = isAnyOfError;
const isEnumError = isXError('enum');
exports.isEnumError = isEnumError;

const getErrors = (node
/*: Node*/
) => node && node.errors || []; // Node


exports.getErrors = getErrors;

const getChildren = (node
/*: Node*/
) =>
/*: $ReadOnlyArray<Node>*/
node && getValues(node.children) || [];

exports.getChildren = getChildren;

const getSiblings = (parent
/*: Node*/
) => (node
/*: Node*/
) =>
/*: $ReadOnlyArray<Node>*/
getChildren(parent).filter(not(eq(node)));

exports.getSiblings = getSiblings;

const concatAll =
/*::<T>*/
(xs
/*: $ReadOnlyArray<T>*/
) => (ys
/*: $ReadOnlyArray<T>*/
) =>
/*: $ReadOnlyArray<T>*/
ys.reduce((zs, z) => zs.concat(z), xs);

exports.concatAll = concatAll;

/***/ }),

/***/ 289:
/***/ ((module, exports, __webpack_require__) => {

"use strict";


__webpack_require__(7465);

exports.__esModule = true;
exports.default = void 0;

var _chalk = _interopRequireDefault(__webpack_require__(1779));

var _base = _interopRequireDefault(__webpack_require__(1303));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class AdditionalPropValidationError extends _base.default {
  constructor(...args) {
    super(...args);
    this.options.isIdentifierLocation = true;
  }

  print() {
    const {
      message,
      dataPath,
      params
    } = this.options;
    const output = [_chalk.default`{red {bold ADDTIONAL PROPERTY} ${message}}\n`];
    return output.concat(this.getCodeFrame(_chalk.default`😲  {magentaBright ${params.additionalProperty}} is not expected to be here!`, `${dataPath}/${params.additionalProperty}`));
  }

  getError() {
    const {
      params,
      dataPath
    } = this.options;
    return Object.assign({}, this.getLocation(`${dataPath}/${params.additionalProperty}`), {
      error: `${this.getDecoratedPath(dataPath)} Property ${params.additionalProperty} is not expected to be here`,
      path: dataPath
    });
  }

}

exports.default = AdditionalPropValidationError;
module.exports = exports.default;

/***/ }),

/***/ 1303:
/***/ ((module, exports, __webpack_require__) => {

"use strict";


exports.__esModule = true;
exports.default = void 0;

var _codeFrame = __webpack_require__(5211);

var _json = __webpack_require__(6432);

class BaseValidationError {
  constructor(options = {
    isIdentifierLocation: false
  }, {
    data,
    schema,
    jsonAst,
    jsonRaw
  }) {
    this.options = options;
    this.data = data;
    this.schema = schema;
    this.jsonAst = jsonAst;
    this.jsonRaw = jsonRaw;
  }

  getLocation(dataPath = this.options.dataPath) {
    const {
      isIdentifierLocation,
      isSkipEndLocation
    } = this.options;
    const {
      loc
    } = (0, _json.getMetaFromPath)(this.jsonAst, dataPath, isIdentifierLocation);
    return {
      start: loc.start,
      end: isSkipEndLocation ? undefined : loc.end
    };
  }

  getDecoratedPath(dataPath = this.options.dataPath) {
    const decoratedPath = (0, _json.getDecoratedDataPath)(this.jsonAst, dataPath);
    return decoratedPath;
  }

  getCodeFrame(message, dataPath = this.options.dataPath) {
    return (0, _codeFrame.codeFrameColumns)(this.jsonRaw, this.getLocation(dataPath), {
      highlightCode: true,
      message
    });
  }

  print() {
    throw new Error(`Implement the 'print' method inside ${this.constructor.name}!`);
  }

  getError() {
    throw new Error(`Implement the 'getError' method inside ${this.constructor.name}!`);
  }

}

exports.default = BaseValidationError;
module.exports = exports.default;

/***/ }),

/***/ 3440:
/***/ ((module, exports, __webpack_require__) => {

"use strict";


exports.__esModule = true;
exports.default = void 0;

var _chalk = _interopRequireDefault(__webpack_require__(1779));

var _base = _interopRequireDefault(__webpack_require__(1303));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class DefaultValidationError extends _base.default {
  print() {
    const {
      keyword,
      message
    } = this.options;
    const output = [_chalk.default`{red {bold ${keyword.toUpperCase()}} ${message}}\n`];
    return output.concat(this.getCodeFrame(_chalk.default`👈🏽  {magentaBright ${keyword}} ${message}`));
  }

  getError() {
    const {
      keyword,
      message,
      dataPath
    } = this.options;
    return Object.assign({}, this.getLocation(), {
      error: `${this.getDecoratedPath(dataPath)}: ${keyword} ${message}`,
      path: dataPath
    });
  }

}

exports.default = DefaultValidationError;
module.exports = exports.default;

/***/ }),

/***/ 9985:
/***/ ((module, exports, __webpack_require__) => {

"use strict";


__webpack_require__(6206);

exports.__esModule = true;
exports.default = void 0;

var _chalk = _interopRequireDefault(__webpack_require__(1779));

var _leven = _interopRequireDefault(__webpack_require__(9232));

var _jsonpointer = _interopRequireDefault(__webpack_require__(7571));

var _base = _interopRequireDefault(__webpack_require__(1303));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class EnumValidationError extends _base.default {
  print() {
    const {
      message,
      params: {
        allowedValues
      }
    } = this.options;
    const bestMatch = this.findBestMatch();
    const output = [_chalk.default`{red {bold ENUM} ${message}}`, _chalk.default`{red (${allowedValues.join(', ')})}\n`];
    return output.concat(this.getCodeFrame(bestMatch !== null ? _chalk.default`👈🏽  Did you mean {magentaBright ${bestMatch}} here?` : _chalk.default`👈🏽  Unexpected value, should be equal to one of the allowed values`));
  }

  getError() {
    const {
      message,
      dataPath,
      params
    } = this.options;
    const bestMatch = this.findBestMatch();
    const output = Object.assign({}, this.getLocation(), {
      error: `${this.getDecoratedPath(dataPath)} ${message}: ${params.allowedValues.join(', ')}`,
      path: dataPath
    });

    if (bestMatch !== null) {
      output.suggestion = `Did you mean ${bestMatch}?`;
    }

    return output;
  }

  findBestMatch() {
    const {
      dataPath,
      params: {
        allowedValues
      }
    } = this.options;
    const currentValue = dataPath === '' ? this.data : _jsonpointer.default.get(this.data, dataPath);

    if (!currentValue) {
      return null;
    }

    const bestMatch = allowedValues.map(value => ({
      value,
      weight: (0, _leven.default)(value, currentValue.toString())
    })).sort((x, y) => x.weight > y.weight ? 1 : x.weight < y.weight ? -1 : 0)[0];
    return allowedValues.length === 1 || bestMatch.weight < bestMatch.value.length ? bestMatch.value : null;
  }

}

exports.default = EnumValidationError;
module.exports = exports.default;

/***/ }),

/***/ 8441:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


exports.__esModule = true;
exports.DefaultValidationError = exports.EnumValidationError = exports.AdditionalPropValidationError = exports.RequiredValidationError = void 0;

var _required = _interopRequireDefault(__webpack_require__(9291));

exports.RequiredValidationError = _required.default;

var _additionalProp = _interopRequireDefault(__webpack_require__(289));

exports.AdditionalPropValidationError = _additionalProp.default;

var _enum = _interopRequireDefault(__webpack_require__(9985));

exports.EnumValidationError = _enum.default;

var _default = _interopRequireDefault(__webpack_require__(3440));

exports.DefaultValidationError = _default.default;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/***/ }),

/***/ 9291:
/***/ ((module, exports, __webpack_require__) => {

"use strict";


exports.__esModule = true;
exports.default = void 0;

var _chalk = _interopRequireDefault(__webpack_require__(1779));

var _base = _interopRequireDefault(__webpack_require__(1303));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class RequiredValidationError extends _base.default {
  getLocation(dataPath = this.options.dataPath) {
    const {
      start
    } = super.getLocation(dataPath);
    return {
      start
    };
  }

  print() {
    const {
      message,
      params
    } = this.options;
    const output = [_chalk.default`{red {bold REQUIRED} ${message}}\n`];
    return output.concat(this.getCodeFrame(_chalk.default`☹️  {magentaBright ${params.missingProperty}} is missing here!`));
  }

  getError() {
    const {
      message,
      dataPath
    } = this.options;
    return Object.assign({}, this.getLocation(), {
      error: `${this.getDecoratedPath(dataPath)} ${message}`,
      path: dataPath
    });
  }

}

exports.default = RequiredValidationError;
module.exports = exports.default;

/***/ }),

/***/ 3717:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var concatMap = __webpack_require__(6891);
var balanced = __webpack_require__(9417);

module.exports = expandTop;

var escSlash = '\0SLASH'+Math.random()+'\0';
var escOpen = '\0OPEN'+Math.random()+'\0';
var escClose = '\0CLOSE'+Math.random()+'\0';
var escComma = '\0COMMA'+Math.random()+'\0';
var escPeriod = '\0PERIOD'+Math.random()+'\0';

function numeric(str) {
  return parseInt(str, 10) == str
    ? parseInt(str, 10)
    : str.charCodeAt(0);
}

function escapeBraces(str) {
  return str.split('\\\\').join(escSlash)
            .split('\\{').join(escOpen)
            .split('\\}').join(escClose)
            .split('\\,').join(escComma)
            .split('\\.').join(escPeriod);
}

function unescapeBraces(str) {
  return str.split(escSlash).join('\\')
            .split(escOpen).join('{')
            .split(escClose).join('}')
            .split(escComma).join(',')
            .split(escPeriod).join('.');
}


// Basically just str.split(","), but handling cases
// where we have nested braced sections, which should be
// treated as individual members, like {a,{b,c},d}
function parseCommaParts(str) {
  if (!str)
    return [''];

  var parts = [];
  var m = balanced('{', '}', str);

  if (!m)
    return str.split(',');

  var pre = m.pre;
  var body = m.body;
  var post = m.post;
  var p = pre.split(',');

  p[p.length-1] += '{' + body + '}';
  var postParts = parseCommaParts(post);
  if (post.length) {
    p[p.length-1] += postParts.shift();
    p.push.apply(p, postParts);
  }

  parts.push.apply(parts, p);

  return parts;
}

function expandTop(str) {
  if (!str)
    return [];

  // I don't know why Bash 4.3 does this, but it does.
  // Anything starting with {} will have the first two bytes preserved
  // but *only* at the top level, so {},a}b will not expand to anything,
  // but a{},b}c will be expanded to [a}c,abc].
  // One could argue that this is a bug in Bash, but since the goal of
  // this module is to match Bash's rules, we escape a leading {}
  if (str.substr(0, 2) === '{}') {
    str = '\\{\\}' + str.substr(2);
  }

  return expand(escapeBraces(str), true).map(unescapeBraces);
}

function identity(e) {
  return e;
}

function embrace(str) {
  return '{' + str + '}';
}
function isPadded(el) {
  return /^-?0\d/.test(el);
}

function lte(i, y) {
  return i <= y;
}
function gte(i, y) {
  return i >= y;
}

function expand(str, isTop) {
  var expansions = [];

  var m = balanced('{', '}', str);
  if (!m || /\$$/.test(m.pre)) return [str];

  var isNumericSequence = /^-?\d+\.\.-?\d+(?:\.\.-?\d+)?$/.test(m.body);
  var isAlphaSequence = /^[a-zA-Z]\.\.[a-zA-Z](?:\.\.-?\d+)?$/.test(m.body);
  var isSequence = isNumericSequence || isAlphaSequence;
  var isOptions = m.body.indexOf(',') >= 0;
  if (!isSequence && !isOptions) {
    // {a},b}
    if (m.post.match(/,.*\}/)) {
      str = m.pre + '{' + m.body + escClose + m.post;
      return expand(str);
    }
    return [str];
  }

  var n;
  if (isSequence) {
    n = m.body.split(/\.\./);
  } else {
    n = parseCommaParts(m.body);
    if (n.length === 1) {
      // x{{a,b}}y ==> x{a}y x{b}y
      n = expand(n[0], false).map(embrace);
      if (n.length === 1) {
        var post = m.post.length
          ? expand(m.post, false)
          : [''];
        return post.map(function(p) {
          return m.pre + n[0] + p;
        });
      }
    }
  }

  // at this point, n is the parts, and we know it's not a comma set
  // with a single entry.

  // no need to expand pre, since it is guaranteed to be free of brace-sets
  var pre = m.pre;
  var post = m.post.length
    ? expand(m.post, false)
    : [''];

  var N;

  if (isSequence) {
    var x = numeric(n[0]);
    var y = numeric(n[1]);
    var width = Math.max(n[0].length, n[1].length)
    var incr = n.length == 3
      ? Math.abs(numeric(n[2]))
      : 1;
    var test = lte;
    var reverse = y < x;
    if (reverse) {
      incr *= -1;
      test = gte;
    }
    var pad = n.some(isPadded);

    N = [];

    for (var i = x; test(i, y); i += incr) {
      var c;
      if (isAlphaSequence) {
        c = String.fromCharCode(i);
        if (c === '\\')
          c = '';
      } else {
        c = String(i);
        if (pad) {
          var need = width - c.length;
          if (need > 0) {
            var z = new Array(need + 1).join('0');
            if (i < 0)
              c = '-' + z + c.slice(1);
            else
              c = z + c;
          }
        }
      }
      N.push(c);
    }
  } else {
    N = concatMap(n, function(el) { return expand(el, false) });
  }

  for (var j = 0; j < N.length; j++) {
    for (var k = 0; k < post.length; k++) {
      var expansion = pre + N[j] + post[k];
      if (!isTop || isSequence || expansion)
        expansions.push(expansion);
    }
  }

  return expansions;
}



/***/ }),

/***/ 1779:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

const escapeStringRegexp = __webpack_require__(8691);
const ansiStyles = __webpack_require__(2068);
const stdoutColor = __webpack_require__(9318).stdout;

const template = __webpack_require__(2138);

const isSimpleWindowsTerm = process.platform === 'win32' && !(process.env.TERM || '').toLowerCase().startsWith('xterm');

// `supportsColor.level` → `ansiStyles.color[name]` mapping
const levelMapping = ['ansi', 'ansi', 'ansi256', 'ansi16m'];

// `color-convert` models to exclude from the Chalk API due to conflicts and such
const skipModels = new Set(['gray']);

const styles = Object.create(null);

function applyOptions(obj, options) {
	options = options || {};

	// Detect level if not set manually
	const scLevel = stdoutColor ? stdoutColor.level : 0;
	obj.level = options.level === undefined ? scLevel : options.level;
	obj.enabled = 'enabled' in options ? options.enabled : obj.level > 0;
}

function Chalk(options) {
	// We check for this.template here since calling `chalk.constructor()`
	// by itself will have a `this` of a previously constructed chalk object
	if (!this || !(this instanceof Chalk) || this.template) {
		const chalk = {};
		applyOptions(chalk, options);

		chalk.template = function () {
			const args = [].slice.call(arguments);
			return chalkTag.apply(null, [chalk.template].concat(args));
		};

		Object.setPrototypeOf(chalk, Chalk.prototype);
		Object.setPrototypeOf(chalk.template, chalk);

		chalk.template.constructor = Chalk;

		return chalk.template;
	}

	applyOptions(this, options);
}

// Use bright blue on Windows as the normal blue color is illegible
if (isSimpleWindowsTerm) {
	ansiStyles.blue.open = '\u001B[94m';
}

for (const key of Object.keys(ansiStyles)) {
	ansiStyles[key].closeRe = new RegExp(escapeStringRegexp(ansiStyles[key].close), 'g');

	styles[key] = {
		get() {
			const codes = ansiStyles[key];
			return build.call(this, this._styles ? this._styles.concat(codes) : [codes], this._empty, key);
		}
	};
}

styles.visible = {
	get() {
		return build.call(this, this._styles || [], true, 'visible');
	}
};

ansiStyles.color.closeRe = new RegExp(escapeStringRegexp(ansiStyles.color.close), 'g');
for (const model of Object.keys(ansiStyles.color.ansi)) {
	if (skipModels.has(model)) {
		continue;
	}

	styles[model] = {
		get() {
			const level = this.level;
			return function () {
				const open = ansiStyles.color[levelMapping[level]][model].apply(null, arguments);
				const codes = {
					open,
					close: ansiStyles.color.close,
					closeRe: ansiStyles.color.closeRe
				};
				return build.call(this, this._styles ? this._styles.concat(codes) : [codes], this._empty, model);
			};
		}
	};
}

ansiStyles.bgColor.closeRe = new RegExp(escapeStringRegexp(ansiStyles.bgColor.close), 'g');
for (const model of Object.keys(ansiStyles.bgColor.ansi)) {
	if (skipModels.has(model)) {
		continue;
	}

	const bgModel = 'bg' + model[0].toUpperCase() + model.slice(1);
	styles[bgModel] = {
		get() {
			const level = this.level;
			return function () {
				const open = ansiStyles.bgColor[levelMapping[level]][model].apply(null, arguments);
				const codes = {
					open,
					close: ansiStyles.bgColor.close,
					closeRe: ansiStyles.bgColor.closeRe
				};
				return build.call(this, this._styles ? this._styles.concat(codes) : [codes], this._empty, model);
			};
		}
	};
}

const proto = Object.defineProperties(() => {}, styles);

function build(_styles, _empty, key) {
	const builder = function () {
		return applyStyle.apply(builder, arguments);
	};

	builder._styles = _styles;
	builder._empty = _empty;

	const self = this;

	Object.defineProperty(builder, 'level', {
		enumerable: true,
		get() {
			return self.level;
		},
		set(level) {
			self.level = level;
		}
	});

	Object.defineProperty(builder, 'enabled', {
		enumerable: true,
		get() {
			return self.enabled;
		},
		set(enabled) {
			self.enabled = enabled;
		}
	});

	// See below for fix regarding invisible grey/dim combination on Windows
	builder.hasGrey = this.hasGrey || key === 'gray' || key === 'grey';

	// `__proto__` is used because we must return a function, but there is
	// no way to create a function with a different prototype
	builder.__proto__ = proto; // eslint-disable-line no-proto

	return builder;
}

function applyStyle() {
	// Support varags, but simply cast to string in case there's only one arg
	const args = arguments;
	const argsLen = args.length;
	let str = String(arguments[0]);

	if (argsLen === 0) {
		return '';
	}

	if (argsLen > 1) {
		// Don't slice `arguments`, it prevents V8 optimizations
		for (let a = 1; a < argsLen; a++) {
			str += ' ' + args[a];
		}
	}

	if (!this.enabled || this.level <= 0 || !str) {
		return this._empty ? '' : str;
	}

	// Turns out that on Windows dimmed gray text becomes invisible in cmd.exe,
	// see https://github.com/chalk/chalk/issues/58
	// If we're on Windows and we're dealing with a gray color, temporarily make 'dim' a noop.
	const originalDim = ansiStyles.dim.open;
	if (isSimpleWindowsTerm && this.hasGrey) {
		ansiStyles.dim.open = '';
	}

	for (const code of this._styles.slice().reverse()) {
		// Replace any instances already present with a re-opening code
		// otherwise only the part of the string until said closing code
		// will be colored, and the rest will simply be 'plain'.
		str = code.open + str.replace(code.closeRe, code.open) + code.close;

		// Close the styling before a linebreak and reopen
		// after next line to fix a bleed issue on macOS
		// https://github.com/chalk/chalk/pull/92
		str = str.replace(/\r?\n/g, `${code.close}$&${code.open}`);
	}

	// Reset the original `dim` if we changed it to work around the Windows dimmed gray issue
	ansiStyles.dim.open = originalDim;

	return str;
}

function chalkTag(chalk, strings) {
	if (!Array.isArray(strings)) {
		// If chalk() was called by itself or with a string,
		// return the string itself as a string.
		return [].slice.call(arguments, 1).join(' ');
	}

	const args = [].slice.call(arguments, 2);
	const parts = [strings.raw[0]];

	for (let i = 1; i < strings.length; i++) {
		parts.push(String(args[i - 1]).replace(/[{}\\]/g, '\\$&'));
		parts.push(String(strings.raw[i]));
	}

	return template(chalk, parts.join(''));
}

Object.defineProperties(Chalk.prototype, styles);

module.exports = Chalk(); // eslint-disable-line new-cap
module.exports.supportsColor = stdoutColor;
module.exports.default = module.exports; // For TypeScript


/***/ }),

/***/ 2138:
/***/ ((module) => {

"use strict";

const TEMPLATE_REGEX = /(?:\\(u[a-f\d]{4}|x[a-f\d]{2}|.))|(?:\{(~)?(\w+(?:\([^)]*\))?(?:\.\w+(?:\([^)]*\))?)*)(?:[ \t]|(?=\r?\n)))|(\})|((?:.|[\r\n\f])+?)/gi;
const STYLE_REGEX = /(?:^|\.)(\w+)(?:\(([^)]*)\))?/g;
const STRING_REGEX = /^(['"])((?:\\.|(?!\1)[^\\])*)\1$/;
const ESCAPE_REGEX = /\\(u[a-f\d]{4}|x[a-f\d]{2}|.)|([^\\])/gi;

const ESCAPES = new Map([
	['n', '\n'],
	['r', '\r'],
	['t', '\t'],
	['b', '\b'],
	['f', '\f'],
	['v', '\v'],
	['0', '\0'],
	['\\', '\\'],
	['e', '\u001B'],
	['a', '\u0007']
]);

function unescape(c) {
	if ((c[0] === 'u' && c.length === 5) || (c[0] === 'x' && c.length === 3)) {
		return String.fromCharCode(parseInt(c.slice(1), 16));
	}

	return ESCAPES.get(c) || c;
}

function parseArguments(name, args) {
	const results = [];
	const chunks = args.trim().split(/\s*,\s*/g);
	let matches;

	for (const chunk of chunks) {
		if (!isNaN(chunk)) {
			results.push(Number(chunk));
		} else if ((matches = chunk.match(STRING_REGEX))) {
			results.push(matches[2].replace(ESCAPE_REGEX, (m, escape, chr) => escape ? unescape(escape) : chr));
		} else {
			throw new Error(`Invalid Chalk template style argument: ${chunk} (in style '${name}')`);
		}
	}

	return results;
}

function parseStyle(style) {
	STYLE_REGEX.lastIndex = 0;

	const results = [];
	let matches;

	while ((matches = STYLE_REGEX.exec(style)) !== null) {
		const name = matches[1];

		if (matches[2]) {
			const args = parseArguments(name, matches[2]);
			results.push([name].concat(args));
		} else {
			results.push([name]);
		}
	}

	return results;
}

function buildStyle(chalk, styles) {
	const enabled = {};

	for (const layer of styles) {
		for (const style of layer.styles) {
			enabled[style[0]] = layer.inverse ? null : style.slice(1);
		}
	}

	let current = chalk;
	for (const styleName of Object.keys(enabled)) {
		if (Array.isArray(enabled[styleName])) {
			if (!(styleName in current)) {
				throw new Error(`Unknown Chalk style: ${styleName}`);
			}

			if (enabled[styleName].length > 0) {
				current = current[styleName].apply(current, enabled[styleName]);
			} else {
				current = current[styleName];
			}
		}
	}

	return current;
}

module.exports = (chalk, tmp) => {
	const styles = [];
	const chunks = [];
	let chunk = [];

	// eslint-disable-next-line max-params
	tmp.replace(TEMPLATE_REGEX, (m, escapeChar, inverse, style, close, chr) => {
		if (escapeChar) {
			chunk.push(unescape(escapeChar));
		} else if (style) {
			const str = chunk.join('');
			chunk = [];
			chunks.push(styles.length === 0 ? str : buildStyle(chalk, styles)(str));
			styles.push({inverse, styles: parseStyle(style)});
		} else if (close) {
			if (styles.length === 0) {
				throw new Error('Found extraneous } in Chalk template literal');
			}

			chunks.push(buildStyle(chalk, styles)(chunk.join('')));
			chunk = [];
			styles.pop();
		} else {
			chunk.push(chr);
		}
	});

	chunks.push(chunk.join(''));

	if (styles.length > 0) {
		const errMsg = `Chalk template literal is missing ${styles.length} closing bracket${styles.length === 1 ? '' : 's'} (\`}\`)`;
		throw new Error(errMsg);
	}

	return chunks.join('');
};


/***/ }),

/***/ 7391:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/* MIT license */
var cssKeywords = __webpack_require__(8510);

// NOTE: conversions should only return primitive values (i.e. arrays, or
//       values that give correct `typeof` results).
//       do not use box values types (i.e. Number(), String(), etc.)

var reverseKeywords = {};
for (var key in cssKeywords) {
	if (cssKeywords.hasOwnProperty(key)) {
		reverseKeywords[cssKeywords[key]] = key;
	}
}

var convert = module.exports = {
	rgb: {channels: 3, labels: 'rgb'},
	hsl: {channels: 3, labels: 'hsl'},
	hsv: {channels: 3, labels: 'hsv'},
	hwb: {channels: 3, labels: 'hwb'},
	cmyk: {channels: 4, labels: 'cmyk'},
	xyz: {channels: 3, labels: 'xyz'},
	lab: {channels: 3, labels: 'lab'},
	lch: {channels: 3, labels: 'lch'},
	hex: {channels: 1, labels: ['hex']},
	keyword: {channels: 1, labels: ['keyword']},
	ansi16: {channels: 1, labels: ['ansi16']},
	ansi256: {channels: 1, labels: ['ansi256']},
	hcg: {channels: 3, labels: ['h', 'c', 'g']},
	apple: {channels: 3, labels: ['r16', 'g16', 'b16']},
	gray: {channels: 1, labels: ['gray']}
};

// hide .channels and .labels properties
for (var model in convert) {
	if (convert.hasOwnProperty(model)) {
		if (!('channels' in convert[model])) {
			throw new Error('missing channels property: ' + model);
		}

		if (!('labels' in convert[model])) {
			throw new Error('missing channel labels property: ' + model);
		}

		if (convert[model].labels.length !== convert[model].channels) {
			throw new Error('channel and label counts mismatch: ' + model);
		}

		var channels = convert[model].channels;
		var labels = convert[model].labels;
		delete convert[model].channels;
		delete convert[model].labels;
		Object.defineProperty(convert[model], 'channels', {value: channels});
		Object.defineProperty(convert[model], 'labels', {value: labels});
	}
}

convert.rgb.hsl = function (rgb) {
	var r = rgb[0] / 255;
	var g = rgb[1] / 255;
	var b = rgb[2] / 255;
	var min = Math.min(r, g, b);
	var max = Math.max(r, g, b);
	var delta = max - min;
	var h;
	var s;
	var l;

	if (max === min) {
		h = 0;
	} else if (r === max) {
		h = (g - b) / delta;
	} else if (g === max) {
		h = 2 + (b - r) / delta;
	} else if (b === max) {
		h = 4 + (r - g) / delta;
	}

	h = Math.min(h * 60, 360);

	if (h < 0) {
		h += 360;
	}

	l = (min + max) / 2;

	if (max === min) {
		s = 0;
	} else if (l <= 0.5) {
		s = delta / (max + min);
	} else {
		s = delta / (2 - max - min);
	}

	return [h, s * 100, l * 100];
};

convert.rgb.hsv = function (rgb) {
	var rdif;
	var gdif;
	var bdif;
	var h;
	var s;

	var r = rgb[0] / 255;
	var g = rgb[1] / 255;
	var b = rgb[2] / 255;
	var v = Math.max(r, g, b);
	var diff = v - Math.min(r, g, b);
	var diffc = function (c) {
		return (v - c) / 6 / diff + 1 / 2;
	};

	if (diff === 0) {
		h = s = 0;
	} else {
		s = diff / v;
		rdif = diffc(r);
		gdif = diffc(g);
		bdif = diffc(b);

		if (r === v) {
			h = bdif - gdif;
		} else if (g === v) {
			h = (1 / 3) + rdif - bdif;
		} else if (b === v) {
			h = (2 / 3) + gdif - rdif;
		}
		if (h < 0) {
			h += 1;
		} else if (h > 1) {
			h -= 1;
		}
	}

	return [
		h * 360,
		s * 100,
		v * 100
	];
};

convert.rgb.hwb = function (rgb) {
	var r = rgb[0];
	var g = rgb[1];
	var b = rgb[2];
	var h = convert.rgb.hsl(rgb)[0];
	var w = 1 / 255 * Math.min(r, Math.min(g, b));

	b = 1 - 1 / 255 * Math.max(r, Math.max(g, b));

	return [h, w * 100, b * 100];
};

convert.rgb.cmyk = function (rgb) {
	var r = rgb[0] / 255;
	var g = rgb[1] / 255;
	var b = rgb[2] / 255;
	var c;
	var m;
	var y;
	var k;

	k = Math.min(1 - r, 1 - g, 1 - b);
	c = (1 - r - k) / (1 - k) || 0;
	m = (1 - g - k) / (1 - k) || 0;
	y = (1 - b - k) / (1 - k) || 0;

	return [c * 100, m * 100, y * 100, k * 100];
};

/**
 * See https://en.m.wikipedia.org/wiki/Euclidean_distance#Squared_Euclidean_distance
 * */
function comparativeDistance(x, y) {
	return (
		Math.pow(x[0] - y[0], 2) +
		Math.pow(x[1] - y[1], 2) +
		Math.pow(x[2] - y[2], 2)
	);
}

convert.rgb.keyword = function (rgb) {
	var reversed = reverseKeywords[rgb];
	if (reversed) {
		return reversed;
	}

	var currentClosestDistance = Infinity;
	var currentClosestKeyword;

	for (var keyword in cssKeywords) {
		if (cssKeywords.hasOwnProperty(keyword)) {
			var value = cssKeywords[keyword];

			// Compute comparative distance
			var distance = comparativeDistance(rgb, value);

			// Check if its less, if so set as closest
			if (distance < currentClosestDistance) {
				currentClosestDistance = distance;
				currentClosestKeyword = keyword;
			}
		}
	}

	return currentClosestKeyword;
};

convert.keyword.rgb = function (keyword) {
	return cssKeywords[keyword];
};

convert.rgb.xyz = function (rgb) {
	var r = rgb[0] / 255;
	var g = rgb[1] / 255;
	var b = rgb[2] / 255;

	// assume sRGB
	r = r > 0.04045 ? Math.pow(((r + 0.055) / 1.055), 2.4) : (r / 12.92);
	g = g > 0.04045 ? Math.pow(((g + 0.055) / 1.055), 2.4) : (g / 12.92);
	b = b > 0.04045 ? Math.pow(((b + 0.055) / 1.055), 2.4) : (b / 12.92);

	var x = (r * 0.4124) + (g * 0.3576) + (b * 0.1805);
	var y = (r * 0.2126) + (g * 0.7152) + (b * 0.0722);
	var z = (r * 0.0193) + (g * 0.1192) + (b * 0.9505);

	return [x * 100, y * 100, z * 100];
};

convert.rgb.lab = function (rgb) {
	var xyz = convert.rgb.xyz(rgb);
	var x = xyz[0];
	var y = xyz[1];
	var z = xyz[2];
	var l;
	var a;
	var b;

	x /= 95.047;
	y /= 100;
	z /= 108.883;

	x = x > 0.008856 ? Math.pow(x, 1 / 3) : (7.787 * x) + (16 / 116);
	y = y > 0.008856 ? Math.pow(y, 1 / 3) : (7.787 * y) + (16 / 116);
	z = z > 0.008856 ? Math.pow(z, 1 / 3) : (7.787 * z) + (16 / 116);

	l = (116 * y) - 16;
	a = 500 * (x - y);
	b = 200 * (y - z);

	return [l, a, b];
};

convert.hsl.rgb = function (hsl) {
	var h = hsl[0] / 360;
	var s = hsl[1] / 100;
	var l = hsl[2] / 100;
	var t1;
	var t2;
	var t3;
	var rgb;
	var val;

	if (s === 0) {
		val = l * 255;
		return [val, val, val];
	}

	if (l < 0.5) {
		t2 = l * (1 + s);
	} else {
		t2 = l + s - l * s;
	}

	t1 = 2 * l - t2;

	rgb = [0, 0, 0];
	for (var i = 0; i < 3; i++) {
		t3 = h + 1 / 3 * -(i - 1);
		if (t3 < 0) {
			t3++;
		}
		if (t3 > 1) {
			t3--;
		}

		if (6 * t3 < 1) {
			val = t1 + (t2 - t1) * 6 * t3;
		} else if (2 * t3 < 1) {
			val = t2;
		} else if (3 * t3 < 2) {
			val = t1 + (t2 - t1) * (2 / 3 - t3) * 6;
		} else {
			val = t1;
		}

		rgb[i] = val * 255;
	}

	return rgb;
};

convert.hsl.hsv = function (hsl) {
	var h = hsl[0];
	var s = hsl[1] / 100;
	var l = hsl[2] / 100;
	var smin = s;
	var lmin = Math.max(l, 0.01);
	var sv;
	var v;

	l *= 2;
	s *= (l <= 1) ? l : 2 - l;
	smin *= lmin <= 1 ? lmin : 2 - lmin;
	v = (l + s) / 2;
	sv = l === 0 ? (2 * smin) / (lmin + smin) : (2 * s) / (l + s);

	return [h, sv * 100, v * 100];
};

convert.hsv.rgb = function (hsv) {
	var h = hsv[0] / 60;
	var s = hsv[1] / 100;
	var v = hsv[2] / 100;
	var hi = Math.floor(h) % 6;

	var f = h - Math.floor(h);
	var p = 255 * v * (1 - s);
	var q = 255 * v * (1 - (s * f));
	var t = 255 * v * (1 - (s * (1 - f)));
	v *= 255;

	switch (hi) {
		case 0:
			return [v, t, p];
		case 1:
			return [q, v, p];
		case 2:
			return [p, v, t];
		case 3:
			return [p, q, v];
		case 4:
			return [t, p, v];
		case 5:
			return [v, p, q];
	}
};

convert.hsv.hsl = function (hsv) {
	var h = hsv[0];
	var s = hsv[1] / 100;
	var v = hsv[2] / 100;
	var vmin = Math.max(v, 0.01);
	var lmin;
	var sl;
	var l;

	l = (2 - s) * v;
	lmin = (2 - s) * vmin;
	sl = s * vmin;
	sl /= (lmin <= 1) ? lmin : 2 - lmin;
	sl = sl || 0;
	l /= 2;

	return [h, sl * 100, l * 100];
};

// http://dev.w3.org/csswg/css-color/#hwb-to-rgb
convert.hwb.rgb = function (hwb) {
	var h = hwb[0] / 360;
	var wh = hwb[1] / 100;
	var bl = hwb[2] / 100;
	var ratio = wh + bl;
	var i;
	var v;
	var f;
	var n;

	// wh + bl cant be > 1
	if (ratio > 1) {
		wh /= ratio;
		bl /= ratio;
	}

	i = Math.floor(6 * h);
	v = 1 - bl;
	f = 6 * h - i;

	if ((i & 0x01) !== 0) {
		f = 1 - f;
	}

	n = wh + f * (v - wh); // linear interpolation

	var r;
	var g;
	var b;
	switch (i) {
		default:
		case 6:
		case 0: r = v; g = n; b = wh; break;
		case 1: r = n; g = v; b = wh; break;
		case 2: r = wh; g = v; b = n; break;
		case 3: r = wh; g = n; b = v; break;
		case 4: r = n; g = wh; b = v; break;
		case 5: r = v; g = wh; b = n; break;
	}

	return [r * 255, g * 255, b * 255];
};

convert.cmyk.rgb = function (cmyk) {
	var c = cmyk[0] / 100;
	var m = cmyk[1] / 100;
	var y = cmyk[2] / 100;
	var k = cmyk[3] / 100;
	var r;
	var g;
	var b;

	r = 1 - Math.min(1, c * (1 - k) + k);
	g = 1 - Math.min(1, m * (1 - k) + k);
	b = 1 - Math.min(1, y * (1 - k) + k);

	return [r * 255, g * 255, b * 255];
};

convert.xyz.rgb = function (xyz) {
	var x = xyz[0] / 100;
	var y = xyz[1] / 100;
	var z = xyz[2] / 100;
	var r;
	var g;
	var b;

	r = (x * 3.2406) + (y * -1.5372) + (z * -0.4986);
	g = (x * -0.9689) + (y * 1.8758) + (z * 0.0415);
	b = (x * 0.0557) + (y * -0.2040) + (z * 1.0570);

	// assume sRGB
	r = r > 0.0031308
		? ((1.055 * Math.pow(r, 1.0 / 2.4)) - 0.055)
		: r * 12.92;

	g = g > 0.0031308
		? ((1.055 * Math.pow(g, 1.0 / 2.4)) - 0.055)
		: g * 12.92;

	b = b > 0.0031308
		? ((1.055 * Math.pow(b, 1.0 / 2.4)) - 0.055)
		: b * 12.92;

	r = Math.min(Math.max(0, r), 1);
	g = Math.min(Math.max(0, g), 1);
	b = Math.min(Math.max(0, b), 1);

	return [r * 255, g * 255, b * 255];
};

convert.xyz.lab = function (xyz) {
	var x = xyz[0];
	var y = xyz[1];
	var z = xyz[2];
	var l;
	var a;
	var b;

	x /= 95.047;
	y /= 100;
	z /= 108.883;

	x = x > 0.008856 ? Math.pow(x, 1 / 3) : (7.787 * x) + (16 / 116);
	y = y > 0.008856 ? Math.pow(y, 1 / 3) : (7.787 * y) + (16 / 116);
	z = z > 0.008856 ? Math.pow(z, 1 / 3) : (7.787 * z) + (16 / 116);

	l = (116 * y) - 16;
	a = 500 * (x - y);
	b = 200 * (y - z);

	return [l, a, b];
};

convert.lab.xyz = function (lab) {
	var l = lab[0];
	var a = lab[1];
	var b = lab[2];
	var x;
	var y;
	var z;

	y = (l + 16) / 116;
	x = a / 500 + y;
	z = y - b / 200;

	var y2 = Math.pow(y, 3);
	var x2 = Math.pow(x, 3);
	var z2 = Math.pow(z, 3);
	y = y2 > 0.008856 ? y2 : (y - 16 / 116) / 7.787;
	x = x2 > 0.008856 ? x2 : (x - 16 / 116) / 7.787;
	z = z2 > 0.008856 ? z2 : (z - 16 / 116) / 7.787;

	x *= 95.047;
	y *= 100;
	z *= 108.883;

	return [x, y, z];
};

convert.lab.lch = function (lab) {
	var l = lab[0];
	var a = lab[1];
	var b = lab[2];
	var hr;
	var h;
	var c;

	hr = Math.atan2(b, a);
	h = hr * 360 / 2 / Math.PI;

	if (h < 0) {
		h += 360;
	}

	c = Math.sqrt(a * a + b * b);

	return [l, c, h];
};

convert.lch.lab = function (lch) {
	var l = lch[0];
	var c = lch[1];
	var h = lch[2];
	var a;
	var b;
	var hr;

	hr = h / 360 * 2 * Math.PI;
	a = c * Math.cos(hr);
	b = c * Math.sin(hr);

	return [l, a, b];
};

convert.rgb.ansi16 = function (args) {
	var r = args[0];
	var g = args[1];
	var b = args[2];
	var value = 1 in arguments ? arguments[1] : convert.rgb.hsv(args)[2]; // hsv -> ansi16 optimization

	value = Math.round(value / 50);

	if (value === 0) {
		return 30;
	}

	var ansi = 30
		+ ((Math.round(b / 255) << 2)
		| (Math.round(g / 255) << 1)
		| Math.round(r / 255));

	if (value === 2) {
		ansi += 60;
	}

	return ansi;
};

convert.hsv.ansi16 = function (args) {
	// optimization here; we already know the value and don't need to get
	// it converted for us.
	return convert.rgb.ansi16(convert.hsv.rgb(args), args[2]);
};

convert.rgb.ansi256 = function (args) {
	var r = args[0];
	var g = args[1];
	var b = args[2];

	// we use the extended greyscale palette here, with the exception of
	// black and white. normal palette only has 4 greyscale shades.
	if (r === g && g === b) {
		if (r < 8) {
			return 16;
		}

		if (r > 248) {
			return 231;
		}

		return Math.round(((r - 8) / 247) * 24) + 232;
	}

	var ansi = 16
		+ (36 * Math.round(r / 255 * 5))
		+ (6 * Math.round(g / 255 * 5))
		+ Math.round(b / 255 * 5);

	return ansi;
};

convert.ansi16.rgb = function (args) {
	var color = args % 10;

	// handle greyscale
	if (color === 0 || color === 7) {
		if (args > 50) {
			color += 3.5;
		}

		color = color / 10.5 * 255;

		return [color, color, color];
	}

	var mult = (~~(args > 50) + 1) * 0.5;
	var r = ((color & 1) * mult) * 255;
	var g = (((color >> 1) & 1) * mult) * 255;
	var b = (((color >> 2) & 1) * mult) * 255;

	return [r, g, b];
};

convert.ansi256.rgb = function (args) {
	// handle greyscale
	if (args >= 232) {
		var c = (args - 232) * 10 + 8;
		return [c, c, c];
	}

	args -= 16;

	var rem;
	var r = Math.floor(args / 36) / 5 * 255;
	var g = Math.floor((rem = args % 36) / 6) / 5 * 255;
	var b = (rem % 6) / 5 * 255;

	return [r, g, b];
};

convert.rgb.hex = function (args) {
	var integer = ((Math.round(args[0]) & 0xFF) << 16)
		+ ((Math.round(args[1]) & 0xFF) << 8)
		+ (Math.round(args[2]) & 0xFF);

	var string = integer.toString(16).toUpperCase();
	return '000000'.substring(string.length) + string;
};

convert.hex.rgb = function (args) {
	var match = args.toString(16).match(/[a-f0-9]{6}|[a-f0-9]{3}/i);
	if (!match) {
		return [0, 0, 0];
	}

	var colorString = match[0];

	if (match[0].length === 3) {
		colorString = colorString.split('').map(function (char) {
			return char + char;
		}).join('');
	}

	var integer = parseInt(colorString, 16);
	var r = (integer >> 16) & 0xFF;
	var g = (integer >> 8) & 0xFF;
	var b = integer & 0xFF;

	return [r, g, b];
};

convert.rgb.hcg = function (rgb) {
	var r = rgb[0] / 255;
	var g = rgb[1] / 255;
	var b = rgb[2] / 255;
	var max = Math.max(Math.max(r, g), b);
	var min = Math.min(Math.min(r, g), b);
	var chroma = (max - min);
	var grayscale;
	var hue;

	if (chroma < 1) {
		grayscale = min / (1 - chroma);
	} else {
		grayscale = 0;
	}

	if (chroma <= 0) {
		hue = 0;
	} else
	if (max === r) {
		hue = ((g - b) / chroma) % 6;
	} else
	if (max === g) {
		hue = 2 + (b - r) / chroma;
	} else {
		hue = 4 + (r - g) / chroma + 4;
	}

	hue /= 6;
	hue %= 1;

	return [hue * 360, chroma * 100, grayscale * 100];
};

convert.hsl.hcg = function (hsl) {
	var s = hsl[1] / 100;
	var l = hsl[2] / 100;
	var c = 1;
	var f = 0;

	if (l < 0.5) {
		c = 2.0 * s * l;
	} else {
		c = 2.0 * s * (1.0 - l);
	}

	if (c < 1.0) {
		f = (l - 0.5 * c) / (1.0 - c);
	}

	return [hsl[0], c * 100, f * 100];
};

convert.hsv.hcg = function (hsv) {
	var s = hsv[1] / 100;
	var v = hsv[2] / 100;

	var c = s * v;
	var f = 0;

	if (c < 1.0) {
		f = (v - c) / (1 - c);
	}

	return [hsv[0], c * 100, f * 100];
};

convert.hcg.rgb = function (hcg) {
	var h = hcg[0] / 360;
	var c = hcg[1] / 100;
	var g = hcg[2] / 100;

	if (c === 0.0) {
		return [g * 255, g * 255, g * 255];
	}

	var pure = [0, 0, 0];
	var hi = (h % 1) * 6;
	var v = hi % 1;
	var w = 1 - v;
	var mg = 0;

	switch (Math.floor(hi)) {
		case 0:
			pure[0] = 1; pure[1] = v; pure[2] = 0; break;
		case 1:
			pure[0] = w; pure[1] = 1; pure[2] = 0; break;
		case 2:
			pure[0] = 0; pure[1] = 1; pure[2] = v; break;
		case 3:
			pure[0] = 0; pure[1] = w; pure[2] = 1; break;
		case 4:
			pure[0] = v; pure[1] = 0; pure[2] = 1; break;
		default:
			pure[0] = 1; pure[1] = 0; pure[2] = w;
	}

	mg = (1.0 - c) * g;

	return [
		(c * pure[0] + mg) * 255,
		(c * pure[1] + mg) * 255,
		(c * pure[2] + mg) * 255
	];
};

convert.hcg.hsv = function (hcg) {
	var c = hcg[1] / 100;
	var g = hcg[2] / 100;

	var v = c + g * (1.0 - c);
	var f = 0;

	if (v > 0.0) {
		f = c / v;
	}

	return [hcg[0], f * 100, v * 100];
};

convert.hcg.hsl = function (hcg) {
	var c = hcg[1] / 100;
	var g = hcg[2] / 100;

	var l = g * (1.0 - c) + 0.5 * c;
	var s = 0;

	if (l > 0.0 && l < 0.5) {
		s = c / (2 * l);
	} else
	if (l >= 0.5 && l < 1.0) {
		s = c / (2 * (1 - l));
	}

	return [hcg[0], s * 100, l * 100];
};

convert.hcg.hwb = function (hcg) {
	var c = hcg[1] / 100;
	var g = hcg[2] / 100;
	var v = c + g * (1.0 - c);
	return [hcg[0], (v - c) * 100, (1 - v) * 100];
};

convert.hwb.hcg = function (hwb) {
	var w = hwb[1] / 100;
	var b = hwb[2] / 100;
	var v = 1 - b;
	var c = v - w;
	var g = 0;

	if (c < 1) {
		g = (v - c) / (1 - c);
	}

	return [hwb[0], c * 100, g * 100];
};

convert.apple.rgb = function (apple) {
	return [(apple[0] / 65535) * 255, (apple[1] / 65535) * 255, (apple[2] / 65535) * 255];
};

convert.rgb.apple = function (rgb) {
	return [(rgb[0] / 255) * 65535, (rgb[1] / 255) * 65535, (rgb[2] / 255) * 65535];
};

convert.gray.rgb = function (args) {
	return [args[0] / 100 * 255, args[0] / 100 * 255, args[0] / 100 * 255];
};

convert.gray.hsl = convert.gray.hsv = function (args) {
	return [0, 0, args[0]];
};

convert.gray.hwb = function (gray) {
	return [0, 100, gray[0]];
};

convert.gray.cmyk = function (gray) {
	return [0, 0, 0, gray[0]];
};

convert.gray.lab = function (gray) {
	return [gray[0], 0, 0];
};

convert.gray.hex = function (gray) {
	var val = Math.round(gray[0] / 100 * 255) & 0xFF;
	var integer = (val << 16) + (val << 8) + val;

	var string = integer.toString(16).toUpperCase();
	return '000000'.substring(string.length) + string;
};

convert.rgb.gray = function (rgb) {
	var val = (rgb[0] + rgb[1] + rgb[2]) / 3;
	return [val / 255 * 100];
};


/***/ }),

/***/ 6931:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var conversions = __webpack_require__(7391);
var route = __webpack_require__(880);

var convert = {};

var models = Object.keys(conversions);

function wrapRaw(fn) {
	var wrappedFn = function (args) {
		if (args === undefined || args === null) {
			return args;
		}

		if (arguments.length > 1) {
			args = Array.prototype.slice.call(arguments);
		}

		return fn(args);
	};

	// preserve .conversion property if there is one
	if ('conversion' in fn) {
		wrappedFn.conversion = fn.conversion;
	}

	return wrappedFn;
}

function wrapRounded(fn) {
	var wrappedFn = function (args) {
		if (args === undefined || args === null) {
			return args;
		}

		if (arguments.length > 1) {
			args = Array.prototype.slice.call(arguments);
		}

		var result = fn(args);

		// we're assuming the result is an array here.
		// see notice in conversions.js; don't use box types
		// in conversion functions.
		if (typeof result === 'object') {
			for (var len = result.length, i = 0; i < len; i++) {
				result[i] = Math.round(result[i]);
			}
		}

		return result;
	};

	// preserve .conversion property if there is one
	if ('conversion' in fn) {
		wrappedFn.conversion = fn.conversion;
	}

	return wrappedFn;
}

models.forEach(function (fromModel) {
	convert[fromModel] = {};

	Object.defineProperty(convert[fromModel], 'channels', {value: conversions[fromModel].channels});
	Object.defineProperty(convert[fromModel], 'labels', {value: conversions[fromModel].labels});

	var routes = route(fromModel);
	var routeModels = Object.keys(routes);

	routeModels.forEach(function (toModel) {
		var fn = routes[toModel];

		convert[fromModel][toModel] = wrapRounded(fn);
		convert[fromModel][toModel].raw = wrapRaw(fn);
	});
});

module.exports = convert;


/***/ }),

/***/ 880:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var conversions = __webpack_require__(7391);

/*
	this function routes a model to all other models.

	all functions that are routed have a property `.conversion` attached
	to the returned synthetic function. This property is an array
	of strings, each with the steps in between the 'from' and 'to'
	color models (inclusive).

	conversions that are not possible simply are not included.
*/

function buildGraph() {
	var graph = {};
	// https://jsperf.com/object-keys-vs-for-in-with-closure/3
	var models = Object.keys(conversions);

	for (var len = models.length, i = 0; i < len; i++) {
		graph[models[i]] = {
			// http://jsperf.com/1-vs-infinity
			// micro-opt, but this is simple.
			distance: -1,
			parent: null
		};
	}

	return graph;
}

// https://en.wikipedia.org/wiki/Breadth-first_search
function deriveBFS(fromModel) {
	var graph = buildGraph();
	var queue = [fromModel]; // unshift -> queue -> pop

	graph[fromModel].distance = 0;

	while (queue.length) {
		var current = queue.pop();
		var adjacents = Object.keys(conversions[current]);

		for (var len = adjacents.length, i = 0; i < len; i++) {
			var adjacent = adjacents[i];
			var node = graph[adjacent];

			if (node.distance === -1) {
				node.distance = graph[current].distance + 1;
				node.parent = current;
				queue.unshift(adjacent);
			}
		}
	}

	return graph;
}

function link(from, to) {
	return function (args) {
		return to(from(args));
	};
}

function wrapConversion(toModel, graph) {
	var path = [graph[toModel].parent, toModel];
	var fn = conversions[graph[toModel].parent][toModel];

	var cur = graph[toModel].parent;
	while (graph[cur].parent) {
		path.unshift(graph[cur].parent);
		fn = link(conversions[graph[cur].parent][cur], fn);
		cur = graph[cur].parent;
	}

	fn.conversion = path;
	return fn;
}

module.exports = function (fromModel) {
	var graph = deriveBFS(fromModel);
	var conversion = {};

	var models = Object.keys(graph);
	for (var len = models.length, i = 0; i < len; i++) {
		var toModel = models[i];
		var node = graph[toModel];

		if (node.parent === null) {
			// no possible conversion, or this node is the source model.
			continue;
		}

		conversion[toModel] = wrapConversion(toModel, graph);
	}

	return conversion;
};



/***/ }),

/***/ 8510:
/***/ ((module) => {

"use strict";


module.exports = {
	"aliceblue": [240, 248, 255],
	"antiquewhite": [250, 235, 215],
	"aqua": [0, 255, 255],
	"aquamarine": [127, 255, 212],
	"azure": [240, 255, 255],
	"beige": [245, 245, 220],
	"bisque": [255, 228, 196],
	"black": [0, 0, 0],
	"blanchedalmond": [255, 235, 205],
	"blue": [0, 0, 255],
	"blueviolet": [138, 43, 226],
	"brown": [165, 42, 42],
	"burlywood": [222, 184, 135],
	"cadetblue": [95, 158, 160],
	"chartreuse": [127, 255, 0],
	"chocolate": [210, 105, 30],
	"coral": [255, 127, 80],
	"cornflowerblue": [100, 149, 237],
	"cornsilk": [255, 248, 220],
	"crimson": [220, 20, 60],
	"cyan": [0, 255, 255],
	"darkblue": [0, 0, 139],
	"darkcyan": [0, 139, 139],
	"darkgoldenrod": [184, 134, 11],
	"darkgray": [169, 169, 169],
	"darkgreen": [0, 100, 0],
	"darkgrey": [169, 169, 169],
	"darkkhaki": [189, 183, 107],
	"darkmagenta": [139, 0, 139],
	"darkolivegreen": [85, 107, 47],
	"darkorange": [255, 140, 0],
	"darkorchid": [153, 50, 204],
	"darkred": [139, 0, 0],
	"darksalmon": [233, 150, 122],
	"darkseagreen": [143, 188, 143],
	"darkslateblue": [72, 61, 139],
	"darkslategray": [47, 79, 79],
	"darkslategrey": [47, 79, 79],
	"darkturquoise": [0, 206, 209],
	"darkviolet": [148, 0, 211],
	"deeppink": [255, 20, 147],
	"deepskyblue": [0, 191, 255],
	"dimgray": [105, 105, 105],
	"dimgrey": [105, 105, 105],
	"dodgerblue": [30, 144, 255],
	"firebrick": [178, 34, 34],
	"floralwhite": [255, 250, 240],
	"forestgreen": [34, 139, 34],
	"fuchsia": [255, 0, 255],
	"gainsboro": [220, 220, 220],
	"ghostwhite": [248, 248, 255],
	"gold": [255, 215, 0],
	"goldenrod": [218, 165, 32],
	"gray": [128, 128, 128],
	"green": [0, 128, 0],
	"greenyellow": [173, 255, 47],
	"grey": [128, 128, 128],
	"honeydew": [240, 255, 240],
	"hotpink": [255, 105, 180],
	"indianred": [205, 92, 92],
	"indigo": [75, 0, 130],
	"ivory": [255, 255, 240],
	"khaki": [240, 230, 140],
	"lavender": [230, 230, 250],
	"lavenderblush": [255, 240, 245],
	"lawngreen": [124, 252, 0],
	"lemonchiffon": [255, 250, 205],
	"lightblue": [173, 216, 230],
	"lightcoral": [240, 128, 128],
	"lightcyan": [224, 255, 255],
	"lightgoldenrodyellow": [250, 250, 210],
	"lightgray": [211, 211, 211],
	"lightgreen": [144, 238, 144],
	"lightgrey": [211, 211, 211],
	"lightpink": [255, 182, 193],
	"lightsalmon": [255, 160, 122],
	"lightseagreen": [32, 178, 170],
	"lightskyblue": [135, 206, 250],
	"lightslategray": [119, 136, 153],
	"lightslategrey": [119, 136, 153],
	"lightsteelblue": [176, 196, 222],
	"lightyellow": [255, 255, 224],
	"lime": [0, 255, 0],
	"limegreen": [50, 205, 50],
	"linen": [250, 240, 230],
	"magenta": [255, 0, 255],
	"maroon": [128, 0, 0],
	"mediumaquamarine": [102, 205, 170],
	"mediumblue": [0, 0, 205],
	"mediumorchid": [186, 85, 211],
	"mediumpurple": [147, 112, 219],
	"mediumseagreen": [60, 179, 113],
	"mediumslateblue": [123, 104, 238],
	"mediumspringgreen": [0, 250, 154],
	"mediumturquoise": [72, 209, 204],
	"mediumvioletred": [199, 21, 133],
	"midnightblue": [25, 25, 112],
	"mintcream": [245, 255, 250],
	"mistyrose": [255, 228, 225],
	"moccasin": [255, 228, 181],
	"navajowhite": [255, 222, 173],
	"navy": [0, 0, 128],
	"oldlace": [253, 245, 230],
	"olive": [128, 128, 0],
	"olivedrab": [107, 142, 35],
	"orange": [255, 165, 0],
	"orangered": [255, 69, 0],
	"orchid": [218, 112, 214],
	"palegoldenrod": [238, 232, 170],
	"palegreen": [152, 251, 152],
	"paleturquoise": [175, 238, 238],
	"palevioletred": [219, 112, 147],
	"papayawhip": [255, 239, 213],
	"peachpuff": [255, 218, 185],
	"peru": [205, 133, 63],
	"pink": [255, 192, 203],
	"plum": [221, 160, 221],
	"powderblue": [176, 224, 230],
	"purple": [128, 0, 128],
	"rebeccapurple": [102, 51, 153],
	"red": [255, 0, 0],
	"rosybrown": [188, 143, 143],
	"royalblue": [65, 105, 225],
	"saddlebrown": [139, 69, 19],
	"salmon": [250, 128, 114],
	"sandybrown": [244, 164, 96],
	"seagreen": [46, 139, 87],
	"seashell": [255, 245, 238],
	"sienna": [160, 82, 45],
	"silver": [192, 192, 192],
	"skyblue": [135, 206, 235],
	"slateblue": [106, 90, 205],
	"slategray": [112, 128, 144],
	"slategrey": [112, 128, 144],
	"snow": [255, 250, 250],
	"springgreen": [0, 255, 127],
	"steelblue": [70, 130, 180],
	"tan": [210, 180, 140],
	"teal": [0, 128, 128],
	"thistle": [216, 191, 216],
	"tomato": [255, 99, 71],
	"turquoise": [64, 224, 208],
	"violet": [238, 130, 238],
	"wheat": [245, 222, 179],
	"white": [255, 255, 255],
	"whitesmoke": [245, 245, 245],
	"yellow": [255, 255, 0],
	"yellowgreen": [154, 205, 50]
};


/***/ }),

/***/ 6891:
/***/ ((module) => {

module.exports = function (xs, fn) {
    var res = [];
    for (var i = 0; i < xs.length; i++) {
        var x = fn(xs[i], i);
        if (isArray(x)) res.push.apply(res, x);
        else res.push(x);
    }
    return res;
};

var isArray = Array.isArray || function (xs) {
    return Object.prototype.toString.call(xs) === '[object Array]';
};


/***/ }),

/***/ 9446:
/***/ ((module) => {

module.exports = function (it) {
  if (typeof it != 'function') {
    throw TypeError(String(it) + ' is not a function');
  } return it;
};


/***/ }),

/***/ 6331:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var isObject = __webpack_require__(5429);

module.exports = function (it) {
  if (!isObject(it) && it !== null) {
    throw TypeError("Can't set " + String(it) + ' as a prototype');
  } return it;
};


/***/ }),

/***/ 6535:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var wellKnownSymbol = __webpack_require__(4162);
var create = __webpack_require__(8456);
var createNonEnumerableProperty = __webpack_require__(7754);

var UNSCOPABLES = wellKnownSymbol('unscopables');
var ArrayPrototype = Array.prototype;

// Array.prototype[@@unscopables]
// https://tc39.github.io/ecma262/#sec-array.prototype-@@unscopables
if (ArrayPrototype[UNSCOPABLES] == undefined) {
  createNonEnumerableProperty(ArrayPrototype, UNSCOPABLES, create(null));
}

// add a key to Array.prototype[@@unscopables]
module.exports = function (key) {
  ArrayPrototype[UNSCOPABLES][key] = true;
};


/***/ }),

/***/ 8485:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

var charAt = __webpack_require__(57).charAt;

// `AdvanceStringIndex` abstract operation
// https://tc39.github.io/ecma262/#sec-advancestringindex
module.exports = function (S, index, unicode) {
  return index + (unicode ? charAt(S, index).length : 1);
};


/***/ }),

/***/ 3960:
/***/ ((module) => {

module.exports = function (it, Constructor, name) {
  if (!(it instanceof Constructor)) {
    throw TypeError('Incorrect ' + (name ? name + ' ' : '') + 'invocation');
  } return it;
};


/***/ }),

/***/ 8005:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var isObject = __webpack_require__(5429);

module.exports = function (it) {
  if (!isObject(it)) {
    throw TypeError(String(it) + ' is not an object');
  } return it;
};


/***/ }),

/***/ 7637:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var toIndexedObject = __webpack_require__(4747);
var toLength = __webpack_require__(5626);
var toAbsoluteIndex = __webpack_require__(987);

// `Array.prototype.{ indexOf, includes }` methods implementation
var createMethod = function (IS_INCLUDES) {
  return function ($this, el, fromIndex) {
    var O = toIndexedObject($this);
    var length = toLength(O.length);
    var index = toAbsoluteIndex(fromIndex, length);
    var value;
    // Array#includes uses SameValueZero equality algorithm
    // eslint-disable-next-line no-self-compare
    if (IS_INCLUDES && el != el) while (length > index) {
      value = O[index++];
      // eslint-disable-next-line no-self-compare
      if (value != value) return true;
    // Array#indexOf ignores holes, Array#includes - not
    } else for (;length > index; index++) {
      if ((IS_INCLUDES || index in O) && O[index] === el) return IS_INCLUDES || index || 0;
    } return !IS_INCLUDES && -1;
  };
};

module.exports = {
  // `Array.prototype.includes` method
  // https://tc39.github.io/ecma262/#sec-array.prototype.includes
  includes: createMethod(true),
  // `Array.prototype.indexOf` method
  // https://tc39.github.io/ecma262/#sec-array.prototype.indexof
  indexOf: createMethod(false)
};


/***/ }),

/***/ 658:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var bind = __webpack_require__(6516);
var IndexedObject = __webpack_require__(2804);
var toObject = __webpack_require__(3228);
var toLength = __webpack_require__(5626);
var arraySpeciesCreate = __webpack_require__(2371);

var push = [].push;

// `Array.prototype.{ forEach, map, filter, some, every, find, findIndex }` methods implementation
var createMethod = function (TYPE) {
  var IS_MAP = TYPE == 1;
  var IS_FILTER = TYPE == 2;
  var IS_SOME = TYPE == 3;
  var IS_EVERY = TYPE == 4;
  var IS_FIND_INDEX = TYPE == 6;
  var NO_HOLES = TYPE == 5 || IS_FIND_INDEX;
  return function ($this, callbackfn, that, specificCreate) {
    var O = toObject($this);
    var self = IndexedObject(O);
    var boundFunction = bind(callbackfn, that, 3);
    var length = toLength(self.length);
    var index = 0;
    var create = specificCreate || arraySpeciesCreate;
    var target = IS_MAP ? create($this, length) : IS_FILTER ? create($this, 0) : undefined;
    var value, result;
    for (;length > index; index++) if (NO_HOLES || index in self) {
      value = self[index];
      result = boundFunction(value, index, O);
      if (TYPE) {
        if (IS_MAP) target[index] = result; // map
        else if (result) switch (TYPE) {
          case 3: return true;              // some
          case 5: return value;             // find
          case 6: return index;             // findIndex
          case 2: push.call(target, value); // filter
        } else if (IS_EVERY) return false;  // every
      }
    }
    return IS_FIND_INDEX ? -1 : IS_SOME || IS_EVERY ? IS_EVERY : target;
  };
};

module.exports = {
  // `Array.prototype.forEach` method
  // https://tc39.github.io/ecma262/#sec-array.prototype.foreach
  forEach: createMethod(0),
  // `Array.prototype.map` method
  // https://tc39.github.io/ecma262/#sec-array.prototype.map
  map: createMethod(1),
  // `Array.prototype.filter` method
  // https://tc39.github.io/ecma262/#sec-array.prototype.filter
  filter: createMethod(2),
  // `Array.prototype.some` method
  // https://tc39.github.io/ecma262/#sec-array.prototype.some
  some: createMethod(3),
  // `Array.prototype.every` method
  // https://tc39.github.io/ecma262/#sec-array.prototype.every
  every: createMethod(4),
  // `Array.prototype.find` method
  // https://tc39.github.io/ecma262/#sec-array.prototype.find
  find: createMethod(5),
  // `Array.prototype.findIndex` method
  // https://tc39.github.io/ecma262/#sec-array.prototype.findIndex
  findIndex: createMethod(6)
};


/***/ }),

/***/ 160:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var fails = __webpack_require__(6287);
var wellKnownSymbol = __webpack_require__(4162);
var V8_VERSION = __webpack_require__(3123);

var SPECIES = wellKnownSymbol('species');

module.exports = function (METHOD_NAME) {
  // We can't use this feature detection in V8 since it causes
  // deoptimization and serious performance degradation
  // https://github.com/zloirock/core-js/issues/677
  return V8_VERSION >= 51 || !fails(function () {
    var array = [];
    var constructor = array.constructor = {};
    constructor[SPECIES] = function () {
      return { foo: 1 };
    };
    return array[METHOD_NAME](Boolean).foo !== 1;
  });
};


/***/ }),

/***/ 2371:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var isObject = __webpack_require__(5429);
var isArray = __webpack_require__(8859);
var wellKnownSymbol = __webpack_require__(4162);

var SPECIES = wellKnownSymbol('species');

// `ArraySpeciesCreate` abstract operation
// https://tc39.github.io/ecma262/#sec-arrayspeciescreate
module.exports = function (originalArray, length) {
  var C;
  if (isArray(originalArray)) {
    C = originalArray.constructor;
    // cross-realm fallback
    if (typeof C == 'function' && (C === Array || isArray(C.prototype))) C = undefined;
    else if (isObject(C)) {
      C = C[SPECIES];
      if (C === null) C = undefined;
    }
  } return new (C === undefined ? Array : C)(length === 0 ? 0 : length);
};


/***/ }),

/***/ 6516:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var aFunction = __webpack_require__(9446);

// optional / simple context binding
module.exports = function (fn, that, length) {
  aFunction(fn);
  if (that === undefined) return fn;
  switch (length) {
    case 0: return function () {
      return fn.call(that);
    };
    case 1: return function (a) {
      return fn.call(that, a);
    };
    case 2: return function (a, b) {
      return fn.call(that, a, b);
    };
    case 3: return function (a, b, c) {
      return fn.call(that, a, b, c);
    };
  }
  return function (/* ...args */) {
    return fn.apply(that, arguments);
  };
};


/***/ }),

/***/ 5209:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var anObject = __webpack_require__(8005);

// call something on iterator step with safe closing on error
module.exports = function (iterator, fn, value, ENTRIES) {
  try {
    return ENTRIES ? fn(anObject(value)[0], value[1]) : fn(value);
  // 7.4.6 IteratorClose(iterator, completion)
  } catch (error) {
    var returnMethod = iterator['return'];
    if (returnMethod !== undefined) anObject(returnMethod.call(iterator));
    throw error;
  }
};


/***/ }),

/***/ 6611:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var wellKnownSymbol = __webpack_require__(4162);

var ITERATOR = wellKnownSymbol('iterator');
var SAFE_CLOSING = false;

try {
  var called = 0;
  var iteratorWithReturn = {
    next: function () {
      return { done: !!called++ };
    },
    'return': function () {
      SAFE_CLOSING = true;
    }
  };
  iteratorWithReturn[ITERATOR] = function () {
    return this;
  };
  // eslint-disable-next-line no-throw-literal
  Array.from(iteratorWithReturn, function () { throw 2; });
} catch (error) { /* empty */ }

module.exports = function (exec, SKIP_CLOSING) {
  if (!SKIP_CLOSING && !SAFE_CLOSING) return false;
  var ITERATION_SUPPORT = false;
  try {
    var object = {};
    object[ITERATOR] = function () {
      return {
        next: function () {
          return { done: ITERATION_SUPPORT = true };
        }
      };
    };
    exec(object);
  } catch (error) { /* empty */ }
  return ITERATION_SUPPORT;
};


/***/ }),

/***/ 619:
/***/ ((module) => {

var toString = {}.toString;

module.exports = function (it) {
  return toString.call(it).slice(8, -1);
};


/***/ }),

/***/ 477:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var classofRaw = __webpack_require__(619);
var wellKnownSymbol = __webpack_require__(4162);

var TO_STRING_TAG = wellKnownSymbol('toStringTag');
// ES3 wrong here
var CORRECT_ARGUMENTS = classofRaw(function () { return arguments; }()) == 'Arguments';

// fallback for IE11 Script Access Denied error
var tryGet = function (it, key) {
  try {
    return it[key];
  } catch (error) { /* empty */ }
};

// getting tag from ES6+ `Object.prototype.toString`
module.exports = function (it) {
  var O, tag, result;
  return it === undefined ? 'Undefined' : it === null ? 'Null'
    // @@toStringTag case
    : typeof (tag = tryGet(O = Object(it), TO_STRING_TAG)) == 'string' ? tag
    // builtinTag case
    : CORRECT_ARGUMENTS ? classofRaw(O)
    // ES3 arguments fallback
    : (result = classofRaw(O)) == 'Object' && typeof O.callee == 'function' ? 'Arguments' : result;
};


/***/ }),

/***/ 9903:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

var defineProperty = __webpack_require__(6085).f;
var create = __webpack_require__(8456);
var redefineAll = __webpack_require__(2214);
var bind = __webpack_require__(6516);
var anInstance = __webpack_require__(3960);
var iterate = __webpack_require__(9538);
var defineIterator = __webpack_require__(376);
var setSpecies = __webpack_require__(2420);
var DESCRIPTORS = __webpack_require__(5121);
var fastKey = __webpack_require__(9350).fastKey;
var InternalStateModule = __webpack_require__(1896);

var setInternalState = InternalStateModule.set;
var internalStateGetterFor = InternalStateModule.getterFor;

module.exports = {
  getConstructor: function (wrapper, CONSTRUCTOR_NAME, IS_MAP, ADDER) {
    var C = wrapper(function (that, iterable) {
      anInstance(that, C, CONSTRUCTOR_NAME);
      setInternalState(that, {
        type: CONSTRUCTOR_NAME,
        index: create(null),
        first: undefined,
        last: undefined,
        size: 0
      });
      if (!DESCRIPTORS) that.size = 0;
      if (iterable != undefined) iterate(iterable, that[ADDER], that, IS_MAP);
    });

    var getInternalState = internalStateGetterFor(CONSTRUCTOR_NAME);

    var define = function (that, key, value) {
      var state = getInternalState(that);
      var entry = getEntry(that, key);
      var previous, index;
      // change existing entry
      if (entry) {
        entry.value = value;
      // create new entry
      } else {
        state.last = entry = {
          index: index = fastKey(key, true),
          key: key,
          value: value,
          previous: previous = state.last,
          next: undefined,
          removed: false
        };
        if (!state.first) state.first = entry;
        if (previous) previous.next = entry;
        if (DESCRIPTORS) state.size++;
        else that.size++;
        // add to index
        if (index !== 'F') state.index[index] = entry;
      } return that;
    };

    var getEntry = function (that, key) {
      var state = getInternalState(that);
      // fast case
      var index = fastKey(key);
      var entry;
      if (index !== 'F') return state.index[index];
      // frozen object case
      for (entry = state.first; entry; entry = entry.next) {
        if (entry.key == key) return entry;
      }
    };

    redefineAll(C.prototype, {
      // 23.1.3.1 Map.prototype.clear()
      // 23.2.3.2 Set.prototype.clear()
      clear: function clear() {
        var that = this;
        var state = getInternalState(that);
        var data = state.index;
        var entry = state.first;
        while (entry) {
          entry.removed = true;
          if (entry.previous) entry.previous = entry.previous.next = undefined;
          delete data[entry.index];
          entry = entry.next;
        }
        state.first = state.last = undefined;
        if (DESCRIPTORS) state.size = 0;
        else that.size = 0;
      },
      // 23.1.3.3 Map.prototype.delete(key)
      // 23.2.3.4 Set.prototype.delete(value)
      'delete': function (key) {
        var that = this;
        var state = getInternalState(that);
        var entry = getEntry(that, key);
        if (entry) {
          var next = entry.next;
          var prev = entry.previous;
          delete state.index[entry.index];
          entry.removed = true;
          if (prev) prev.next = next;
          if (next) next.previous = prev;
          if (state.first == entry) state.first = next;
          if (state.last == entry) state.last = prev;
          if (DESCRIPTORS) state.size--;
          else that.size--;
        } return !!entry;
      },
      // 23.2.3.6 Set.prototype.forEach(callbackfn, thisArg = undefined)
      // 23.1.3.5 Map.prototype.forEach(callbackfn, thisArg = undefined)
      forEach: function forEach(callbackfn /* , that = undefined */) {
        var state = getInternalState(this);
        var boundFunction = bind(callbackfn, arguments.length > 1 ? arguments[1] : undefined, 3);
        var entry;
        while (entry = entry ? entry.next : state.first) {
          boundFunction(entry.value, entry.key, this);
          // revert to the last existing entry
          while (entry && entry.removed) entry = entry.previous;
        }
      },
      // 23.1.3.7 Map.prototype.has(key)
      // 23.2.3.7 Set.prototype.has(value)
      has: function has(key) {
        return !!getEntry(this, key);
      }
    });

    redefineAll(C.prototype, IS_MAP ? {
      // 23.1.3.6 Map.prototype.get(key)
      get: function get(key) {
        var entry = getEntry(this, key);
        return entry && entry.value;
      },
      // 23.1.3.9 Map.prototype.set(key, value)
      set: function set(key, value) {
        return define(this, key === 0 ? 0 : key, value);
      }
    } : {
      // 23.2.3.1 Set.prototype.add(value)
      add: function add(value) {
        return define(this, value = value === 0 ? 0 : value, value);
      }
    });
    if (DESCRIPTORS) defineProperty(C.prototype, 'size', {
      get: function () {
        return getInternalState(this).size;
      }
    });
    return C;
  },
  setStrong: function (C, CONSTRUCTOR_NAME, IS_MAP) {
    var ITERATOR_NAME = CONSTRUCTOR_NAME + ' Iterator';
    var getInternalCollectionState = internalStateGetterFor(CONSTRUCTOR_NAME);
    var getInternalIteratorState = internalStateGetterFor(ITERATOR_NAME);
    // add .keys, .values, .entries, [@@iterator]
    // 23.1.3.4, 23.1.3.8, 23.1.3.11, 23.1.3.12, 23.2.3.5, 23.2.3.8, 23.2.3.10, 23.2.3.11
    defineIterator(C, CONSTRUCTOR_NAME, function (iterated, kind) {
      setInternalState(this, {
        type: ITERATOR_NAME,
        target: iterated,
        state: getInternalCollectionState(iterated),
        kind: kind,
        last: undefined
      });
    }, function () {
      var state = getInternalIteratorState(this);
      var kind = state.kind;
      var entry = state.last;
      // revert to the last existing entry
      while (entry && entry.removed) entry = entry.previous;
      // get next entry
      if (!state.target || !(state.last = entry = entry ? entry.next : state.state.first)) {
        // or finish the iteration
        state.target = undefined;
        return { value: undefined, done: true };
      }
      // return step by kind
      if (kind == 'keys') return { value: entry.key, done: false };
      if (kind == 'values') return { value: entry.value, done: false };
      return { value: [entry.key, entry.value], done: false };
    }, IS_MAP ? 'entries' : 'values', !IS_MAP, true);

    // add [@@species], 23.1.2.2, 23.2.2.2
    setSpecies(CONSTRUCTOR_NAME);
  }
};


/***/ }),

/***/ 4542:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

var $ = __webpack_require__(8283);
var global = __webpack_require__(2858);
var isForced = __webpack_require__(783);
var redefine = __webpack_require__(7384);
var InternalMetadataModule = __webpack_require__(9350);
var iterate = __webpack_require__(9538);
var anInstance = __webpack_require__(3960);
var isObject = __webpack_require__(5429);
var fails = __webpack_require__(6287);
var checkCorrectnessOfIteration = __webpack_require__(6611);
var setToStringTag = __webpack_require__(8504);
var inheritIfRequired = __webpack_require__(9630);

module.exports = function (CONSTRUCTOR_NAME, wrapper, common, IS_MAP, IS_WEAK) {
  var NativeConstructor = global[CONSTRUCTOR_NAME];
  var NativePrototype = NativeConstructor && NativeConstructor.prototype;
  var Constructor = NativeConstructor;
  var ADDER = IS_MAP ? 'set' : 'add';
  var exported = {};

  var fixMethod = function (KEY) {
    var nativeMethod = NativePrototype[KEY];
    redefine(NativePrototype, KEY,
      KEY == 'add' ? function add(value) {
        nativeMethod.call(this, value === 0 ? 0 : value);
        return this;
      } : KEY == 'delete' ? function (key) {
        return IS_WEAK && !isObject(key) ? false : nativeMethod.call(this, key === 0 ? 0 : key);
      } : KEY == 'get' ? function get(key) {
        return IS_WEAK && !isObject(key) ? undefined : nativeMethod.call(this, key === 0 ? 0 : key);
      } : KEY == 'has' ? function has(key) {
        return IS_WEAK && !isObject(key) ? false : nativeMethod.call(this, key === 0 ? 0 : key);
      } : function set(key, value) {
        nativeMethod.call(this, key === 0 ? 0 : key, value);
        return this;
      }
    );
  };

  // eslint-disable-next-line max-len
  if (isForced(CONSTRUCTOR_NAME, typeof NativeConstructor != 'function' || !(IS_WEAK || NativePrototype.forEach && !fails(function () {
    new NativeConstructor().entries().next();
  })))) {
    // create collection constructor
    Constructor = common.getConstructor(wrapper, CONSTRUCTOR_NAME, IS_MAP, ADDER);
    InternalMetadataModule.REQUIRED = true;
  } else if (isForced(CONSTRUCTOR_NAME, true)) {
    var instance = new Constructor();
    // early implementations not supports chaining
    var HASNT_CHAINING = instance[ADDER](IS_WEAK ? {} : -0, 1) != instance;
    // V8 ~ Chromium 40- weak-collections throws on primitives, but should return false
    var THROWS_ON_PRIMITIVES = fails(function () { instance.has(1); });
    // most early implementations doesn't supports iterables, most modern - not close it correctly
    // eslint-disable-next-line no-new
    var ACCEPT_ITERABLES = checkCorrectnessOfIteration(function (iterable) { new NativeConstructor(iterable); });
    // for early implementations -0 and +0 not the same
    var BUGGY_ZERO = !IS_WEAK && fails(function () {
      // V8 ~ Chromium 42- fails only with 5+ elements
      var $instance = new NativeConstructor();
      var index = 5;
      while (index--) $instance[ADDER](index, index);
      return !$instance.has(-0);
    });

    if (!ACCEPT_ITERABLES) {
      Constructor = wrapper(function (dummy, iterable) {
        anInstance(dummy, Constructor, CONSTRUCTOR_NAME);
        var that = inheritIfRequired(new NativeConstructor(), dummy, Constructor);
        if (iterable != undefined) iterate(iterable, that[ADDER], that, IS_MAP);
        return that;
      });
      Constructor.prototype = NativePrototype;
      NativePrototype.constructor = Constructor;
    }

    if (THROWS_ON_PRIMITIVES || BUGGY_ZERO) {
      fixMethod('delete');
      fixMethod('has');
      IS_MAP && fixMethod('get');
    }

    if (BUGGY_ZERO || HASNT_CHAINING) fixMethod(ADDER);

    // weak collections should not contains .clear method
    if (IS_WEAK && NativePrototype.clear) delete NativePrototype.clear;
  }

  exported[CONSTRUCTOR_NAME] = Constructor;
  $({ global: true, forced: Constructor != NativeConstructor }, exported);

  setToStringTag(Constructor, CONSTRUCTOR_NAME);

  if (!IS_WEAK) common.setStrong(Constructor, CONSTRUCTOR_NAME, IS_MAP);

  return Constructor;
};


/***/ }),

/***/ 7976:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var has = __webpack_require__(920);
var ownKeys = __webpack_require__(609);
var getOwnPropertyDescriptorModule = __webpack_require__(1590);
var definePropertyModule = __webpack_require__(6085);

module.exports = function (target, source) {
  var keys = ownKeys(source);
  var defineProperty = definePropertyModule.f;
  var getOwnPropertyDescriptor = getOwnPropertyDescriptorModule.f;
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    if (!has(target, key)) defineProperty(target, key, getOwnPropertyDescriptor(source, key));
  }
};


/***/ }),

/***/ 565:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var fails = __webpack_require__(6287);

module.exports = !fails(function () {
  function F() { /* empty */ }
  F.prototype.constructor = null;
  return Object.getPrototypeOf(new F()) !== F.prototype;
});


/***/ }),

/***/ 9411:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

var IteratorPrototype = __webpack_require__(4945).IteratorPrototype;
var create = __webpack_require__(8456);
var createPropertyDescriptor = __webpack_require__(7752);
var setToStringTag = __webpack_require__(8504);
var Iterators = __webpack_require__(6879);

var returnThis = function () { return this; };

module.exports = function (IteratorConstructor, NAME, next) {
  var TO_STRING_TAG = NAME + ' Iterator';
  IteratorConstructor.prototype = create(IteratorPrototype, { next: createPropertyDescriptor(1, next) });
  setToStringTag(IteratorConstructor, TO_STRING_TAG, false, true);
  Iterators[TO_STRING_TAG] = returnThis;
  return IteratorConstructor;
};


/***/ }),

/***/ 7754:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var DESCRIPTORS = __webpack_require__(5121);
var definePropertyModule = __webpack_require__(6085);
var createPropertyDescriptor = __webpack_require__(7752);

module.exports = DESCRIPTORS ? function (object, key, value) {
  return definePropertyModule.f(object, key, createPropertyDescriptor(1, value));
} : function (object, key, value) {
  object[key] = value;
  return object;
};


/***/ }),

/***/ 7752:
/***/ ((module) => {

module.exports = function (bitmap, value) {
  return {
    enumerable: !(bitmap & 1),
    configurable: !(bitmap & 2),
    writable: !(bitmap & 4),
    value: value
  };
};


/***/ }),

/***/ 6549:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

var toPrimitive = __webpack_require__(8400);
var definePropertyModule = __webpack_require__(6085);
var createPropertyDescriptor = __webpack_require__(7752);

module.exports = function (object, key, value) {
  var propertyKey = toPrimitive(key);
  if (propertyKey in object) definePropertyModule.f(object, propertyKey, createPropertyDescriptor(0, value));
  else object[propertyKey] = value;
};


/***/ }),

/***/ 376:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

var $ = __webpack_require__(8283);
var createIteratorConstructor = __webpack_require__(9411);
var getPrototypeOf = __webpack_require__(4257);
var setPrototypeOf = __webpack_require__(116);
var setToStringTag = __webpack_require__(8504);
var createNonEnumerableProperty = __webpack_require__(7754);
var redefine = __webpack_require__(7384);
var wellKnownSymbol = __webpack_require__(4162);
var IS_PURE = __webpack_require__(4432);
var Iterators = __webpack_require__(6879);
var IteratorsCore = __webpack_require__(4945);

var IteratorPrototype = IteratorsCore.IteratorPrototype;
var BUGGY_SAFARI_ITERATORS = IteratorsCore.BUGGY_SAFARI_ITERATORS;
var ITERATOR = wellKnownSymbol('iterator');
var KEYS = 'keys';
var VALUES = 'values';
var ENTRIES = 'entries';

var returnThis = function () { return this; };

module.exports = function (Iterable, NAME, IteratorConstructor, next, DEFAULT, IS_SET, FORCED) {
  createIteratorConstructor(IteratorConstructor, NAME, next);

  var getIterationMethod = function (KIND) {
    if (KIND === DEFAULT && defaultIterator) return defaultIterator;
    if (!BUGGY_SAFARI_ITERATORS && KIND in IterablePrototype) return IterablePrototype[KIND];
    switch (KIND) {
      case KEYS: return function keys() { return new IteratorConstructor(this, KIND); };
      case VALUES: return function values() { return new IteratorConstructor(this, KIND); };
      case ENTRIES: return function entries() { return new IteratorConstructor(this, KIND); };
    } return function () { return new IteratorConstructor(this); };
  };

  var TO_STRING_TAG = NAME + ' Iterator';
  var INCORRECT_VALUES_NAME = false;
  var IterablePrototype = Iterable.prototype;
  var nativeIterator = IterablePrototype[ITERATOR]
    || IterablePrototype['@@iterator']
    || DEFAULT && IterablePrototype[DEFAULT];
  var defaultIterator = !BUGGY_SAFARI_ITERATORS && nativeIterator || getIterationMethod(DEFAULT);
  var anyNativeIterator = NAME == 'Array' ? IterablePrototype.entries || nativeIterator : nativeIterator;
  var CurrentIteratorPrototype, methods, KEY;

  // fix native
  if (anyNativeIterator) {
    CurrentIteratorPrototype = getPrototypeOf(anyNativeIterator.call(new Iterable()));
    if (IteratorPrototype !== Object.prototype && CurrentIteratorPrototype.next) {
      if (!IS_PURE && getPrototypeOf(CurrentIteratorPrototype) !== IteratorPrototype) {
        if (setPrototypeOf) {
          setPrototypeOf(CurrentIteratorPrototype, IteratorPrototype);
        } else if (typeof CurrentIteratorPrototype[ITERATOR] != 'function') {
          createNonEnumerableProperty(CurrentIteratorPrototype, ITERATOR, returnThis);
        }
      }
      // Set @@toStringTag to native iterators
      setToStringTag(CurrentIteratorPrototype, TO_STRING_TAG, true, true);
      if (IS_PURE) Iterators[TO_STRING_TAG] = returnThis;
    }
  }

  // fix Array#{values, @@iterator}.name in V8 / FF
  if (DEFAULT == VALUES && nativeIterator && nativeIterator.name !== VALUES) {
    INCORRECT_VALUES_NAME = true;
    defaultIterator = function values() { return nativeIterator.call(this); };
  }

  // define iterator
  if ((!IS_PURE || FORCED) && IterablePrototype[ITERATOR] !== defaultIterator) {
    createNonEnumerableProperty(IterablePrototype, ITERATOR, defaultIterator);
  }
  Iterators[NAME] = defaultIterator;

  // export additional methods
  if (DEFAULT) {
    methods = {
      values: getIterationMethod(VALUES),
      keys: IS_SET ? defaultIterator : getIterationMethod(KEYS),
      entries: getIterationMethod(ENTRIES)
    };
    if (FORCED) for (KEY in methods) {
      if (BUGGY_SAFARI_ITERATORS || INCORRECT_VALUES_NAME || !(KEY in IterablePrototype)) {
        redefine(IterablePrototype, KEY, methods[KEY]);
      }
    } else $({ target: NAME, proto: true, forced: BUGGY_SAFARI_ITERATORS || INCORRECT_VALUES_NAME }, methods);
  }

  return methods;
};


/***/ }),

/***/ 5121:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var fails = __webpack_require__(6287);

// Thank's IE8 for his funny defineProperty
module.exports = !fails(function () {
  return Object.defineProperty({}, 'a', { get: function () { return 7; } }).a != 7;
});


/***/ }),

/***/ 9760:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var global = __webpack_require__(2858);
var isObject = __webpack_require__(5429);

var document = global.document;
// typeof document.createElement is 'object' in old IE
var EXISTS = isObject(document) && isObject(document.createElement);

module.exports = function (it) {
  return EXISTS ? document.createElement(it) : {};
};


/***/ }),

/***/ 5034:
/***/ ((module) => {

// IE8- don't enum bug keys
module.exports = [
  'constructor',
  'hasOwnProperty',
  'isPrototypeOf',
  'propertyIsEnumerable',
  'toLocaleString',
  'toString',
  'valueOf'
];


/***/ }),

/***/ 8283:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var global = __webpack_require__(2858);
var getOwnPropertyDescriptor = __webpack_require__(1590).f;
var createNonEnumerableProperty = __webpack_require__(7754);
var redefine = __webpack_require__(7384);
var setGlobal = __webpack_require__(2380);
var copyConstructorProperties = __webpack_require__(7976);
var isForced = __webpack_require__(783);

/*
  options.target      - name of the target object
  options.global      - target is the global object
  options.stat        - export as static methods of target
  options.proto       - export as prototype methods of target
  options.real        - real prototype method for the `pure` version
  options.forced      - export even if the native feature is available
  options.bind        - bind methods to the target, required for the `pure` version
  options.wrap        - wrap constructors to preventing global pollution, required for the `pure` version
  options.unsafe      - use the simple assignment of property instead of delete + defineProperty
  options.sham        - add a flag to not completely full polyfills
  options.enumerable  - export as enumerable property
  options.noTargetGet - prevent calling a getter on target
*/
module.exports = function (options, source) {
  var TARGET = options.target;
  var GLOBAL = options.global;
  var STATIC = options.stat;
  var FORCED, target, key, targetProperty, sourceProperty, descriptor;
  if (GLOBAL) {
    target = global;
  } else if (STATIC) {
    target = global[TARGET] || setGlobal(TARGET, {});
  } else {
    target = (global[TARGET] || {}).prototype;
  }
  if (target) for (key in source) {
    sourceProperty = source[key];
    if (options.noTargetGet) {
      descriptor = getOwnPropertyDescriptor(target, key);
      targetProperty = descriptor && descriptor.value;
    } else targetProperty = target[key];
    FORCED = isForced(GLOBAL ? key : TARGET + (STATIC ? '.' : '#') + key, options.forced);
    // contained in target
    if (!FORCED && targetProperty !== undefined) {
      if (typeof sourceProperty === typeof targetProperty) continue;
      copyConstructorProperties(sourceProperty, targetProperty);
    }
    // add a flag to not completely full polyfills
    if (options.sham || (targetProperty && targetProperty.sham)) {
      createNonEnumerableProperty(sourceProperty, 'sham', true);
    }
    // extend global
    redefine(target, key, sourceProperty, options);
  }
};


/***/ }),

/***/ 6287:
/***/ ((module) => {

module.exports = function (exec) {
  try {
    return !!exec();
  } catch (error) {
    return true;
  }
};


/***/ }),

/***/ 1824:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

var createNonEnumerableProperty = __webpack_require__(7754);
var redefine = __webpack_require__(7384);
var fails = __webpack_require__(6287);
var wellKnownSymbol = __webpack_require__(4162);
var regexpExec = __webpack_require__(7344);

var SPECIES = wellKnownSymbol('species');

var REPLACE_SUPPORTS_NAMED_GROUPS = !fails(function () {
  // #replace needs built-in support for named groups.
  // #match works fine because it just return the exec results, even if it has
  // a "grops" property.
  var re = /./;
  re.exec = function () {
    var result = [];
    result.groups = { a: '7' };
    return result;
  };
  return ''.replace(re, '$<a>') !== '7';
});

// Chrome 51 has a buggy "split" implementation when RegExp#exec !== nativeExec
// Weex JS has frozen built-in prototypes, so use try / catch wrapper
var SPLIT_WORKS_WITH_OVERWRITTEN_EXEC = !fails(function () {
  var re = /(?:)/;
  var originalExec = re.exec;
  re.exec = function () { return originalExec.apply(this, arguments); };
  var result = 'ab'.split(re);
  return result.length !== 2 || result[0] !== 'a' || result[1] !== 'b';
});

module.exports = function (KEY, length, exec, sham) {
  var SYMBOL = wellKnownSymbol(KEY);

  var DELEGATES_TO_SYMBOL = !fails(function () {
    // String methods call symbol-named RegEp methods
    var O = {};
    O[SYMBOL] = function () { return 7; };
    return ''[KEY](O) != 7;
  });

  var DELEGATES_TO_EXEC = DELEGATES_TO_SYMBOL && !fails(function () {
    // Symbol-named RegExp methods call .exec
    var execCalled = false;
    var re = /a/;

    if (KEY === 'split') {
      // We can't use real regex here since it causes deoptimization
      // and serious performance degradation in V8
      // https://github.com/zloirock/core-js/issues/306
      re = {};
      // RegExp[@@split] doesn't call the regex's exec method, but first creates
      // a new one. We need to return the patched regex when creating the new one.
      re.constructor = {};
      re.constructor[SPECIES] = function () { return re; };
      re.flags = '';
      re[SYMBOL] = /./[SYMBOL];
    }

    re.exec = function () { execCalled = true; return null; };

    re[SYMBOL]('');
    return !execCalled;
  });

  if (
    !DELEGATES_TO_SYMBOL ||
    !DELEGATES_TO_EXEC ||
    (KEY === 'replace' && !REPLACE_SUPPORTS_NAMED_GROUPS) ||
    (KEY === 'split' && !SPLIT_WORKS_WITH_OVERWRITTEN_EXEC)
  ) {
    var nativeRegExpMethod = /./[SYMBOL];
    var methods = exec(SYMBOL, ''[KEY], function (nativeMethod, regexp, str, arg2, forceStringMethod) {
      if (regexp.exec === regexpExec) {
        if (DELEGATES_TO_SYMBOL && !forceStringMethod) {
          // The native String method already delegates to @@method (this
          // polyfilled function), leasing to infinite recursion.
          // We avoid it by directly calling the native @@method method.
          return { done: true, value: nativeRegExpMethod.call(regexp, str, arg2) };
        }
        return { done: true, value: nativeMethod.call(str, regexp, arg2) };
      }
      return { done: false };
    });
    var stringMethod = methods[0];
    var regexMethod = methods[1];

    redefine(String.prototype, KEY, stringMethod);
    redefine(RegExp.prototype, SYMBOL, length == 2
      // 21.2.5.8 RegExp.prototype[@@replace](string, replaceValue)
      // 21.2.5.11 RegExp.prototype[@@split](string, limit)
      ? function (string, arg) { return regexMethod.call(string, this, arg); }
      // 21.2.5.6 RegExp.prototype[@@match](string)
      // 21.2.5.9 RegExp.prototype[@@search](string)
      : function (string) { return regexMethod.call(string, this); }
    );
    if (sham) createNonEnumerableProperty(RegExp.prototype[SYMBOL], 'sham', true);
  }
};


/***/ }),

/***/ 6137:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var fails = __webpack_require__(6287);

module.exports = !fails(function () {
  return Object.isExtensible(Object.preventExtensions({}));
});


/***/ }),

/***/ 1233:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var shared = __webpack_require__(7932);

module.exports = shared('native-function-to-string', Function.toString);


/***/ }),

/***/ 4527:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var path = __webpack_require__(4173);
var global = __webpack_require__(2858);

var aFunction = function (variable) {
  return typeof variable == 'function' ? variable : undefined;
};

module.exports = function (namespace, method) {
  return arguments.length < 2 ? aFunction(path[namespace]) || aFunction(global[namespace])
    : path[namespace] && path[namespace][method] || global[namespace] && global[namespace][method];
};


/***/ }),

/***/ 2493:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var classof = __webpack_require__(477);
var Iterators = __webpack_require__(6879);
var wellKnownSymbol = __webpack_require__(4162);

var ITERATOR = wellKnownSymbol('iterator');

module.exports = function (it) {
  if (it != undefined) return it[ITERATOR]
    || it['@@iterator']
    || Iterators[classof(it)];
};


/***/ }),

/***/ 2858:
/***/ ((module) => {

var check = function (it) {
  return it && it.Math == Math && it;
};

// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
module.exports =
  // eslint-disable-next-line no-undef
  check(typeof globalThis == 'object' && globalThis) ||
  check(typeof window == 'object' && window) ||
  check(typeof self == 'object' && self) ||
  check(typeof global == 'object' && global) ||
  // eslint-disable-next-line no-new-func
  Function('return this')();


/***/ }),

/***/ 920:
/***/ ((module) => {

var hasOwnProperty = {}.hasOwnProperty;

module.exports = function (it, key) {
  return hasOwnProperty.call(it, key);
};


/***/ }),

/***/ 7446:
/***/ ((module) => {

module.exports = {};


/***/ }),

/***/ 49:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var getBuiltIn = __webpack_require__(4527);

module.exports = getBuiltIn('document', 'documentElement');


/***/ }),

/***/ 3151:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var DESCRIPTORS = __webpack_require__(5121);
var fails = __webpack_require__(6287);
var createElement = __webpack_require__(9760);

// Thank's IE8 for his funny defineProperty
module.exports = !DESCRIPTORS && !fails(function () {
  return Object.defineProperty(createElement('div'), 'a', {
    get: function () { return 7; }
  }).a != 7;
});


/***/ }),

/***/ 2804:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var fails = __webpack_require__(6287);
var classof = __webpack_require__(619);

var split = ''.split;

// fallback for non-array-like ES3 and non-enumerable old V8 strings
module.exports = fails(function () {
  // throws an error in rhino, see https://github.com/mozilla/rhino/issues/346
  // eslint-disable-next-line no-prototype-builtins
  return !Object('z').propertyIsEnumerable(0);
}) ? function (it) {
  return classof(it) == 'String' ? split.call(it, '') : Object(it);
} : Object;


/***/ }),

/***/ 9630:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var isObject = __webpack_require__(5429);
var setPrototypeOf = __webpack_require__(116);

// makes subclassing work correct for wrapped built-ins
module.exports = function ($this, dummy, Wrapper) {
  var NewTarget, NewTargetPrototype;
  if (
    // it can work only with native `setPrototypeOf`
    setPrototypeOf &&
    // we haven't completely correct pre-ES6 way for getting `new.target`, so use this
    typeof (NewTarget = dummy.constructor) == 'function' &&
    NewTarget !== Wrapper &&
    isObject(NewTargetPrototype = NewTarget.prototype) &&
    NewTargetPrototype !== Wrapper.prototype
  ) setPrototypeOf($this, NewTargetPrototype);
  return $this;
};


/***/ }),

/***/ 9350:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var hiddenKeys = __webpack_require__(7446);
var isObject = __webpack_require__(5429);
var has = __webpack_require__(920);
var defineProperty = __webpack_require__(6085).f;
var uid = __webpack_require__(5048);
var FREEZING = __webpack_require__(6137);

var METADATA = uid('meta');
var id = 0;

var isExtensible = Object.isExtensible || function () {
  return true;
};

var setMetadata = function (it) {
  defineProperty(it, METADATA, { value: {
    objectID: 'O' + ++id, // object ID
    weakData: {}          // weak collections IDs
  } });
};

var fastKey = function (it, create) {
  // return a primitive with prefix
  if (!isObject(it)) return typeof it == 'symbol' ? it : (typeof it == 'string' ? 'S' : 'P') + it;
  if (!has(it, METADATA)) {
    // can't set metadata to uncaught frozen object
    if (!isExtensible(it)) return 'F';
    // not necessary to add metadata
    if (!create) return 'E';
    // add missing metadata
    setMetadata(it);
  // return object ID
  } return it[METADATA].objectID;
};

var getWeakData = function (it, create) {
  if (!has(it, METADATA)) {
    // can't set metadata to uncaught frozen object
    if (!isExtensible(it)) return true;
    // not necessary to add metadata
    if (!create) return false;
    // add missing metadata
    setMetadata(it);
  // return the store of weak collections IDs
  } return it[METADATA].weakData;
};

// add metadata on freeze-family methods calling
var onFreeze = function (it) {
  if (FREEZING && meta.REQUIRED && isExtensible(it) && !has(it, METADATA)) setMetadata(it);
  return it;
};

var meta = module.exports = {
  REQUIRED: false,
  fastKey: fastKey,
  getWeakData: getWeakData,
  onFreeze: onFreeze
};

hiddenKeys[METADATA] = true;


/***/ }),

/***/ 1896:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var NATIVE_WEAK_MAP = __webpack_require__(4590);
var global = __webpack_require__(2858);
var isObject = __webpack_require__(5429);
var createNonEnumerableProperty = __webpack_require__(7754);
var objectHas = __webpack_require__(920);
var sharedKey = __webpack_require__(3560);
var hiddenKeys = __webpack_require__(7446);

var WeakMap = global.WeakMap;
var set, get, has;

var enforce = function (it) {
  return has(it) ? get(it) : set(it, {});
};

var getterFor = function (TYPE) {
  return function (it) {
    var state;
    if (!isObject(it) || (state = get(it)).type !== TYPE) {
      throw TypeError('Incompatible receiver, ' + TYPE + ' required');
    } return state;
  };
};

if (NATIVE_WEAK_MAP) {
  var store = new WeakMap();
  var wmget = store.get;
  var wmhas = store.has;
  var wmset = store.set;
  set = function (it, metadata) {
    wmset.call(store, it, metadata);
    return metadata;
  };
  get = function (it) {
    return wmget.call(store, it) || {};
  };
  has = function (it) {
    return wmhas.call(store, it);
  };
} else {
  var STATE = sharedKey('state');
  hiddenKeys[STATE] = true;
  set = function (it, metadata) {
    createNonEnumerableProperty(it, STATE, metadata);
    return metadata;
  };
  get = function (it) {
    return objectHas(it, STATE) ? it[STATE] : {};
  };
  has = function (it) {
    return objectHas(it, STATE);
  };
}

module.exports = {
  set: set,
  get: get,
  has: has,
  enforce: enforce,
  getterFor: getterFor
};


/***/ }),

/***/ 3594:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var wellKnownSymbol = __webpack_require__(4162);
var Iterators = __webpack_require__(6879);

var ITERATOR = wellKnownSymbol('iterator');
var ArrayPrototype = Array.prototype;

// check on default Array iterator
module.exports = function (it) {
  return it !== undefined && (Iterators.Array === it || ArrayPrototype[ITERATOR] === it);
};


/***/ }),

/***/ 8859:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var classof = __webpack_require__(619);

// `IsArray` abstract operation
// https://tc39.github.io/ecma262/#sec-isarray
module.exports = Array.isArray || function isArray(arg) {
  return classof(arg) == 'Array';
};


/***/ }),

/***/ 783:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var fails = __webpack_require__(6287);

var replacement = /#|\.prototype\./;

var isForced = function (feature, detection) {
  var value = data[normalize(feature)];
  return value == POLYFILL ? true
    : value == NATIVE ? false
    : typeof detection == 'function' ? fails(detection)
    : !!detection;
};

var normalize = isForced.normalize = function (string) {
  return String(string).replace(replacement, '.').toLowerCase();
};

var data = isForced.data = {};
var NATIVE = isForced.NATIVE = 'N';
var POLYFILL = isForced.POLYFILL = 'P';

module.exports = isForced;


/***/ }),

/***/ 5429:
/***/ ((module) => {

module.exports = function (it) {
  return typeof it === 'object' ? it !== null : typeof it === 'function';
};


/***/ }),

/***/ 4432:
/***/ ((module) => {

module.exports = false;


/***/ }),

/***/ 2832:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var isObject = __webpack_require__(5429);
var classof = __webpack_require__(619);
var wellKnownSymbol = __webpack_require__(4162);

var MATCH = wellKnownSymbol('match');

// `IsRegExp` abstract operation
// https://tc39.github.io/ecma262/#sec-isregexp
module.exports = function (it) {
  var isRegExp;
  return isObject(it) && ((isRegExp = it[MATCH]) !== undefined ? !!isRegExp : classof(it) == 'RegExp');
};


/***/ }),

/***/ 9538:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var anObject = __webpack_require__(8005);
var isArrayIteratorMethod = __webpack_require__(3594);
var toLength = __webpack_require__(5626);
var bind = __webpack_require__(6516);
var getIteratorMethod = __webpack_require__(2493);
var callWithSafeIterationClosing = __webpack_require__(5209);

var Result = function (stopped, result) {
  this.stopped = stopped;
  this.result = result;
};

var iterate = module.exports = function (iterable, fn, that, AS_ENTRIES, IS_ITERATOR) {
  var boundFunction = bind(fn, that, AS_ENTRIES ? 2 : 1);
  var iterator, iterFn, index, length, result, next, step;

  if (IS_ITERATOR) {
    iterator = iterable;
  } else {
    iterFn = getIteratorMethod(iterable);
    if (typeof iterFn != 'function') throw TypeError('Target is not iterable');
    // optimisation for array iterators
    if (isArrayIteratorMethod(iterFn)) {
      for (index = 0, length = toLength(iterable.length); length > index; index++) {
        result = AS_ENTRIES
          ? boundFunction(anObject(step = iterable[index])[0], step[1])
          : boundFunction(iterable[index]);
        if (result && result instanceof Result) return result;
      } return new Result(false);
    }
    iterator = iterFn.call(iterable);
  }

  next = iterator.next;
  while (!(step = next.call(iterator)).done) {
    result = callWithSafeIterationClosing(iterator, boundFunction, step.value, AS_ENTRIES);
    if (typeof result == 'object' && result && result instanceof Result) return result;
  } return new Result(false);
};

iterate.stop = function (result) {
  return new Result(true, result);
};


/***/ }),

/***/ 4945:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

var getPrototypeOf = __webpack_require__(4257);
var createNonEnumerableProperty = __webpack_require__(7754);
var has = __webpack_require__(920);
var wellKnownSymbol = __webpack_require__(4162);
var IS_PURE = __webpack_require__(4432);

var ITERATOR = wellKnownSymbol('iterator');
var BUGGY_SAFARI_ITERATORS = false;

var returnThis = function () { return this; };

// `%IteratorPrototype%` object
// https://tc39.github.io/ecma262/#sec-%iteratorprototype%-object
var IteratorPrototype, PrototypeOfArrayIteratorPrototype, arrayIterator;

if ([].keys) {
  arrayIterator = [].keys();
  // Safari 8 has buggy iterators w/o `next`
  if (!('next' in arrayIterator)) BUGGY_SAFARI_ITERATORS = true;
  else {
    PrototypeOfArrayIteratorPrototype = getPrototypeOf(getPrototypeOf(arrayIterator));
    if (PrototypeOfArrayIteratorPrototype !== Object.prototype) IteratorPrototype = PrototypeOfArrayIteratorPrototype;
  }
}

if (IteratorPrototype == undefined) IteratorPrototype = {};

// 25.1.2.1.1 %IteratorPrototype%[@@iterator]()
if (!IS_PURE && !has(IteratorPrototype, ITERATOR)) {
  createNonEnumerableProperty(IteratorPrototype, ITERATOR, returnThis);
}

module.exports = {
  IteratorPrototype: IteratorPrototype,
  BUGGY_SAFARI_ITERATORS: BUGGY_SAFARI_ITERATORS
};


/***/ }),

/***/ 6879:
/***/ ((module) => {

module.exports = {};


/***/ }),

/***/ 4913:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var fails = __webpack_require__(6287);

module.exports = !!Object.getOwnPropertySymbols && !fails(function () {
  // Chrome 38 Symbol has incorrect toString conversion
  // eslint-disable-next-line no-undef
  return !String(Symbol());
});


/***/ }),

/***/ 4590:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var global = __webpack_require__(2858);
var nativeFunctionToString = __webpack_require__(1233);

var WeakMap = global.WeakMap;

module.exports = typeof WeakMap === 'function' && /native code/.test(nativeFunctionToString.call(WeakMap));


/***/ }),

/***/ 8707:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

var DESCRIPTORS = __webpack_require__(5121);
var fails = __webpack_require__(6287);
var objectKeys = __webpack_require__(385);
var getOwnPropertySymbolsModule = __webpack_require__(2243);
var propertyIsEnumerableModule = __webpack_require__(7948);
var toObject = __webpack_require__(3228);
var IndexedObject = __webpack_require__(2804);

var nativeAssign = Object.assign;

// `Object.assign` method
// https://tc39.github.io/ecma262/#sec-object.assign
// should work with symbols and should have deterministic property order (V8 bug)
module.exports = !nativeAssign || fails(function () {
  var A = {};
  var B = {};
  // eslint-disable-next-line no-undef
  var symbol = Symbol();
  var alphabet = 'abcdefghijklmnopqrst';
  A[symbol] = 7;
  alphabet.split('').forEach(function (chr) { B[chr] = chr; });
  return nativeAssign({}, A)[symbol] != 7 || objectKeys(nativeAssign({}, B)).join('') != alphabet;
}) ? function assign(target, source) { // eslint-disable-line no-unused-vars
  var T = toObject(target);
  var argumentsLength = arguments.length;
  var index = 1;
  var getOwnPropertySymbols = getOwnPropertySymbolsModule.f;
  var propertyIsEnumerable = propertyIsEnumerableModule.f;
  while (argumentsLength > index) {
    var S = IndexedObject(arguments[index++]);
    var keys = getOwnPropertySymbols ? objectKeys(S).concat(getOwnPropertySymbols(S)) : objectKeys(S);
    var length = keys.length;
    var j = 0;
    var key;
    while (length > j) {
      key = keys[j++];
      if (!DESCRIPTORS || propertyIsEnumerable.call(S, key)) T[key] = S[key];
    }
  } return T;
} : nativeAssign;


/***/ }),

/***/ 8456:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var anObject = __webpack_require__(8005);
var defineProperties = __webpack_require__(5428);
var enumBugKeys = __webpack_require__(5034);
var hiddenKeys = __webpack_require__(7446);
var html = __webpack_require__(49);
var documentCreateElement = __webpack_require__(9760);
var sharedKey = __webpack_require__(3560);
var IE_PROTO = sharedKey('IE_PROTO');

var PROTOTYPE = 'prototype';
var Empty = function () { /* empty */ };

// Create object with fake `null` prototype: use iframe Object with cleared prototype
var createDict = function () {
  // Thrash, waste and sodomy: IE GC bug
  var iframe = documentCreateElement('iframe');
  var length = enumBugKeys.length;
  var lt = '<';
  var script = 'script';
  var gt = '>';
  var js = 'java' + script + ':';
  var iframeDocument;
  iframe.style.display = 'none';
  html.appendChild(iframe);
  iframe.src = String(js);
  iframeDocument = iframe.contentWindow.document;
  iframeDocument.open();
  iframeDocument.write(lt + script + gt + 'document.F=Object' + lt + '/' + script + gt);
  iframeDocument.close();
  createDict = iframeDocument.F;
  while (length--) delete createDict[PROTOTYPE][enumBugKeys[length]];
  return createDict();
};

// `Object.create` method
// https://tc39.github.io/ecma262/#sec-object.create
module.exports = Object.create || function create(O, Properties) {
  var result;
  if (O !== null) {
    Empty[PROTOTYPE] = anObject(O);
    result = new Empty();
    Empty[PROTOTYPE] = null;
    // add "__proto__" for Object.getPrototypeOf polyfill
    result[IE_PROTO] = O;
  } else result = createDict();
  return Properties === undefined ? result : defineProperties(result, Properties);
};

hiddenKeys[IE_PROTO] = true;


/***/ }),

/***/ 5428:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var DESCRIPTORS = __webpack_require__(5121);
var definePropertyModule = __webpack_require__(6085);
var anObject = __webpack_require__(8005);
var objectKeys = __webpack_require__(385);

// `Object.defineProperties` method
// https://tc39.github.io/ecma262/#sec-object.defineproperties
module.exports = DESCRIPTORS ? Object.defineProperties : function defineProperties(O, Properties) {
  anObject(O);
  var keys = objectKeys(Properties);
  var length = keys.length;
  var index = 0;
  var key;
  while (length > index) definePropertyModule.f(O, key = keys[index++], Properties[key]);
  return O;
};


/***/ }),

/***/ 6085:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

var DESCRIPTORS = __webpack_require__(5121);
var IE8_DOM_DEFINE = __webpack_require__(3151);
var anObject = __webpack_require__(8005);
var toPrimitive = __webpack_require__(8400);

var nativeDefineProperty = Object.defineProperty;

// `Object.defineProperty` method
// https://tc39.github.io/ecma262/#sec-object.defineproperty
exports.f = DESCRIPTORS ? nativeDefineProperty : function defineProperty(O, P, Attributes) {
  anObject(O);
  P = toPrimitive(P, true);
  anObject(Attributes);
  if (IE8_DOM_DEFINE) try {
    return nativeDefineProperty(O, P, Attributes);
  } catch (error) { /* empty */ }
  if ('get' in Attributes || 'set' in Attributes) throw TypeError('Accessors not supported');
  if ('value' in Attributes) O[P] = Attributes.value;
  return O;
};


/***/ }),

/***/ 1590:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

var DESCRIPTORS = __webpack_require__(5121);
var propertyIsEnumerableModule = __webpack_require__(7948);
var createPropertyDescriptor = __webpack_require__(7752);
var toIndexedObject = __webpack_require__(4747);
var toPrimitive = __webpack_require__(8400);
var has = __webpack_require__(920);
var IE8_DOM_DEFINE = __webpack_require__(3151);

var nativeGetOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;

// `Object.getOwnPropertyDescriptor` method
// https://tc39.github.io/ecma262/#sec-object.getownpropertydescriptor
exports.f = DESCRIPTORS ? nativeGetOwnPropertyDescriptor : function getOwnPropertyDescriptor(O, P) {
  O = toIndexedObject(O);
  P = toPrimitive(P, true);
  if (IE8_DOM_DEFINE) try {
    return nativeGetOwnPropertyDescriptor(O, P);
  } catch (error) { /* empty */ }
  if (has(O, P)) return createPropertyDescriptor(!propertyIsEnumerableModule.f.call(O, P), O[P]);
};


/***/ }),

/***/ 7898:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

var internalObjectKeys = __webpack_require__(8974);
var enumBugKeys = __webpack_require__(5034);

var hiddenKeys = enumBugKeys.concat('length', 'prototype');

// `Object.getOwnPropertyNames` method
// https://tc39.github.io/ecma262/#sec-object.getownpropertynames
exports.f = Object.getOwnPropertyNames || function getOwnPropertyNames(O) {
  return internalObjectKeys(O, hiddenKeys);
};


/***/ }),

/***/ 2243:
/***/ ((__unused_webpack_module, exports) => {

exports.f = Object.getOwnPropertySymbols;


/***/ }),

/***/ 4257:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var has = __webpack_require__(920);
var toObject = __webpack_require__(3228);
var sharedKey = __webpack_require__(3560);
var CORRECT_PROTOTYPE_GETTER = __webpack_require__(565);

var IE_PROTO = sharedKey('IE_PROTO');
var ObjectPrototype = Object.prototype;

// `Object.getPrototypeOf` method
// https://tc39.github.io/ecma262/#sec-object.getprototypeof
module.exports = CORRECT_PROTOTYPE_GETTER ? Object.getPrototypeOf : function (O) {
  O = toObject(O);
  if (has(O, IE_PROTO)) return O[IE_PROTO];
  if (typeof O.constructor == 'function' && O instanceof O.constructor) {
    return O.constructor.prototype;
  } return O instanceof Object ? ObjectPrototype : null;
};


/***/ }),

/***/ 8974:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var has = __webpack_require__(920);
var toIndexedObject = __webpack_require__(4747);
var indexOf = __webpack_require__(7637).indexOf;
var hiddenKeys = __webpack_require__(7446);

module.exports = function (object, names) {
  var O = toIndexedObject(object);
  var i = 0;
  var result = [];
  var key;
  for (key in O) !has(hiddenKeys, key) && has(O, key) && result.push(key);
  // Don't enum bug & hidden keys
  while (names.length > i) if (has(O, key = names[i++])) {
    ~indexOf(result, key) || result.push(key);
  }
  return result;
};


/***/ }),

/***/ 385:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var internalObjectKeys = __webpack_require__(8974);
var enumBugKeys = __webpack_require__(5034);

// `Object.keys` method
// https://tc39.github.io/ecma262/#sec-object.keys
module.exports = Object.keys || function keys(O) {
  return internalObjectKeys(O, enumBugKeys);
};


/***/ }),

/***/ 7948:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

var nativePropertyIsEnumerable = {}.propertyIsEnumerable;
var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;

// Nashorn ~ JDK8 bug
var NASHORN_BUG = getOwnPropertyDescriptor && !nativePropertyIsEnumerable.call({ 1: 2 }, 1);

// `Object.prototype.propertyIsEnumerable` method implementation
// https://tc39.github.io/ecma262/#sec-object.prototype.propertyisenumerable
exports.f = NASHORN_BUG ? function propertyIsEnumerable(V) {
  var descriptor = getOwnPropertyDescriptor(this, V);
  return !!descriptor && descriptor.enumerable;
} : nativePropertyIsEnumerable;


/***/ }),

/***/ 116:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var anObject = __webpack_require__(8005);
var aPossiblePrototype = __webpack_require__(6331);

// `Object.setPrototypeOf` method
// https://tc39.github.io/ecma262/#sec-object.setprototypeof
// Works with __proto__ only. Old v8 can't work with null proto objects.
/* eslint-disable no-proto */
module.exports = Object.setPrototypeOf || ('__proto__' in {} ? function () {
  var CORRECT_SETTER = false;
  var test = {};
  var setter;
  try {
    setter = Object.getOwnPropertyDescriptor(Object.prototype, '__proto__').set;
    setter.call(test, []);
    CORRECT_SETTER = test instanceof Array;
  } catch (error) { /* empty */ }
  return function setPrototypeOf(O, proto) {
    anObject(O);
    aPossiblePrototype(proto);
    if (CORRECT_SETTER) setter.call(O, proto);
    else O.__proto__ = proto;
    return O;
  };
}() : undefined);


/***/ }),

/***/ 8503:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var DESCRIPTORS = __webpack_require__(5121);
var objectKeys = __webpack_require__(385);
var toIndexedObject = __webpack_require__(4747);
var propertyIsEnumerable = __webpack_require__(7948).f;

// `Object.{ entries, values }` methods implementation
var createMethod = function (TO_ENTRIES) {
  return function (it) {
    var O = toIndexedObject(it);
    var keys = objectKeys(O);
    var length = keys.length;
    var i = 0;
    var result = [];
    var key;
    while (length > i) {
      key = keys[i++];
      if (!DESCRIPTORS || propertyIsEnumerable.call(O, key)) {
        result.push(TO_ENTRIES ? [key, O[key]] : O[key]);
      }
    }
    return result;
  };
};

module.exports = {
  // `Object.entries` method
  // https://tc39.github.io/ecma262/#sec-object.entries
  entries: createMethod(true),
  // `Object.values` method
  // https://tc39.github.io/ecma262/#sec-object.values
  values: createMethod(false)
};


/***/ }),

/***/ 4102:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

var classof = __webpack_require__(477);
var wellKnownSymbol = __webpack_require__(4162);

var TO_STRING_TAG = wellKnownSymbol('toStringTag');
var test = {};

test[TO_STRING_TAG] = 'z';

// `Object.prototype.toString` method implementation
// https://tc39.github.io/ecma262/#sec-object.prototype.tostring
module.exports = String(test) !== '[object z]' ? function toString() {
  return '[object ' + classof(this) + ']';
} : test.toString;


/***/ }),

/***/ 609:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var getBuiltIn = __webpack_require__(4527);
var getOwnPropertyNamesModule = __webpack_require__(7898);
var getOwnPropertySymbolsModule = __webpack_require__(2243);
var anObject = __webpack_require__(8005);

// all object keys, includes non-enumerable and symbols
module.exports = getBuiltIn('Reflect', 'ownKeys') || function ownKeys(it) {
  var keys = getOwnPropertyNamesModule.f(anObject(it));
  var getOwnPropertySymbols = getOwnPropertySymbolsModule.f;
  return getOwnPropertySymbols ? keys.concat(getOwnPropertySymbols(it)) : keys;
};


/***/ }),

/***/ 4173:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = __webpack_require__(2858);


/***/ }),

/***/ 2214:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var redefine = __webpack_require__(7384);

module.exports = function (target, src, options) {
  for (var key in src) redefine(target, key, src[key], options);
  return target;
};


/***/ }),

/***/ 7384:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var global = __webpack_require__(2858);
var shared = __webpack_require__(7932);
var createNonEnumerableProperty = __webpack_require__(7754);
var has = __webpack_require__(920);
var setGlobal = __webpack_require__(2380);
var nativeFunctionToString = __webpack_require__(1233);
var InternalStateModule = __webpack_require__(1896);

var getInternalState = InternalStateModule.get;
var enforceInternalState = InternalStateModule.enforce;
var TEMPLATE = String(nativeFunctionToString).split('toString');

shared('inspectSource', function (it) {
  return nativeFunctionToString.call(it);
});

(module.exports = function (O, key, value, options) {
  var unsafe = options ? !!options.unsafe : false;
  var simple = options ? !!options.enumerable : false;
  var noTargetGet = options ? !!options.noTargetGet : false;
  if (typeof value == 'function') {
    if (typeof key == 'string' && !has(value, 'name')) createNonEnumerableProperty(value, 'name', key);
    enforceInternalState(value).source = TEMPLATE.join(typeof key == 'string' ? key : '');
  }
  if (O === global) {
    if (simple) O[key] = value;
    else setGlobal(key, value);
    return;
  } else if (!unsafe) {
    delete O[key];
  } else if (!noTargetGet && O[key]) {
    simple = true;
  }
  if (simple) O[key] = value;
  else createNonEnumerableProperty(O, key, value);
// add fake Function#toString for correct work wrapped methods / constructors with methods like LoDash isNative
})(Function.prototype, 'toString', function toString() {
  return typeof this == 'function' && getInternalState(this).source || nativeFunctionToString.call(this);
});


/***/ }),

/***/ 4111:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var classof = __webpack_require__(619);
var regexpExec = __webpack_require__(7344);

// `RegExpExec` abstract operation
// https://tc39.github.io/ecma262/#sec-regexpexec
module.exports = function (R, S) {
  var exec = R.exec;
  if (typeof exec === 'function') {
    var result = exec.call(R, S);
    if (typeof result !== 'object') {
      throw TypeError('RegExp exec method returned something other than an Object or null');
    }
    return result;
  }

  if (classof(R) !== 'RegExp') {
    throw TypeError('RegExp#exec called on incompatible receiver');
  }

  return regexpExec.call(R, S);
};



/***/ }),

/***/ 7344:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

var regexpFlags = __webpack_require__(6309);

var nativeExec = RegExp.prototype.exec;
// This always refers to the native implementation, because the
// String#replace polyfill uses ./fix-regexp-well-known-symbol-logic.js,
// which loads this file before patching the method.
var nativeReplace = String.prototype.replace;

var patchedExec = nativeExec;

var UPDATES_LAST_INDEX_WRONG = (function () {
  var re1 = /a/;
  var re2 = /b*/g;
  nativeExec.call(re1, 'a');
  nativeExec.call(re2, 'a');
  return re1.lastIndex !== 0 || re2.lastIndex !== 0;
})();

// nonparticipating capturing group, copied from es5-shim's String#split patch.
var NPCG_INCLUDED = /()??/.exec('')[1] !== undefined;

var PATCH = UPDATES_LAST_INDEX_WRONG || NPCG_INCLUDED;

if (PATCH) {
  patchedExec = function exec(str) {
    var re = this;
    var lastIndex, reCopy, match, i;

    if (NPCG_INCLUDED) {
      reCopy = new RegExp('^' + re.source + '$(?!\\s)', regexpFlags.call(re));
    }
    if (UPDATES_LAST_INDEX_WRONG) lastIndex = re.lastIndex;

    match = nativeExec.call(re, str);

    if (UPDATES_LAST_INDEX_WRONG && match) {
      re.lastIndex = re.global ? match.index + match[0].length : lastIndex;
    }
    if (NPCG_INCLUDED && match && match.length > 1) {
      // Fix browsers whose `exec` methods don't consistently return `undefined`
      // for NPCG, like IE8. NOTE: This doesn' work for /(.?)?/
      nativeReplace.call(match[0], reCopy, function () {
        for (i = 1; i < arguments.length - 2; i++) {
          if (arguments[i] === undefined) match[i] = undefined;
        }
      });
    }

    return match;
  };
}

module.exports = patchedExec;


/***/ }),

/***/ 6309:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

var anObject = __webpack_require__(8005);

// `RegExp.prototype.flags` getter implementation
// https://tc39.github.io/ecma262/#sec-get-regexp.prototype.flags
module.exports = function () {
  var that = anObject(this);
  var result = '';
  if (that.global) result += 'g';
  if (that.ignoreCase) result += 'i';
  if (that.multiline) result += 'm';
  if (that.dotAll) result += 's';
  if (that.unicode) result += 'u';
  if (that.sticky) result += 'y';
  return result;
};


/***/ }),

/***/ 4385:
/***/ ((module) => {

// `RequireObjectCoercible` abstract operation
// https://tc39.github.io/ecma262/#sec-requireobjectcoercible
module.exports = function (it) {
  if (it == undefined) throw TypeError("Can't call method on " + it);
  return it;
};


/***/ }),

/***/ 2380:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var global = __webpack_require__(2858);
var createNonEnumerableProperty = __webpack_require__(7754);

module.exports = function (key, value) {
  try {
    createNonEnumerableProperty(global, key, value);
  } catch (error) {
    global[key] = value;
  } return value;
};


/***/ }),

/***/ 2420:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

var getBuiltIn = __webpack_require__(4527);
var definePropertyModule = __webpack_require__(6085);
var wellKnownSymbol = __webpack_require__(4162);
var DESCRIPTORS = __webpack_require__(5121);

var SPECIES = wellKnownSymbol('species');

module.exports = function (CONSTRUCTOR_NAME) {
  var Constructor = getBuiltIn(CONSTRUCTOR_NAME);
  var defineProperty = definePropertyModule.f;

  if (DESCRIPTORS && Constructor && !Constructor[SPECIES]) {
    defineProperty(Constructor, SPECIES, {
      configurable: true,
      get: function () { return this; }
    });
  }
};


/***/ }),

/***/ 8504:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var defineProperty = __webpack_require__(6085).f;
var has = __webpack_require__(920);
var wellKnownSymbol = __webpack_require__(4162);

var TO_STRING_TAG = wellKnownSymbol('toStringTag');

module.exports = function (it, TAG, STATIC) {
  if (it && !has(it = STATIC ? it : it.prototype, TO_STRING_TAG)) {
    defineProperty(it, TO_STRING_TAG, { configurable: true, value: TAG });
  }
};


/***/ }),

/***/ 3560:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var shared = __webpack_require__(7932);
var uid = __webpack_require__(5048);

var keys = shared('keys');

module.exports = function (key) {
  return keys[key] || (keys[key] = uid(key));
};


/***/ }),

/***/ 9557:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var global = __webpack_require__(2858);
var setGlobal = __webpack_require__(2380);

var SHARED = '__core-js_shared__';
var store = global[SHARED] || setGlobal(SHARED, {});

module.exports = store;


/***/ }),

/***/ 7932:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var IS_PURE = __webpack_require__(4432);
var store = __webpack_require__(9557);

(module.exports = function (key, value) {
  return store[key] || (store[key] = value !== undefined ? value : {});
})('versions', []).push({
  version: '3.4.0',
  mode: IS_PURE ? 'pure' : 'global',
  copyright: '© 2019 Denis Pushkarev (zloirock.ru)'
});


/***/ }),

/***/ 9894:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

var fails = __webpack_require__(6287);

module.exports = function (METHOD_NAME, argument) {
  var method = [][METHOD_NAME];
  return !method || !fails(function () {
    // eslint-disable-next-line no-useless-call,no-throw-literal
    method.call(null, argument || function () { throw 1; }, 1);
  });
};


/***/ }),

/***/ 8336:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var anObject = __webpack_require__(8005);
var aFunction = __webpack_require__(9446);
var wellKnownSymbol = __webpack_require__(4162);

var SPECIES = wellKnownSymbol('species');

// `SpeciesConstructor` abstract operation
// https://tc39.github.io/ecma262/#sec-speciesconstructor
module.exports = function (O, defaultConstructor) {
  var C = anObject(O).constructor;
  var S;
  return C === undefined || (S = anObject(C)[SPECIES]) == undefined ? defaultConstructor : aFunction(S);
};


/***/ }),

/***/ 57:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var toInteger = __webpack_require__(6452);
var requireObjectCoercible = __webpack_require__(4385);

// `String.prototype.{ codePointAt, at }` methods implementation
var createMethod = function (CONVERT_TO_STRING) {
  return function ($this, pos) {
    var S = String(requireObjectCoercible($this));
    var position = toInteger(pos);
    var size = S.length;
    var first, second;
    if (position < 0 || position >= size) return CONVERT_TO_STRING ? '' : undefined;
    first = S.charCodeAt(position);
    return first < 0xD800 || first > 0xDBFF || position + 1 === size
      || (second = S.charCodeAt(position + 1)) < 0xDC00 || second > 0xDFFF
        ? CONVERT_TO_STRING ? S.charAt(position) : first
        : CONVERT_TO_STRING ? S.slice(position, position + 2) : (first - 0xD800 << 10) + (second - 0xDC00) + 0x10000;
  };
};

module.exports = {
  // `String.prototype.codePointAt` method
  // https://tc39.github.io/ecma262/#sec-string.prototype.codepointat
  codeAt: createMethod(false),
  // `String.prototype.at` method
  // https://github.com/mathiasbynens/String.prototype.at
  charAt: createMethod(true)
};


/***/ }),

/***/ 987:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var toInteger = __webpack_require__(6452);

var max = Math.max;
var min = Math.min;

// Helper for a popular repeating case of the spec:
// Let integer be ? ToInteger(index).
// If integer < 0, let result be max((length + integer), 0); else let result be min(length, length).
module.exports = function (index, length) {
  var integer = toInteger(index);
  return integer < 0 ? max(integer + length, 0) : min(integer, length);
};


/***/ }),

/***/ 4747:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

// toObject with fallback for non-array-like ES3 strings
var IndexedObject = __webpack_require__(2804);
var requireObjectCoercible = __webpack_require__(4385);

module.exports = function (it) {
  return IndexedObject(requireObjectCoercible(it));
};


/***/ }),

/***/ 6452:
/***/ ((module) => {

var ceil = Math.ceil;
var floor = Math.floor;

// `ToInteger` abstract operation
// https://tc39.github.io/ecma262/#sec-tointeger
module.exports = function (argument) {
  return isNaN(argument = +argument) ? 0 : (argument > 0 ? floor : ceil)(argument);
};


/***/ }),

/***/ 5626:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var toInteger = __webpack_require__(6452);

var min = Math.min;

// `ToLength` abstract operation
// https://tc39.github.io/ecma262/#sec-tolength
module.exports = function (argument) {
  return argument > 0 ? min(toInteger(argument), 0x1FFFFFFFFFFFFF) : 0; // 2 ** 53 - 1 == 9007199254740991
};


/***/ }),

/***/ 3228:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var requireObjectCoercible = __webpack_require__(4385);

// `ToObject` abstract operation
// https://tc39.github.io/ecma262/#sec-toobject
module.exports = function (argument) {
  return Object(requireObjectCoercible(argument));
};


/***/ }),

/***/ 8400:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var isObject = __webpack_require__(5429);

// `ToPrimitive` abstract operation
// https://tc39.github.io/ecma262/#sec-toprimitive
// instead of the ES6 spec version, we didn't implement @@toPrimitive case
// and the second argument - flag - preferred type is a string
module.exports = function (input, PREFERRED_STRING) {
  if (!isObject(input)) return input;
  var fn, val;
  if (PREFERRED_STRING && typeof (fn = input.toString) == 'function' && !isObject(val = fn.call(input))) return val;
  if (typeof (fn = input.valueOf) == 'function' && !isObject(val = fn.call(input))) return val;
  if (!PREFERRED_STRING && typeof (fn = input.toString) == 'function' && !isObject(val = fn.call(input))) return val;
  throw TypeError("Can't convert object to primitive value");
};


/***/ }),

/***/ 5048:
/***/ ((module) => {

var id = 0;
var postfix = Math.random();

module.exports = function (key) {
  return 'Symbol(' + String(key === undefined ? '' : key) + ')_' + (++id + postfix).toString(36);
};


/***/ }),

/***/ 3460:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var getBuiltIn = __webpack_require__(4527);

module.exports = getBuiltIn('navigator', 'userAgent') || '';


/***/ }),

/***/ 3123:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var global = __webpack_require__(2858);
var userAgent = __webpack_require__(3460);

var process = global.process;
var versions = process && process.versions;
var v8 = versions && versions.v8;
var match, version;

if (v8) {
  match = v8.split('.');
  version = match[0] + match[1];
} else if (userAgent) {
  match = userAgent.match(/Edge\/(\d+)/);
  if (!match || match[1] >= 74) {
    match = userAgent.match(/Chrome\/(\d+)/);
    if (match) version = match[1];
  }
}

module.exports = version && +version;


/***/ }),

/***/ 4162:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var global = __webpack_require__(2858);
var shared = __webpack_require__(7932);
var uid = __webpack_require__(5048);
var NATIVE_SYMBOL = __webpack_require__(4913);

var Symbol = global.Symbol;
var store = shared('wks');

module.exports = function (name) {
  return store[name] || (store[name] = NATIVE_SYMBOL && Symbol[name]
    || (NATIVE_SYMBOL ? Symbol : uid)('Symbol.' + name));
};


/***/ }),

/***/ 5588:
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

var $ = __webpack_require__(8283);
var fails = __webpack_require__(6287);
var isArray = __webpack_require__(8859);
var isObject = __webpack_require__(5429);
var toObject = __webpack_require__(3228);
var toLength = __webpack_require__(5626);
var createProperty = __webpack_require__(6549);
var arraySpeciesCreate = __webpack_require__(2371);
var arrayMethodHasSpeciesSupport = __webpack_require__(160);
var wellKnownSymbol = __webpack_require__(4162);
var V8_VERSION = __webpack_require__(3123);

var IS_CONCAT_SPREADABLE = wellKnownSymbol('isConcatSpreadable');
var MAX_SAFE_INTEGER = 0x1FFFFFFFFFFFFF;
var MAXIMUM_ALLOWED_INDEX_EXCEEDED = 'Maximum allowed index exceeded';

// We can't use this feature detection in V8 since it causes
// deoptimization and serious performance degradation
// https://github.com/zloirock/core-js/issues/679
var IS_CONCAT_SPREADABLE_SUPPORT = V8_VERSION >= 51 || !fails(function () {
  var array = [];
  array[IS_CONCAT_SPREADABLE] = false;
  return array.concat()[0] !== array;
});

var SPECIES_SUPPORT = arrayMethodHasSpeciesSupport('concat');

var isConcatSpreadable = function (O) {
  if (!isObject(O)) return false;
  var spreadable = O[IS_CONCAT_SPREADABLE];
  return spreadable !== undefined ? !!spreadable : isArray(O);
};

var FORCED = !IS_CONCAT_SPREADABLE_SUPPORT || !SPECIES_SUPPORT;

// `Array.prototype.concat` method
// https://tc39.github.io/ecma262/#sec-array.prototype.concat
// with adding support of @@isConcatSpreadable and @@species
$({ target: 'Array', proto: true, forced: FORCED }, {
  concat: function concat(arg) { // eslint-disable-line no-unused-vars
    var O = toObject(this);
    var A = arraySpeciesCreate(O, 0);
    var n = 0;
    var i, k, length, len, E;
    for (i = -1, length = arguments.length; i < length; i++) {
      E = i === -1 ? O : arguments[i];
      if (isConcatSpreadable(E)) {
        len = toLength(E.length);
        if (n + len > MAX_SAFE_INTEGER) throw TypeError(MAXIMUM_ALLOWED_INDEX_EXCEEDED);
        for (k = 0; k < len; k++, n++) if (k in E) createProperty(A, n, E[k]);
      } else {
        if (n >= MAX_SAFE_INTEGER) throw TypeError(MAXIMUM_ALLOWED_INDEX_EXCEEDED);
        createProperty(A, n++, E);
      }
    }
    A.length = n;
    return A;
  }
});


/***/ }),

/***/ 7168:
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

var $ = __webpack_require__(8283);
var $filter = __webpack_require__(658).filter;
var arrayMethodHasSpeciesSupport = __webpack_require__(160);

// `Array.prototype.filter` method
// https://tc39.github.io/ecma262/#sec-array.prototype.filter
// with adding support of @@species
$({ target: 'Array', proto: true, forced: !arrayMethodHasSpeciesSupport('filter') }, {
  filter: function filter(callbackfn /* , thisArg */) {
    return $filter(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
  }
});


/***/ }),

/***/ 7465:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

var toIndexedObject = __webpack_require__(4747);
var addToUnscopables = __webpack_require__(6535);
var Iterators = __webpack_require__(6879);
var InternalStateModule = __webpack_require__(1896);
var defineIterator = __webpack_require__(376);

var ARRAY_ITERATOR = 'Array Iterator';
var setInternalState = InternalStateModule.set;
var getInternalState = InternalStateModule.getterFor(ARRAY_ITERATOR);

// `Array.prototype.entries` method
// https://tc39.github.io/ecma262/#sec-array.prototype.entries
// `Array.prototype.keys` method
// https://tc39.github.io/ecma262/#sec-array.prototype.keys
// `Array.prototype.values` method
// https://tc39.github.io/ecma262/#sec-array.prototype.values
// `Array.prototype[@@iterator]` method
// https://tc39.github.io/ecma262/#sec-array.prototype-@@iterator
// `CreateArrayIterator` internal method
// https://tc39.github.io/ecma262/#sec-createarrayiterator
module.exports = defineIterator(Array, 'Array', function (iterated, kind) {
  setInternalState(this, {
    type: ARRAY_ITERATOR,
    target: toIndexedObject(iterated), // target
    index: 0,                          // next index
    kind: kind                         // kind
  });
// `%ArrayIteratorPrototype%.next` method
// https://tc39.github.io/ecma262/#sec-%arrayiteratorprototype%.next
}, function () {
  var state = getInternalState(this);
  var target = state.target;
  var kind = state.kind;
  var index = state.index++;
  if (!target || index >= target.length) {
    state.target = undefined;
    return { value: undefined, done: true };
  }
  if (kind == 'keys') return { value: index, done: false };
  if (kind == 'values') return { value: target[index], done: false };
  return { value: [index, target[index]], done: false };
}, 'values');

// argumentsList[@@iterator] is %ArrayProto_values%
// https://tc39.github.io/ecma262/#sec-createunmappedargumentsobject
// https://tc39.github.io/ecma262/#sec-createmappedargumentsobject
Iterators.Arguments = Iterators.Array;

// https://tc39.github.io/ecma262/#sec-array.prototype-@@unscopables
addToUnscopables('keys');
addToUnscopables('values');
addToUnscopables('entries');


/***/ }),

/***/ 6049:
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

var $ = __webpack_require__(8283);
var $map = __webpack_require__(658).map;
var arrayMethodHasSpeciesSupport = __webpack_require__(160);

// `Array.prototype.map` method
// https://tc39.github.io/ecma262/#sec-array.prototype.map
// with adding support of @@species
$({ target: 'Array', proto: true, forced: !arrayMethodHasSpeciesSupport('map') }, {
  map: function map(callbackfn /* , thisArg */) {
    return $map(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
  }
});


/***/ }),

/***/ 6882:
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

var $ = __webpack_require__(8283);
var isObject = __webpack_require__(5429);
var isArray = __webpack_require__(8859);
var toAbsoluteIndex = __webpack_require__(987);
var toLength = __webpack_require__(5626);
var toIndexedObject = __webpack_require__(4747);
var createProperty = __webpack_require__(6549);
var arrayMethodHasSpeciesSupport = __webpack_require__(160);
var wellKnownSymbol = __webpack_require__(4162);

var SPECIES = wellKnownSymbol('species');
var nativeSlice = [].slice;
var max = Math.max;

// `Array.prototype.slice` method
// https://tc39.github.io/ecma262/#sec-array.prototype.slice
// fallback for not array-like ES3 strings and DOM objects
$({ target: 'Array', proto: true, forced: !arrayMethodHasSpeciesSupport('slice') }, {
  slice: function slice(start, end) {
    var O = toIndexedObject(this);
    var length = toLength(O.length);
    var k = toAbsoluteIndex(start, length);
    var fin = toAbsoluteIndex(end === undefined ? length : end, length);
    // inline `ArraySpeciesCreate` for usage native `Array#slice` where it's possible
    var Constructor, result, n;
    if (isArray(O)) {
      Constructor = O.constructor;
      // cross-realm fallback
      if (typeof Constructor == 'function' && (Constructor === Array || isArray(Constructor.prototype))) {
        Constructor = undefined;
      } else if (isObject(Constructor)) {
        Constructor = Constructor[SPECIES];
        if (Constructor === null) Constructor = undefined;
      }
      if (Constructor === Array || Constructor === undefined) {
        return nativeSlice.call(O, k, fin);
      }
    }
    result = new (Constructor === undefined ? Array : Constructor)(max(fin - k, 0));
    for (n = 0; k < fin; k++, n++) if (k in O) createProperty(result, n, O[k]);
    result.length = n;
    return result;
  }
});


/***/ }),

/***/ 6206:
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

var $ = __webpack_require__(8283);
var aFunction = __webpack_require__(9446);
var toObject = __webpack_require__(3228);
var fails = __webpack_require__(6287);
var sloppyArrayMethod = __webpack_require__(9894);

var nativeSort = [].sort;
var test = [1, 2, 3];

// IE8-
var FAILS_ON_UNDEFINED = fails(function () {
  test.sort(undefined);
});
// V8 bug
var FAILS_ON_NULL = fails(function () {
  test.sort(null);
});
// Old WebKit
var SLOPPY_METHOD = sloppyArrayMethod('sort');

var FORCED = FAILS_ON_UNDEFINED || !FAILS_ON_NULL || SLOPPY_METHOD;

// `Array.prototype.sort` method
// https://tc39.github.io/ecma262/#sec-array.prototype.sort
$({ target: 'Array', proto: true, forced: FORCED }, {
  sort: function sort(comparefn) {
    return comparefn === undefined
      ? nativeSort.call(toObject(this))
      : nativeSort.call(toObject(this), aFunction(comparefn));
  }
});


/***/ }),

/***/ 1236:
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {

var $ = __webpack_require__(8283);
var assign = __webpack_require__(8707);

// `Object.assign` method
// https://tc39.github.io/ecma262/#sec-object.assign
$({ target: 'Object', stat: true, forced: Object.assign !== assign }, {
  assign: assign
});


/***/ }),

/***/ 5841:
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {

var $ = __webpack_require__(8283);
var $entries = __webpack_require__(8503).entries;

// `Object.entries` method
// https://tc39.github.io/ecma262/#sec-object.entries
$({ target: 'Object', stat: true }, {
  entries: function entries(O) {
    return $entries(O);
  }
});


/***/ }),

/***/ 1592:
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {

var redefine = __webpack_require__(7384);
var toString = __webpack_require__(4102);

var ObjectPrototype = Object.prototype;

// `Object.prototype.toString` method
// https://tc39.github.io/ecma262/#sec-object.prototype.tostring
if (toString !== ObjectPrototype.toString) {
  redefine(ObjectPrototype, 'toString', toString, { unsafe: true });
}


/***/ }),

/***/ 1607:
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {

var $ = __webpack_require__(8283);
var $values = __webpack_require__(8503).values;

// `Object.values` method
// https://tc39.github.io/ecma262/#sec-object.values
$({ target: 'Object', stat: true }, {
  values: function values(O) {
    return $values(O);
  }
});


/***/ }),

/***/ 7604:
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

var redefine = __webpack_require__(7384);
var anObject = __webpack_require__(8005);
var fails = __webpack_require__(6287);
var flags = __webpack_require__(6309);

var TO_STRING = 'toString';
var RegExpPrototype = RegExp.prototype;
var nativeToString = RegExpPrototype[TO_STRING];

var NOT_GENERIC = fails(function () { return nativeToString.call({ source: 'a', flags: 'b' }) != '/a/b'; });
// FF44- RegExp#toString has a wrong name
var INCORRECT_NAME = nativeToString.name != TO_STRING;

// `RegExp.prototype.toString` method
// https://tc39.github.io/ecma262/#sec-regexp.prototype.tostring
if (NOT_GENERIC || INCORRECT_NAME) {
  redefine(RegExp.prototype, TO_STRING, function toString() {
    var R = anObject(this);
    var p = String(R.source);
    var rf = R.flags;
    var f = String(rf === undefined && R instanceof RegExp && !('flags' in RegExpPrototype) ? flags.call(R) : rf);
    return '/' + p + '/' + f;
  }, { unsafe: true });
}


/***/ }),

/***/ 9600:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

var collection = __webpack_require__(4542);
var collectionStrong = __webpack_require__(9903);

// `Set` constructor
// https://tc39.github.io/ecma262/#sec-set-objects
module.exports = collection('Set', function (get) {
  return function Set() { return get(this, arguments.length ? arguments[0] : undefined); };
}, collectionStrong);


/***/ }),

/***/ 2343:
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

var fixRegExpWellKnownSymbolLogic = __webpack_require__(1824);
var anObject = __webpack_require__(8005);
var toLength = __webpack_require__(5626);
var requireObjectCoercible = __webpack_require__(4385);
var advanceStringIndex = __webpack_require__(8485);
var regExpExec = __webpack_require__(4111);

// @@match logic
fixRegExpWellKnownSymbolLogic('match', 1, function (MATCH, nativeMatch, maybeCallNative) {
  return [
    // `String.prototype.match` method
    // https://tc39.github.io/ecma262/#sec-string.prototype.match
    function match(regexp) {
      var O = requireObjectCoercible(this);
      var matcher = regexp == undefined ? undefined : regexp[MATCH];
      return matcher !== undefined ? matcher.call(regexp, O) : new RegExp(regexp)[MATCH](String(O));
    },
    // `RegExp.prototype[@@match]` method
    // https://tc39.github.io/ecma262/#sec-regexp.prototype-@@match
    function (regexp) {
      var res = maybeCallNative(nativeMatch, regexp, this);
      if (res.done) return res.value;

      var rx = anObject(regexp);
      var S = String(this);

      if (!rx.global) return regExpExec(rx, S);

      var fullUnicode = rx.unicode;
      rx.lastIndex = 0;
      var A = [];
      var n = 0;
      var result;
      while ((result = regExpExec(rx, S)) !== null) {
        var matchStr = String(result[0]);
        A[n] = matchStr;
        if (matchStr === '') rx.lastIndex = advanceStringIndex(S, toLength(rx.lastIndex), fullUnicode);
        n++;
      }
      return n === 0 ? null : A;
    }
  ];
});


/***/ }),

/***/ 3652:
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

var fixRegExpWellKnownSymbolLogic = __webpack_require__(1824);
var isRegExp = __webpack_require__(2832);
var anObject = __webpack_require__(8005);
var requireObjectCoercible = __webpack_require__(4385);
var speciesConstructor = __webpack_require__(8336);
var advanceStringIndex = __webpack_require__(8485);
var toLength = __webpack_require__(5626);
var callRegExpExec = __webpack_require__(4111);
var regexpExec = __webpack_require__(7344);
var fails = __webpack_require__(6287);

var arrayPush = [].push;
var min = Math.min;
var MAX_UINT32 = 0xFFFFFFFF;

// babel-minify transpiles RegExp('x', 'y') -> /x/y and it causes SyntaxError
var SUPPORTS_Y = !fails(function () { return !RegExp(MAX_UINT32, 'y'); });

// @@split logic
fixRegExpWellKnownSymbolLogic('split', 2, function (SPLIT, nativeSplit, maybeCallNative) {
  var internalSplit;
  if (
    'abbc'.split(/(b)*/)[1] == 'c' ||
    'test'.split(/(?:)/, -1).length != 4 ||
    'ab'.split(/(?:ab)*/).length != 2 ||
    '.'.split(/(.?)(.?)/).length != 4 ||
    '.'.split(/()()/).length > 1 ||
    ''.split(/.?/).length
  ) {
    // based on es5-shim implementation, need to rework it
    internalSplit = function (separator, limit) {
      var string = String(requireObjectCoercible(this));
      var lim = limit === undefined ? MAX_UINT32 : limit >>> 0;
      if (lim === 0) return [];
      if (separator === undefined) return [string];
      // If `separator` is not a regex, use native split
      if (!isRegExp(separator)) {
        return nativeSplit.call(string, separator, lim);
      }
      var output = [];
      var flags = (separator.ignoreCase ? 'i' : '') +
                  (separator.multiline ? 'm' : '') +
                  (separator.unicode ? 'u' : '') +
                  (separator.sticky ? 'y' : '');
      var lastLastIndex = 0;
      // Make `global` and avoid `lastIndex` issues by working with a copy
      var separatorCopy = new RegExp(separator.source, flags + 'g');
      var match, lastIndex, lastLength;
      while (match = regexpExec.call(separatorCopy, string)) {
        lastIndex = separatorCopy.lastIndex;
        if (lastIndex > lastLastIndex) {
          output.push(string.slice(lastLastIndex, match.index));
          if (match.length > 1 && match.index < string.length) arrayPush.apply(output, match.slice(1));
          lastLength = match[0].length;
          lastLastIndex = lastIndex;
          if (output.length >= lim) break;
        }
        if (separatorCopy.lastIndex === match.index) separatorCopy.lastIndex++; // Avoid an infinite loop
      }
      if (lastLastIndex === string.length) {
        if (lastLength || !separatorCopy.test('')) output.push('');
      } else output.push(string.slice(lastLastIndex));
      return output.length > lim ? output.slice(0, lim) : output;
    };
  // Chakra, V8
  } else if ('0'.split(undefined, 0).length) {
    internalSplit = function (separator, limit) {
      return separator === undefined && limit === 0 ? [] : nativeSplit.call(this, separator, limit);
    };
  } else internalSplit = nativeSplit;

  return [
    // `String.prototype.split` method
    // https://tc39.github.io/ecma262/#sec-string.prototype.split
    function split(separator, limit) {
      var O = requireObjectCoercible(this);
      var splitter = separator == undefined ? undefined : separator[SPLIT];
      return splitter !== undefined
        ? splitter.call(separator, O, limit)
        : internalSplit.call(String(O), separator, limit);
    },
    // `RegExp.prototype[@@split]` method
    // https://tc39.github.io/ecma262/#sec-regexp.prototype-@@split
    //
    // NOTE: This cannot be properly polyfilled in engines that don't support
    // the 'y' flag.
    function (regexp, limit) {
      var res = maybeCallNative(internalSplit, regexp, this, limit, internalSplit !== nativeSplit);
      if (res.done) return res.value;

      var rx = anObject(regexp);
      var S = String(this);
      var C = speciesConstructor(rx, RegExp);

      var unicodeMatching = rx.unicode;
      var flags = (rx.ignoreCase ? 'i' : '') +
                  (rx.multiline ? 'm' : '') +
                  (rx.unicode ? 'u' : '') +
                  (SUPPORTS_Y ? 'y' : 'g');

      // ^(? + rx + ) is needed, in combination with some S slicing, to
      // simulate the 'y' flag.
      var splitter = new C(SUPPORTS_Y ? rx : '^(?:' + rx.source + ')', flags);
      var lim = limit === undefined ? MAX_UINT32 : limit >>> 0;
      if (lim === 0) return [];
      if (S.length === 0) return callRegExpExec(splitter, S) === null ? [S] : [];
      var p = 0;
      var q = 0;
      var A = [];
      while (q < S.length) {
        splitter.lastIndex = SUPPORTS_Y ? q : 0;
        var z = callRegExpExec(splitter, SUPPORTS_Y ? S : S.slice(q));
        var e;
        if (
          z === null ||
          (e = min(toLength(splitter.lastIndex + (SUPPORTS_Y ? 0 : q)), S.length)) === p
        ) {
          q = advanceStringIndex(S, q, unicodeMatching);
        } else {
          A.push(S.slice(p, q));
          if (A.length === lim) return A;
          for (var i = 1; i <= z.length - 1; i++) {
            A.push(z[i]);
            if (A.length === lim) return A;
          }
          q = p = e;
        }
      }
      A.push(S.slice(p));
      return A;
    }
  ];
}, !SUPPORTS_Y);


/***/ }),

/***/ 8222:
/***/ ((module, exports, __webpack_require__) => {

/**
 * This is the web browser implementation of `debug()`.
 *
 * Expose `debug()` as the module.
 */

exports = module.exports = __webpack_require__(8564);
exports.log = log;
exports.formatArgs = formatArgs;
exports.save = save;
exports.load = load;
exports.useColors = useColors;
exports.storage = 'undefined' != typeof chrome
               && 'undefined' != typeof chrome.storage
                  ? chrome.storage.local
                  : localstorage();

/**
 * Colors.
 */

exports.colors = [
  'lightseagreen',
  'forestgreen',
  'goldenrod',
  'dodgerblue',
  'darkorchid',
  'crimson'
];

/**
 * Currently only WebKit-based Web Inspectors, Firefox >= v31,
 * and the Firebug extension (any Firefox version) are known
 * to support "%c" CSS customizations.
 *
 * TODO: add a `localStorage` variable to explicitly enable/disable colors
 */

function useColors() {
  // NB: In an Electron preload script, document will be defined but not fully
  // initialized. Since we know we're in Chrome, we'll just detect this case
  // explicitly
  if (typeof window !== 'undefined' && window.process && window.process.type === 'renderer') {
    return true;
  }

  // is webkit? http://stackoverflow.com/a/16459606/376773
  // document is undefined in react-native: https://github.com/facebook/react-native/pull/1632
  return (typeof document !== 'undefined' && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance) ||
    // is firebug? http://stackoverflow.com/a/398120/376773
    (typeof window !== 'undefined' && window.console && (window.console.firebug || (window.console.exception && window.console.table))) ||
    // is firefox >= v31?
    // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
    (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31) ||
    // double check webkit in userAgent just in case we are in a worker
    (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/));
}

/**
 * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
 */

exports.formatters.j = function(v) {
  try {
    return JSON.stringify(v);
  } catch (err) {
    return '[UnexpectedJSONParseError]: ' + err.message;
  }
};


/**
 * Colorize log arguments if enabled.
 *
 * @api public
 */

function formatArgs(args) {
  var useColors = this.useColors;

  args[0] = (useColors ? '%c' : '')
    + this.namespace
    + (useColors ? ' %c' : ' ')
    + args[0]
    + (useColors ? '%c ' : ' ')
    + '+' + exports.humanize(this.diff);

  if (!useColors) return;

  var c = 'color: ' + this.color;
  args.splice(1, 0, c, 'color: inherit')

  // the final "%c" is somewhat tricky, because there could be other
  // arguments passed either before or after the %c, so we need to
  // figure out the correct index to insert the CSS into
  var index = 0;
  var lastC = 0;
  args[0].replace(/%[a-zA-Z%]/g, function(match) {
    if ('%%' === match) return;
    index++;
    if ('%c' === match) {
      // we only are interested in the *last* %c
      // (the user may have provided their own)
      lastC = index;
    }
  });

  args.splice(lastC, 0, c);
}

/**
 * Invokes `console.log()` when available.
 * No-op when `console.log` is not a "function".
 *
 * @api public
 */

function log() {
  // this hackery is required for IE8/9, where
  // the `console.log` function doesn't have 'apply'
  return 'object' === typeof console
    && console.log
    && Function.prototype.apply.call(console.log, console, arguments);
}

/**
 * Save `namespaces`.
 *
 * @param {String} namespaces
 * @api private
 */

function save(namespaces) {
  try {
    if (null == namespaces) {
      exports.storage.removeItem('debug');
    } else {
      exports.storage.debug = namespaces;
    }
  } catch(e) {}
}

/**
 * Load `namespaces`.
 *
 * @return {String} returns the previously persisted debug modes
 * @api private
 */

function load() {
  var r;
  try {
    r = exports.storage.debug;
  } catch(e) {}

  // If debug isn't set in LS, and we're in Electron, try to load $DEBUG
  if (!r && typeof process !== 'undefined' && 'env' in process) {
    r = process.env.DEBUG;
  }

  return r;
}

/**
 * Enable namespaces listed in `localStorage.debug` initially.
 */

exports.enable(load());

/**
 * Localstorage attempts to return the localstorage.
 *
 * This is necessary because safari throws
 * when a user disables cookies/localstorage
 * and you attempt to access it.
 *
 * @return {LocalStorage}
 * @api private
 */

function localstorage() {
  try {
    return window.localStorage;
  } catch (e) {}
}


/***/ }),

/***/ 8564:
/***/ ((module, exports, __webpack_require__) => {


/**
 * This is the common logic for both the Node.js and web browser
 * implementations of `debug()`.
 *
 * Expose `debug()` as the module.
 */

exports = module.exports = createDebug.debug = createDebug['default'] = createDebug;
exports.coerce = coerce;
exports.disable = disable;
exports.enable = enable;
exports.enabled = enabled;
exports.humanize = __webpack_require__(900);

/**
 * The currently active debug mode names, and names to skip.
 */

exports.names = [];
exports.skips = [];

/**
 * Map of special "%n" handling functions, for the debug "format" argument.
 *
 * Valid key names are a single, lower or upper-case letter, i.e. "n" and "N".
 */

exports.formatters = {};

/**
 * Previous log timestamp.
 */

var prevTime;

/**
 * Select a color.
 * @param {String} namespace
 * @return {Number}
 * @api private
 */

function selectColor(namespace) {
  var hash = 0, i;

  for (i in namespace) {
    hash  = ((hash << 5) - hash) + namespace.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }

  return exports.colors[Math.abs(hash) % exports.colors.length];
}

/**
 * Create a debugger with the given `namespace`.
 *
 * @param {String} namespace
 * @return {Function}
 * @api public
 */

function createDebug(namespace) {

  function debug() {
    // disabled?
    if (!debug.enabled) return;

    var self = debug;

    // set `diff` timestamp
    var curr = +new Date();
    var ms = curr - (prevTime || curr);
    self.diff = ms;
    self.prev = prevTime;
    self.curr = curr;
    prevTime = curr;

    // turn the `arguments` into a proper Array
    var args = new Array(arguments.length);
    for (var i = 0; i < args.length; i++) {
      args[i] = arguments[i];
    }

    args[0] = exports.coerce(args[0]);

    if ('string' !== typeof args[0]) {
      // anything else let's inspect with %O
      args.unshift('%O');
    }

    // apply any `formatters` transformations
    var index = 0;
    args[0] = args[0].replace(/%([a-zA-Z%])/g, function(match, format) {
      // if we encounter an escaped % then don't increase the array index
      if (match === '%%') return match;
      index++;
      var formatter = exports.formatters[format];
      if ('function' === typeof formatter) {
        var val = args[index];
        match = formatter.call(self, val);

        // now we need to remove `args[index]` since it's inlined in the `format`
        args.splice(index, 1);
        index--;
      }
      return match;
    });

    // apply env-specific formatting (colors, etc.)
    exports.formatArgs.call(self, args);

    var logFn = debug.log || exports.log || console.log.bind(console);
    logFn.apply(self, args);
  }

  debug.namespace = namespace;
  debug.enabled = exports.enabled(namespace);
  debug.useColors = exports.useColors();
  debug.color = selectColor(namespace);

  // env-specific initialization logic for debug instances
  if ('function' === typeof exports.init) {
    exports.init(debug);
  }

  return debug;
}

/**
 * Enables a debug mode by namespaces. This can include modes
 * separated by a colon and wildcards.
 *
 * @param {String} namespaces
 * @api public
 */

function enable(namespaces) {
  exports.save(namespaces);

  exports.names = [];
  exports.skips = [];

  var split = (typeof namespaces === 'string' ? namespaces : '').split(/[\s,]+/);
  var len = split.length;

  for (var i = 0; i < len; i++) {
    if (!split[i]) continue; // ignore empty strings
    namespaces = split[i].replace(/\*/g, '.*?');
    if (namespaces[0] === '-') {
      exports.skips.push(new RegExp('^' + namespaces.substr(1) + '$'));
    } else {
      exports.names.push(new RegExp('^' + namespaces + '$'));
    }
  }
}

/**
 * Disable debug output.
 *
 * @api public
 */

function disable() {
  exports.enable('');
}

/**
 * Returns true if the given mode name is enabled, false otherwise.
 *
 * @param {String} name
 * @return {Boolean}
 * @api public
 */

function enabled(name) {
  var i, len;
  for (i = 0, len = exports.skips.length; i < len; i++) {
    if (exports.skips[i].test(name)) {
      return false;
    }
  }
  for (i = 0, len = exports.names.length; i < len; i++) {
    if (exports.names[i].test(name)) {
      return true;
    }
  }
  return false;
}

/**
 * Coerce `val`.
 *
 * @param {Mixed} val
 * @return {Mixed}
 * @api private
 */

function coerce(val) {
  if (val instanceof Error) return val.stack || val.message;
  return val;
}


/***/ }),

/***/ 8237:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/**
 * Detect Electron renderer process, which is node, but we should
 * treat as a browser.
 */

if (typeof process !== 'undefined' && process.type === 'renderer') {
  module.exports = __webpack_require__(8222);
} else {
  module.exports = __webpack_require__(5332);
}


/***/ }),

/***/ 5332:
/***/ ((module, exports, __webpack_require__) => {

/**
 * Module dependencies.
 */

var tty = __webpack_require__(3867);
var util = __webpack_require__(1669);

/**
 * This is the Node.js implementation of `debug()`.
 *
 * Expose `debug()` as the module.
 */

exports = module.exports = __webpack_require__(8564);
exports.init = init;
exports.log = log;
exports.formatArgs = formatArgs;
exports.save = save;
exports.load = load;
exports.useColors = useColors;

/**
 * Colors.
 */

exports.colors = [6, 2, 3, 4, 5, 1];

/**
 * Build up the default `inspectOpts` object from the environment variables.
 *
 *   $ DEBUG_COLORS=no DEBUG_DEPTH=10 DEBUG_SHOW_HIDDEN=enabled node script.js
 */

exports.inspectOpts = Object.keys(process.env).filter(function (key) {
  return /^debug_/i.test(key);
}).reduce(function (obj, key) {
  // camel-case
  var prop = key
    .substring(6)
    .toLowerCase()
    .replace(/_([a-z])/g, function (_, k) { return k.toUpperCase() });

  // coerce string value into JS value
  var val = process.env[key];
  if (/^(yes|on|true|enabled)$/i.test(val)) val = true;
  else if (/^(no|off|false|disabled)$/i.test(val)) val = false;
  else if (val === 'null') val = null;
  else val = Number(val);

  obj[prop] = val;
  return obj;
}, {});

/**
 * The file descriptor to write the `debug()` calls to.
 * Set the `DEBUG_FD` env variable to override with another value. i.e.:
 *
 *   $ DEBUG_FD=3 node script.js 3>debug.log
 */

var fd = parseInt(process.env.DEBUG_FD, 10) || 2;

if (1 !== fd && 2 !== fd) {
  util.deprecate(function(){}, 'except for stderr(2) and stdout(1), any other usage of DEBUG_FD is deprecated. Override debug.log if you want to use a different log function (https://git.io/debug_fd)')()
}

var stream = 1 === fd ? process.stdout :
             2 === fd ? process.stderr :
             createWritableStdioStream(fd);

/**
 * Is stdout a TTY? Colored output is enabled when `true`.
 */

function useColors() {
  return 'colors' in exports.inspectOpts
    ? Boolean(exports.inspectOpts.colors)
    : tty.isatty(fd);
}

/**
 * Map %o to `util.inspect()`, all on a single line.
 */

exports.formatters.o = function(v) {
  this.inspectOpts.colors = this.useColors;
  return util.inspect(v, this.inspectOpts)
    .split('\n').map(function(str) {
      return str.trim()
    }).join(' ');
};

/**
 * Map %o to `util.inspect()`, allowing multiple lines if needed.
 */

exports.formatters.O = function(v) {
  this.inspectOpts.colors = this.useColors;
  return util.inspect(v, this.inspectOpts);
};

/**
 * Adds ANSI color escape codes if enabled.
 *
 * @api public
 */

function formatArgs(args) {
  var name = this.namespace;
  var useColors = this.useColors;

  if (useColors) {
    var c = this.color;
    var prefix = '  \u001b[3' + c + ';1m' + name + ' ' + '\u001b[0m';

    args[0] = prefix + args[0].split('\n').join('\n' + prefix);
    args.push('\u001b[3' + c + 'm+' + exports.humanize(this.diff) + '\u001b[0m');
  } else {
    args[0] = new Date().toUTCString()
      + ' ' + name + ' ' + args[0];
  }
}

/**
 * Invokes `util.format()` with the specified arguments and writes to `stream`.
 */

function log() {
  return stream.write(util.format.apply(util, arguments) + '\n');
}

/**
 * Save `namespaces`.
 *
 * @param {String} namespaces
 * @api private
 */

function save(namespaces) {
  if (null == namespaces) {
    // If you set a process.env field to null or undefined, it gets cast to the
    // string 'null' or 'undefined'. Just delete instead.
    delete process.env.DEBUG;
  } else {
    process.env.DEBUG = namespaces;
  }
}

/**
 * Load `namespaces`.
 *
 * @return {String} returns the previously persisted debug modes
 * @api private
 */

function load() {
  return process.env.DEBUG;
}

/**
 * Copied from `node/src/node.js`.
 *
 * XXX: It's lame that node doesn't expose this API out-of-the-box. It also
 * relies on the undocumented `tty_wrap.guessHandleType()` which is also lame.
 */

function createWritableStdioStream (fd) {
  var stream;
  var tty_wrap = process.binding('tty_wrap');

  // Note stream._type is used for test-module-load-list.js

  switch (tty_wrap.guessHandleType(fd)) {
    case 'TTY':
      stream = new tty.WriteStream(fd);
      stream._type = 'tty';

      // Hack to have stream not keep the event loop alive.
      // See https://github.com/joyent/node/issues/1726
      if (stream._handle && stream._handle.unref) {
        stream._handle.unref();
      }
      break;

    case 'FILE':
      var fs = __webpack_require__(5747);
      stream = new fs.SyncWriteStream(fd, { autoClose: false });
      stream._type = 'fs';
      break;

    case 'PIPE':
    case 'TCP':
      var net = __webpack_require__(1631);
      stream = new net.Socket({
        fd: fd,
        readable: false,
        writable: true
      });

      // FIXME Should probably have an option in net.Socket to create a
      // stream from an existing fd which is writable only. But for now
      // we'll just add this hack and set the `readable` member to false.
      // Test: ./node test/fixtures/echo.js < /etc/passwd
      stream.readable = false;
      stream.read = null;
      stream._type = 'pipe';

      // FIXME Hack to have stream not keep the event loop alive.
      // See https://github.com/joyent/node/issues/1726
      if (stream._handle && stream._handle.unref) {
        stream._handle.unref();
      }
      break;

    default:
      // Probably an error on in uv_guess_handle()
      throw new Error('Implement me. Unknown stream file type!');
  }

  // For supporting legacy API we put the FD here.
  stream.fd = fd;

  stream._isStdio = true;

  return stream;
}

/**
 * Init logic for `debug` instances.
 *
 * Create a new `inspectOpts` object in case `useColors` is set
 * differently for a particular `debug` instance.
 */

function init (debug) {
  debug.inspectOpts = {};

  var keys = Object.keys(exports.inspectOpts);
  for (var i = 0; i < keys.length; i++) {
    debug.inspectOpts[keys[i]] = exports.inspectOpts[keys[i]];
  }
}

/**
 * Enable namespaces listed in `process.env.DEBUG` initially.
 */

exports.enable(load());


/***/ }),

/***/ 8691:
/***/ ((module) => {

"use strict";


var matchOperatorsRe = /[|\\{}()[\]^$+*?.]/g;

module.exports = function (str) {
	if (typeof str !== 'string') {
		throw new TypeError('Expected a string');
	}

	return str.replace(matchOperatorsRe, '\\$&');
};


/***/ }),

/***/ 471:
/***/ ((module) => {

/*
  Copyright (C) 2013 Yusuke Suzuki <utatane.tea@gmail.com>

  Redistribution and use in source and binary forms, with or without
  modification, are permitted provided that the following conditions are met:

    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.

  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS 'AS IS'
  AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
  IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
  ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
  DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
  (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
  LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
  ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
  THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

(function () {
    'use strict';

    function isExpression(node) {
        if (node == null) { return false; }
        switch (node.type) {
            case 'ArrayExpression':
            case 'AssignmentExpression':
            case 'BinaryExpression':
            case 'CallExpression':
            case 'ConditionalExpression':
            case 'FunctionExpression':
            case 'Identifier':
            case 'Literal':
            case 'LogicalExpression':
            case 'MemberExpression':
            case 'NewExpression':
            case 'ObjectExpression':
            case 'SequenceExpression':
            case 'ThisExpression':
            case 'UnaryExpression':
            case 'UpdateExpression':
                return true;
        }
        return false;
    }

    function isIterationStatement(node) {
        if (node == null) { return false; }
        switch (node.type) {
            case 'DoWhileStatement':
            case 'ForInStatement':
            case 'ForStatement':
            case 'WhileStatement':
                return true;
        }
        return false;
    }

    function isStatement(node) {
        if (node == null) { return false; }
        switch (node.type) {
            case 'BlockStatement':
            case 'BreakStatement':
            case 'ContinueStatement':
            case 'DebuggerStatement':
            case 'DoWhileStatement':
            case 'EmptyStatement':
            case 'ExpressionStatement':
            case 'ForInStatement':
            case 'ForStatement':
            case 'IfStatement':
            case 'LabeledStatement':
            case 'ReturnStatement':
            case 'SwitchStatement':
            case 'ThrowStatement':
            case 'TryStatement':
            case 'VariableDeclaration':
            case 'WhileStatement':
            case 'WithStatement':
                return true;
        }
        return false;
    }

    function isSourceElement(node) {
      return isStatement(node) || node != null && node.type === 'FunctionDeclaration';
    }

    function trailingStatement(node) {
        switch (node.type) {
        case 'IfStatement':
            if (node.alternate != null) {
                return node.alternate;
            }
            return node.consequent;

        case 'LabeledStatement':
        case 'ForStatement':
        case 'ForInStatement':
        case 'WhileStatement':
        case 'WithStatement':
            return node.body;
        }
        return null;
    }

    function isProblematicIfStatement(node) {
        var current;

        if (node.type !== 'IfStatement') {
            return false;
        }
        if (node.alternate == null) {
            return false;
        }
        current = node.consequent;
        do {
            if (current.type === 'IfStatement') {
                if (current.alternate == null)  {
                    return true;
                }
            }
            current = trailingStatement(current);
        } while (current);

        return false;
    }

    module.exports = {
        isExpression: isExpression,
        isStatement: isStatement,
        isIterationStatement: isIterationStatement,
        isSourceElement: isSourceElement,
        isProblematicIfStatement: isProblematicIfStatement,

        trailingStatement: trailingStatement
    };
}());
/* vim: set sw=4 ts=4 et tw=80 : */


/***/ }),

/***/ 5501:
/***/ ((module) => {

/*
  Copyright (C) 2013-2014 Yusuke Suzuki <utatane.tea@gmail.com>
  Copyright (C) 2014 Ivan Nikulin <ifaaan@gmail.com>

  Redistribution and use in source and binary forms, with or without
  modification, are permitted provided that the following conditions are met:

    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.

  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
  AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
  IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
  ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
  DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
  (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
  LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
  ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
  THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

(function () {
    'use strict';

    var ES6Regex, ES5Regex, NON_ASCII_WHITESPACES, IDENTIFIER_START, IDENTIFIER_PART, ch;

    // See `tools/generate-identifier-regex.js`.
    ES5Regex = {
        // ECMAScript 5.1/Unicode v9.0.0 NonAsciiIdentifierStart:
        NonAsciiIdentifierStart: /[\xAA\xB5\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0370-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u052F\u0531-\u0556\u0559\u0561-\u0587\u05D0-\u05EA\u05F0-\u05F2\u0620-\u064A\u066E\u066F\u0671-\u06D3\u06D5\u06E5\u06E6\u06EE\u06EF\u06FA-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07CA-\u07EA\u07F4\u07F5\u07FA\u0800-\u0815\u081A\u0824\u0828\u0840-\u0858\u08A0-\u08B4\u08B6-\u08BD\u0904-\u0939\u093D\u0950\u0958-\u0961\u0971-\u0980\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC\u09DD\u09DF-\u09E1\u09F0\u09F1\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0\u0AE1\u0AF9\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3D\u0B5C\u0B5D\u0B5F-\u0B61\u0B71\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D\u0C58-\u0C5A\u0C60\u0C61\u0C80\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDE\u0CE0\u0CE1\u0CF1\u0CF2\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D54-\u0D56\u0D5F-\u0D61\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0E01-\u0E30\u0E32\u0E33\u0E40-\u0E46\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0EC6\u0EDC-\u0EDF\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F\u1050-\u1055\u105A-\u105D\u1061\u1065\u1066\u106E-\u1070\u1075-\u1081\u108E\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1380-\u138F\u13A0-\u13F5\u13F8-\u13FD\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16EE-\u16F8\u1700-\u170C\u170E-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17D7\u17DC\u1820-\u1877\u1880-\u1884\u1887-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191E\u1950-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u1A00-\u1A16\u1A20-\u1A54\u1AA7\u1B05-\u1B33\u1B45-\u1B4B\u1B83-\u1BA0\u1BAE\u1BAF\u1BBA-\u1BE5\u1C00-\u1C23\u1C4D-\u1C4F\u1C5A-\u1C7D\u1C80-\u1C88\u1CE9-\u1CEC\u1CEE-\u1CF1\u1CF5\u1CF6\u1D00-\u1DBF\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2071\u207F\u2090-\u209C\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2160-\u2188\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CEE\u2CF2\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2E2F\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303C\u3041-\u3096\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312D\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FD5\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA61F\uA62A\uA62B\uA640-\uA66E\uA67F-\uA69D\uA6A0-\uA6EF\uA717-\uA71F\uA722-\uA788\uA78B-\uA7AE\uA7B0-\uA7B7\uA7F7-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA840-\uA873\uA882-\uA8B3\uA8F2-\uA8F7\uA8FB\uA8FD\uA90A-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9CF\uA9E0-\uA9E4\uA9E6-\uA9EF\uA9FA-\uA9FE\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA60-\uAA76\uAA7A\uAA7E-\uAAAF\uAAB1\uAAB5\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAADD\uAAE0-\uAAEA\uAAF2-\uAAF4\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB65\uAB70-\uABE2\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]/,
        // ECMAScript 5.1/Unicode v9.0.0 NonAsciiIdentifierPart:
        NonAsciiIdentifierPart: /[\xAA\xB5\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0300-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u0483-\u0487\u048A-\u052F\u0531-\u0556\u0559\u0561-\u0587\u0591-\u05BD\u05BF\u05C1\u05C2\u05C4\u05C5\u05C7\u05D0-\u05EA\u05F0-\u05F2\u0610-\u061A\u0620-\u0669\u066E-\u06D3\u06D5-\u06DC\u06DF-\u06E8\u06EA-\u06FC\u06FF\u0710-\u074A\u074D-\u07B1\u07C0-\u07F5\u07FA\u0800-\u082D\u0840-\u085B\u08A0-\u08B4\u08B6-\u08BD\u08D4-\u08E1\u08E3-\u0963\u0966-\u096F\u0971-\u0983\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BC-\u09C4\u09C7\u09C8\u09CB-\u09CE\u09D7\u09DC\u09DD\u09DF-\u09E3\u09E6-\u09F1\u0A01-\u0A03\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A3C\u0A3E-\u0A42\u0A47\u0A48\u0A4B-\u0A4D\u0A51\u0A59-\u0A5C\u0A5E\u0A66-\u0A75\u0A81-\u0A83\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABC-\u0AC5\u0AC7-\u0AC9\u0ACB-\u0ACD\u0AD0\u0AE0-\u0AE3\u0AE6-\u0AEF\u0AF9\u0B01-\u0B03\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3C-\u0B44\u0B47\u0B48\u0B4B-\u0B4D\u0B56\u0B57\u0B5C\u0B5D\u0B5F-\u0B63\u0B66-\u0B6F\u0B71\u0B82\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BBE-\u0BC2\u0BC6-\u0BC8\u0BCA-\u0BCD\u0BD0\u0BD7\u0BE6-\u0BEF\u0C00-\u0C03\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D-\u0C44\u0C46-\u0C48\u0C4A-\u0C4D\u0C55\u0C56\u0C58-\u0C5A\u0C60-\u0C63\u0C66-\u0C6F\u0C80-\u0C83\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBC-\u0CC4\u0CC6-\u0CC8\u0CCA-\u0CCD\u0CD5\u0CD6\u0CDE\u0CE0-\u0CE3\u0CE6-\u0CEF\u0CF1\u0CF2\u0D01-\u0D03\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D-\u0D44\u0D46-\u0D48\u0D4A-\u0D4E\u0D54-\u0D57\u0D5F-\u0D63\u0D66-\u0D6F\u0D7A-\u0D7F\u0D82\u0D83\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0DCA\u0DCF-\u0DD4\u0DD6\u0DD8-\u0DDF\u0DE6-\u0DEF\u0DF2\u0DF3\u0E01-\u0E3A\u0E40-\u0E4E\u0E50-\u0E59\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB9\u0EBB-\u0EBD\u0EC0-\u0EC4\u0EC6\u0EC8-\u0ECD\u0ED0-\u0ED9\u0EDC-\u0EDF\u0F00\u0F18\u0F19\u0F20-\u0F29\u0F35\u0F37\u0F39\u0F3E-\u0F47\u0F49-\u0F6C\u0F71-\u0F84\u0F86-\u0F97\u0F99-\u0FBC\u0FC6\u1000-\u1049\u1050-\u109D\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u135D-\u135F\u1380-\u138F\u13A0-\u13F5\u13F8-\u13FD\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16EE-\u16F8\u1700-\u170C\u170E-\u1714\u1720-\u1734\u1740-\u1753\u1760-\u176C\u176E-\u1770\u1772\u1773\u1780-\u17D3\u17D7\u17DC\u17DD\u17E0-\u17E9\u180B-\u180D\u1810-\u1819\u1820-\u1877\u1880-\u18AA\u18B0-\u18F5\u1900-\u191E\u1920-\u192B\u1930-\u193B\u1946-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u19D0-\u19D9\u1A00-\u1A1B\u1A20-\u1A5E\u1A60-\u1A7C\u1A7F-\u1A89\u1A90-\u1A99\u1AA7\u1AB0-\u1ABD\u1B00-\u1B4B\u1B50-\u1B59\u1B6B-\u1B73\u1B80-\u1BF3\u1C00-\u1C37\u1C40-\u1C49\u1C4D-\u1C7D\u1C80-\u1C88\u1CD0-\u1CD2\u1CD4-\u1CF6\u1CF8\u1CF9\u1D00-\u1DF5\u1DFB-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u200C\u200D\u203F\u2040\u2054\u2071\u207F\u2090-\u209C\u20D0-\u20DC\u20E1\u20E5-\u20F0\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2160-\u2188\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D7F-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2DE0-\u2DFF\u2E2F\u3005-\u3007\u3021-\u302F\u3031-\u3035\u3038-\u303C\u3041-\u3096\u3099\u309A\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312D\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FD5\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA62B\uA640-\uA66F\uA674-\uA67D\uA67F-\uA6F1\uA717-\uA71F\uA722-\uA788\uA78B-\uA7AE\uA7B0-\uA7B7\uA7F7-\uA827\uA840-\uA873\uA880-\uA8C5\uA8D0-\uA8D9\uA8E0-\uA8F7\uA8FB\uA8FD\uA900-\uA92D\uA930-\uA953\uA960-\uA97C\uA980-\uA9C0\uA9CF-\uA9D9\uA9E0-\uA9FE\uAA00-\uAA36\uAA40-\uAA4D\uAA50-\uAA59\uAA60-\uAA76\uAA7A-\uAAC2\uAADB-\uAADD\uAAE0-\uAAEF\uAAF2-\uAAF6\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB65\uAB70-\uABEA\uABEC\uABED\uABF0-\uABF9\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE00-\uFE0F\uFE20-\uFE2F\uFE33\uFE34\uFE4D-\uFE4F\uFE70-\uFE74\uFE76-\uFEFC\uFF10-\uFF19\uFF21-\uFF3A\uFF3F\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]/
    };

    ES6Regex = {
        // ECMAScript 6/Unicode v9.0.0 NonAsciiIdentifierStart:
        NonAsciiIdentifierStart: /[\xAA\xB5\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0370-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u052F\u0531-\u0556\u0559\u0561-\u0587\u05D0-\u05EA\u05F0-\u05F2\u0620-\u064A\u066E\u066F\u0671-\u06D3\u06D5\u06E5\u06E6\u06EE\u06EF\u06FA-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07CA-\u07EA\u07F4\u07F5\u07FA\u0800-\u0815\u081A\u0824\u0828\u0840-\u0858\u08A0-\u08B4\u08B6-\u08BD\u0904-\u0939\u093D\u0950\u0958-\u0961\u0971-\u0980\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC\u09DD\u09DF-\u09E1\u09F0\u09F1\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0\u0AE1\u0AF9\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3D\u0B5C\u0B5D\u0B5F-\u0B61\u0B71\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D\u0C58-\u0C5A\u0C60\u0C61\u0C80\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDE\u0CE0\u0CE1\u0CF1\u0CF2\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D54-\u0D56\u0D5F-\u0D61\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0E01-\u0E30\u0E32\u0E33\u0E40-\u0E46\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0EC6\u0EDC-\u0EDF\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F\u1050-\u1055\u105A-\u105D\u1061\u1065\u1066\u106E-\u1070\u1075-\u1081\u108E\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1380-\u138F\u13A0-\u13F5\u13F8-\u13FD\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16EE-\u16F8\u1700-\u170C\u170E-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17D7\u17DC\u1820-\u1877\u1880-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191E\u1950-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u1A00-\u1A16\u1A20-\u1A54\u1AA7\u1B05-\u1B33\u1B45-\u1B4B\u1B83-\u1BA0\u1BAE\u1BAF\u1BBA-\u1BE5\u1C00-\u1C23\u1C4D-\u1C4F\u1C5A-\u1C7D\u1C80-\u1C88\u1CE9-\u1CEC\u1CEE-\u1CF1\u1CF5\u1CF6\u1D00-\u1DBF\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2071\u207F\u2090-\u209C\u2102\u2107\u210A-\u2113\u2115\u2118-\u211D\u2124\u2126\u2128\u212A-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2160-\u2188\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CEE\u2CF2\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303C\u3041-\u3096\u309B-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312D\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FD5\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA61F\uA62A\uA62B\uA640-\uA66E\uA67F-\uA69D\uA6A0-\uA6EF\uA717-\uA71F\uA722-\uA788\uA78B-\uA7AE\uA7B0-\uA7B7\uA7F7-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA840-\uA873\uA882-\uA8B3\uA8F2-\uA8F7\uA8FB\uA8FD\uA90A-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9CF\uA9E0-\uA9E4\uA9E6-\uA9EF\uA9FA-\uA9FE\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA60-\uAA76\uAA7A\uAA7E-\uAAAF\uAAB1\uAAB5\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAADD\uAAE0-\uAAEA\uAAF2-\uAAF4\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB65\uAB70-\uABE2\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]|\uD800[\uDC00-\uDC0B\uDC0D-\uDC26\uDC28-\uDC3A\uDC3C\uDC3D\uDC3F-\uDC4D\uDC50-\uDC5D\uDC80-\uDCFA\uDD40-\uDD74\uDE80-\uDE9C\uDEA0-\uDED0\uDF00-\uDF1F\uDF30-\uDF4A\uDF50-\uDF75\uDF80-\uDF9D\uDFA0-\uDFC3\uDFC8-\uDFCF\uDFD1-\uDFD5]|\uD801[\uDC00-\uDC9D\uDCB0-\uDCD3\uDCD8-\uDCFB\uDD00-\uDD27\uDD30-\uDD63\uDE00-\uDF36\uDF40-\uDF55\uDF60-\uDF67]|\uD802[\uDC00-\uDC05\uDC08\uDC0A-\uDC35\uDC37\uDC38\uDC3C\uDC3F-\uDC55\uDC60-\uDC76\uDC80-\uDC9E\uDCE0-\uDCF2\uDCF4\uDCF5\uDD00-\uDD15\uDD20-\uDD39\uDD80-\uDDB7\uDDBE\uDDBF\uDE00\uDE10-\uDE13\uDE15-\uDE17\uDE19-\uDE33\uDE60-\uDE7C\uDE80-\uDE9C\uDEC0-\uDEC7\uDEC9-\uDEE4\uDF00-\uDF35\uDF40-\uDF55\uDF60-\uDF72\uDF80-\uDF91]|\uD803[\uDC00-\uDC48\uDC80-\uDCB2\uDCC0-\uDCF2]|\uD804[\uDC03-\uDC37\uDC83-\uDCAF\uDCD0-\uDCE8\uDD03-\uDD26\uDD50-\uDD72\uDD76\uDD83-\uDDB2\uDDC1-\uDDC4\uDDDA\uDDDC\uDE00-\uDE11\uDE13-\uDE2B\uDE80-\uDE86\uDE88\uDE8A-\uDE8D\uDE8F-\uDE9D\uDE9F-\uDEA8\uDEB0-\uDEDE\uDF05-\uDF0C\uDF0F\uDF10\uDF13-\uDF28\uDF2A-\uDF30\uDF32\uDF33\uDF35-\uDF39\uDF3D\uDF50\uDF5D-\uDF61]|\uD805[\uDC00-\uDC34\uDC47-\uDC4A\uDC80-\uDCAF\uDCC4\uDCC5\uDCC7\uDD80-\uDDAE\uDDD8-\uDDDB\uDE00-\uDE2F\uDE44\uDE80-\uDEAA\uDF00-\uDF19]|\uD806[\uDCA0-\uDCDF\uDCFF\uDEC0-\uDEF8]|\uD807[\uDC00-\uDC08\uDC0A-\uDC2E\uDC40\uDC72-\uDC8F]|\uD808[\uDC00-\uDF99]|\uD809[\uDC00-\uDC6E\uDC80-\uDD43]|[\uD80C\uD81C-\uD820\uD840-\uD868\uD86A-\uD86C\uD86F-\uD872][\uDC00-\uDFFF]|\uD80D[\uDC00-\uDC2E]|\uD811[\uDC00-\uDE46]|\uD81A[\uDC00-\uDE38\uDE40-\uDE5E\uDED0-\uDEED\uDF00-\uDF2F\uDF40-\uDF43\uDF63-\uDF77\uDF7D-\uDF8F]|\uD81B[\uDF00-\uDF44\uDF50\uDF93-\uDF9F\uDFE0]|\uD821[\uDC00-\uDFEC]|\uD822[\uDC00-\uDEF2]|\uD82C[\uDC00\uDC01]|\uD82F[\uDC00-\uDC6A\uDC70-\uDC7C\uDC80-\uDC88\uDC90-\uDC99]|\uD835[\uDC00-\uDC54\uDC56-\uDC9C\uDC9E\uDC9F\uDCA2\uDCA5\uDCA6\uDCA9-\uDCAC\uDCAE-\uDCB9\uDCBB\uDCBD-\uDCC3\uDCC5-\uDD05\uDD07-\uDD0A\uDD0D-\uDD14\uDD16-\uDD1C\uDD1E-\uDD39\uDD3B-\uDD3E\uDD40-\uDD44\uDD46\uDD4A-\uDD50\uDD52-\uDEA5\uDEA8-\uDEC0\uDEC2-\uDEDA\uDEDC-\uDEFA\uDEFC-\uDF14\uDF16-\uDF34\uDF36-\uDF4E\uDF50-\uDF6E\uDF70-\uDF88\uDF8A-\uDFA8\uDFAA-\uDFC2\uDFC4-\uDFCB]|\uD83A[\uDC00-\uDCC4\uDD00-\uDD43]|\uD83B[\uDE00-\uDE03\uDE05-\uDE1F\uDE21\uDE22\uDE24\uDE27\uDE29-\uDE32\uDE34-\uDE37\uDE39\uDE3B\uDE42\uDE47\uDE49\uDE4B\uDE4D-\uDE4F\uDE51\uDE52\uDE54\uDE57\uDE59\uDE5B\uDE5D\uDE5F\uDE61\uDE62\uDE64\uDE67-\uDE6A\uDE6C-\uDE72\uDE74-\uDE77\uDE79-\uDE7C\uDE7E\uDE80-\uDE89\uDE8B-\uDE9B\uDEA1-\uDEA3\uDEA5-\uDEA9\uDEAB-\uDEBB]|\uD869[\uDC00-\uDED6\uDF00-\uDFFF]|\uD86D[\uDC00-\uDF34\uDF40-\uDFFF]|\uD86E[\uDC00-\uDC1D\uDC20-\uDFFF]|\uD873[\uDC00-\uDEA1]|\uD87E[\uDC00-\uDE1D]/,
        // ECMAScript 6/Unicode v9.0.0 NonAsciiIdentifierPart:
        NonAsciiIdentifierPart: /[\xAA\xB5\xB7\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0300-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u0483-\u0487\u048A-\u052F\u0531-\u0556\u0559\u0561-\u0587\u0591-\u05BD\u05BF\u05C1\u05C2\u05C4\u05C5\u05C7\u05D0-\u05EA\u05F0-\u05F2\u0610-\u061A\u0620-\u0669\u066E-\u06D3\u06D5-\u06DC\u06DF-\u06E8\u06EA-\u06FC\u06FF\u0710-\u074A\u074D-\u07B1\u07C0-\u07F5\u07FA\u0800-\u082D\u0840-\u085B\u08A0-\u08B4\u08B6-\u08BD\u08D4-\u08E1\u08E3-\u0963\u0966-\u096F\u0971-\u0983\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BC-\u09C4\u09C7\u09C8\u09CB-\u09CE\u09D7\u09DC\u09DD\u09DF-\u09E3\u09E6-\u09F1\u0A01-\u0A03\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A3C\u0A3E-\u0A42\u0A47\u0A48\u0A4B-\u0A4D\u0A51\u0A59-\u0A5C\u0A5E\u0A66-\u0A75\u0A81-\u0A83\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABC-\u0AC5\u0AC7-\u0AC9\u0ACB-\u0ACD\u0AD0\u0AE0-\u0AE3\u0AE6-\u0AEF\u0AF9\u0B01-\u0B03\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3C-\u0B44\u0B47\u0B48\u0B4B-\u0B4D\u0B56\u0B57\u0B5C\u0B5D\u0B5F-\u0B63\u0B66-\u0B6F\u0B71\u0B82\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BBE-\u0BC2\u0BC6-\u0BC8\u0BCA-\u0BCD\u0BD0\u0BD7\u0BE6-\u0BEF\u0C00-\u0C03\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D-\u0C44\u0C46-\u0C48\u0C4A-\u0C4D\u0C55\u0C56\u0C58-\u0C5A\u0C60-\u0C63\u0C66-\u0C6F\u0C80-\u0C83\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBC-\u0CC4\u0CC6-\u0CC8\u0CCA-\u0CCD\u0CD5\u0CD6\u0CDE\u0CE0-\u0CE3\u0CE6-\u0CEF\u0CF1\u0CF2\u0D01-\u0D03\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D-\u0D44\u0D46-\u0D48\u0D4A-\u0D4E\u0D54-\u0D57\u0D5F-\u0D63\u0D66-\u0D6F\u0D7A-\u0D7F\u0D82\u0D83\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0DCA\u0DCF-\u0DD4\u0DD6\u0DD8-\u0DDF\u0DE6-\u0DEF\u0DF2\u0DF3\u0E01-\u0E3A\u0E40-\u0E4E\u0E50-\u0E59\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB9\u0EBB-\u0EBD\u0EC0-\u0EC4\u0EC6\u0EC8-\u0ECD\u0ED0-\u0ED9\u0EDC-\u0EDF\u0F00\u0F18\u0F19\u0F20-\u0F29\u0F35\u0F37\u0F39\u0F3E-\u0F47\u0F49-\u0F6C\u0F71-\u0F84\u0F86-\u0F97\u0F99-\u0FBC\u0FC6\u1000-\u1049\u1050-\u109D\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u135D-\u135F\u1369-\u1371\u1380-\u138F\u13A0-\u13F5\u13F8-\u13FD\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16EE-\u16F8\u1700-\u170C\u170E-\u1714\u1720-\u1734\u1740-\u1753\u1760-\u176C\u176E-\u1770\u1772\u1773\u1780-\u17D3\u17D7\u17DC\u17DD\u17E0-\u17E9\u180B-\u180D\u1810-\u1819\u1820-\u1877\u1880-\u18AA\u18B0-\u18F5\u1900-\u191E\u1920-\u192B\u1930-\u193B\u1946-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u19D0-\u19DA\u1A00-\u1A1B\u1A20-\u1A5E\u1A60-\u1A7C\u1A7F-\u1A89\u1A90-\u1A99\u1AA7\u1AB0-\u1ABD\u1B00-\u1B4B\u1B50-\u1B59\u1B6B-\u1B73\u1B80-\u1BF3\u1C00-\u1C37\u1C40-\u1C49\u1C4D-\u1C7D\u1C80-\u1C88\u1CD0-\u1CD2\u1CD4-\u1CF6\u1CF8\u1CF9\u1D00-\u1DF5\u1DFB-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u200C\u200D\u203F\u2040\u2054\u2071\u207F\u2090-\u209C\u20D0-\u20DC\u20E1\u20E5-\u20F0\u2102\u2107\u210A-\u2113\u2115\u2118-\u211D\u2124\u2126\u2128\u212A-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2160-\u2188\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D7F-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2DE0-\u2DFF\u3005-\u3007\u3021-\u302F\u3031-\u3035\u3038-\u303C\u3041-\u3096\u3099-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312D\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FD5\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA62B\uA640-\uA66F\uA674-\uA67D\uA67F-\uA6F1\uA717-\uA71F\uA722-\uA788\uA78B-\uA7AE\uA7B0-\uA7B7\uA7F7-\uA827\uA840-\uA873\uA880-\uA8C5\uA8D0-\uA8D9\uA8E0-\uA8F7\uA8FB\uA8FD\uA900-\uA92D\uA930-\uA953\uA960-\uA97C\uA980-\uA9C0\uA9CF-\uA9D9\uA9E0-\uA9FE\uAA00-\uAA36\uAA40-\uAA4D\uAA50-\uAA59\uAA60-\uAA76\uAA7A-\uAAC2\uAADB-\uAADD\uAAE0-\uAAEF\uAAF2-\uAAF6\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB65\uAB70-\uABEA\uABEC\uABED\uABF0-\uABF9\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE00-\uFE0F\uFE20-\uFE2F\uFE33\uFE34\uFE4D-\uFE4F\uFE70-\uFE74\uFE76-\uFEFC\uFF10-\uFF19\uFF21-\uFF3A\uFF3F\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]|\uD800[\uDC00-\uDC0B\uDC0D-\uDC26\uDC28-\uDC3A\uDC3C\uDC3D\uDC3F-\uDC4D\uDC50-\uDC5D\uDC80-\uDCFA\uDD40-\uDD74\uDDFD\uDE80-\uDE9C\uDEA0-\uDED0\uDEE0\uDF00-\uDF1F\uDF30-\uDF4A\uDF50-\uDF7A\uDF80-\uDF9D\uDFA0-\uDFC3\uDFC8-\uDFCF\uDFD1-\uDFD5]|\uD801[\uDC00-\uDC9D\uDCA0-\uDCA9\uDCB0-\uDCD3\uDCD8-\uDCFB\uDD00-\uDD27\uDD30-\uDD63\uDE00-\uDF36\uDF40-\uDF55\uDF60-\uDF67]|\uD802[\uDC00-\uDC05\uDC08\uDC0A-\uDC35\uDC37\uDC38\uDC3C\uDC3F-\uDC55\uDC60-\uDC76\uDC80-\uDC9E\uDCE0-\uDCF2\uDCF4\uDCF5\uDD00-\uDD15\uDD20-\uDD39\uDD80-\uDDB7\uDDBE\uDDBF\uDE00-\uDE03\uDE05\uDE06\uDE0C-\uDE13\uDE15-\uDE17\uDE19-\uDE33\uDE38-\uDE3A\uDE3F\uDE60-\uDE7C\uDE80-\uDE9C\uDEC0-\uDEC7\uDEC9-\uDEE6\uDF00-\uDF35\uDF40-\uDF55\uDF60-\uDF72\uDF80-\uDF91]|\uD803[\uDC00-\uDC48\uDC80-\uDCB2\uDCC0-\uDCF2]|\uD804[\uDC00-\uDC46\uDC66-\uDC6F\uDC7F-\uDCBA\uDCD0-\uDCE8\uDCF0-\uDCF9\uDD00-\uDD34\uDD36-\uDD3F\uDD50-\uDD73\uDD76\uDD80-\uDDC4\uDDCA-\uDDCC\uDDD0-\uDDDA\uDDDC\uDE00-\uDE11\uDE13-\uDE37\uDE3E\uDE80-\uDE86\uDE88\uDE8A-\uDE8D\uDE8F-\uDE9D\uDE9F-\uDEA8\uDEB0-\uDEEA\uDEF0-\uDEF9\uDF00-\uDF03\uDF05-\uDF0C\uDF0F\uDF10\uDF13-\uDF28\uDF2A-\uDF30\uDF32\uDF33\uDF35-\uDF39\uDF3C-\uDF44\uDF47\uDF48\uDF4B-\uDF4D\uDF50\uDF57\uDF5D-\uDF63\uDF66-\uDF6C\uDF70-\uDF74]|\uD805[\uDC00-\uDC4A\uDC50-\uDC59\uDC80-\uDCC5\uDCC7\uDCD0-\uDCD9\uDD80-\uDDB5\uDDB8-\uDDC0\uDDD8-\uDDDD\uDE00-\uDE40\uDE44\uDE50-\uDE59\uDE80-\uDEB7\uDEC0-\uDEC9\uDF00-\uDF19\uDF1D-\uDF2B\uDF30-\uDF39]|\uD806[\uDCA0-\uDCE9\uDCFF\uDEC0-\uDEF8]|\uD807[\uDC00-\uDC08\uDC0A-\uDC36\uDC38-\uDC40\uDC50-\uDC59\uDC72-\uDC8F\uDC92-\uDCA7\uDCA9-\uDCB6]|\uD808[\uDC00-\uDF99]|\uD809[\uDC00-\uDC6E\uDC80-\uDD43]|[\uD80C\uD81C-\uD820\uD840-\uD868\uD86A-\uD86C\uD86F-\uD872][\uDC00-\uDFFF]|\uD80D[\uDC00-\uDC2E]|\uD811[\uDC00-\uDE46]|\uD81A[\uDC00-\uDE38\uDE40-\uDE5E\uDE60-\uDE69\uDED0-\uDEED\uDEF0-\uDEF4\uDF00-\uDF36\uDF40-\uDF43\uDF50-\uDF59\uDF63-\uDF77\uDF7D-\uDF8F]|\uD81B[\uDF00-\uDF44\uDF50-\uDF7E\uDF8F-\uDF9F\uDFE0]|\uD821[\uDC00-\uDFEC]|\uD822[\uDC00-\uDEF2]|\uD82C[\uDC00\uDC01]|\uD82F[\uDC00-\uDC6A\uDC70-\uDC7C\uDC80-\uDC88\uDC90-\uDC99\uDC9D\uDC9E]|\uD834[\uDD65-\uDD69\uDD6D-\uDD72\uDD7B-\uDD82\uDD85-\uDD8B\uDDAA-\uDDAD\uDE42-\uDE44]|\uD835[\uDC00-\uDC54\uDC56-\uDC9C\uDC9E\uDC9F\uDCA2\uDCA5\uDCA6\uDCA9-\uDCAC\uDCAE-\uDCB9\uDCBB\uDCBD-\uDCC3\uDCC5-\uDD05\uDD07-\uDD0A\uDD0D-\uDD14\uDD16-\uDD1C\uDD1E-\uDD39\uDD3B-\uDD3E\uDD40-\uDD44\uDD46\uDD4A-\uDD50\uDD52-\uDEA5\uDEA8-\uDEC0\uDEC2-\uDEDA\uDEDC-\uDEFA\uDEFC-\uDF14\uDF16-\uDF34\uDF36-\uDF4E\uDF50-\uDF6E\uDF70-\uDF88\uDF8A-\uDFA8\uDFAA-\uDFC2\uDFC4-\uDFCB\uDFCE-\uDFFF]|\uD836[\uDE00-\uDE36\uDE3B-\uDE6C\uDE75\uDE84\uDE9B-\uDE9F\uDEA1-\uDEAF]|\uD838[\uDC00-\uDC06\uDC08-\uDC18\uDC1B-\uDC21\uDC23\uDC24\uDC26-\uDC2A]|\uD83A[\uDC00-\uDCC4\uDCD0-\uDCD6\uDD00-\uDD4A\uDD50-\uDD59]|\uD83B[\uDE00-\uDE03\uDE05-\uDE1F\uDE21\uDE22\uDE24\uDE27\uDE29-\uDE32\uDE34-\uDE37\uDE39\uDE3B\uDE42\uDE47\uDE49\uDE4B\uDE4D-\uDE4F\uDE51\uDE52\uDE54\uDE57\uDE59\uDE5B\uDE5D\uDE5F\uDE61\uDE62\uDE64\uDE67-\uDE6A\uDE6C-\uDE72\uDE74-\uDE77\uDE79-\uDE7C\uDE7E\uDE80-\uDE89\uDE8B-\uDE9B\uDEA1-\uDEA3\uDEA5-\uDEA9\uDEAB-\uDEBB]|\uD869[\uDC00-\uDED6\uDF00-\uDFFF]|\uD86D[\uDC00-\uDF34\uDF40-\uDFFF]|\uD86E[\uDC00-\uDC1D\uDC20-\uDFFF]|\uD873[\uDC00-\uDEA1]|\uD87E[\uDC00-\uDE1D]|\uDB40[\uDD00-\uDDEF]/
    };

    function isDecimalDigit(ch) {
        return 0x30 <= ch && ch <= 0x39;  // 0..9
    }

    function isHexDigit(ch) {
        return 0x30 <= ch && ch <= 0x39 ||  // 0..9
            0x61 <= ch && ch <= 0x66 ||     // a..f
            0x41 <= ch && ch <= 0x46;       // A..F
    }

    function isOctalDigit(ch) {
        return ch >= 0x30 && ch <= 0x37;  // 0..7
    }

    // 7.2 White Space

    NON_ASCII_WHITESPACES = [
        0x1680,
        0x2000, 0x2001, 0x2002, 0x2003, 0x2004, 0x2005, 0x2006, 0x2007, 0x2008, 0x2009, 0x200A,
        0x202F, 0x205F,
        0x3000,
        0xFEFF
    ];

    function isWhiteSpace(ch) {
        return ch === 0x20 || ch === 0x09 || ch === 0x0B || ch === 0x0C || ch === 0xA0 ||
            ch >= 0x1680 && NON_ASCII_WHITESPACES.indexOf(ch) >= 0;
    }

    // 7.3 Line Terminators

    function isLineTerminator(ch) {
        return ch === 0x0A || ch === 0x0D || ch === 0x2028 || ch === 0x2029;
    }

    // 7.6 Identifier Names and Identifiers

    function fromCodePoint(cp) {
        if (cp <= 0xFFFF) { return String.fromCharCode(cp); }
        var cu1 = String.fromCharCode(Math.floor((cp - 0x10000) / 0x400) + 0xD800);
        var cu2 = String.fromCharCode(((cp - 0x10000) % 0x400) + 0xDC00);
        return cu1 + cu2;
    }

    IDENTIFIER_START = new Array(0x80);
    for(ch = 0; ch < 0x80; ++ch) {
        IDENTIFIER_START[ch] =
            ch >= 0x61 && ch <= 0x7A ||  // a..z
            ch >= 0x41 && ch <= 0x5A ||  // A..Z
            ch === 0x24 || ch === 0x5F;  // $ (dollar) and _ (underscore)
    }

    IDENTIFIER_PART = new Array(0x80);
    for(ch = 0; ch < 0x80; ++ch) {
        IDENTIFIER_PART[ch] =
            ch >= 0x61 && ch <= 0x7A ||  // a..z
            ch >= 0x41 && ch <= 0x5A ||  // A..Z
            ch >= 0x30 && ch <= 0x39 ||  // 0..9
            ch === 0x24 || ch === 0x5F;  // $ (dollar) and _ (underscore)
    }

    function isIdentifierStartES5(ch) {
        return ch < 0x80 ? IDENTIFIER_START[ch] : ES5Regex.NonAsciiIdentifierStart.test(fromCodePoint(ch));
    }

    function isIdentifierPartES5(ch) {
        return ch < 0x80 ? IDENTIFIER_PART[ch] : ES5Regex.NonAsciiIdentifierPart.test(fromCodePoint(ch));
    }

    function isIdentifierStartES6(ch) {
        return ch < 0x80 ? IDENTIFIER_START[ch] : ES6Regex.NonAsciiIdentifierStart.test(fromCodePoint(ch));
    }

    function isIdentifierPartES6(ch) {
        return ch < 0x80 ? IDENTIFIER_PART[ch] : ES6Regex.NonAsciiIdentifierPart.test(fromCodePoint(ch));
    }

    module.exports = {
        isDecimalDigit: isDecimalDigit,
        isHexDigit: isHexDigit,
        isOctalDigit: isOctalDigit,
        isWhiteSpace: isWhiteSpace,
        isLineTerminator: isLineTerminator,
        isIdentifierStartES5: isIdentifierStartES5,
        isIdentifierPartES5: isIdentifierPartES5,
        isIdentifierStartES6: isIdentifierStartES6,
        isIdentifierPartES6: isIdentifierPartES6
    };
}());
/* vim: set sw=4 ts=4 et tw=80 : */


/***/ }),

/***/ 7635:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/*
  Copyright (C) 2013 Yusuke Suzuki <utatane.tea@gmail.com>

  Redistribution and use in source and binary forms, with or without
  modification, are permitted provided that the following conditions are met:

    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.

  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
  AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
  IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
  ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
  DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
  (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
  LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
  ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
  THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

(function () {
    'use strict';

    var code = __webpack_require__(5501);

    function isStrictModeReservedWordES6(id) {
        switch (id) {
        case 'implements':
        case 'interface':
        case 'package':
        case 'private':
        case 'protected':
        case 'public':
        case 'static':
        case 'let':
            return true;
        default:
            return false;
        }
    }

    function isKeywordES5(id, strict) {
        // yield should not be treated as keyword under non-strict mode.
        if (!strict && id === 'yield') {
            return false;
        }
        return isKeywordES6(id, strict);
    }

    function isKeywordES6(id, strict) {
        if (strict && isStrictModeReservedWordES6(id)) {
            return true;
        }

        switch (id.length) {
        case 2:
            return (id === 'if') || (id === 'in') || (id === 'do');
        case 3:
            return (id === 'var') || (id === 'for') || (id === 'new') || (id === 'try');
        case 4:
            return (id === 'this') || (id === 'else') || (id === 'case') ||
                (id === 'void') || (id === 'with') || (id === 'enum');
        case 5:
            return (id === 'while') || (id === 'break') || (id === 'catch') ||
                (id === 'throw') || (id === 'const') || (id === 'yield') ||
                (id === 'class') || (id === 'super');
        case 6:
            return (id === 'return') || (id === 'typeof') || (id === 'delete') ||
                (id === 'switch') || (id === 'export') || (id === 'import');
        case 7:
            return (id === 'default') || (id === 'finally') || (id === 'extends');
        case 8:
            return (id === 'function') || (id === 'continue') || (id === 'debugger');
        case 10:
            return (id === 'instanceof');
        default:
            return false;
        }
    }

    function isReservedWordES5(id, strict) {
        return id === 'null' || id === 'true' || id === 'false' || isKeywordES5(id, strict);
    }

    function isReservedWordES6(id, strict) {
        return id === 'null' || id === 'true' || id === 'false' || isKeywordES6(id, strict);
    }

    function isRestrictedWord(id) {
        return id === 'eval' || id === 'arguments';
    }

    function isIdentifierNameES5(id) {
        var i, iz, ch;

        if (id.length === 0) { return false; }

        ch = id.charCodeAt(0);
        if (!code.isIdentifierStartES5(ch)) {
            return false;
        }

        for (i = 1, iz = id.length; i < iz; ++i) {
            ch = id.charCodeAt(i);
            if (!code.isIdentifierPartES5(ch)) {
                return false;
            }
        }
        return true;
    }

    function decodeUtf16(lead, trail) {
        return (lead - 0xD800) * 0x400 + (trail - 0xDC00) + 0x10000;
    }

    function isIdentifierNameES6(id) {
        var i, iz, ch, lowCh, check;

        if (id.length === 0) { return false; }

        check = code.isIdentifierStartES6;
        for (i = 0, iz = id.length; i < iz; ++i) {
            ch = id.charCodeAt(i);
            if (0xD800 <= ch && ch <= 0xDBFF) {
                ++i;
                if (i >= iz) { return false; }
                lowCh = id.charCodeAt(i);
                if (!(0xDC00 <= lowCh && lowCh <= 0xDFFF)) {
                    return false;
                }
                ch = decodeUtf16(ch, lowCh);
            }
            if (!check(ch)) {
                return false;
            }
            check = code.isIdentifierPartES6;
        }
        return true;
    }

    function isIdentifierES5(id, strict) {
        return isIdentifierNameES5(id) && !isReservedWordES5(id, strict);
    }

    function isIdentifierES6(id, strict) {
        return isIdentifierNameES6(id) && !isReservedWordES6(id, strict);
    }

    module.exports = {
        isKeywordES5: isKeywordES5,
        isKeywordES6: isKeywordES6,
        isReservedWordES5: isReservedWordES5,
        isReservedWordES6: isReservedWordES6,
        isRestrictedWord: isRestrictedWord,
        isIdentifierNameES5: isIdentifierNameES5,
        isIdentifierNameES6: isIdentifierNameES6,
        isIdentifierES5: isIdentifierES5,
        isIdentifierES6: isIdentifierES6
    };
}());
/* vim: set sw=4 ts=4 et tw=80 : */


/***/ }),

/***/ 4038:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

/*
  Copyright (C) 2013 Yusuke Suzuki <utatane.tea@gmail.com>

  Redistribution and use in source and binary forms, with or without
  modification, are permitted provided that the following conditions are met:

    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.

  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
  AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
  IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
  ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
  DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
  (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
  LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
  ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
  THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/


(function () {
    'use strict';

    exports.ast = __webpack_require__(471);
    exports.code = __webpack_require__(5501);
    exports.keyword = __webpack_require__(7635);
}());
/* vim: set sw=4 ts=4 et tw=80 : */


/***/ }),

/***/ 8206:
/***/ ((module) => {

"use strict";


// do not edit .js files directly - edit src/index.jst



module.exports = function equal(a, b) {
  if (a === b) return true;

  if (a && b && typeof a == 'object' && typeof b == 'object') {
    if (a.constructor !== b.constructor) return false;

    var length, i, keys;
    if (Array.isArray(a)) {
      length = a.length;
      if (length != b.length) return false;
      for (i = length; i-- !== 0;)
        if (!equal(a[i], b[i])) return false;
      return true;
    }



    if (a.constructor === RegExp) return a.source === b.source && a.flags === b.flags;
    if (a.valueOf !== Object.prototype.valueOf) return a.valueOf() === b.valueOf();
    if (a.toString !== Object.prototype.toString) return a.toString() === b.toString();

    keys = Object.keys(a);
    length = keys.length;
    if (length !== Object.keys(b).length) return false;

    for (i = length; i-- !== 0;)
      if (!Object.prototype.hasOwnProperty.call(b, keys[i])) return false;

    for (i = length; i-- !== 0;) {
      var key = keys[i];

      if (!equal(a[key], b[key])) return false;
    }

    return true;
  }

  // true if both NaN, false otherwise
  return a!==a && b!==b;
};


/***/ }),

/***/ 969:
/***/ ((module) => {

"use strict";


module.exports = function (data, opts) {
    if (!opts) opts = {};
    if (typeof opts === 'function') opts = { cmp: opts };
    var cycles = (typeof opts.cycles === 'boolean') ? opts.cycles : false;

    var cmp = opts.cmp && (function (f) {
        return function (node) {
            return function (a, b) {
                var aobj = { key: a, value: node[a] };
                var bobj = { key: b, value: node[b] };
                return f(aobj, bobj);
            };
        };
    })(opts.cmp);

    var seen = [];
    return (function stringify (node) {
        if (node && node.toJSON && typeof node.toJSON === 'function') {
            node = node.toJSON();
        }

        if (node === undefined) return;
        if (typeof node == 'number') return isFinite(node) ? '' + node : 'null';
        if (typeof node !== 'object') return JSON.stringify(node);

        var i, out;
        if (Array.isArray(node)) {
            out = '[';
            for (i = 0; i < node.length; i++) {
                if (i) out += ',';
                out += stringify(node[i]) || 'null';
            }
            return out + ']';
        }

        if (node === null) return 'null';

        if (seen.indexOf(node) !== -1) {
            if (cycles) return JSON.stringify('__cycle__');
            throw new TypeError('Converting circular structure to JSON');
        }

        var seenIndex = seen.push(node) - 1;
        var keys = Object.keys(node).sort(cmp && cmp(node));
        out = '';
        for (i = 0; i < keys.length; i++) {
            var key = keys[i];
            var value = stringify(node[key]);

            if (!value) continue;
            if (out) out += ',';
            out += JSON.stringify(key) + ':' + value;
        }
        seen.splice(seenIndex, 1);
        return '{' + out + '}';
    })(data);
};


/***/ }),

/***/ 1133:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var debug;
try {
  /* eslint global-require: off */
  debug = __webpack_require__(8237)("follow-redirects");
}
catch (error) {
  debug = function () { /* */ };
}
module.exports = debug;


/***/ }),

/***/ 7707:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var url = __webpack_require__(8835);
var URL = url.URL;
var http = __webpack_require__(8605);
var https = __webpack_require__(7211);
var Writable = __webpack_require__(2413).Writable;
var assert = __webpack_require__(2357);
var debug = __webpack_require__(1133);

// Create handlers that pass events from native requests
var eventHandlers = Object.create(null);
["abort", "aborted", "connect", "error", "socket", "timeout"].forEach(function (event) {
  eventHandlers[event] = function (arg1, arg2, arg3) {
    this._redirectable.emit(event, arg1, arg2, arg3);
  };
});

// Error types with codes
var RedirectionError = createErrorType(
  "ERR_FR_REDIRECTION_FAILURE",
  ""
);
var TooManyRedirectsError = createErrorType(
  "ERR_FR_TOO_MANY_REDIRECTS",
  "Maximum number of redirects exceeded"
);
var MaxBodyLengthExceededError = createErrorType(
  "ERR_FR_MAX_BODY_LENGTH_EXCEEDED",
  "Request body larger than maxBodyLength limit"
);
var WriteAfterEndError = createErrorType(
  "ERR_STREAM_WRITE_AFTER_END",
  "write after end"
);

// An HTTP(S) request that can be redirected
function RedirectableRequest(options, responseCallback) {
  // Initialize the request
  Writable.call(this);
  this._sanitizeOptions(options);
  this._options = options;
  this._ended = false;
  this._ending = false;
  this._redirectCount = 0;
  this._redirects = [];
  this._requestBodyLength = 0;
  this._requestBodyBuffers = [];

  // Attach a callback if passed
  if (responseCallback) {
    this.on("response", responseCallback);
  }

  // React to responses of native requests
  var self = this;
  this._onNativeResponse = function (response) {
    self._processResponse(response);
  };

  // Perform the first request
  this._performRequest();
}
RedirectableRequest.prototype = Object.create(Writable.prototype);

// Writes buffered data to the current native request
RedirectableRequest.prototype.write = function (data, encoding, callback) {
  // Writing is not allowed if end has been called
  if (this._ending) {
    throw new WriteAfterEndError();
  }

  // Validate input and shift parameters if necessary
  if (!(typeof data === "string" || typeof data === "object" && ("length" in data))) {
    throw new TypeError("data should be a string, Buffer or Uint8Array");
  }
  if (typeof encoding === "function") {
    callback = encoding;
    encoding = null;
  }

  // Ignore empty buffers, since writing them doesn't invoke the callback
  // https://github.com/nodejs/node/issues/22066
  if (data.length === 0) {
    if (callback) {
      callback();
    }
    return;
  }
  // Only write when we don't exceed the maximum body length
  if (this._requestBodyLength + data.length <= this._options.maxBodyLength) {
    this._requestBodyLength += data.length;
    this._requestBodyBuffers.push({ data: data, encoding: encoding });
    this._currentRequest.write(data, encoding, callback);
  }
  // Error when we exceed the maximum body length
  else {
    this.emit("error", new MaxBodyLengthExceededError());
    this.abort();
  }
};

// Ends the current native request
RedirectableRequest.prototype.end = function (data, encoding, callback) {
  // Shift parameters if necessary
  if (typeof data === "function") {
    callback = data;
    data = encoding = null;
  }
  else if (typeof encoding === "function") {
    callback = encoding;
    encoding = null;
  }

  // Write data if needed and end
  if (!data) {
    this._ended = this._ending = true;
    this._currentRequest.end(null, null, callback);
  }
  else {
    var self = this;
    var currentRequest = this._currentRequest;
    this.write(data, encoding, function () {
      self._ended = true;
      currentRequest.end(null, null, callback);
    });
    this._ending = true;
  }
};

// Sets a header value on the current native request
RedirectableRequest.prototype.setHeader = function (name, value) {
  this._options.headers[name] = value;
  this._currentRequest.setHeader(name, value);
};

// Clears a header value on the current native request
RedirectableRequest.prototype.removeHeader = function (name) {
  delete this._options.headers[name];
  this._currentRequest.removeHeader(name);
};

// Global timeout for all underlying requests
RedirectableRequest.prototype.setTimeout = function (msecs, callback) {
  if (callback) {
    this.once("timeout", callback);
  }

  if (this.socket) {
    startTimer(this, msecs);
  }
  else {
    var self = this;
    this._currentRequest.once("socket", function () {
      startTimer(self, msecs);
    });
  }

  this.once("response", clearTimer);
  this.once("error", clearTimer);

  return this;
};

function startTimer(request, msecs) {
  clearTimeout(request._timeout);
  request._timeout = setTimeout(function () {
    request.emit("timeout");
  }, msecs);
}

function clearTimer() {
  clearTimeout(this._timeout);
}

// Proxy all other public ClientRequest methods
[
  "abort", "flushHeaders", "getHeader",
  "setNoDelay", "setSocketKeepAlive",
].forEach(function (method) {
  RedirectableRequest.prototype[method] = function (a, b) {
    return this._currentRequest[method](a, b);
  };
});

// Proxy all public ClientRequest properties
["aborted", "connection", "socket"].forEach(function (property) {
  Object.defineProperty(RedirectableRequest.prototype, property, {
    get: function () { return this._currentRequest[property]; },
  });
});

RedirectableRequest.prototype._sanitizeOptions = function (options) {
  // Ensure headers are always present
  if (!options.headers) {
    options.headers = {};
  }

  // Since http.request treats host as an alias of hostname,
  // but the url module interprets host as hostname plus port,
  // eliminate the host property to avoid confusion.
  if (options.host) {
    // Use hostname if set, because it has precedence
    if (!options.hostname) {
      options.hostname = options.host;
    }
    delete options.host;
  }

  // Complete the URL object when necessary
  if (!options.pathname && options.path) {
    var searchPos = options.path.indexOf("?");
    if (searchPos < 0) {
      options.pathname = options.path;
    }
    else {
      options.pathname = options.path.substring(0, searchPos);
      options.search = options.path.substring(searchPos);
    }
  }
};


// Executes the next native request (initial or redirect)
RedirectableRequest.prototype._performRequest = function () {
  // Load the native protocol
  var protocol = this._options.protocol;
  var nativeProtocol = this._options.nativeProtocols[protocol];
  if (!nativeProtocol) {
    this.emit("error", new TypeError("Unsupported protocol " + protocol));
    return;
  }

  // If specified, use the agent corresponding to the protocol
  // (HTTP and HTTPS use different types of agents)
  if (this._options.agents) {
    var scheme = protocol.substr(0, protocol.length - 1);
    this._options.agent = this._options.agents[scheme];
  }

  // Create the native request
  var request = this._currentRequest =
        nativeProtocol.request(this._options, this._onNativeResponse);
  this._currentUrl = url.format(this._options);

  // Set up event handlers
  request._redirectable = this;
  for (var event in eventHandlers) {
    /* istanbul ignore else */
    if (event) {
      request.on(event, eventHandlers[event]);
    }
  }

  // End a redirected request
  // (The first request must be ended explicitly with RedirectableRequest#end)
  if (this._isRedirect) {
    // Write the request entity and end.
    var i = 0;
    var self = this;
    var buffers = this._requestBodyBuffers;
    (function writeNext(error) {
      // Only write if this request has not been redirected yet
      /* istanbul ignore else */
      if (request === self._currentRequest) {
        // Report any write errors
        /* istanbul ignore if */
        if (error) {
          self.emit("error", error);
        }
        // Write the next buffer if there are still left
        else if (i < buffers.length) {
          var buffer = buffers[i++];
          /* istanbul ignore else */
          if (!request.finished) {
            request.write(buffer.data, buffer.encoding, writeNext);
          }
        }
        // End the request if `end` has been called on us
        else if (self._ended) {
          request.end();
        }
      }
    }());
  }
};

// Processes a response from the current native request
RedirectableRequest.prototype._processResponse = function (response) {
  // Store the redirected response
  var statusCode = response.statusCode;
  if (this._options.trackRedirects) {
    this._redirects.push({
      url: this._currentUrl,
      headers: response.headers,
      statusCode: statusCode,
    });
  }

  // RFC7231§6.4: The 3xx (Redirection) class of status code indicates
  // that further action needs to be taken by the user agent in order to
  // fulfill the request. If a Location header field is provided,
  // the user agent MAY automatically redirect its request to the URI
  // referenced by the Location field value,
  // even if the specific status code is not understood.
  var location = response.headers.location;
  if (location && this._options.followRedirects !== false &&
      statusCode >= 300 && statusCode < 400) {
    // Abort the current request
    this._currentRequest.removeAllListeners();
    this._currentRequest.on("error", noop);
    this._currentRequest.abort();
    // Discard the remainder of the response to avoid waiting for data
    response.destroy();

    // RFC7231§6.4: A client SHOULD detect and intervene
    // in cyclical redirections (i.e., "infinite" redirection loops).
    if (++this._redirectCount > this._options.maxRedirects) {
      this.emit("error", new TooManyRedirectsError());
      return;
    }

    // RFC7231§6.4: Automatic redirection needs to done with
    // care for methods not known to be safe, […]
    // RFC7231§6.4.2–3: For historical reasons, a user agent MAY change
    // the request method from POST to GET for the subsequent request.
    if ((statusCode === 301 || statusCode === 302) && this._options.method === "POST" ||
        // RFC7231§6.4.4: The 303 (See Other) status code indicates that
        // the server is redirecting the user agent to a different resource […]
        // A user agent can perform a retrieval request targeting that URI
        // (a GET or HEAD request if using HTTP) […]
        (statusCode === 303) && !/^(?:GET|HEAD)$/.test(this._options.method)) {
      this._options.method = "GET";
      // Drop a possible entity and headers related to it
      this._requestBodyBuffers = [];
      removeMatchingHeaders(/^content-/i, this._options.headers);
    }

    // Drop the Host header, as the redirect might lead to a different host
    var previousHostName = removeMatchingHeaders(/^host$/i, this._options.headers) ||
      url.parse(this._currentUrl).hostname;

    // Create the redirected request
    var redirectUrl = url.resolve(this._currentUrl, location);
    debug("redirecting to", redirectUrl);
    this._isRedirect = true;
    var redirectUrlParts = url.parse(redirectUrl);
    Object.assign(this._options, redirectUrlParts);

    // Drop the Authorization header if redirecting to another host
    if (redirectUrlParts.hostname !== previousHostName) {
      removeMatchingHeaders(/^authorization$/i, this._options.headers);
    }

    // Evaluate the beforeRedirect callback
    if (typeof this._options.beforeRedirect === "function") {
      var responseDetails = { headers: response.headers };
      try {
        this._options.beforeRedirect.call(null, this._options, responseDetails);
      }
      catch (err) {
        this.emit("error", err);
        return;
      }
      this._sanitizeOptions(this._options);
    }

    // Perform the redirected request
    try {
      this._performRequest();
    }
    catch (cause) {
      var error = new RedirectionError("Redirected request failed: " + cause.message);
      error.cause = cause;
      this.emit("error", error);
    }
  }
  else {
    // The response is not a redirect; return it as-is
    response.responseUrl = this._currentUrl;
    response.redirects = this._redirects;
    this.emit("response", response);

    // Clean up
    this._requestBodyBuffers = [];
  }
};

// Wraps the key/value object of protocols with redirect functionality
function wrap(protocols) {
  // Default settings
  var exports = {
    maxRedirects: 21,
    maxBodyLength: 10 * 1024 * 1024,
  };

  // Wrap each protocol
  var nativeProtocols = {};
  Object.keys(protocols).forEach(function (scheme) {
    var protocol = scheme + ":";
    var nativeProtocol = nativeProtocols[protocol] = protocols[scheme];
    var wrappedProtocol = exports[scheme] = Object.create(nativeProtocol);

    // Executes a request, following redirects
    function request(input, options, callback) {
      // Parse parameters
      if (typeof input === "string") {
        var urlStr = input;
        try {
          input = urlToOptions(new URL(urlStr));
        }
        catch (err) {
          /* istanbul ignore next */
          input = url.parse(urlStr);
        }
      }
      else if (URL && (input instanceof URL)) {
        input = urlToOptions(input);
      }
      else {
        callback = options;
        options = input;
        input = { protocol: protocol };
      }
      if (typeof options === "function") {
        callback = options;
        options = null;
      }

      // Set defaults
      options = Object.assign({
        maxRedirects: exports.maxRedirects,
        maxBodyLength: exports.maxBodyLength,
      }, input, options);
      options.nativeProtocols = nativeProtocols;

      assert.equal(options.protocol, protocol, "protocol mismatch");
      debug("options", options);
      return new RedirectableRequest(options, callback);
    }

    // Executes a GET request, following redirects
    function get(input, options, callback) {
      var wrappedRequest = wrappedProtocol.request(input, options, callback);
      wrappedRequest.end();
      return wrappedRequest;
    }

    // Expose the properties on the wrapped protocol
    Object.defineProperties(wrappedProtocol, {
      request: { value: request, configurable: true, enumerable: true, writable: true },
      get: { value: get, configurable: true, enumerable: true, writable: true },
    });
  });
  return exports;
}

/* istanbul ignore next */
function noop() { /* empty */ }

// from https://github.com/nodejs/node/blob/master/lib/internal/url.js
function urlToOptions(urlObject) {
  var options = {
    protocol: urlObject.protocol,
    hostname: urlObject.hostname.startsWith("[") ?
      /* istanbul ignore next */
      urlObject.hostname.slice(1, -1) :
      urlObject.hostname,
    hash: urlObject.hash,
    search: urlObject.search,
    pathname: urlObject.pathname,
    path: urlObject.pathname + urlObject.search,
    href: urlObject.href,
  };
  if (urlObject.port !== "") {
    options.port = Number(urlObject.port);
  }
  return options;
}

function removeMatchingHeaders(regex, headers) {
  var lastValue;
  for (var header in headers) {
    if (regex.test(header)) {
      lastValue = headers[header];
      delete headers[header];
    }
  }
  return lastValue;
}

function createErrorType(code, defaultMessage) {
  function CustomError(message) {
    Error.captureStackTrace(this, this.constructor);
    this.message = message || defaultMessage;
  }
  CustomError.prototype = new Error();
  CustomError.prototype.constructor = CustomError;
  CustomError.prototype.name = "Error [" + code + "]";
  CustomError.prototype.code = code;
  return CustomError;
}

// Exports
module.exports = wrap({ http: http, https: https });
module.exports.wrap = wrap;


/***/ }),

/***/ 1621:
/***/ ((module) => {

"use strict";

module.exports = (flag, argv) => {
	argv = argv || process.argv;
	const prefix = flag.startsWith('-') ? '' : (flag.length === 1 ? '-' : '--');
	const pos = argv.indexOf(prefix + flag);
	const terminatorPos = argv.indexOf('--');
	return pos !== -1 && (terminatorPos === -1 ? true : pos < terminatorPos);
};


/***/ }),

/***/ 1531:
/***/ ((__unused_webpack_module, exports) => {

// Copyright 2014, 2015, 2016, 2017, 2018 Simon Lydell
// License: MIT. (See LICENSE.)

Object.defineProperty(exports, "__esModule", ({
  value: true
}))

// This regex comes from regex.coffee, and is inserted here by generate-index.js
// (run `npm run build`).
exports.default = /((['"])(?:(?!\2|\\).|\\(?:\r\n|[\s\S]))*(\2)?|`(?:[^`\\$]|\\[\s\S]|\$(?!\{)|\$\{(?:[^{}]|\{[^}]*\}?)*\}?)*(`)?)|(\/\/.*)|(\/\*(?:[^*]|\*(?!\/))*(\*\/)?)|(\/(?!\*)(?:\[(?:(?![\]\\]).|\\.)*\]|(?![\/\]\\]).|\\.)+\/(?:(?!\s*(?:\b|[\u0080-\uFFFF$\\'"~({]|[+\-!](?!=)|\.?\d))|[gmiyus]{1,6}\b(?![\u0080-\uFFFF$\\]|\s*(?:[+\-*%&|^<>!=?({]|\/(?![\/*])))))|(0[xX][\da-fA-F]+|0[oO][0-7]+|0[bB][01]+|(?:\d*\.\d+|\d+\.?)(?:[eE][+-]?\d+)?)|((?!\d)(?:(?!\s)[$\w\u0080-\uFFFF]|\\u[\da-fA-F]{4}|\\u\{[\da-fA-F]+\})+)|(--|\+\+|&&|\|\||=>|\.{3}|(?:[+\-\/%&|^]|\*{1,2}|<{1,2}|>{1,3}|!=?|={1,2})=?|[?~.,:;[\](){}])|(\s+)|(^$|[\s\S])/g

exports.matchToToken = function(match) {
  var token = {type: "invalid", value: match[0], closed: undefined}
       if (match[ 1]) token.type = "string" , token.closed = !!(match[3] || match[4])
  else if (match[ 5]) token.type = "comment"
  else if (match[ 6]) token.type = "comment", token.closed = !!match[7]
  else if (match[ 8]) token.type = "regex"
  else if (match[ 9]) token.type = "number"
  else if (match[10]) token.type = "name"
  else if (match[11]) token.type = "punctuator"
  else if (match[12]) token.type = "whitespace"
  return token
}


/***/ }),

/***/ 2533:
/***/ ((module) => {

"use strict";


var traverse = module.exports = function (schema, opts, cb) {
  // Legacy support for v0.3.1 and earlier.
  if (typeof opts == 'function') {
    cb = opts;
    opts = {};
  }

  cb = opts.cb || cb;
  var pre = (typeof cb == 'function') ? cb : cb.pre || function() {};
  var post = cb.post || function() {};

  _traverse(opts, pre, post, schema, '', schema);
};


traverse.keywords = {
  additionalItems: true,
  items: true,
  contains: true,
  additionalProperties: true,
  propertyNames: true,
  not: true
};

traverse.arrayKeywords = {
  items: true,
  allOf: true,
  anyOf: true,
  oneOf: true
};

traverse.propsKeywords = {
  definitions: true,
  properties: true,
  patternProperties: true,
  dependencies: true
};

traverse.skipKeywords = {
  default: true,
  enum: true,
  const: true,
  required: true,
  maximum: true,
  minimum: true,
  exclusiveMaximum: true,
  exclusiveMinimum: true,
  multipleOf: true,
  maxLength: true,
  minLength: true,
  pattern: true,
  format: true,
  maxItems: true,
  minItems: true,
  uniqueItems: true,
  maxProperties: true,
  minProperties: true
};


function _traverse(opts, pre, post, schema, jsonPtr, rootSchema, parentJsonPtr, parentKeyword, parentSchema, keyIndex) {
  if (schema && typeof schema == 'object' && !Array.isArray(schema)) {
    pre(schema, jsonPtr, rootSchema, parentJsonPtr, parentKeyword, parentSchema, keyIndex);
    for (var key in schema) {
      var sch = schema[key];
      if (Array.isArray(sch)) {
        if (key in traverse.arrayKeywords) {
          for (var i=0; i<sch.length; i++)
            _traverse(opts, pre, post, sch[i], jsonPtr + '/' + key + '/' + i, rootSchema, jsonPtr, key, schema, i);
        }
      } else if (key in traverse.propsKeywords) {
        if (sch && typeof sch == 'object') {
          for (var prop in sch)
            _traverse(opts, pre, post, sch[prop], jsonPtr + '/' + key + '/' + escapeJsonPtr(prop), rootSchema, jsonPtr, key, schema, prop);
        }
      } else if (key in traverse.keywords || (opts.allKeys && !(key in traverse.skipKeywords))) {
        _traverse(opts, pre, post, sch, jsonPtr + '/' + key, rootSchema, jsonPtr, key, schema);
      }
    }
    post(schema, jsonPtr, rootSchema, parentJsonPtr, parentKeyword, parentSchema, keyIndex);
  }
}


function escapeJsonPtr(str) {
  return str.replace(/~/g, '~0').replace(/\//g, '~1');
}


/***/ }),

/***/ 6675:
/***/ (function(module) {

(function (global, factory) {
	 true ? module.exports = factory() :
	0;
}(this, (function () { 'use strict';

var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};





function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var graphemeSplitter = createCommonjsModule(function (module) {
	/*
 Breaks a Javascript string into individual user-perceived "characters" 
 called extended grapheme clusters by implementing the Unicode UAX-29 standard, version 10.0.0
 
 Usage:
 var splitter = new GraphemeSplitter();
 //returns an array of strings, one string for each grapheme cluster
 var graphemes = splitter.splitGraphemes(string); 
 
 */
	function GraphemeSplitter() {
		var CR = 0,
		    LF = 1,
		    Control = 2,
		    Extend = 3,
		    Regional_Indicator = 4,
		    SpacingMark = 5,
		    L = 6,
		    V = 7,
		    T = 8,
		    LV = 9,
		    LVT = 10,
		    Other = 11,
		    Prepend = 12,
		    E_Base = 13,
		    E_Modifier = 14,
		    ZWJ = 15,
		    Glue_After_Zwj = 16,
		    E_Base_GAZ = 17;

		// BreakTypes
		var NotBreak = 0,
		    BreakStart = 1,
		    Break = 2,
		    BreakLastRegional = 3,
		    BreakPenultimateRegional = 4;

		function isSurrogate(str, pos) {
			return 0xd800 <= str.charCodeAt(pos) && str.charCodeAt(pos) <= 0xdbff && 0xdc00 <= str.charCodeAt(pos + 1) && str.charCodeAt(pos + 1) <= 0xdfff;
		}

		// Private function, gets a Unicode code point from a JavaScript UTF-16 string
		// handling surrogate pairs appropriately
		function codePointAt(str, idx) {
			if (idx === undefined) {
				idx = 0;
			}
			var code = str.charCodeAt(idx);

			// if a high surrogate
			if (0xD800 <= code && code <= 0xDBFF && idx < str.length - 1) {
				var hi = code;
				var low = str.charCodeAt(idx + 1);
				if (0xDC00 <= low && low <= 0xDFFF) {
					return (hi - 0xD800) * 0x400 + (low - 0xDC00) + 0x10000;
				}
				return hi;
			}

			// if a low surrogate
			if (0xDC00 <= code && code <= 0xDFFF && idx >= 1) {
				var hi = str.charCodeAt(idx - 1);
				var low = code;
				if (0xD800 <= hi && hi <= 0xDBFF) {
					return (hi - 0xD800) * 0x400 + (low - 0xDC00) + 0x10000;
				}
				return low;
			}

			//just return the char if an unmatched surrogate half or a 
			//single-char codepoint
			return code;
		}

		// Private function, returns whether a break is allowed between the 
		// two given grapheme breaking classes
		function shouldBreak(start, mid, end) {
			var all = [start].concat(mid).concat([end]);
			var previous = all[all.length - 2];
			var next = end;

			// Lookahead termintor for:
			// GB10. (E_Base | EBG) Extend* ?	E_Modifier
			var eModifierIndex = all.lastIndexOf(E_Modifier);
			if (eModifierIndex > 1 && all.slice(1, eModifierIndex).every(function (c) {
				return c == Extend;
			}) && [Extend, E_Base, E_Base_GAZ].indexOf(start) == -1) {
				return Break;
			}

			// Lookahead termintor for:
			// GB12. ^ (RI RI)* RI	?	RI
			// GB13. [^RI] (RI RI)* RI	?	RI
			var rIIndex = all.lastIndexOf(Regional_Indicator);
			if (rIIndex > 0 && all.slice(1, rIIndex).every(function (c) {
				return c == Regional_Indicator;
			}) && [Prepend, Regional_Indicator].indexOf(previous) == -1) {
				if (all.filter(function (c) {
					return c == Regional_Indicator;
				}).length % 2 == 1) {
					return BreakLastRegional;
				} else {
					return BreakPenultimateRegional;
				}
			}

			// GB3. CR X LF
			if (previous == CR && next == LF) {
				return NotBreak;
			}
			// GB4. (Control|CR|LF) ÷
			else if (previous == Control || previous == CR || previous == LF) {
					if (next == E_Modifier && mid.every(function (c) {
						return c == Extend;
					})) {
						return Break;
					} else {
						return BreakStart;
					}
				}
				// GB5. ÷ (Control|CR|LF)
				else if (next == Control || next == CR || next == LF) {
						return BreakStart;
					}
					// GB6. L X (L|V|LV|LVT)
					else if (previous == L && (next == L || next == V || next == LV || next == LVT)) {
							return NotBreak;
						}
						// GB7. (LV|V) X (V|T)
						else if ((previous == LV || previous == V) && (next == V || next == T)) {
								return NotBreak;
							}
							// GB8. (LVT|T) X (T)
							else if ((previous == LVT || previous == T) && next == T) {
									return NotBreak;
								}
								// GB9. X (Extend|ZWJ)
								else if (next == Extend || next == ZWJ) {
										return NotBreak;
									}
									// GB9a. X SpacingMark
									else if (next == SpacingMark) {
											return NotBreak;
										}
										// GB9b. Prepend X
										else if (previous == Prepend) {
												return NotBreak;
											}

			// GB10. (E_Base | EBG) Extend* ?	E_Modifier
			var previousNonExtendIndex = all.indexOf(Extend) != -1 ? all.lastIndexOf(Extend) - 1 : all.length - 2;
			if ([E_Base, E_Base_GAZ].indexOf(all[previousNonExtendIndex]) != -1 && all.slice(previousNonExtendIndex + 1, -1).every(function (c) {
				return c == Extend;
			}) && next == E_Modifier) {
				return NotBreak;
			}

			// GB11. ZWJ ? (Glue_After_Zwj | EBG)
			if (previous == ZWJ && [Glue_After_Zwj, E_Base_GAZ].indexOf(next) != -1) {
				return NotBreak;
			}

			// GB12. ^ (RI RI)* RI ? RI
			// GB13. [^RI] (RI RI)* RI ? RI
			if (mid.indexOf(Regional_Indicator) != -1) {
				return Break;
			}
			if (previous == Regional_Indicator && next == Regional_Indicator) {
				return NotBreak;
			}

			// GB999. Any ? Any
			return BreakStart;
		}

		// Returns the next grapheme break in the string after the given index
		this.nextBreak = function (string, index) {
			if (index === undefined) {
				index = 0;
			}
			if (index < 0) {
				return 0;
			}
			if (index >= string.length - 1) {
				return string.length;
			}
			var prev = getGraphemeBreakProperty(codePointAt(string, index));
			var mid = [];
			for (var i = index + 1; i < string.length; i++) {
				// check for already processed low surrogates
				if (isSurrogate(string, i - 1)) {
					continue;
				}

				var next = getGraphemeBreakProperty(codePointAt(string, i));
				if (shouldBreak(prev, mid, next)) {
					return i;
				}

				mid.push(next);
			}
			return string.length;
		};

		// Breaks the given string into an array of grapheme cluster strings
		this.splitGraphemes = function (str) {
			var res = [];
			var index = 0;
			var brk;
			while ((brk = this.nextBreak(str, index)) < str.length) {
				res.push(str.slice(index, brk));
				index = brk;
			}
			if (index < str.length) {
				res.push(str.slice(index));
			}
			return res;
		};

		// Returns the iterator of grapheme clusters there are in the given string
		this.iterateGraphemes = function (str) {
			var index = 0;
			var res = {
				next: function () {
					var value;
					var brk;
					if ((brk = this.nextBreak(str, index)) < str.length) {
						value = str.slice(index, brk);
						index = brk;
						return { value: value, done: false };
					}
					if (index < str.length) {
						value = str.slice(index);
						index = str.length;
						return { value: value, done: false };
					}
					return { value: undefined, done: true };
				}.bind(this)
			};
			// ES2015 @@iterator method (iterable) for spread syntax and for...of statement
			if (typeof Symbol !== 'undefined' && Symbol.iterator) {
				res[Symbol.iterator] = function () {
					return res;
				};
			}
			return res;
		};

		// Returns the number of grapheme clusters there are in the given string
		this.countGraphemes = function (str) {
			var count = 0;
			var index = 0;
			var brk;
			while ((brk = this.nextBreak(str, index)) < str.length) {
				index = brk;
				count++;
			}
			if (index < str.length) {
				count++;
			}
			return count;
		};

		//given a Unicode code point, determines this symbol's grapheme break property
		function getGraphemeBreakProperty(code) {

			//grapheme break property for Unicode 10.0.0, 
			//taken from http://www.unicode.org/Public/10.0.0/ucd/auxiliary/GraphemeBreakProperty.txt
			//and adapted to JavaScript rules

			if (0x0600 <= code && code <= 0x0605 || // Cf   [6] ARABIC NUMBER SIGN..ARABIC NUMBER MARK ABOVE
			0x06DD == code || // Cf       ARABIC END OF AYAH
			0x070F == code || // Cf       SYRIAC ABBREVIATION MARK
			0x08E2 == code || // Cf       ARABIC DISPUTED END OF AYAH
			0x0D4E == code || // Lo       MALAYALAM LETTER DOT REPH
			0x110BD == code || // Cf       KAITHI NUMBER SIGN
			0x111C2 <= code && code <= 0x111C3 || // Lo   [2] SHARADA SIGN JIHVAMULIYA..SHARADA SIGN UPADHMANIYA
			0x11A3A == code || // Lo       ZANABAZAR SQUARE CLUSTER-INITIAL LETTER RA
			0x11A86 <= code && code <= 0x11A89 || // Lo   [4] SOYOMBO CLUSTER-INITIAL LETTER RA..SOYOMBO CLUSTER-INITIAL LETTER SA
			0x11D46 == code // Lo       MASARAM GONDI REPHA
			) {
					return Prepend;
				}
			if (0x000D == code // Cc       <control-000D>
			) {
					return CR;
				}

			if (0x000A == code // Cc       <control-000A>
			) {
					return LF;
				}

			if (0x0000 <= code && code <= 0x0009 || // Cc  [10] <control-0000>..<control-0009>
			0x000B <= code && code <= 0x000C || // Cc   [2] <control-000B>..<control-000C>
			0x000E <= code && code <= 0x001F || // Cc  [18] <control-000E>..<control-001F>
			0x007F <= code && code <= 0x009F || // Cc  [33] <control-007F>..<control-009F>
			0x00AD == code || // Cf       SOFT HYPHEN
			0x061C == code || // Cf       ARABIC LETTER MARK

			0x180E == code || // Cf       MONGOLIAN VOWEL SEPARATOR
			0x200B == code || // Cf       ZERO WIDTH SPACE
			0x200E <= code && code <= 0x200F || // Cf   [2] LEFT-TO-RIGHT MARK..RIGHT-TO-LEFT MARK
			0x2028 == code || // Zl       LINE SEPARATOR
			0x2029 == code || // Zp       PARAGRAPH SEPARATOR
			0x202A <= code && code <= 0x202E || // Cf   [5] LEFT-TO-RIGHT EMBEDDING..RIGHT-TO-LEFT OVERRIDE
			0x2060 <= code && code <= 0x2064 || // Cf   [5] WORD JOINER..INVISIBLE PLUS
			0x2065 == code || // Cn       <reserved-2065>
			0x2066 <= code && code <= 0x206F || // Cf  [10] LEFT-TO-RIGHT ISOLATE..NOMINAL DIGIT SHAPES
			0xD800 <= code && code <= 0xDFFF || // Cs [2048] <surrogate-D800>..<surrogate-DFFF>
			0xFEFF == code || // Cf       ZERO WIDTH NO-BREAK SPACE
			0xFFF0 <= code && code <= 0xFFF8 || // Cn   [9] <reserved-FFF0>..<reserved-FFF8>
			0xFFF9 <= code && code <= 0xFFFB || // Cf   [3] INTERLINEAR ANNOTATION ANCHOR..INTERLINEAR ANNOTATION TERMINATOR
			0x1BCA0 <= code && code <= 0x1BCA3 || // Cf   [4] SHORTHAND FORMAT LETTER OVERLAP..SHORTHAND FORMAT UP STEP
			0x1D173 <= code && code <= 0x1D17A || // Cf   [8] MUSICAL SYMBOL BEGIN BEAM..MUSICAL SYMBOL END PHRASE
			0xE0000 == code || // Cn       <reserved-E0000>
			0xE0001 == code || // Cf       LANGUAGE TAG
			0xE0002 <= code && code <= 0xE001F || // Cn  [30] <reserved-E0002>..<reserved-E001F>
			0xE0080 <= code && code <= 0xE00FF || // Cn [128] <reserved-E0080>..<reserved-E00FF>
			0xE01F0 <= code && code <= 0xE0FFF // Cn [3600] <reserved-E01F0>..<reserved-E0FFF>
			) {
					return Control;
				}

			if (0x0300 <= code && code <= 0x036F || // Mn [112] COMBINING GRAVE ACCENT..COMBINING LATIN SMALL LETTER X
			0x0483 <= code && code <= 0x0487 || // Mn   [5] COMBINING CYRILLIC TITLO..COMBINING CYRILLIC POKRYTIE
			0x0488 <= code && code <= 0x0489 || // Me   [2] COMBINING CYRILLIC HUNDRED THOUSANDS SIGN..COMBINING CYRILLIC MILLIONS SIGN
			0x0591 <= code && code <= 0x05BD || // Mn  [45] HEBREW ACCENT ETNAHTA..HEBREW POINT METEG
			0x05BF == code || // Mn       HEBREW POINT RAFE
			0x05C1 <= code && code <= 0x05C2 || // Mn   [2] HEBREW POINT SHIN DOT..HEBREW POINT SIN DOT
			0x05C4 <= code && code <= 0x05C5 || // Mn   [2] HEBREW MARK UPPER DOT..HEBREW MARK LOWER DOT
			0x05C7 == code || // Mn       HEBREW POINT QAMATS QATAN
			0x0610 <= code && code <= 0x061A || // Mn  [11] ARABIC SIGN SALLALLAHOU ALAYHE WASSALLAM..ARABIC SMALL KASRA
			0x064B <= code && code <= 0x065F || // Mn  [21] ARABIC FATHATAN..ARABIC WAVY HAMZA BELOW
			0x0670 == code || // Mn       ARABIC LETTER SUPERSCRIPT ALEF
			0x06D6 <= code && code <= 0x06DC || // Mn   [7] ARABIC SMALL HIGH LIGATURE SAD WITH LAM WITH ALEF MAKSURA..ARABIC SMALL HIGH SEEN
			0x06DF <= code && code <= 0x06E4 || // Mn   [6] ARABIC SMALL HIGH ROUNDED ZERO..ARABIC SMALL HIGH MADDA
			0x06E7 <= code && code <= 0x06E8 || // Mn   [2] ARABIC SMALL HIGH YEH..ARABIC SMALL HIGH NOON
			0x06EA <= code && code <= 0x06ED || // Mn   [4] ARABIC EMPTY CENTRE LOW STOP..ARABIC SMALL LOW MEEM
			0x0711 == code || // Mn       SYRIAC LETTER SUPERSCRIPT ALAPH
			0x0730 <= code && code <= 0x074A || // Mn  [27] SYRIAC PTHAHA ABOVE..SYRIAC BARREKH
			0x07A6 <= code && code <= 0x07B0 || // Mn  [11] THAANA ABAFILI..THAANA SUKUN
			0x07EB <= code && code <= 0x07F3 || // Mn   [9] NKO COMBINING SHORT HIGH TONE..NKO COMBINING DOUBLE DOT ABOVE
			0x0816 <= code && code <= 0x0819 || // Mn   [4] SAMARITAN MARK IN..SAMARITAN MARK DAGESH
			0x081B <= code && code <= 0x0823 || // Mn   [9] SAMARITAN MARK EPENTHETIC YUT..SAMARITAN VOWEL SIGN A
			0x0825 <= code && code <= 0x0827 || // Mn   [3] SAMARITAN VOWEL SIGN SHORT A..SAMARITAN VOWEL SIGN U
			0x0829 <= code && code <= 0x082D || // Mn   [5] SAMARITAN VOWEL SIGN LONG I..SAMARITAN MARK NEQUDAA
			0x0859 <= code && code <= 0x085B || // Mn   [3] MANDAIC AFFRICATION MARK..MANDAIC GEMINATION MARK
			0x08D4 <= code && code <= 0x08E1 || // Mn  [14] ARABIC SMALL HIGH WORD AR-RUB..ARABIC SMALL HIGH SIGN SAFHA
			0x08E3 <= code && code <= 0x0902 || // Mn  [32] ARABIC TURNED DAMMA BELOW..DEVANAGARI SIGN ANUSVARA
			0x093A == code || // Mn       DEVANAGARI VOWEL SIGN OE
			0x093C == code || // Mn       DEVANAGARI SIGN NUKTA
			0x0941 <= code && code <= 0x0948 || // Mn   [8] DEVANAGARI VOWEL SIGN U..DEVANAGARI VOWEL SIGN AI
			0x094D == code || // Mn       DEVANAGARI SIGN VIRAMA
			0x0951 <= code && code <= 0x0957 || // Mn   [7] DEVANAGARI STRESS SIGN UDATTA..DEVANAGARI VOWEL SIGN UUE
			0x0962 <= code && code <= 0x0963 || // Mn   [2] DEVANAGARI VOWEL SIGN VOCALIC L..DEVANAGARI VOWEL SIGN VOCALIC LL
			0x0981 == code || // Mn       BENGALI SIGN CANDRABINDU
			0x09BC == code || // Mn       BENGALI SIGN NUKTA
			0x09BE == code || // Mc       BENGALI VOWEL SIGN AA
			0x09C1 <= code && code <= 0x09C4 || // Mn   [4] BENGALI VOWEL SIGN U..BENGALI VOWEL SIGN VOCALIC RR
			0x09CD == code || // Mn       BENGALI SIGN VIRAMA
			0x09D7 == code || // Mc       BENGALI AU LENGTH MARK
			0x09E2 <= code && code <= 0x09E3 || // Mn   [2] BENGALI VOWEL SIGN VOCALIC L..BENGALI VOWEL SIGN VOCALIC LL
			0x0A01 <= code && code <= 0x0A02 || // Mn   [2] GURMUKHI SIGN ADAK BINDI..GURMUKHI SIGN BINDI
			0x0A3C == code || // Mn       GURMUKHI SIGN NUKTA
			0x0A41 <= code && code <= 0x0A42 || // Mn   [2] GURMUKHI VOWEL SIGN U..GURMUKHI VOWEL SIGN UU
			0x0A47 <= code && code <= 0x0A48 || // Mn   [2] GURMUKHI VOWEL SIGN EE..GURMUKHI VOWEL SIGN AI
			0x0A4B <= code && code <= 0x0A4D || // Mn   [3] GURMUKHI VOWEL SIGN OO..GURMUKHI SIGN VIRAMA
			0x0A51 == code || // Mn       GURMUKHI SIGN UDAAT
			0x0A70 <= code && code <= 0x0A71 || // Mn   [2] GURMUKHI TIPPI..GURMUKHI ADDAK
			0x0A75 == code || // Mn       GURMUKHI SIGN YAKASH
			0x0A81 <= code && code <= 0x0A82 || // Mn   [2] GUJARATI SIGN CANDRABINDU..GUJARATI SIGN ANUSVARA
			0x0ABC == code || // Mn       GUJARATI SIGN NUKTA
			0x0AC1 <= code && code <= 0x0AC5 || // Mn   [5] GUJARATI VOWEL SIGN U..GUJARATI VOWEL SIGN CANDRA E
			0x0AC7 <= code && code <= 0x0AC8 || // Mn   [2] GUJARATI VOWEL SIGN E..GUJARATI VOWEL SIGN AI
			0x0ACD == code || // Mn       GUJARATI SIGN VIRAMA
			0x0AE2 <= code && code <= 0x0AE3 || // Mn   [2] GUJARATI VOWEL SIGN VOCALIC L..GUJARATI VOWEL SIGN VOCALIC LL
			0x0AFA <= code && code <= 0x0AFF || // Mn   [6] GUJARATI SIGN SUKUN..GUJARATI SIGN TWO-CIRCLE NUKTA ABOVE
			0x0B01 == code || // Mn       ORIYA SIGN CANDRABINDU
			0x0B3C == code || // Mn       ORIYA SIGN NUKTA
			0x0B3E == code || // Mc       ORIYA VOWEL SIGN AA
			0x0B3F == code || // Mn       ORIYA VOWEL SIGN I
			0x0B41 <= code && code <= 0x0B44 || // Mn   [4] ORIYA VOWEL SIGN U..ORIYA VOWEL SIGN VOCALIC RR
			0x0B4D == code || // Mn       ORIYA SIGN VIRAMA
			0x0B56 == code || // Mn       ORIYA AI LENGTH MARK
			0x0B57 == code || // Mc       ORIYA AU LENGTH MARK
			0x0B62 <= code && code <= 0x0B63 || // Mn   [2] ORIYA VOWEL SIGN VOCALIC L..ORIYA VOWEL SIGN VOCALIC LL
			0x0B82 == code || // Mn       TAMIL SIGN ANUSVARA
			0x0BBE == code || // Mc       TAMIL VOWEL SIGN AA
			0x0BC0 == code || // Mn       TAMIL VOWEL SIGN II
			0x0BCD == code || // Mn       TAMIL SIGN VIRAMA
			0x0BD7 == code || // Mc       TAMIL AU LENGTH MARK
			0x0C00 == code || // Mn       TELUGU SIGN COMBINING CANDRABINDU ABOVE
			0x0C3E <= code && code <= 0x0C40 || // Mn   [3] TELUGU VOWEL SIGN AA..TELUGU VOWEL SIGN II
			0x0C46 <= code && code <= 0x0C48 || // Mn   [3] TELUGU VOWEL SIGN E..TELUGU VOWEL SIGN AI
			0x0C4A <= code && code <= 0x0C4D || // Mn   [4] TELUGU VOWEL SIGN O..TELUGU SIGN VIRAMA
			0x0C55 <= code && code <= 0x0C56 || // Mn   [2] TELUGU LENGTH MARK..TELUGU AI LENGTH MARK
			0x0C62 <= code && code <= 0x0C63 || // Mn   [2] TELUGU VOWEL SIGN VOCALIC L..TELUGU VOWEL SIGN VOCALIC LL
			0x0C81 == code || // Mn       KANNADA SIGN CANDRABINDU
			0x0CBC == code || // Mn       KANNADA SIGN NUKTA
			0x0CBF == code || // Mn       KANNADA VOWEL SIGN I
			0x0CC2 == code || // Mc       KANNADA VOWEL SIGN UU
			0x0CC6 == code || // Mn       KANNADA VOWEL SIGN E
			0x0CCC <= code && code <= 0x0CCD || // Mn   [2] KANNADA VOWEL SIGN AU..KANNADA SIGN VIRAMA
			0x0CD5 <= code && code <= 0x0CD6 || // Mc   [2] KANNADA LENGTH MARK..KANNADA AI LENGTH MARK
			0x0CE2 <= code && code <= 0x0CE3 || // Mn   [2] KANNADA VOWEL SIGN VOCALIC L..KANNADA VOWEL SIGN VOCALIC LL
			0x0D00 <= code && code <= 0x0D01 || // Mn   [2] MALAYALAM SIGN COMBINING ANUSVARA ABOVE..MALAYALAM SIGN CANDRABINDU
			0x0D3B <= code && code <= 0x0D3C || // Mn   [2] MALAYALAM SIGN VERTICAL BAR VIRAMA..MALAYALAM SIGN CIRCULAR VIRAMA
			0x0D3E == code || // Mc       MALAYALAM VOWEL SIGN AA
			0x0D41 <= code && code <= 0x0D44 || // Mn   [4] MALAYALAM VOWEL SIGN U..MALAYALAM VOWEL SIGN VOCALIC RR
			0x0D4D == code || // Mn       MALAYALAM SIGN VIRAMA
			0x0D57 == code || // Mc       MALAYALAM AU LENGTH MARK
			0x0D62 <= code && code <= 0x0D63 || // Mn   [2] MALAYALAM VOWEL SIGN VOCALIC L..MALAYALAM VOWEL SIGN VOCALIC LL
			0x0DCA == code || // Mn       SINHALA SIGN AL-LAKUNA
			0x0DCF == code || // Mc       SINHALA VOWEL SIGN AELA-PILLA
			0x0DD2 <= code && code <= 0x0DD4 || // Mn   [3] SINHALA VOWEL SIGN KETTI IS-PILLA..SINHALA VOWEL SIGN KETTI PAA-PILLA
			0x0DD6 == code || // Mn       SINHALA VOWEL SIGN DIGA PAA-PILLA
			0x0DDF == code || // Mc       SINHALA VOWEL SIGN GAYANUKITTA
			0x0E31 == code || // Mn       THAI CHARACTER MAI HAN-AKAT
			0x0E34 <= code && code <= 0x0E3A || // Mn   [7] THAI CHARACTER SARA I..THAI CHARACTER PHINTHU
			0x0E47 <= code && code <= 0x0E4E || // Mn   [8] THAI CHARACTER MAITAIKHU..THAI CHARACTER YAMAKKAN
			0x0EB1 == code || // Mn       LAO VOWEL SIGN MAI KAN
			0x0EB4 <= code && code <= 0x0EB9 || // Mn   [6] LAO VOWEL SIGN I..LAO VOWEL SIGN UU
			0x0EBB <= code && code <= 0x0EBC || // Mn   [2] LAO VOWEL SIGN MAI KON..LAO SEMIVOWEL SIGN LO
			0x0EC8 <= code && code <= 0x0ECD || // Mn   [6] LAO TONE MAI EK..LAO NIGGAHITA
			0x0F18 <= code && code <= 0x0F19 || // Mn   [2] TIBETAN ASTROLOGICAL SIGN -KHYUD PA..TIBETAN ASTROLOGICAL SIGN SDONG TSHUGS
			0x0F35 == code || // Mn       TIBETAN MARK NGAS BZUNG NYI ZLA
			0x0F37 == code || // Mn       TIBETAN MARK NGAS BZUNG SGOR RTAGS
			0x0F39 == code || // Mn       TIBETAN MARK TSA -PHRU
			0x0F71 <= code && code <= 0x0F7E || // Mn  [14] TIBETAN VOWEL SIGN AA..TIBETAN SIGN RJES SU NGA RO
			0x0F80 <= code && code <= 0x0F84 || // Mn   [5] TIBETAN VOWEL SIGN REVERSED I..TIBETAN MARK HALANTA
			0x0F86 <= code && code <= 0x0F87 || // Mn   [2] TIBETAN SIGN LCI RTAGS..TIBETAN SIGN YANG RTAGS
			0x0F8D <= code && code <= 0x0F97 || // Mn  [11] TIBETAN SUBJOINED SIGN LCE TSA CAN..TIBETAN SUBJOINED LETTER JA
			0x0F99 <= code && code <= 0x0FBC || // Mn  [36] TIBETAN SUBJOINED LETTER NYA..TIBETAN SUBJOINED LETTER FIXED-FORM RA
			0x0FC6 == code || // Mn       TIBETAN SYMBOL PADMA GDAN
			0x102D <= code && code <= 0x1030 || // Mn   [4] MYANMAR VOWEL SIGN I..MYANMAR VOWEL SIGN UU
			0x1032 <= code && code <= 0x1037 || // Mn   [6] MYANMAR VOWEL SIGN AI..MYANMAR SIGN DOT BELOW
			0x1039 <= code && code <= 0x103A || // Mn   [2] MYANMAR SIGN VIRAMA..MYANMAR SIGN ASAT
			0x103D <= code && code <= 0x103E || // Mn   [2] MYANMAR CONSONANT SIGN MEDIAL WA..MYANMAR CONSONANT SIGN MEDIAL HA
			0x1058 <= code && code <= 0x1059 || // Mn   [2] MYANMAR VOWEL SIGN VOCALIC L..MYANMAR VOWEL SIGN VOCALIC LL
			0x105E <= code && code <= 0x1060 || // Mn   [3] MYANMAR CONSONANT SIGN MON MEDIAL NA..MYANMAR CONSONANT SIGN MON MEDIAL LA
			0x1071 <= code && code <= 0x1074 || // Mn   [4] MYANMAR VOWEL SIGN GEBA KAREN I..MYANMAR VOWEL SIGN KAYAH EE
			0x1082 == code || // Mn       MYANMAR CONSONANT SIGN SHAN MEDIAL WA
			0x1085 <= code && code <= 0x1086 || // Mn   [2] MYANMAR VOWEL SIGN SHAN E ABOVE..MYANMAR VOWEL SIGN SHAN FINAL Y
			0x108D == code || // Mn       MYANMAR SIGN SHAN COUNCIL EMPHATIC TONE
			0x109D == code || // Mn       MYANMAR VOWEL SIGN AITON AI
			0x135D <= code && code <= 0x135F || // Mn   [3] ETHIOPIC COMBINING GEMINATION AND VOWEL LENGTH MARK..ETHIOPIC COMBINING GEMINATION MARK
			0x1712 <= code && code <= 0x1714 || // Mn   [3] TAGALOG VOWEL SIGN I..TAGALOG SIGN VIRAMA
			0x1732 <= code && code <= 0x1734 || // Mn   [3] HANUNOO VOWEL SIGN I..HANUNOO SIGN PAMUDPOD
			0x1752 <= code && code <= 0x1753 || // Mn   [2] BUHID VOWEL SIGN I..BUHID VOWEL SIGN U
			0x1772 <= code && code <= 0x1773 || // Mn   [2] TAGBANWA VOWEL SIGN I..TAGBANWA VOWEL SIGN U
			0x17B4 <= code && code <= 0x17B5 || // Mn   [2] KHMER VOWEL INHERENT AQ..KHMER VOWEL INHERENT AA
			0x17B7 <= code && code <= 0x17BD || // Mn   [7] KHMER VOWEL SIGN I..KHMER VOWEL SIGN UA
			0x17C6 == code || // Mn       KHMER SIGN NIKAHIT
			0x17C9 <= code && code <= 0x17D3 || // Mn  [11] KHMER SIGN MUUSIKATOAN..KHMER SIGN BATHAMASAT
			0x17DD == code || // Mn       KHMER SIGN ATTHACAN
			0x180B <= code && code <= 0x180D || // Mn   [3] MONGOLIAN FREE VARIATION SELECTOR ONE..MONGOLIAN FREE VARIATION SELECTOR THREE
			0x1885 <= code && code <= 0x1886 || // Mn   [2] MONGOLIAN LETTER ALI GALI BALUDA..MONGOLIAN LETTER ALI GALI THREE BALUDA
			0x18A9 == code || // Mn       MONGOLIAN LETTER ALI GALI DAGALGA
			0x1920 <= code && code <= 0x1922 || // Mn   [3] LIMBU VOWEL SIGN A..LIMBU VOWEL SIGN U
			0x1927 <= code && code <= 0x1928 || // Mn   [2] LIMBU VOWEL SIGN E..LIMBU VOWEL SIGN O
			0x1932 == code || // Mn       LIMBU SMALL LETTER ANUSVARA
			0x1939 <= code && code <= 0x193B || // Mn   [3] LIMBU SIGN MUKPHRENG..LIMBU SIGN SA-I
			0x1A17 <= code && code <= 0x1A18 || // Mn   [2] BUGINESE VOWEL SIGN I..BUGINESE VOWEL SIGN U
			0x1A1B == code || // Mn       BUGINESE VOWEL SIGN AE
			0x1A56 == code || // Mn       TAI THAM CONSONANT SIGN MEDIAL LA
			0x1A58 <= code && code <= 0x1A5E || // Mn   [7] TAI THAM SIGN MAI KANG LAI..TAI THAM CONSONANT SIGN SA
			0x1A60 == code || // Mn       TAI THAM SIGN SAKOT
			0x1A62 == code || // Mn       TAI THAM VOWEL SIGN MAI SAT
			0x1A65 <= code && code <= 0x1A6C || // Mn   [8] TAI THAM VOWEL SIGN I..TAI THAM VOWEL SIGN OA BELOW
			0x1A73 <= code && code <= 0x1A7C || // Mn  [10] TAI THAM VOWEL SIGN OA ABOVE..TAI THAM SIGN KHUEN-LUE KARAN
			0x1A7F == code || // Mn       TAI THAM COMBINING CRYPTOGRAMMIC DOT
			0x1AB0 <= code && code <= 0x1ABD || // Mn  [14] COMBINING DOUBLED CIRCUMFLEX ACCENT..COMBINING PARENTHESES BELOW
			0x1ABE == code || // Me       COMBINING PARENTHESES OVERLAY
			0x1B00 <= code && code <= 0x1B03 || // Mn   [4] BALINESE SIGN ULU RICEM..BALINESE SIGN SURANG
			0x1B34 == code || // Mn       BALINESE SIGN REREKAN
			0x1B36 <= code && code <= 0x1B3A || // Mn   [5] BALINESE VOWEL SIGN ULU..BALINESE VOWEL SIGN RA REPA
			0x1B3C == code || // Mn       BALINESE VOWEL SIGN LA LENGA
			0x1B42 == code || // Mn       BALINESE VOWEL SIGN PEPET
			0x1B6B <= code && code <= 0x1B73 || // Mn   [9] BALINESE MUSICAL SYMBOL COMBINING TEGEH..BALINESE MUSICAL SYMBOL COMBINING GONG
			0x1B80 <= code && code <= 0x1B81 || // Mn   [2] SUNDANESE SIGN PANYECEK..SUNDANESE SIGN PANGLAYAR
			0x1BA2 <= code && code <= 0x1BA5 || // Mn   [4] SUNDANESE CONSONANT SIGN PANYAKRA..SUNDANESE VOWEL SIGN PANYUKU
			0x1BA8 <= code && code <= 0x1BA9 || // Mn   [2] SUNDANESE VOWEL SIGN PAMEPET..SUNDANESE VOWEL SIGN PANEULEUNG
			0x1BAB <= code && code <= 0x1BAD || // Mn   [3] SUNDANESE SIGN VIRAMA..SUNDANESE CONSONANT SIGN PASANGAN WA
			0x1BE6 == code || // Mn       BATAK SIGN TOMPI
			0x1BE8 <= code && code <= 0x1BE9 || // Mn   [2] BATAK VOWEL SIGN PAKPAK E..BATAK VOWEL SIGN EE
			0x1BED == code || // Mn       BATAK VOWEL SIGN KARO O
			0x1BEF <= code && code <= 0x1BF1 || // Mn   [3] BATAK VOWEL SIGN U FOR SIMALUNGUN SA..BATAK CONSONANT SIGN H
			0x1C2C <= code && code <= 0x1C33 || // Mn   [8] LEPCHA VOWEL SIGN E..LEPCHA CONSONANT SIGN T
			0x1C36 <= code && code <= 0x1C37 || // Mn   [2] LEPCHA SIGN RAN..LEPCHA SIGN NUKTA
			0x1CD0 <= code && code <= 0x1CD2 || // Mn   [3] VEDIC TONE KARSHANA..VEDIC TONE PRENKHA
			0x1CD4 <= code && code <= 0x1CE0 || // Mn  [13] VEDIC SIGN YAJURVEDIC MIDLINE SVARITA..VEDIC TONE RIGVEDIC KASHMIRI INDEPENDENT SVARITA
			0x1CE2 <= code && code <= 0x1CE8 || // Mn   [7] VEDIC SIGN VISARGA SVARITA..VEDIC SIGN VISARGA ANUDATTA WITH TAIL
			0x1CED == code || // Mn       VEDIC SIGN TIRYAK
			0x1CF4 == code || // Mn       VEDIC TONE CANDRA ABOVE
			0x1CF8 <= code && code <= 0x1CF9 || // Mn   [2] VEDIC TONE RING ABOVE..VEDIC TONE DOUBLE RING ABOVE
			0x1DC0 <= code && code <= 0x1DF9 || // Mn  [58] COMBINING DOTTED GRAVE ACCENT..COMBINING WIDE INVERTED BRIDGE BELOW
			0x1DFB <= code && code <= 0x1DFF || // Mn   [5] COMBINING DELETION MARK..COMBINING RIGHT ARROWHEAD AND DOWN ARROWHEAD BELOW
			0x200C == code || // Cf       ZERO WIDTH NON-JOINER
			0x20D0 <= code && code <= 0x20DC || // Mn  [13] COMBINING LEFT HARPOON ABOVE..COMBINING FOUR DOTS ABOVE
			0x20DD <= code && code <= 0x20E0 || // Me   [4] COMBINING ENCLOSING CIRCLE..COMBINING ENCLOSING CIRCLE BACKSLASH
			0x20E1 == code || // Mn       COMBINING LEFT RIGHT ARROW ABOVE
			0x20E2 <= code && code <= 0x20E4 || // Me   [3] COMBINING ENCLOSING SCREEN..COMBINING ENCLOSING UPWARD POINTING TRIANGLE
			0x20E5 <= code && code <= 0x20F0 || // Mn  [12] COMBINING REVERSE SOLIDUS OVERLAY..COMBINING ASTERISK ABOVE
			0x2CEF <= code && code <= 0x2CF1 || // Mn   [3] COPTIC COMBINING NI ABOVE..COPTIC COMBINING SPIRITUS LENIS
			0x2D7F == code || // Mn       TIFINAGH CONSONANT JOINER
			0x2DE0 <= code && code <= 0x2DFF || // Mn  [32] COMBINING CYRILLIC LETTER BE..COMBINING CYRILLIC LETTER IOTIFIED BIG YUS
			0x302A <= code && code <= 0x302D || // Mn   [4] IDEOGRAPHIC LEVEL TONE MARK..IDEOGRAPHIC ENTERING TONE MARK
			0x302E <= code && code <= 0x302F || // Mc   [2] HANGUL SINGLE DOT TONE MARK..HANGUL DOUBLE DOT TONE MARK
			0x3099 <= code && code <= 0x309A || // Mn   [2] COMBINING KATAKANA-HIRAGANA VOICED SOUND MARK..COMBINING KATAKANA-HIRAGANA SEMI-VOICED SOUND MARK
			0xA66F == code || // Mn       COMBINING CYRILLIC VZMET
			0xA670 <= code && code <= 0xA672 || // Me   [3] COMBINING CYRILLIC TEN MILLIONS SIGN..COMBINING CYRILLIC THOUSAND MILLIONS SIGN
			0xA674 <= code && code <= 0xA67D || // Mn  [10] COMBINING CYRILLIC LETTER UKRAINIAN IE..COMBINING CYRILLIC PAYEROK
			0xA69E <= code && code <= 0xA69F || // Mn   [2] COMBINING CYRILLIC LETTER EF..COMBINING CYRILLIC LETTER IOTIFIED E
			0xA6F0 <= code && code <= 0xA6F1 || // Mn   [2] BAMUM COMBINING MARK KOQNDON..BAMUM COMBINING MARK TUKWENTIS
			0xA802 == code || // Mn       SYLOTI NAGRI SIGN DVISVARA
			0xA806 == code || // Mn       SYLOTI NAGRI SIGN HASANTA
			0xA80B == code || // Mn       SYLOTI NAGRI SIGN ANUSVARA
			0xA825 <= code && code <= 0xA826 || // Mn   [2] SYLOTI NAGRI VOWEL SIGN U..SYLOTI NAGRI VOWEL SIGN E
			0xA8C4 <= code && code <= 0xA8C5 || // Mn   [2] SAURASHTRA SIGN VIRAMA..SAURASHTRA SIGN CANDRABINDU
			0xA8E0 <= code && code <= 0xA8F1 || // Mn  [18] COMBINING DEVANAGARI DIGIT ZERO..COMBINING DEVANAGARI SIGN AVAGRAHA
			0xA926 <= code && code <= 0xA92D || // Mn   [8] KAYAH LI VOWEL UE..KAYAH LI TONE CALYA PLOPHU
			0xA947 <= code && code <= 0xA951 || // Mn  [11] REJANG VOWEL SIGN I..REJANG CONSONANT SIGN R
			0xA980 <= code && code <= 0xA982 || // Mn   [3] JAVANESE SIGN PANYANGGA..JAVANESE SIGN LAYAR
			0xA9B3 == code || // Mn       JAVANESE SIGN CECAK TELU
			0xA9B6 <= code && code <= 0xA9B9 || // Mn   [4] JAVANESE VOWEL SIGN WULU..JAVANESE VOWEL SIGN SUKU MENDUT
			0xA9BC == code || // Mn       JAVANESE VOWEL SIGN PEPET
			0xA9E5 == code || // Mn       MYANMAR SIGN SHAN SAW
			0xAA29 <= code && code <= 0xAA2E || // Mn   [6] CHAM VOWEL SIGN AA..CHAM VOWEL SIGN OE
			0xAA31 <= code && code <= 0xAA32 || // Mn   [2] CHAM VOWEL SIGN AU..CHAM VOWEL SIGN UE
			0xAA35 <= code && code <= 0xAA36 || // Mn   [2] CHAM CONSONANT SIGN LA..CHAM CONSONANT SIGN WA
			0xAA43 == code || // Mn       CHAM CONSONANT SIGN FINAL NG
			0xAA4C == code || // Mn       CHAM CONSONANT SIGN FINAL M
			0xAA7C == code || // Mn       MYANMAR SIGN TAI LAING TONE-2
			0xAAB0 == code || // Mn       TAI VIET MAI KANG
			0xAAB2 <= code && code <= 0xAAB4 || // Mn   [3] TAI VIET VOWEL I..TAI VIET VOWEL U
			0xAAB7 <= code && code <= 0xAAB8 || // Mn   [2] TAI VIET MAI KHIT..TAI VIET VOWEL IA
			0xAABE <= code && code <= 0xAABF || // Mn   [2] TAI VIET VOWEL AM..TAI VIET TONE MAI EK
			0xAAC1 == code || // Mn       TAI VIET TONE MAI THO
			0xAAEC <= code && code <= 0xAAED || // Mn   [2] MEETEI MAYEK VOWEL SIGN UU..MEETEI MAYEK VOWEL SIGN AAI
			0xAAF6 == code || // Mn       MEETEI MAYEK VIRAMA
			0xABE5 == code || // Mn       MEETEI MAYEK VOWEL SIGN ANAP
			0xABE8 == code || // Mn       MEETEI MAYEK VOWEL SIGN UNAP
			0xABED == code || // Mn       MEETEI MAYEK APUN IYEK
			0xFB1E == code || // Mn       HEBREW POINT JUDEO-SPANISH VARIKA
			0xFE00 <= code && code <= 0xFE0F || // Mn  [16] VARIATION SELECTOR-1..VARIATION SELECTOR-16
			0xFE20 <= code && code <= 0xFE2F || // Mn  [16] COMBINING LIGATURE LEFT HALF..COMBINING CYRILLIC TITLO RIGHT HALF
			0xFF9E <= code && code <= 0xFF9F || // Lm   [2] HALFWIDTH KATAKANA VOICED SOUND MARK..HALFWIDTH KATAKANA SEMI-VOICED SOUND MARK
			0x101FD == code || // Mn       PHAISTOS DISC SIGN COMBINING OBLIQUE STROKE
			0x102E0 == code || // Mn       COPTIC EPACT THOUSANDS MARK
			0x10376 <= code && code <= 0x1037A || // Mn   [5] COMBINING OLD PERMIC LETTER AN..COMBINING OLD PERMIC LETTER SII
			0x10A01 <= code && code <= 0x10A03 || // Mn   [3] KHAROSHTHI VOWEL SIGN I..KHAROSHTHI VOWEL SIGN VOCALIC R
			0x10A05 <= code && code <= 0x10A06 || // Mn   [2] KHAROSHTHI VOWEL SIGN E..KHAROSHTHI VOWEL SIGN O
			0x10A0C <= code && code <= 0x10A0F || // Mn   [4] KHAROSHTHI VOWEL LENGTH MARK..KHAROSHTHI SIGN VISARGA
			0x10A38 <= code && code <= 0x10A3A || // Mn   [3] KHAROSHTHI SIGN BAR ABOVE..KHAROSHTHI SIGN DOT BELOW
			0x10A3F == code || // Mn       KHAROSHTHI VIRAMA
			0x10AE5 <= code && code <= 0x10AE6 || // Mn   [2] MANICHAEAN ABBREVIATION MARK ABOVE..MANICHAEAN ABBREVIATION MARK BELOW
			0x11001 == code || // Mn       BRAHMI SIGN ANUSVARA
			0x11038 <= code && code <= 0x11046 || // Mn  [15] BRAHMI VOWEL SIGN AA..BRAHMI VIRAMA
			0x1107F <= code && code <= 0x11081 || // Mn   [3] BRAHMI NUMBER JOINER..KAITHI SIGN ANUSVARA
			0x110B3 <= code && code <= 0x110B6 || // Mn   [4] KAITHI VOWEL SIGN U..KAITHI VOWEL SIGN AI
			0x110B9 <= code && code <= 0x110BA || // Mn   [2] KAITHI SIGN VIRAMA..KAITHI SIGN NUKTA
			0x11100 <= code && code <= 0x11102 || // Mn   [3] CHAKMA SIGN CANDRABINDU..CHAKMA SIGN VISARGA
			0x11127 <= code && code <= 0x1112B || // Mn   [5] CHAKMA VOWEL SIGN A..CHAKMA VOWEL SIGN UU
			0x1112D <= code && code <= 0x11134 || // Mn   [8] CHAKMA VOWEL SIGN AI..CHAKMA MAAYYAA
			0x11173 == code || // Mn       MAHAJANI SIGN NUKTA
			0x11180 <= code && code <= 0x11181 || // Mn   [2] SHARADA SIGN CANDRABINDU..SHARADA SIGN ANUSVARA
			0x111B6 <= code && code <= 0x111BE || // Mn   [9] SHARADA VOWEL SIGN U..SHARADA VOWEL SIGN O
			0x111CA <= code && code <= 0x111CC || // Mn   [3] SHARADA SIGN NUKTA..SHARADA EXTRA SHORT VOWEL MARK
			0x1122F <= code && code <= 0x11231 || // Mn   [3] KHOJKI VOWEL SIGN U..KHOJKI VOWEL SIGN AI
			0x11234 == code || // Mn       KHOJKI SIGN ANUSVARA
			0x11236 <= code && code <= 0x11237 || // Mn   [2] KHOJKI SIGN NUKTA..KHOJKI SIGN SHADDA
			0x1123E == code || // Mn       KHOJKI SIGN SUKUN
			0x112DF == code || // Mn       KHUDAWADI SIGN ANUSVARA
			0x112E3 <= code && code <= 0x112EA || // Mn   [8] KHUDAWADI VOWEL SIGN U..KHUDAWADI SIGN VIRAMA
			0x11300 <= code && code <= 0x11301 || // Mn   [2] GRANTHA SIGN COMBINING ANUSVARA ABOVE..GRANTHA SIGN CANDRABINDU
			0x1133C == code || // Mn       GRANTHA SIGN NUKTA
			0x1133E == code || // Mc       GRANTHA VOWEL SIGN AA
			0x11340 == code || // Mn       GRANTHA VOWEL SIGN II
			0x11357 == code || // Mc       GRANTHA AU LENGTH MARK
			0x11366 <= code && code <= 0x1136C || // Mn   [7] COMBINING GRANTHA DIGIT ZERO..COMBINING GRANTHA DIGIT SIX
			0x11370 <= code && code <= 0x11374 || // Mn   [5] COMBINING GRANTHA LETTER A..COMBINING GRANTHA LETTER PA
			0x11438 <= code && code <= 0x1143F || // Mn   [8] NEWA VOWEL SIGN U..NEWA VOWEL SIGN AI
			0x11442 <= code && code <= 0x11444 || // Mn   [3] NEWA SIGN VIRAMA..NEWA SIGN ANUSVARA
			0x11446 == code || // Mn       NEWA SIGN NUKTA
			0x114B0 == code || // Mc       TIRHUTA VOWEL SIGN AA
			0x114B3 <= code && code <= 0x114B8 || // Mn   [6] TIRHUTA VOWEL SIGN U..TIRHUTA VOWEL SIGN VOCALIC LL
			0x114BA == code || // Mn       TIRHUTA VOWEL SIGN SHORT E
			0x114BD == code || // Mc       TIRHUTA VOWEL SIGN SHORT O
			0x114BF <= code && code <= 0x114C0 || // Mn   [2] TIRHUTA SIGN CANDRABINDU..TIRHUTA SIGN ANUSVARA
			0x114C2 <= code && code <= 0x114C3 || // Mn   [2] TIRHUTA SIGN VIRAMA..TIRHUTA SIGN NUKTA
			0x115AF == code || // Mc       SIDDHAM VOWEL SIGN AA
			0x115B2 <= code && code <= 0x115B5 || // Mn   [4] SIDDHAM VOWEL SIGN U..SIDDHAM VOWEL SIGN VOCALIC RR
			0x115BC <= code && code <= 0x115BD || // Mn   [2] SIDDHAM SIGN CANDRABINDU..SIDDHAM SIGN ANUSVARA
			0x115BF <= code && code <= 0x115C0 || // Mn   [2] SIDDHAM SIGN VIRAMA..SIDDHAM SIGN NUKTA
			0x115DC <= code && code <= 0x115DD || // Mn   [2] SIDDHAM VOWEL SIGN ALTERNATE U..SIDDHAM VOWEL SIGN ALTERNATE UU
			0x11633 <= code && code <= 0x1163A || // Mn   [8] MODI VOWEL SIGN U..MODI VOWEL SIGN AI
			0x1163D == code || // Mn       MODI SIGN ANUSVARA
			0x1163F <= code && code <= 0x11640 || // Mn   [2] MODI SIGN VIRAMA..MODI SIGN ARDHACANDRA
			0x116AB == code || // Mn       TAKRI SIGN ANUSVARA
			0x116AD == code || // Mn       TAKRI VOWEL SIGN AA
			0x116B0 <= code && code <= 0x116B5 || // Mn   [6] TAKRI VOWEL SIGN U..TAKRI VOWEL SIGN AU
			0x116B7 == code || // Mn       TAKRI SIGN NUKTA
			0x1171D <= code && code <= 0x1171F || // Mn   [3] AHOM CONSONANT SIGN MEDIAL LA..AHOM CONSONANT SIGN MEDIAL LIGATING RA
			0x11722 <= code && code <= 0x11725 || // Mn   [4] AHOM VOWEL SIGN I..AHOM VOWEL SIGN UU
			0x11727 <= code && code <= 0x1172B || // Mn   [5] AHOM VOWEL SIGN AW..AHOM SIGN KILLER
			0x11A01 <= code && code <= 0x11A06 || // Mn   [6] ZANABAZAR SQUARE VOWEL SIGN I..ZANABAZAR SQUARE VOWEL SIGN O
			0x11A09 <= code && code <= 0x11A0A || // Mn   [2] ZANABAZAR SQUARE VOWEL SIGN REVERSED I..ZANABAZAR SQUARE VOWEL LENGTH MARK
			0x11A33 <= code && code <= 0x11A38 || // Mn   [6] ZANABAZAR SQUARE FINAL CONSONANT MARK..ZANABAZAR SQUARE SIGN ANUSVARA
			0x11A3B <= code && code <= 0x11A3E || // Mn   [4] ZANABAZAR SQUARE CLUSTER-FINAL LETTER YA..ZANABAZAR SQUARE CLUSTER-FINAL LETTER VA
			0x11A47 == code || // Mn       ZANABAZAR SQUARE SUBJOINER
			0x11A51 <= code && code <= 0x11A56 || // Mn   [6] SOYOMBO VOWEL SIGN I..SOYOMBO VOWEL SIGN OE
			0x11A59 <= code && code <= 0x11A5B || // Mn   [3] SOYOMBO VOWEL SIGN VOCALIC R..SOYOMBO VOWEL LENGTH MARK
			0x11A8A <= code && code <= 0x11A96 || // Mn  [13] SOYOMBO FINAL CONSONANT SIGN G..SOYOMBO SIGN ANUSVARA
			0x11A98 <= code && code <= 0x11A99 || // Mn   [2] SOYOMBO GEMINATION MARK..SOYOMBO SUBJOINER
			0x11C30 <= code && code <= 0x11C36 || // Mn   [7] BHAIKSUKI VOWEL SIGN I..BHAIKSUKI VOWEL SIGN VOCALIC L
			0x11C38 <= code && code <= 0x11C3D || // Mn   [6] BHAIKSUKI VOWEL SIGN E..BHAIKSUKI SIGN ANUSVARA
			0x11C3F == code || // Mn       BHAIKSUKI SIGN VIRAMA
			0x11C92 <= code && code <= 0x11CA7 || // Mn  [22] MARCHEN SUBJOINED LETTER KA..MARCHEN SUBJOINED LETTER ZA
			0x11CAA <= code && code <= 0x11CB0 || // Mn   [7] MARCHEN SUBJOINED LETTER RA..MARCHEN VOWEL SIGN AA
			0x11CB2 <= code && code <= 0x11CB3 || // Mn   [2] MARCHEN VOWEL SIGN U..MARCHEN VOWEL SIGN E
			0x11CB5 <= code && code <= 0x11CB6 || // Mn   [2] MARCHEN SIGN ANUSVARA..MARCHEN SIGN CANDRABINDU
			0x11D31 <= code && code <= 0x11D36 || // Mn   [6] MASARAM GONDI VOWEL SIGN AA..MASARAM GONDI VOWEL SIGN VOCALIC R
			0x11D3A == code || // Mn       MASARAM GONDI VOWEL SIGN E
			0x11D3C <= code && code <= 0x11D3D || // Mn   [2] MASARAM GONDI VOWEL SIGN AI..MASARAM GONDI VOWEL SIGN O
			0x11D3F <= code && code <= 0x11D45 || // Mn   [7] MASARAM GONDI VOWEL SIGN AU..MASARAM GONDI VIRAMA
			0x11D47 == code || // Mn       MASARAM GONDI RA-KARA
			0x16AF0 <= code && code <= 0x16AF4 || // Mn   [5] BASSA VAH COMBINING HIGH TONE..BASSA VAH COMBINING HIGH-LOW TONE
			0x16B30 <= code && code <= 0x16B36 || // Mn   [7] PAHAWH HMONG MARK CIM TUB..PAHAWH HMONG MARK CIM TAUM
			0x16F8F <= code && code <= 0x16F92 || // Mn   [4] MIAO TONE RIGHT..MIAO TONE BELOW
			0x1BC9D <= code && code <= 0x1BC9E || // Mn   [2] DUPLOYAN THICK LETTER SELECTOR..DUPLOYAN DOUBLE MARK
			0x1D165 == code || // Mc       MUSICAL SYMBOL COMBINING STEM
			0x1D167 <= code && code <= 0x1D169 || // Mn   [3] MUSICAL SYMBOL COMBINING TREMOLO-1..MUSICAL SYMBOL COMBINING TREMOLO-3
			0x1D16E <= code && code <= 0x1D172 || // Mc   [5] MUSICAL SYMBOL COMBINING FLAG-1..MUSICAL SYMBOL COMBINING FLAG-5
			0x1D17B <= code && code <= 0x1D182 || // Mn   [8] MUSICAL SYMBOL COMBINING ACCENT..MUSICAL SYMBOL COMBINING LOURE
			0x1D185 <= code && code <= 0x1D18B || // Mn   [7] MUSICAL SYMBOL COMBINING DOIT..MUSICAL SYMBOL COMBINING TRIPLE TONGUE
			0x1D1AA <= code && code <= 0x1D1AD || // Mn   [4] MUSICAL SYMBOL COMBINING DOWN BOW..MUSICAL SYMBOL COMBINING SNAP PIZZICATO
			0x1D242 <= code && code <= 0x1D244 || // Mn   [3] COMBINING GREEK MUSICAL TRISEME..COMBINING GREEK MUSICAL PENTASEME
			0x1DA00 <= code && code <= 0x1DA36 || // Mn  [55] SIGNWRITING HEAD RIM..SIGNWRITING AIR SUCKING IN
			0x1DA3B <= code && code <= 0x1DA6C || // Mn  [50] SIGNWRITING MOUTH CLOSED NEUTRAL..SIGNWRITING EXCITEMENT
			0x1DA75 == code || // Mn       SIGNWRITING UPPER BODY TILTING FROM HIP JOINTS
			0x1DA84 == code || // Mn       SIGNWRITING LOCATION HEAD NECK
			0x1DA9B <= code && code <= 0x1DA9F || // Mn   [5] SIGNWRITING FILL MODIFIER-2..SIGNWRITING FILL MODIFIER-6
			0x1DAA1 <= code && code <= 0x1DAAF || // Mn  [15] SIGNWRITING ROTATION MODIFIER-2..SIGNWRITING ROTATION MODIFIER-16
			0x1E000 <= code && code <= 0x1E006 || // Mn   [7] COMBINING GLAGOLITIC LETTER AZU..COMBINING GLAGOLITIC LETTER ZHIVETE
			0x1E008 <= code && code <= 0x1E018 || // Mn  [17] COMBINING GLAGOLITIC LETTER ZEMLJA..COMBINING GLAGOLITIC LETTER HERU
			0x1E01B <= code && code <= 0x1E021 || // Mn   [7] COMBINING GLAGOLITIC LETTER SHTA..COMBINING GLAGOLITIC LETTER YATI
			0x1E023 <= code && code <= 0x1E024 || // Mn   [2] COMBINING GLAGOLITIC LETTER YU..COMBINING GLAGOLITIC LETTER SMALL YUS
			0x1E026 <= code && code <= 0x1E02A || // Mn   [5] COMBINING GLAGOLITIC LETTER YO..COMBINING GLAGOLITIC LETTER FITA
			0x1E8D0 <= code && code <= 0x1E8D6 || // Mn   [7] MENDE KIKAKUI COMBINING NUMBER TEENS..MENDE KIKAKUI COMBINING NUMBER MILLIONS
			0x1E944 <= code && code <= 0x1E94A || // Mn   [7] ADLAM ALIF LENGTHENER..ADLAM NUKTA
			0xE0020 <= code && code <= 0xE007F || // Cf  [96] TAG SPACE..CANCEL TAG
			0xE0100 <= code && code <= 0xE01EF // Mn [240] VARIATION SELECTOR-17..VARIATION SELECTOR-256
			) {
					return Extend;
				}

			if (0x1F1E6 <= code && code <= 0x1F1FF) // So  [26] REGIONAL INDICATOR SYMBOL LETTER A..REGIONAL INDICATOR SYMBOL LETTER Z
				{
					return Regional_Indicator;
				}

			if (0x0903 == code || // Mc       DEVANAGARI SIGN VISARGA
			0x093B == code || // Mc       DEVANAGARI VOWEL SIGN OOE
			0x093E <= code && code <= 0x0940 || // Mc   [3] DEVANAGARI VOWEL SIGN AA..DEVANAGARI VOWEL SIGN II
			0x0949 <= code && code <= 0x094C || // Mc   [4] DEVANAGARI VOWEL SIGN CANDRA O..DEVANAGARI VOWEL SIGN AU
			0x094E <= code && code <= 0x094F || // Mc   [2] DEVANAGARI VOWEL SIGN PRISHTHAMATRA E..DEVANAGARI VOWEL SIGN AW
			0x0982 <= code && code <= 0x0983 || // Mc   [2] BENGALI SIGN ANUSVARA..BENGALI SIGN VISARGA
			0x09BF <= code && code <= 0x09C0 || // Mc   [2] BENGALI VOWEL SIGN I..BENGALI VOWEL SIGN II
			0x09C7 <= code && code <= 0x09C8 || // Mc   [2] BENGALI VOWEL SIGN E..BENGALI VOWEL SIGN AI
			0x09CB <= code && code <= 0x09CC || // Mc   [2] BENGALI VOWEL SIGN O..BENGALI VOWEL SIGN AU
			0x0A03 == code || // Mc       GURMUKHI SIGN VISARGA
			0x0A3E <= code && code <= 0x0A40 || // Mc   [3] GURMUKHI VOWEL SIGN AA..GURMUKHI VOWEL SIGN II
			0x0A83 == code || // Mc       GUJARATI SIGN VISARGA
			0x0ABE <= code && code <= 0x0AC0 || // Mc   [3] GUJARATI VOWEL SIGN AA..GUJARATI VOWEL SIGN II
			0x0AC9 == code || // Mc       GUJARATI VOWEL SIGN CANDRA O
			0x0ACB <= code && code <= 0x0ACC || // Mc   [2] GUJARATI VOWEL SIGN O..GUJARATI VOWEL SIGN AU
			0x0B02 <= code && code <= 0x0B03 || // Mc   [2] ORIYA SIGN ANUSVARA..ORIYA SIGN VISARGA
			0x0B40 == code || // Mc       ORIYA VOWEL SIGN II
			0x0B47 <= code && code <= 0x0B48 || // Mc   [2] ORIYA VOWEL SIGN E..ORIYA VOWEL SIGN AI
			0x0B4B <= code && code <= 0x0B4C || // Mc   [2] ORIYA VOWEL SIGN O..ORIYA VOWEL SIGN AU
			0x0BBF == code || // Mc       TAMIL VOWEL SIGN I
			0x0BC1 <= code && code <= 0x0BC2 || // Mc   [2] TAMIL VOWEL SIGN U..TAMIL VOWEL SIGN UU
			0x0BC6 <= code && code <= 0x0BC8 || // Mc   [3] TAMIL VOWEL SIGN E..TAMIL VOWEL SIGN AI
			0x0BCA <= code && code <= 0x0BCC || // Mc   [3] TAMIL VOWEL SIGN O..TAMIL VOWEL SIGN AU
			0x0C01 <= code && code <= 0x0C03 || // Mc   [3] TELUGU SIGN CANDRABINDU..TELUGU SIGN VISARGA
			0x0C41 <= code && code <= 0x0C44 || // Mc   [4] TELUGU VOWEL SIGN U..TELUGU VOWEL SIGN VOCALIC RR
			0x0C82 <= code && code <= 0x0C83 || // Mc   [2] KANNADA SIGN ANUSVARA..KANNADA SIGN VISARGA
			0x0CBE == code || // Mc       KANNADA VOWEL SIGN AA
			0x0CC0 <= code && code <= 0x0CC1 || // Mc   [2] KANNADA VOWEL SIGN II..KANNADA VOWEL SIGN U
			0x0CC3 <= code && code <= 0x0CC4 || // Mc   [2] KANNADA VOWEL SIGN VOCALIC R..KANNADA VOWEL SIGN VOCALIC RR
			0x0CC7 <= code && code <= 0x0CC8 || // Mc   [2] KANNADA VOWEL SIGN EE..KANNADA VOWEL SIGN AI
			0x0CCA <= code && code <= 0x0CCB || // Mc   [2] KANNADA VOWEL SIGN O..KANNADA VOWEL SIGN OO
			0x0D02 <= code && code <= 0x0D03 || // Mc   [2] MALAYALAM SIGN ANUSVARA..MALAYALAM SIGN VISARGA
			0x0D3F <= code && code <= 0x0D40 || // Mc   [2] MALAYALAM VOWEL SIGN I..MALAYALAM VOWEL SIGN II
			0x0D46 <= code && code <= 0x0D48 || // Mc   [3] MALAYALAM VOWEL SIGN E..MALAYALAM VOWEL SIGN AI
			0x0D4A <= code && code <= 0x0D4C || // Mc   [3] MALAYALAM VOWEL SIGN O..MALAYALAM VOWEL SIGN AU
			0x0D82 <= code && code <= 0x0D83 || // Mc   [2] SINHALA SIGN ANUSVARAYA..SINHALA SIGN VISARGAYA
			0x0DD0 <= code && code <= 0x0DD1 || // Mc   [2] SINHALA VOWEL SIGN KETTI AEDA-PILLA..SINHALA VOWEL SIGN DIGA AEDA-PILLA
			0x0DD8 <= code && code <= 0x0DDE || // Mc   [7] SINHALA VOWEL SIGN GAETTA-PILLA..SINHALA VOWEL SIGN KOMBUVA HAA GAYANUKITTA
			0x0DF2 <= code && code <= 0x0DF3 || // Mc   [2] SINHALA VOWEL SIGN DIGA GAETTA-PILLA..SINHALA VOWEL SIGN DIGA GAYANUKITTA
			0x0E33 == code || // Lo       THAI CHARACTER SARA AM
			0x0EB3 == code || // Lo       LAO VOWEL SIGN AM
			0x0F3E <= code && code <= 0x0F3F || // Mc   [2] TIBETAN SIGN YAR TSHES..TIBETAN SIGN MAR TSHES
			0x0F7F == code || // Mc       TIBETAN SIGN RNAM BCAD
			0x1031 == code || // Mc       MYANMAR VOWEL SIGN E
			0x103B <= code && code <= 0x103C || // Mc   [2] MYANMAR CONSONANT SIGN MEDIAL YA..MYANMAR CONSONANT SIGN MEDIAL RA
			0x1056 <= code && code <= 0x1057 || // Mc   [2] MYANMAR VOWEL SIGN VOCALIC R..MYANMAR VOWEL SIGN VOCALIC RR
			0x1084 == code || // Mc       MYANMAR VOWEL SIGN SHAN E
			0x17B6 == code || // Mc       KHMER VOWEL SIGN AA
			0x17BE <= code && code <= 0x17C5 || // Mc   [8] KHMER VOWEL SIGN OE..KHMER VOWEL SIGN AU
			0x17C7 <= code && code <= 0x17C8 || // Mc   [2] KHMER SIGN REAHMUK..KHMER SIGN YUUKALEAPINTU
			0x1923 <= code && code <= 0x1926 || // Mc   [4] LIMBU VOWEL SIGN EE..LIMBU VOWEL SIGN AU
			0x1929 <= code && code <= 0x192B || // Mc   [3] LIMBU SUBJOINED LETTER YA..LIMBU SUBJOINED LETTER WA
			0x1930 <= code && code <= 0x1931 || // Mc   [2] LIMBU SMALL LETTER KA..LIMBU SMALL LETTER NGA
			0x1933 <= code && code <= 0x1938 || // Mc   [6] LIMBU SMALL LETTER TA..LIMBU SMALL LETTER LA
			0x1A19 <= code && code <= 0x1A1A || // Mc   [2] BUGINESE VOWEL SIGN E..BUGINESE VOWEL SIGN O
			0x1A55 == code || // Mc       TAI THAM CONSONANT SIGN MEDIAL RA
			0x1A57 == code || // Mc       TAI THAM CONSONANT SIGN LA TANG LAI
			0x1A6D <= code && code <= 0x1A72 || // Mc   [6] TAI THAM VOWEL SIGN OY..TAI THAM VOWEL SIGN THAM AI
			0x1B04 == code || // Mc       BALINESE SIGN BISAH
			0x1B35 == code || // Mc       BALINESE VOWEL SIGN TEDUNG
			0x1B3B == code || // Mc       BALINESE VOWEL SIGN RA REPA TEDUNG
			0x1B3D <= code && code <= 0x1B41 || // Mc   [5] BALINESE VOWEL SIGN LA LENGA TEDUNG..BALINESE VOWEL SIGN TALING REPA TEDUNG
			0x1B43 <= code && code <= 0x1B44 || // Mc   [2] BALINESE VOWEL SIGN PEPET TEDUNG..BALINESE ADEG ADEG
			0x1B82 == code || // Mc       SUNDANESE SIGN PANGWISAD
			0x1BA1 == code || // Mc       SUNDANESE CONSONANT SIGN PAMINGKAL
			0x1BA6 <= code && code <= 0x1BA7 || // Mc   [2] SUNDANESE VOWEL SIGN PANAELAENG..SUNDANESE VOWEL SIGN PANOLONG
			0x1BAA == code || // Mc       SUNDANESE SIGN PAMAAEH
			0x1BE7 == code || // Mc       BATAK VOWEL SIGN E
			0x1BEA <= code && code <= 0x1BEC || // Mc   [3] BATAK VOWEL SIGN I..BATAK VOWEL SIGN O
			0x1BEE == code || // Mc       BATAK VOWEL SIGN U
			0x1BF2 <= code && code <= 0x1BF3 || // Mc   [2] BATAK PANGOLAT..BATAK PANONGONAN
			0x1C24 <= code && code <= 0x1C2B || // Mc   [8] LEPCHA SUBJOINED LETTER YA..LEPCHA VOWEL SIGN UU
			0x1C34 <= code && code <= 0x1C35 || // Mc   [2] LEPCHA CONSONANT SIGN NYIN-DO..LEPCHA CONSONANT SIGN KANG
			0x1CE1 == code || // Mc       VEDIC TONE ATHARVAVEDIC INDEPENDENT SVARITA
			0x1CF2 <= code && code <= 0x1CF3 || // Mc   [2] VEDIC SIGN ARDHAVISARGA..VEDIC SIGN ROTATED ARDHAVISARGA
			0x1CF7 == code || // Mc       VEDIC SIGN ATIKRAMA
			0xA823 <= code && code <= 0xA824 || // Mc   [2] SYLOTI NAGRI VOWEL SIGN A..SYLOTI NAGRI VOWEL SIGN I
			0xA827 == code || // Mc       SYLOTI NAGRI VOWEL SIGN OO
			0xA880 <= code && code <= 0xA881 || // Mc   [2] SAURASHTRA SIGN ANUSVARA..SAURASHTRA SIGN VISARGA
			0xA8B4 <= code && code <= 0xA8C3 || // Mc  [16] SAURASHTRA CONSONANT SIGN HAARU..SAURASHTRA VOWEL SIGN AU
			0xA952 <= code && code <= 0xA953 || // Mc   [2] REJANG CONSONANT SIGN H..REJANG VIRAMA
			0xA983 == code || // Mc       JAVANESE SIGN WIGNYAN
			0xA9B4 <= code && code <= 0xA9B5 || // Mc   [2] JAVANESE VOWEL SIGN TARUNG..JAVANESE VOWEL SIGN TOLONG
			0xA9BA <= code && code <= 0xA9BB || // Mc   [2] JAVANESE VOWEL SIGN TALING..JAVANESE VOWEL SIGN DIRGA MURE
			0xA9BD <= code && code <= 0xA9C0 || // Mc   [4] JAVANESE CONSONANT SIGN KERET..JAVANESE PANGKON
			0xAA2F <= code && code <= 0xAA30 || // Mc   [2] CHAM VOWEL SIGN O..CHAM VOWEL SIGN AI
			0xAA33 <= code && code <= 0xAA34 || // Mc   [2] CHAM CONSONANT SIGN YA..CHAM CONSONANT SIGN RA
			0xAA4D == code || // Mc       CHAM CONSONANT SIGN FINAL H
			0xAAEB == code || // Mc       MEETEI MAYEK VOWEL SIGN II
			0xAAEE <= code && code <= 0xAAEF || // Mc   [2] MEETEI MAYEK VOWEL SIGN AU..MEETEI MAYEK VOWEL SIGN AAU
			0xAAF5 == code || // Mc       MEETEI MAYEK VOWEL SIGN VISARGA
			0xABE3 <= code && code <= 0xABE4 || // Mc   [2] MEETEI MAYEK VOWEL SIGN ONAP..MEETEI MAYEK VOWEL SIGN INAP
			0xABE6 <= code && code <= 0xABE7 || // Mc   [2] MEETEI MAYEK VOWEL SIGN YENAP..MEETEI MAYEK VOWEL SIGN SOUNAP
			0xABE9 <= code && code <= 0xABEA || // Mc   [2] MEETEI MAYEK VOWEL SIGN CHEINAP..MEETEI MAYEK VOWEL SIGN NUNG
			0xABEC == code || // Mc       MEETEI MAYEK LUM IYEK
			0x11000 == code || // Mc       BRAHMI SIGN CANDRABINDU
			0x11002 == code || // Mc       BRAHMI SIGN VISARGA
			0x11082 == code || // Mc       KAITHI SIGN VISARGA
			0x110B0 <= code && code <= 0x110B2 || // Mc   [3] KAITHI VOWEL SIGN AA..KAITHI VOWEL SIGN II
			0x110B7 <= code && code <= 0x110B8 || // Mc   [2] KAITHI VOWEL SIGN O..KAITHI VOWEL SIGN AU
			0x1112C == code || // Mc       CHAKMA VOWEL SIGN E
			0x11182 == code || // Mc       SHARADA SIGN VISARGA
			0x111B3 <= code && code <= 0x111B5 || // Mc   [3] SHARADA VOWEL SIGN AA..SHARADA VOWEL SIGN II
			0x111BF <= code && code <= 0x111C0 || // Mc   [2] SHARADA VOWEL SIGN AU..SHARADA SIGN VIRAMA
			0x1122C <= code && code <= 0x1122E || // Mc   [3] KHOJKI VOWEL SIGN AA..KHOJKI VOWEL SIGN II
			0x11232 <= code && code <= 0x11233 || // Mc   [2] KHOJKI VOWEL SIGN O..KHOJKI VOWEL SIGN AU
			0x11235 == code || // Mc       KHOJKI SIGN VIRAMA
			0x112E0 <= code && code <= 0x112E2 || // Mc   [3] KHUDAWADI VOWEL SIGN AA..KHUDAWADI VOWEL SIGN II
			0x11302 <= code && code <= 0x11303 || // Mc   [2] GRANTHA SIGN ANUSVARA..GRANTHA SIGN VISARGA
			0x1133F == code || // Mc       GRANTHA VOWEL SIGN I
			0x11341 <= code && code <= 0x11344 || // Mc   [4] GRANTHA VOWEL SIGN U..GRANTHA VOWEL SIGN VOCALIC RR
			0x11347 <= code && code <= 0x11348 || // Mc   [2] GRANTHA VOWEL SIGN EE..GRANTHA VOWEL SIGN AI
			0x1134B <= code && code <= 0x1134D || // Mc   [3] GRANTHA VOWEL SIGN OO..GRANTHA SIGN VIRAMA
			0x11362 <= code && code <= 0x11363 || // Mc   [2] GRANTHA VOWEL SIGN VOCALIC L..GRANTHA VOWEL SIGN VOCALIC LL
			0x11435 <= code && code <= 0x11437 || // Mc   [3] NEWA VOWEL SIGN AA..NEWA VOWEL SIGN II
			0x11440 <= code && code <= 0x11441 || // Mc   [2] NEWA VOWEL SIGN O..NEWA VOWEL SIGN AU
			0x11445 == code || // Mc       NEWA SIGN VISARGA
			0x114B1 <= code && code <= 0x114B2 || // Mc   [2] TIRHUTA VOWEL SIGN I..TIRHUTA VOWEL SIGN II
			0x114B9 == code || // Mc       TIRHUTA VOWEL SIGN E
			0x114BB <= code && code <= 0x114BC || // Mc   [2] TIRHUTA VOWEL SIGN AI..TIRHUTA VOWEL SIGN O
			0x114BE == code || // Mc       TIRHUTA VOWEL SIGN AU
			0x114C1 == code || // Mc       TIRHUTA SIGN VISARGA
			0x115B0 <= code && code <= 0x115B1 || // Mc   [2] SIDDHAM VOWEL SIGN I..SIDDHAM VOWEL SIGN II
			0x115B8 <= code && code <= 0x115BB || // Mc   [4] SIDDHAM VOWEL SIGN E..SIDDHAM VOWEL SIGN AU
			0x115BE == code || // Mc       SIDDHAM SIGN VISARGA
			0x11630 <= code && code <= 0x11632 || // Mc   [3] MODI VOWEL SIGN AA..MODI VOWEL SIGN II
			0x1163B <= code && code <= 0x1163C || // Mc   [2] MODI VOWEL SIGN O..MODI VOWEL SIGN AU
			0x1163E == code || // Mc       MODI SIGN VISARGA
			0x116AC == code || // Mc       TAKRI SIGN VISARGA
			0x116AE <= code && code <= 0x116AF || // Mc   [2] TAKRI VOWEL SIGN I..TAKRI VOWEL SIGN II
			0x116B6 == code || // Mc       TAKRI SIGN VIRAMA
			0x11720 <= code && code <= 0x11721 || // Mc   [2] AHOM VOWEL SIGN A..AHOM VOWEL SIGN AA
			0x11726 == code || // Mc       AHOM VOWEL SIGN E
			0x11A07 <= code && code <= 0x11A08 || // Mc   [2] ZANABAZAR SQUARE VOWEL SIGN AI..ZANABAZAR SQUARE VOWEL SIGN AU
			0x11A39 == code || // Mc       ZANABAZAR SQUARE SIGN VISARGA
			0x11A57 <= code && code <= 0x11A58 || // Mc   [2] SOYOMBO VOWEL SIGN AI..SOYOMBO VOWEL SIGN AU
			0x11A97 == code || // Mc       SOYOMBO SIGN VISARGA
			0x11C2F == code || // Mc       BHAIKSUKI VOWEL SIGN AA
			0x11C3E == code || // Mc       BHAIKSUKI SIGN VISARGA
			0x11CA9 == code || // Mc       MARCHEN SUBJOINED LETTER YA
			0x11CB1 == code || // Mc       MARCHEN VOWEL SIGN I
			0x11CB4 == code || // Mc       MARCHEN VOWEL SIGN O
			0x16F51 <= code && code <= 0x16F7E || // Mc  [46] MIAO SIGN ASPIRATION..MIAO VOWEL SIGN NG
			0x1D166 == code || // Mc       MUSICAL SYMBOL COMBINING SPRECHGESANG STEM
			0x1D16D == code // Mc       MUSICAL SYMBOL COMBINING AUGMENTATION DOT
			) {
					return SpacingMark;
				}

			if (0x1100 <= code && code <= 0x115F || // Lo  [96] HANGUL CHOSEONG KIYEOK..HANGUL CHOSEONG FILLER
			0xA960 <= code && code <= 0xA97C // Lo  [29] HANGUL CHOSEONG TIKEUT-MIEUM..HANGUL CHOSEONG SSANGYEORINHIEUH
			) {
					return L;
				}

			if (0x1160 <= code && code <= 0x11A7 || // Lo  [72] HANGUL JUNGSEONG FILLER..HANGUL JUNGSEONG O-YAE
			0xD7B0 <= code && code <= 0xD7C6 // Lo  [23] HANGUL JUNGSEONG O-YEO..HANGUL JUNGSEONG ARAEA-E
			) {
					return V;
				}

			if (0x11A8 <= code && code <= 0x11FF || // Lo  [88] HANGUL JONGSEONG KIYEOK..HANGUL JONGSEONG SSANGNIEUN
			0xD7CB <= code && code <= 0xD7FB // Lo  [49] HANGUL JONGSEONG NIEUN-RIEUL..HANGUL JONGSEONG PHIEUPH-THIEUTH
			) {
					return T;
				}

			if (0xAC00 == code || // Lo       HANGUL SYLLABLE GA
			0xAC1C == code || // Lo       HANGUL SYLLABLE GAE
			0xAC38 == code || // Lo       HANGUL SYLLABLE GYA
			0xAC54 == code || // Lo       HANGUL SYLLABLE GYAE
			0xAC70 == code || // Lo       HANGUL SYLLABLE GEO
			0xAC8C == code || // Lo       HANGUL SYLLABLE GE
			0xACA8 == code || // Lo       HANGUL SYLLABLE GYEO
			0xACC4 == code || // Lo       HANGUL SYLLABLE GYE
			0xACE0 == code || // Lo       HANGUL SYLLABLE GO
			0xACFC == code || // Lo       HANGUL SYLLABLE GWA
			0xAD18 == code || // Lo       HANGUL SYLLABLE GWAE
			0xAD34 == code || // Lo       HANGUL SYLLABLE GOE
			0xAD50 == code || // Lo       HANGUL SYLLABLE GYO
			0xAD6C == code || // Lo       HANGUL SYLLABLE GU
			0xAD88 == code || // Lo       HANGUL SYLLABLE GWEO
			0xADA4 == code || // Lo       HANGUL SYLLABLE GWE
			0xADC0 == code || // Lo       HANGUL SYLLABLE GWI
			0xADDC == code || // Lo       HANGUL SYLLABLE GYU
			0xADF8 == code || // Lo       HANGUL SYLLABLE GEU
			0xAE14 == code || // Lo       HANGUL SYLLABLE GYI
			0xAE30 == code || // Lo       HANGUL SYLLABLE GI
			0xAE4C == code || // Lo       HANGUL SYLLABLE GGA
			0xAE68 == code || // Lo       HANGUL SYLLABLE GGAE
			0xAE84 == code || // Lo       HANGUL SYLLABLE GGYA
			0xAEA0 == code || // Lo       HANGUL SYLLABLE GGYAE
			0xAEBC == code || // Lo       HANGUL SYLLABLE GGEO
			0xAED8 == code || // Lo       HANGUL SYLLABLE GGE
			0xAEF4 == code || // Lo       HANGUL SYLLABLE GGYEO
			0xAF10 == code || // Lo       HANGUL SYLLABLE GGYE
			0xAF2C == code || // Lo       HANGUL SYLLABLE GGO
			0xAF48 == code || // Lo       HANGUL SYLLABLE GGWA
			0xAF64 == code || // Lo       HANGUL SYLLABLE GGWAE
			0xAF80 == code || // Lo       HANGUL SYLLABLE GGOE
			0xAF9C == code || // Lo       HANGUL SYLLABLE GGYO
			0xAFB8 == code || // Lo       HANGUL SYLLABLE GGU
			0xAFD4 == code || // Lo       HANGUL SYLLABLE GGWEO
			0xAFF0 == code || // Lo       HANGUL SYLLABLE GGWE
			0xB00C == code || // Lo       HANGUL SYLLABLE GGWI
			0xB028 == code || // Lo       HANGUL SYLLABLE GGYU
			0xB044 == code || // Lo       HANGUL SYLLABLE GGEU
			0xB060 == code || // Lo       HANGUL SYLLABLE GGYI
			0xB07C == code || // Lo       HANGUL SYLLABLE GGI
			0xB098 == code || // Lo       HANGUL SYLLABLE NA
			0xB0B4 == code || // Lo       HANGUL SYLLABLE NAE
			0xB0D0 == code || // Lo       HANGUL SYLLABLE NYA
			0xB0EC == code || // Lo       HANGUL SYLLABLE NYAE
			0xB108 == code || // Lo       HANGUL SYLLABLE NEO
			0xB124 == code || // Lo       HANGUL SYLLABLE NE
			0xB140 == code || // Lo       HANGUL SYLLABLE NYEO
			0xB15C == code || // Lo       HANGUL SYLLABLE NYE
			0xB178 == code || // Lo       HANGUL SYLLABLE NO
			0xB194 == code || // Lo       HANGUL SYLLABLE NWA
			0xB1B0 == code || // Lo       HANGUL SYLLABLE NWAE
			0xB1CC == code || // Lo       HANGUL SYLLABLE NOE
			0xB1E8 == code || // Lo       HANGUL SYLLABLE NYO
			0xB204 == code || // Lo       HANGUL SYLLABLE NU
			0xB220 == code || // Lo       HANGUL SYLLABLE NWEO
			0xB23C == code || // Lo       HANGUL SYLLABLE NWE
			0xB258 == code || // Lo       HANGUL SYLLABLE NWI
			0xB274 == code || // Lo       HANGUL SYLLABLE NYU
			0xB290 == code || // Lo       HANGUL SYLLABLE NEU
			0xB2AC == code || // Lo       HANGUL SYLLABLE NYI
			0xB2C8 == code || // Lo       HANGUL SYLLABLE NI
			0xB2E4 == code || // Lo       HANGUL SYLLABLE DA
			0xB300 == code || // Lo       HANGUL SYLLABLE DAE
			0xB31C == code || // Lo       HANGUL SYLLABLE DYA
			0xB338 == code || // Lo       HANGUL SYLLABLE DYAE
			0xB354 == code || // Lo       HANGUL SYLLABLE DEO
			0xB370 == code || // Lo       HANGUL SYLLABLE DE
			0xB38C == code || // Lo       HANGUL SYLLABLE DYEO
			0xB3A8 == code || // Lo       HANGUL SYLLABLE DYE
			0xB3C4 == code || // Lo       HANGUL SYLLABLE DO
			0xB3E0 == code || // Lo       HANGUL SYLLABLE DWA
			0xB3FC == code || // Lo       HANGUL SYLLABLE DWAE
			0xB418 == code || // Lo       HANGUL SYLLABLE DOE
			0xB434 == code || // Lo       HANGUL SYLLABLE DYO
			0xB450 == code || // Lo       HANGUL SYLLABLE DU
			0xB46C == code || // Lo       HANGUL SYLLABLE DWEO
			0xB488 == code || // Lo       HANGUL SYLLABLE DWE
			0xB4A4 == code || // Lo       HANGUL SYLLABLE DWI
			0xB4C0 == code || // Lo       HANGUL SYLLABLE DYU
			0xB4DC == code || // Lo       HANGUL SYLLABLE DEU
			0xB4F8 == code || // Lo       HANGUL SYLLABLE DYI
			0xB514 == code || // Lo       HANGUL SYLLABLE DI
			0xB530 == code || // Lo       HANGUL SYLLABLE DDA
			0xB54C == code || // Lo       HANGUL SYLLABLE DDAE
			0xB568 == code || // Lo       HANGUL SYLLABLE DDYA
			0xB584 == code || // Lo       HANGUL SYLLABLE DDYAE
			0xB5A0 == code || // Lo       HANGUL SYLLABLE DDEO
			0xB5BC == code || // Lo       HANGUL SYLLABLE DDE
			0xB5D8 == code || // Lo       HANGUL SYLLABLE DDYEO
			0xB5F4 == code || // Lo       HANGUL SYLLABLE DDYE
			0xB610 == code || // Lo       HANGUL SYLLABLE DDO
			0xB62C == code || // Lo       HANGUL SYLLABLE DDWA
			0xB648 == code || // Lo       HANGUL SYLLABLE DDWAE
			0xB664 == code || // Lo       HANGUL SYLLABLE DDOE
			0xB680 == code || // Lo       HANGUL SYLLABLE DDYO
			0xB69C == code || // Lo       HANGUL SYLLABLE DDU
			0xB6B8 == code || // Lo       HANGUL SYLLABLE DDWEO
			0xB6D4 == code || // Lo       HANGUL SYLLABLE DDWE
			0xB6F0 == code || // Lo       HANGUL SYLLABLE DDWI
			0xB70C == code || // Lo       HANGUL SYLLABLE DDYU
			0xB728 == code || // Lo       HANGUL SYLLABLE DDEU
			0xB744 == code || // Lo       HANGUL SYLLABLE DDYI
			0xB760 == code || // Lo       HANGUL SYLLABLE DDI
			0xB77C == code || // Lo       HANGUL SYLLABLE RA
			0xB798 == code || // Lo       HANGUL SYLLABLE RAE
			0xB7B4 == code || // Lo       HANGUL SYLLABLE RYA
			0xB7D0 == code || // Lo       HANGUL SYLLABLE RYAE
			0xB7EC == code || // Lo       HANGUL SYLLABLE REO
			0xB808 == code || // Lo       HANGUL SYLLABLE RE
			0xB824 == code || // Lo       HANGUL SYLLABLE RYEO
			0xB840 == code || // Lo       HANGUL SYLLABLE RYE
			0xB85C == code || // Lo       HANGUL SYLLABLE RO
			0xB878 == code || // Lo       HANGUL SYLLABLE RWA
			0xB894 == code || // Lo       HANGUL SYLLABLE RWAE
			0xB8B0 == code || // Lo       HANGUL SYLLABLE ROE
			0xB8CC == code || // Lo       HANGUL SYLLABLE RYO
			0xB8E8 == code || // Lo       HANGUL SYLLABLE RU
			0xB904 == code || // Lo       HANGUL SYLLABLE RWEO
			0xB920 == code || // Lo       HANGUL SYLLABLE RWE
			0xB93C == code || // Lo       HANGUL SYLLABLE RWI
			0xB958 == code || // Lo       HANGUL SYLLABLE RYU
			0xB974 == code || // Lo       HANGUL SYLLABLE REU
			0xB990 == code || // Lo       HANGUL SYLLABLE RYI
			0xB9AC == code || // Lo       HANGUL SYLLABLE RI
			0xB9C8 == code || // Lo       HANGUL SYLLABLE MA
			0xB9E4 == code || // Lo       HANGUL SYLLABLE MAE
			0xBA00 == code || // Lo       HANGUL SYLLABLE MYA
			0xBA1C == code || // Lo       HANGUL SYLLABLE MYAE
			0xBA38 == code || // Lo       HANGUL SYLLABLE MEO
			0xBA54 == code || // Lo       HANGUL SYLLABLE ME
			0xBA70 == code || // Lo       HANGUL SYLLABLE MYEO
			0xBA8C == code || // Lo       HANGUL SYLLABLE MYE
			0xBAA8 == code || // Lo       HANGUL SYLLABLE MO
			0xBAC4 == code || // Lo       HANGUL SYLLABLE MWA
			0xBAE0 == code || // Lo       HANGUL SYLLABLE MWAE
			0xBAFC == code || // Lo       HANGUL SYLLABLE MOE
			0xBB18 == code || // Lo       HANGUL SYLLABLE MYO
			0xBB34 == code || // Lo       HANGUL SYLLABLE MU
			0xBB50 == code || // Lo       HANGUL SYLLABLE MWEO
			0xBB6C == code || // Lo       HANGUL SYLLABLE MWE
			0xBB88 == code || // Lo       HANGUL SYLLABLE MWI
			0xBBA4 == code || // Lo       HANGUL SYLLABLE MYU
			0xBBC0 == code || // Lo       HANGUL SYLLABLE MEU
			0xBBDC == code || // Lo       HANGUL SYLLABLE MYI
			0xBBF8 == code || // Lo       HANGUL SYLLABLE MI
			0xBC14 == code || // Lo       HANGUL SYLLABLE BA
			0xBC30 == code || // Lo       HANGUL SYLLABLE BAE
			0xBC4C == code || // Lo       HANGUL SYLLABLE BYA
			0xBC68 == code || // Lo       HANGUL SYLLABLE BYAE
			0xBC84 == code || // Lo       HANGUL SYLLABLE BEO
			0xBCA0 == code || // Lo       HANGUL SYLLABLE BE
			0xBCBC == code || // Lo       HANGUL SYLLABLE BYEO
			0xBCD8 == code || // Lo       HANGUL SYLLABLE BYE
			0xBCF4 == code || // Lo       HANGUL SYLLABLE BO
			0xBD10 == code || // Lo       HANGUL SYLLABLE BWA
			0xBD2C == code || // Lo       HANGUL SYLLABLE BWAE
			0xBD48 == code || // Lo       HANGUL SYLLABLE BOE
			0xBD64 == code || // Lo       HANGUL SYLLABLE BYO
			0xBD80 == code || // Lo       HANGUL SYLLABLE BU
			0xBD9C == code || // Lo       HANGUL SYLLABLE BWEO
			0xBDB8 == code || // Lo       HANGUL SYLLABLE BWE
			0xBDD4 == code || // Lo       HANGUL SYLLABLE BWI
			0xBDF0 == code || // Lo       HANGUL SYLLABLE BYU
			0xBE0C == code || // Lo       HANGUL SYLLABLE BEU
			0xBE28 == code || // Lo       HANGUL SYLLABLE BYI
			0xBE44 == code || // Lo       HANGUL SYLLABLE BI
			0xBE60 == code || // Lo       HANGUL SYLLABLE BBA
			0xBE7C == code || // Lo       HANGUL SYLLABLE BBAE
			0xBE98 == code || // Lo       HANGUL SYLLABLE BBYA
			0xBEB4 == code || // Lo       HANGUL SYLLABLE BBYAE
			0xBED0 == code || // Lo       HANGUL SYLLABLE BBEO
			0xBEEC == code || // Lo       HANGUL SYLLABLE BBE
			0xBF08 == code || // Lo       HANGUL SYLLABLE BBYEO
			0xBF24 == code || // Lo       HANGUL SYLLABLE BBYE
			0xBF40 == code || // Lo       HANGUL SYLLABLE BBO
			0xBF5C == code || // Lo       HANGUL SYLLABLE BBWA
			0xBF78 == code || // Lo       HANGUL SYLLABLE BBWAE
			0xBF94 == code || // Lo       HANGUL SYLLABLE BBOE
			0xBFB0 == code || // Lo       HANGUL SYLLABLE BBYO
			0xBFCC == code || // Lo       HANGUL SYLLABLE BBU
			0xBFE8 == code || // Lo       HANGUL SYLLABLE BBWEO
			0xC004 == code || // Lo       HANGUL SYLLABLE BBWE
			0xC020 == code || // Lo       HANGUL SYLLABLE BBWI
			0xC03C == code || // Lo       HANGUL SYLLABLE BBYU
			0xC058 == code || // Lo       HANGUL SYLLABLE BBEU
			0xC074 == code || // Lo       HANGUL SYLLABLE BBYI
			0xC090 == code || // Lo       HANGUL SYLLABLE BBI
			0xC0AC == code || // Lo       HANGUL SYLLABLE SA
			0xC0C8 == code || // Lo       HANGUL SYLLABLE SAE
			0xC0E4 == code || // Lo       HANGUL SYLLABLE SYA
			0xC100 == code || // Lo       HANGUL SYLLABLE SYAE
			0xC11C == code || // Lo       HANGUL SYLLABLE SEO
			0xC138 == code || // Lo       HANGUL SYLLABLE SE
			0xC154 == code || // Lo       HANGUL SYLLABLE SYEO
			0xC170 == code || // Lo       HANGUL SYLLABLE SYE
			0xC18C == code || // Lo       HANGUL SYLLABLE SO
			0xC1A8 == code || // Lo       HANGUL SYLLABLE SWA
			0xC1C4 == code || // Lo       HANGUL SYLLABLE SWAE
			0xC1E0 == code || // Lo       HANGUL SYLLABLE SOE
			0xC1FC == code || // Lo       HANGUL SYLLABLE SYO
			0xC218 == code || // Lo       HANGUL SYLLABLE SU
			0xC234 == code || // Lo       HANGUL SYLLABLE SWEO
			0xC250 == code || // Lo       HANGUL SYLLABLE SWE
			0xC26C == code || // Lo       HANGUL SYLLABLE SWI
			0xC288 == code || // Lo       HANGUL SYLLABLE SYU
			0xC2A4 == code || // Lo       HANGUL SYLLABLE SEU
			0xC2C0 == code || // Lo       HANGUL SYLLABLE SYI
			0xC2DC == code || // Lo       HANGUL SYLLABLE SI
			0xC2F8 == code || // Lo       HANGUL SYLLABLE SSA
			0xC314 == code || // Lo       HANGUL SYLLABLE SSAE
			0xC330 == code || // Lo       HANGUL SYLLABLE SSYA
			0xC34C == code || // Lo       HANGUL SYLLABLE SSYAE
			0xC368 == code || // Lo       HANGUL SYLLABLE SSEO
			0xC384 == code || // Lo       HANGUL SYLLABLE SSE
			0xC3A0 == code || // Lo       HANGUL SYLLABLE SSYEO
			0xC3BC == code || // Lo       HANGUL SYLLABLE SSYE
			0xC3D8 == code || // Lo       HANGUL SYLLABLE SSO
			0xC3F4 == code || // Lo       HANGUL SYLLABLE SSWA
			0xC410 == code || // Lo       HANGUL SYLLABLE SSWAE
			0xC42C == code || // Lo       HANGUL SYLLABLE SSOE
			0xC448 == code || // Lo       HANGUL SYLLABLE SSYO
			0xC464 == code || // Lo       HANGUL SYLLABLE SSU
			0xC480 == code || // Lo       HANGUL SYLLABLE SSWEO
			0xC49C == code || // Lo       HANGUL SYLLABLE SSWE
			0xC4B8 == code || // Lo       HANGUL SYLLABLE SSWI
			0xC4D4 == code || // Lo       HANGUL SYLLABLE SSYU
			0xC4F0 == code || // Lo       HANGUL SYLLABLE SSEU
			0xC50C == code || // Lo       HANGUL SYLLABLE SSYI
			0xC528 == code || // Lo       HANGUL SYLLABLE SSI
			0xC544 == code || // Lo       HANGUL SYLLABLE A
			0xC560 == code || // Lo       HANGUL SYLLABLE AE
			0xC57C == code || // Lo       HANGUL SYLLABLE YA
			0xC598 == code || // Lo       HANGUL SYLLABLE YAE
			0xC5B4 == code || // Lo       HANGUL SYLLABLE EO
			0xC5D0 == code || // Lo       HANGUL SYLLABLE E
			0xC5EC == code || // Lo       HANGUL SYLLABLE YEO
			0xC608 == code || // Lo       HANGUL SYLLABLE YE
			0xC624 == code || // Lo       HANGUL SYLLABLE O
			0xC640 == code || // Lo       HANGUL SYLLABLE WA
			0xC65C == code || // Lo       HANGUL SYLLABLE WAE
			0xC678 == code || // Lo       HANGUL SYLLABLE OE
			0xC694 == code || // Lo       HANGUL SYLLABLE YO
			0xC6B0 == code || // Lo       HANGUL SYLLABLE U
			0xC6CC == code || // Lo       HANGUL SYLLABLE WEO
			0xC6E8 == code || // Lo       HANGUL SYLLABLE WE
			0xC704 == code || // Lo       HANGUL SYLLABLE WI
			0xC720 == code || // Lo       HANGUL SYLLABLE YU
			0xC73C == code || // Lo       HANGUL SYLLABLE EU
			0xC758 == code || // Lo       HANGUL SYLLABLE YI
			0xC774 == code || // Lo       HANGUL SYLLABLE I
			0xC790 == code || // Lo       HANGUL SYLLABLE JA
			0xC7AC == code || // Lo       HANGUL SYLLABLE JAE
			0xC7C8 == code || // Lo       HANGUL SYLLABLE JYA
			0xC7E4 == code || // Lo       HANGUL SYLLABLE JYAE
			0xC800 == code || // Lo       HANGUL SYLLABLE JEO
			0xC81C == code || // Lo       HANGUL SYLLABLE JE
			0xC838 == code || // Lo       HANGUL SYLLABLE JYEO
			0xC854 == code || // Lo       HANGUL SYLLABLE JYE
			0xC870 == code || // Lo       HANGUL SYLLABLE JO
			0xC88C == code || // Lo       HANGUL SYLLABLE JWA
			0xC8A8 == code || // Lo       HANGUL SYLLABLE JWAE
			0xC8C4 == code || // Lo       HANGUL SYLLABLE JOE
			0xC8E0 == code || // Lo       HANGUL SYLLABLE JYO
			0xC8FC == code || // Lo       HANGUL SYLLABLE JU
			0xC918 == code || // Lo       HANGUL SYLLABLE JWEO
			0xC934 == code || // Lo       HANGUL SYLLABLE JWE
			0xC950 == code || // Lo       HANGUL SYLLABLE JWI
			0xC96C == code || // Lo       HANGUL SYLLABLE JYU
			0xC988 == code || // Lo       HANGUL SYLLABLE JEU
			0xC9A4 == code || // Lo       HANGUL SYLLABLE JYI
			0xC9C0 == code || // Lo       HANGUL SYLLABLE JI
			0xC9DC == code || // Lo       HANGUL SYLLABLE JJA
			0xC9F8 == code || // Lo       HANGUL SYLLABLE JJAE
			0xCA14 == code || // Lo       HANGUL SYLLABLE JJYA
			0xCA30 == code || // Lo       HANGUL SYLLABLE JJYAE
			0xCA4C == code || // Lo       HANGUL SYLLABLE JJEO
			0xCA68 == code || // Lo       HANGUL SYLLABLE JJE
			0xCA84 == code || // Lo       HANGUL SYLLABLE JJYEO
			0xCAA0 == code || // Lo       HANGUL SYLLABLE JJYE
			0xCABC == code || // Lo       HANGUL SYLLABLE JJO
			0xCAD8 == code || // Lo       HANGUL SYLLABLE JJWA
			0xCAF4 == code || // Lo       HANGUL SYLLABLE JJWAE
			0xCB10 == code || // Lo       HANGUL SYLLABLE JJOE
			0xCB2C == code || // Lo       HANGUL SYLLABLE JJYO
			0xCB48 == code || // Lo       HANGUL SYLLABLE JJU
			0xCB64 == code || // Lo       HANGUL SYLLABLE JJWEO
			0xCB80 == code || // Lo       HANGUL SYLLABLE JJWE
			0xCB9C == code || // Lo       HANGUL SYLLABLE JJWI
			0xCBB8 == code || // Lo       HANGUL SYLLABLE JJYU
			0xCBD4 == code || // Lo       HANGUL SYLLABLE JJEU
			0xCBF0 == code || // Lo       HANGUL SYLLABLE JJYI
			0xCC0C == code || // Lo       HANGUL SYLLABLE JJI
			0xCC28 == code || // Lo       HANGUL SYLLABLE CA
			0xCC44 == code || // Lo       HANGUL SYLLABLE CAE
			0xCC60 == code || // Lo       HANGUL SYLLABLE CYA
			0xCC7C == code || // Lo       HANGUL SYLLABLE CYAE
			0xCC98 == code || // Lo       HANGUL SYLLABLE CEO
			0xCCB4 == code || // Lo       HANGUL SYLLABLE CE
			0xCCD0 == code || // Lo       HANGUL SYLLABLE CYEO
			0xCCEC == code || // Lo       HANGUL SYLLABLE CYE
			0xCD08 == code || // Lo       HANGUL SYLLABLE CO
			0xCD24 == code || // Lo       HANGUL SYLLABLE CWA
			0xCD40 == code || // Lo       HANGUL SYLLABLE CWAE
			0xCD5C == code || // Lo       HANGUL SYLLABLE COE
			0xCD78 == code || // Lo       HANGUL SYLLABLE CYO
			0xCD94 == code || // Lo       HANGUL SYLLABLE CU
			0xCDB0 == code || // Lo       HANGUL SYLLABLE CWEO
			0xCDCC == code || // Lo       HANGUL SYLLABLE CWE
			0xCDE8 == code || // Lo       HANGUL SYLLABLE CWI
			0xCE04 == code || // Lo       HANGUL SYLLABLE CYU
			0xCE20 == code || // Lo       HANGUL SYLLABLE CEU
			0xCE3C == code || // Lo       HANGUL SYLLABLE CYI
			0xCE58 == code || // Lo       HANGUL SYLLABLE CI
			0xCE74 == code || // Lo       HANGUL SYLLABLE KA
			0xCE90 == code || // Lo       HANGUL SYLLABLE KAE
			0xCEAC == code || // Lo       HANGUL SYLLABLE KYA
			0xCEC8 == code || // Lo       HANGUL SYLLABLE KYAE
			0xCEE4 == code || // Lo       HANGUL SYLLABLE KEO
			0xCF00 == code || // Lo       HANGUL SYLLABLE KE
			0xCF1C == code || // Lo       HANGUL SYLLABLE KYEO
			0xCF38 == code || // Lo       HANGUL SYLLABLE KYE
			0xCF54 == code || // Lo       HANGUL SYLLABLE KO
			0xCF70 == code || // Lo       HANGUL SYLLABLE KWA
			0xCF8C == code || // Lo       HANGUL SYLLABLE KWAE
			0xCFA8 == code || // Lo       HANGUL SYLLABLE KOE
			0xCFC4 == code || // Lo       HANGUL SYLLABLE KYO
			0xCFE0 == code || // Lo       HANGUL SYLLABLE KU
			0xCFFC == code || // Lo       HANGUL SYLLABLE KWEO
			0xD018 == code || // Lo       HANGUL SYLLABLE KWE
			0xD034 == code || // Lo       HANGUL SYLLABLE KWI
			0xD050 == code || // Lo       HANGUL SYLLABLE KYU
			0xD06C == code || // Lo       HANGUL SYLLABLE KEU
			0xD088 == code || // Lo       HANGUL SYLLABLE KYI
			0xD0A4 == code || // Lo       HANGUL SYLLABLE KI
			0xD0C0 == code || // Lo       HANGUL SYLLABLE TA
			0xD0DC == code || // Lo       HANGUL SYLLABLE TAE
			0xD0F8 == code || // Lo       HANGUL SYLLABLE TYA
			0xD114 == code || // Lo       HANGUL SYLLABLE TYAE
			0xD130 == code || // Lo       HANGUL SYLLABLE TEO
			0xD14C == code || // Lo       HANGUL SYLLABLE TE
			0xD168 == code || // Lo       HANGUL SYLLABLE TYEO
			0xD184 == code || // Lo       HANGUL SYLLABLE TYE
			0xD1A0 == code || // Lo       HANGUL SYLLABLE TO
			0xD1BC == code || // Lo       HANGUL SYLLABLE TWA
			0xD1D8 == code || // Lo       HANGUL SYLLABLE TWAE
			0xD1F4 == code || // Lo       HANGUL SYLLABLE TOE
			0xD210 == code || // Lo       HANGUL SYLLABLE TYO
			0xD22C == code || // Lo       HANGUL SYLLABLE TU
			0xD248 == code || // Lo       HANGUL SYLLABLE TWEO
			0xD264 == code || // Lo       HANGUL SYLLABLE TWE
			0xD280 == code || // Lo       HANGUL SYLLABLE TWI
			0xD29C == code || // Lo       HANGUL SYLLABLE TYU
			0xD2B8 == code || // Lo       HANGUL SYLLABLE TEU
			0xD2D4 == code || // Lo       HANGUL SYLLABLE TYI
			0xD2F0 == code || // Lo       HANGUL SYLLABLE TI
			0xD30C == code || // Lo       HANGUL SYLLABLE PA
			0xD328 == code || // Lo       HANGUL SYLLABLE PAE
			0xD344 == code || // Lo       HANGUL SYLLABLE PYA
			0xD360 == code || // Lo       HANGUL SYLLABLE PYAE
			0xD37C == code || // Lo       HANGUL SYLLABLE PEO
			0xD398 == code || // Lo       HANGUL SYLLABLE PE
			0xD3B4 == code || // Lo       HANGUL SYLLABLE PYEO
			0xD3D0 == code || // Lo       HANGUL SYLLABLE PYE
			0xD3EC == code || // Lo       HANGUL SYLLABLE PO
			0xD408 == code || // Lo       HANGUL SYLLABLE PWA
			0xD424 == code || // Lo       HANGUL SYLLABLE PWAE
			0xD440 == code || // Lo       HANGUL SYLLABLE POE
			0xD45C == code || // Lo       HANGUL SYLLABLE PYO
			0xD478 == code || // Lo       HANGUL SYLLABLE PU
			0xD494 == code || // Lo       HANGUL SYLLABLE PWEO
			0xD4B0 == code || // Lo       HANGUL SYLLABLE PWE
			0xD4CC == code || // Lo       HANGUL SYLLABLE PWI
			0xD4E8 == code || // Lo       HANGUL SYLLABLE PYU
			0xD504 == code || // Lo       HANGUL SYLLABLE PEU
			0xD520 == code || // Lo       HANGUL SYLLABLE PYI
			0xD53C == code || // Lo       HANGUL SYLLABLE PI
			0xD558 == code || // Lo       HANGUL SYLLABLE HA
			0xD574 == code || // Lo       HANGUL SYLLABLE HAE
			0xD590 == code || // Lo       HANGUL SYLLABLE HYA
			0xD5AC == code || // Lo       HANGUL SYLLABLE HYAE
			0xD5C8 == code || // Lo       HANGUL SYLLABLE HEO
			0xD5E4 == code || // Lo       HANGUL SYLLABLE HE
			0xD600 == code || // Lo       HANGUL SYLLABLE HYEO
			0xD61C == code || // Lo       HANGUL SYLLABLE HYE
			0xD638 == code || // Lo       HANGUL SYLLABLE HO
			0xD654 == code || // Lo       HANGUL SYLLABLE HWA
			0xD670 == code || // Lo       HANGUL SYLLABLE HWAE
			0xD68C == code || // Lo       HANGUL SYLLABLE HOE
			0xD6A8 == code || // Lo       HANGUL SYLLABLE HYO
			0xD6C4 == code || // Lo       HANGUL SYLLABLE HU
			0xD6E0 == code || // Lo       HANGUL SYLLABLE HWEO
			0xD6FC == code || // Lo       HANGUL SYLLABLE HWE
			0xD718 == code || // Lo       HANGUL SYLLABLE HWI
			0xD734 == code || // Lo       HANGUL SYLLABLE HYU
			0xD750 == code || // Lo       HANGUL SYLLABLE HEU
			0xD76C == code || // Lo       HANGUL SYLLABLE HYI
			0xD788 == code // Lo       HANGUL SYLLABLE HI
			) {
					return LV;
				}

			if (0xAC01 <= code && code <= 0xAC1B || // Lo  [27] HANGUL SYLLABLE GAG..HANGUL SYLLABLE GAH
			0xAC1D <= code && code <= 0xAC37 || // Lo  [27] HANGUL SYLLABLE GAEG..HANGUL SYLLABLE GAEH
			0xAC39 <= code && code <= 0xAC53 || // Lo  [27] HANGUL SYLLABLE GYAG..HANGUL SYLLABLE GYAH
			0xAC55 <= code && code <= 0xAC6F || // Lo  [27] HANGUL SYLLABLE GYAEG..HANGUL SYLLABLE GYAEH
			0xAC71 <= code && code <= 0xAC8B || // Lo  [27] HANGUL SYLLABLE GEOG..HANGUL SYLLABLE GEOH
			0xAC8D <= code && code <= 0xACA7 || // Lo  [27] HANGUL SYLLABLE GEG..HANGUL SYLLABLE GEH
			0xACA9 <= code && code <= 0xACC3 || // Lo  [27] HANGUL SYLLABLE GYEOG..HANGUL SYLLABLE GYEOH
			0xACC5 <= code && code <= 0xACDF || // Lo  [27] HANGUL SYLLABLE GYEG..HANGUL SYLLABLE GYEH
			0xACE1 <= code && code <= 0xACFB || // Lo  [27] HANGUL SYLLABLE GOG..HANGUL SYLLABLE GOH
			0xACFD <= code && code <= 0xAD17 || // Lo  [27] HANGUL SYLLABLE GWAG..HANGUL SYLLABLE GWAH
			0xAD19 <= code && code <= 0xAD33 || // Lo  [27] HANGUL SYLLABLE GWAEG..HANGUL SYLLABLE GWAEH
			0xAD35 <= code && code <= 0xAD4F || // Lo  [27] HANGUL SYLLABLE GOEG..HANGUL SYLLABLE GOEH
			0xAD51 <= code && code <= 0xAD6B || // Lo  [27] HANGUL SYLLABLE GYOG..HANGUL SYLLABLE GYOH
			0xAD6D <= code && code <= 0xAD87 || // Lo  [27] HANGUL SYLLABLE GUG..HANGUL SYLLABLE GUH
			0xAD89 <= code && code <= 0xADA3 || // Lo  [27] HANGUL SYLLABLE GWEOG..HANGUL SYLLABLE GWEOH
			0xADA5 <= code && code <= 0xADBF || // Lo  [27] HANGUL SYLLABLE GWEG..HANGUL SYLLABLE GWEH
			0xADC1 <= code && code <= 0xADDB || // Lo  [27] HANGUL SYLLABLE GWIG..HANGUL SYLLABLE GWIH
			0xADDD <= code && code <= 0xADF7 || // Lo  [27] HANGUL SYLLABLE GYUG..HANGUL SYLLABLE GYUH
			0xADF9 <= code && code <= 0xAE13 || // Lo  [27] HANGUL SYLLABLE GEUG..HANGUL SYLLABLE GEUH
			0xAE15 <= code && code <= 0xAE2F || // Lo  [27] HANGUL SYLLABLE GYIG..HANGUL SYLLABLE GYIH
			0xAE31 <= code && code <= 0xAE4B || // Lo  [27] HANGUL SYLLABLE GIG..HANGUL SYLLABLE GIH
			0xAE4D <= code && code <= 0xAE67 || // Lo  [27] HANGUL SYLLABLE GGAG..HANGUL SYLLABLE GGAH
			0xAE69 <= code && code <= 0xAE83 || // Lo  [27] HANGUL SYLLABLE GGAEG..HANGUL SYLLABLE GGAEH
			0xAE85 <= code && code <= 0xAE9F || // Lo  [27] HANGUL SYLLABLE GGYAG..HANGUL SYLLABLE GGYAH
			0xAEA1 <= code && code <= 0xAEBB || // Lo  [27] HANGUL SYLLABLE GGYAEG..HANGUL SYLLABLE GGYAEH
			0xAEBD <= code && code <= 0xAED7 || // Lo  [27] HANGUL SYLLABLE GGEOG..HANGUL SYLLABLE GGEOH
			0xAED9 <= code && code <= 0xAEF3 || // Lo  [27] HANGUL SYLLABLE GGEG..HANGUL SYLLABLE GGEH
			0xAEF5 <= code && code <= 0xAF0F || // Lo  [27] HANGUL SYLLABLE GGYEOG..HANGUL SYLLABLE GGYEOH
			0xAF11 <= code && code <= 0xAF2B || // Lo  [27] HANGUL SYLLABLE GGYEG..HANGUL SYLLABLE GGYEH
			0xAF2D <= code && code <= 0xAF47 || // Lo  [27] HANGUL SYLLABLE GGOG..HANGUL SYLLABLE GGOH
			0xAF49 <= code && code <= 0xAF63 || // Lo  [27] HANGUL SYLLABLE GGWAG..HANGUL SYLLABLE GGWAH
			0xAF65 <= code && code <= 0xAF7F || // Lo  [27] HANGUL SYLLABLE GGWAEG..HANGUL SYLLABLE GGWAEH
			0xAF81 <= code && code <= 0xAF9B || // Lo  [27] HANGUL SYLLABLE GGOEG..HANGUL SYLLABLE GGOEH
			0xAF9D <= code && code <= 0xAFB7 || // Lo  [27] HANGUL SYLLABLE GGYOG..HANGUL SYLLABLE GGYOH
			0xAFB9 <= code && code <= 0xAFD3 || // Lo  [27] HANGUL SYLLABLE GGUG..HANGUL SYLLABLE GGUH
			0xAFD5 <= code && code <= 0xAFEF || // Lo  [27] HANGUL SYLLABLE GGWEOG..HANGUL SYLLABLE GGWEOH
			0xAFF1 <= code && code <= 0xB00B || // Lo  [27] HANGUL SYLLABLE GGWEG..HANGUL SYLLABLE GGWEH
			0xB00D <= code && code <= 0xB027 || // Lo  [27] HANGUL SYLLABLE GGWIG..HANGUL SYLLABLE GGWIH
			0xB029 <= code && code <= 0xB043 || // Lo  [27] HANGUL SYLLABLE GGYUG..HANGUL SYLLABLE GGYUH
			0xB045 <= code && code <= 0xB05F || // Lo  [27] HANGUL SYLLABLE GGEUG..HANGUL SYLLABLE GGEUH
			0xB061 <= code && code <= 0xB07B || // Lo  [27] HANGUL SYLLABLE GGYIG..HANGUL SYLLABLE GGYIH
			0xB07D <= code && code <= 0xB097 || // Lo  [27] HANGUL SYLLABLE GGIG..HANGUL SYLLABLE GGIH
			0xB099 <= code && code <= 0xB0B3 || // Lo  [27] HANGUL SYLLABLE NAG..HANGUL SYLLABLE NAH
			0xB0B5 <= code && code <= 0xB0CF || // Lo  [27] HANGUL SYLLABLE NAEG..HANGUL SYLLABLE NAEH
			0xB0D1 <= code && code <= 0xB0EB || // Lo  [27] HANGUL SYLLABLE NYAG..HANGUL SYLLABLE NYAH
			0xB0ED <= code && code <= 0xB107 || // Lo  [27] HANGUL SYLLABLE NYAEG..HANGUL SYLLABLE NYAEH
			0xB109 <= code && code <= 0xB123 || // Lo  [27] HANGUL SYLLABLE NEOG..HANGUL SYLLABLE NEOH
			0xB125 <= code && code <= 0xB13F || // Lo  [27] HANGUL SYLLABLE NEG..HANGUL SYLLABLE NEH
			0xB141 <= code && code <= 0xB15B || // Lo  [27] HANGUL SYLLABLE NYEOG..HANGUL SYLLABLE NYEOH
			0xB15D <= code && code <= 0xB177 || // Lo  [27] HANGUL SYLLABLE NYEG..HANGUL SYLLABLE NYEH
			0xB179 <= code && code <= 0xB193 || // Lo  [27] HANGUL SYLLABLE NOG..HANGUL SYLLABLE NOH
			0xB195 <= code && code <= 0xB1AF || // Lo  [27] HANGUL SYLLABLE NWAG..HANGUL SYLLABLE NWAH
			0xB1B1 <= code && code <= 0xB1CB || // Lo  [27] HANGUL SYLLABLE NWAEG..HANGUL SYLLABLE NWAEH
			0xB1CD <= code && code <= 0xB1E7 || // Lo  [27] HANGUL SYLLABLE NOEG..HANGUL SYLLABLE NOEH
			0xB1E9 <= code && code <= 0xB203 || // Lo  [27] HANGUL SYLLABLE NYOG..HANGUL SYLLABLE NYOH
			0xB205 <= code && code <= 0xB21F || // Lo  [27] HANGUL SYLLABLE NUG..HANGUL SYLLABLE NUH
			0xB221 <= code && code <= 0xB23B || // Lo  [27] HANGUL SYLLABLE NWEOG..HANGUL SYLLABLE NWEOH
			0xB23D <= code && code <= 0xB257 || // Lo  [27] HANGUL SYLLABLE NWEG..HANGUL SYLLABLE NWEH
			0xB259 <= code && code <= 0xB273 || // Lo  [27] HANGUL SYLLABLE NWIG..HANGUL SYLLABLE NWIH
			0xB275 <= code && code <= 0xB28F || // Lo  [27] HANGUL SYLLABLE NYUG..HANGUL SYLLABLE NYUH
			0xB291 <= code && code <= 0xB2AB || // Lo  [27] HANGUL SYLLABLE NEUG..HANGUL SYLLABLE NEUH
			0xB2AD <= code && code <= 0xB2C7 || // Lo  [27] HANGUL SYLLABLE NYIG..HANGUL SYLLABLE NYIH
			0xB2C9 <= code && code <= 0xB2E3 || // Lo  [27] HANGUL SYLLABLE NIG..HANGUL SYLLABLE NIH
			0xB2E5 <= code && code <= 0xB2FF || // Lo  [27] HANGUL SYLLABLE DAG..HANGUL SYLLABLE DAH
			0xB301 <= code && code <= 0xB31B || // Lo  [27] HANGUL SYLLABLE DAEG..HANGUL SYLLABLE DAEH
			0xB31D <= code && code <= 0xB337 || // Lo  [27] HANGUL SYLLABLE DYAG..HANGUL SYLLABLE DYAH
			0xB339 <= code && code <= 0xB353 || // Lo  [27] HANGUL SYLLABLE DYAEG..HANGUL SYLLABLE DYAEH
			0xB355 <= code && code <= 0xB36F || // Lo  [27] HANGUL SYLLABLE DEOG..HANGUL SYLLABLE DEOH
			0xB371 <= code && code <= 0xB38B || // Lo  [27] HANGUL SYLLABLE DEG..HANGUL SYLLABLE DEH
			0xB38D <= code && code <= 0xB3A7 || // Lo  [27] HANGUL SYLLABLE DYEOG..HANGUL SYLLABLE DYEOH
			0xB3A9 <= code && code <= 0xB3C3 || // Lo  [27] HANGUL SYLLABLE DYEG..HANGUL SYLLABLE DYEH
			0xB3C5 <= code && code <= 0xB3DF || // Lo  [27] HANGUL SYLLABLE DOG..HANGUL SYLLABLE DOH
			0xB3E1 <= code && code <= 0xB3FB || // Lo  [27] HANGUL SYLLABLE DWAG..HANGUL SYLLABLE DWAH
			0xB3FD <= code && code <= 0xB417 || // Lo  [27] HANGUL SYLLABLE DWAEG..HANGUL SYLLABLE DWAEH
			0xB419 <= code && code <= 0xB433 || // Lo  [27] HANGUL SYLLABLE DOEG..HANGUL SYLLABLE DOEH
			0xB435 <= code && code <= 0xB44F || // Lo  [27] HANGUL SYLLABLE DYOG..HANGUL SYLLABLE DYOH
			0xB451 <= code && code <= 0xB46B || // Lo  [27] HANGUL SYLLABLE DUG..HANGUL SYLLABLE DUH
			0xB46D <= code && code <= 0xB487 || // Lo  [27] HANGUL SYLLABLE DWEOG..HANGUL SYLLABLE DWEOH
			0xB489 <= code && code <= 0xB4A3 || // Lo  [27] HANGUL SYLLABLE DWEG..HANGUL SYLLABLE DWEH
			0xB4A5 <= code && code <= 0xB4BF || // Lo  [27] HANGUL SYLLABLE DWIG..HANGUL SYLLABLE DWIH
			0xB4C1 <= code && code <= 0xB4DB || // Lo  [27] HANGUL SYLLABLE DYUG..HANGUL SYLLABLE DYUH
			0xB4DD <= code && code <= 0xB4F7 || // Lo  [27] HANGUL SYLLABLE DEUG..HANGUL SYLLABLE DEUH
			0xB4F9 <= code && code <= 0xB513 || // Lo  [27] HANGUL SYLLABLE DYIG..HANGUL SYLLABLE DYIH
			0xB515 <= code && code <= 0xB52F || // Lo  [27] HANGUL SYLLABLE DIG..HANGUL SYLLABLE DIH
			0xB531 <= code && code <= 0xB54B || // Lo  [27] HANGUL SYLLABLE DDAG..HANGUL SYLLABLE DDAH
			0xB54D <= code && code <= 0xB567 || // Lo  [27] HANGUL SYLLABLE DDAEG..HANGUL SYLLABLE DDAEH
			0xB569 <= code && code <= 0xB583 || // Lo  [27] HANGUL SYLLABLE DDYAG..HANGUL SYLLABLE DDYAH
			0xB585 <= code && code <= 0xB59F || // Lo  [27] HANGUL SYLLABLE DDYAEG..HANGUL SYLLABLE DDYAEH
			0xB5A1 <= code && code <= 0xB5BB || // Lo  [27] HANGUL SYLLABLE DDEOG..HANGUL SYLLABLE DDEOH
			0xB5BD <= code && code <= 0xB5D7 || // Lo  [27] HANGUL SYLLABLE DDEG..HANGUL SYLLABLE DDEH
			0xB5D9 <= code && code <= 0xB5F3 || // Lo  [27] HANGUL SYLLABLE DDYEOG..HANGUL SYLLABLE DDYEOH
			0xB5F5 <= code && code <= 0xB60F || // Lo  [27] HANGUL SYLLABLE DDYEG..HANGUL SYLLABLE DDYEH
			0xB611 <= code && code <= 0xB62B || // Lo  [27] HANGUL SYLLABLE DDOG..HANGUL SYLLABLE DDOH
			0xB62D <= code && code <= 0xB647 || // Lo  [27] HANGUL SYLLABLE DDWAG..HANGUL SYLLABLE DDWAH
			0xB649 <= code && code <= 0xB663 || // Lo  [27] HANGUL SYLLABLE DDWAEG..HANGUL SYLLABLE DDWAEH
			0xB665 <= code && code <= 0xB67F || // Lo  [27] HANGUL SYLLABLE DDOEG..HANGUL SYLLABLE DDOEH
			0xB681 <= code && code <= 0xB69B || // Lo  [27] HANGUL SYLLABLE DDYOG..HANGUL SYLLABLE DDYOH
			0xB69D <= code && code <= 0xB6B7 || // Lo  [27] HANGUL SYLLABLE DDUG..HANGUL SYLLABLE DDUH
			0xB6B9 <= code && code <= 0xB6D3 || // Lo  [27] HANGUL SYLLABLE DDWEOG..HANGUL SYLLABLE DDWEOH
			0xB6D5 <= code && code <= 0xB6EF || // Lo  [27] HANGUL SYLLABLE DDWEG..HANGUL SYLLABLE DDWEH
			0xB6F1 <= code && code <= 0xB70B || // Lo  [27] HANGUL SYLLABLE DDWIG..HANGUL SYLLABLE DDWIH
			0xB70D <= code && code <= 0xB727 || // Lo  [27] HANGUL SYLLABLE DDYUG..HANGUL SYLLABLE DDYUH
			0xB729 <= code && code <= 0xB743 || // Lo  [27] HANGUL SYLLABLE DDEUG..HANGUL SYLLABLE DDEUH
			0xB745 <= code && code <= 0xB75F || // Lo  [27] HANGUL SYLLABLE DDYIG..HANGUL SYLLABLE DDYIH
			0xB761 <= code && code <= 0xB77B || // Lo  [27] HANGUL SYLLABLE DDIG..HANGUL SYLLABLE DDIH
			0xB77D <= code && code <= 0xB797 || // Lo  [27] HANGUL SYLLABLE RAG..HANGUL SYLLABLE RAH
			0xB799 <= code && code <= 0xB7B3 || // Lo  [27] HANGUL SYLLABLE RAEG..HANGUL SYLLABLE RAEH
			0xB7B5 <= code && code <= 0xB7CF || // Lo  [27] HANGUL SYLLABLE RYAG..HANGUL SYLLABLE RYAH
			0xB7D1 <= code && code <= 0xB7EB || // Lo  [27] HANGUL SYLLABLE RYAEG..HANGUL SYLLABLE RYAEH
			0xB7ED <= code && code <= 0xB807 || // Lo  [27] HANGUL SYLLABLE REOG..HANGUL SYLLABLE REOH
			0xB809 <= code && code <= 0xB823 || // Lo  [27] HANGUL SYLLABLE REG..HANGUL SYLLABLE REH
			0xB825 <= code && code <= 0xB83F || // Lo  [27] HANGUL SYLLABLE RYEOG..HANGUL SYLLABLE RYEOH
			0xB841 <= code && code <= 0xB85B || // Lo  [27] HANGUL SYLLABLE RYEG..HANGUL SYLLABLE RYEH
			0xB85D <= code && code <= 0xB877 || // Lo  [27] HANGUL SYLLABLE ROG..HANGUL SYLLABLE ROH
			0xB879 <= code && code <= 0xB893 || // Lo  [27] HANGUL SYLLABLE RWAG..HANGUL SYLLABLE RWAH
			0xB895 <= code && code <= 0xB8AF || // Lo  [27] HANGUL SYLLABLE RWAEG..HANGUL SYLLABLE RWAEH
			0xB8B1 <= code && code <= 0xB8CB || // Lo  [27] HANGUL SYLLABLE ROEG..HANGUL SYLLABLE ROEH
			0xB8CD <= code && code <= 0xB8E7 || // Lo  [27] HANGUL SYLLABLE RYOG..HANGUL SYLLABLE RYOH
			0xB8E9 <= code && code <= 0xB903 || // Lo  [27] HANGUL SYLLABLE RUG..HANGUL SYLLABLE RUH
			0xB905 <= code && code <= 0xB91F || // Lo  [27] HANGUL SYLLABLE RWEOG..HANGUL SYLLABLE RWEOH
			0xB921 <= code && code <= 0xB93B || // Lo  [27] HANGUL SYLLABLE RWEG..HANGUL SYLLABLE RWEH
			0xB93D <= code && code <= 0xB957 || // Lo  [27] HANGUL SYLLABLE RWIG..HANGUL SYLLABLE RWIH
			0xB959 <= code && code <= 0xB973 || // Lo  [27] HANGUL SYLLABLE RYUG..HANGUL SYLLABLE RYUH
			0xB975 <= code && code <= 0xB98F || // Lo  [27] HANGUL SYLLABLE REUG..HANGUL SYLLABLE REUH
			0xB991 <= code && code <= 0xB9AB || // Lo  [27] HANGUL SYLLABLE RYIG..HANGUL SYLLABLE RYIH
			0xB9AD <= code && code <= 0xB9C7 || // Lo  [27] HANGUL SYLLABLE RIG..HANGUL SYLLABLE RIH
			0xB9C9 <= code && code <= 0xB9E3 || // Lo  [27] HANGUL SYLLABLE MAG..HANGUL SYLLABLE MAH
			0xB9E5 <= code && code <= 0xB9FF || // Lo  [27] HANGUL SYLLABLE MAEG..HANGUL SYLLABLE MAEH
			0xBA01 <= code && code <= 0xBA1B || // Lo  [27] HANGUL SYLLABLE MYAG..HANGUL SYLLABLE MYAH
			0xBA1D <= code && code <= 0xBA37 || // Lo  [27] HANGUL SYLLABLE MYAEG..HANGUL SYLLABLE MYAEH
			0xBA39 <= code && code <= 0xBA53 || // Lo  [27] HANGUL SYLLABLE MEOG..HANGUL SYLLABLE MEOH
			0xBA55 <= code && code <= 0xBA6F || // Lo  [27] HANGUL SYLLABLE MEG..HANGUL SYLLABLE MEH
			0xBA71 <= code && code <= 0xBA8B || // Lo  [27] HANGUL SYLLABLE MYEOG..HANGUL SYLLABLE MYEOH
			0xBA8D <= code && code <= 0xBAA7 || // Lo  [27] HANGUL SYLLABLE MYEG..HANGUL SYLLABLE MYEH
			0xBAA9 <= code && code <= 0xBAC3 || // Lo  [27] HANGUL SYLLABLE MOG..HANGUL SYLLABLE MOH
			0xBAC5 <= code && code <= 0xBADF || // Lo  [27] HANGUL SYLLABLE MWAG..HANGUL SYLLABLE MWAH
			0xBAE1 <= code && code <= 0xBAFB || // Lo  [27] HANGUL SYLLABLE MWAEG..HANGUL SYLLABLE MWAEH
			0xBAFD <= code && code <= 0xBB17 || // Lo  [27] HANGUL SYLLABLE MOEG..HANGUL SYLLABLE MOEH
			0xBB19 <= code && code <= 0xBB33 || // Lo  [27] HANGUL SYLLABLE MYOG..HANGUL SYLLABLE MYOH
			0xBB35 <= code && code <= 0xBB4F || // Lo  [27] HANGUL SYLLABLE MUG..HANGUL SYLLABLE MUH
			0xBB51 <= code && code <= 0xBB6B || // Lo  [27] HANGUL SYLLABLE MWEOG..HANGUL SYLLABLE MWEOH
			0xBB6D <= code && code <= 0xBB87 || // Lo  [27] HANGUL SYLLABLE MWEG..HANGUL SYLLABLE MWEH
			0xBB89 <= code && code <= 0xBBA3 || // Lo  [27] HANGUL SYLLABLE MWIG..HANGUL SYLLABLE MWIH
			0xBBA5 <= code && code <= 0xBBBF || // Lo  [27] HANGUL SYLLABLE MYUG..HANGUL SYLLABLE MYUH
			0xBBC1 <= code && code <= 0xBBDB || // Lo  [27] HANGUL SYLLABLE MEUG..HANGUL SYLLABLE MEUH
			0xBBDD <= code && code <= 0xBBF7 || // Lo  [27] HANGUL SYLLABLE MYIG..HANGUL SYLLABLE MYIH
			0xBBF9 <= code && code <= 0xBC13 || // Lo  [27] HANGUL SYLLABLE MIG..HANGUL SYLLABLE MIH
			0xBC15 <= code && code <= 0xBC2F || // Lo  [27] HANGUL SYLLABLE BAG..HANGUL SYLLABLE BAH
			0xBC31 <= code && code <= 0xBC4B || // Lo  [27] HANGUL SYLLABLE BAEG..HANGUL SYLLABLE BAEH
			0xBC4D <= code && code <= 0xBC67 || // Lo  [27] HANGUL SYLLABLE BYAG..HANGUL SYLLABLE BYAH
			0xBC69 <= code && code <= 0xBC83 || // Lo  [27] HANGUL SYLLABLE BYAEG..HANGUL SYLLABLE BYAEH
			0xBC85 <= code && code <= 0xBC9F || // Lo  [27] HANGUL SYLLABLE BEOG..HANGUL SYLLABLE BEOH
			0xBCA1 <= code && code <= 0xBCBB || // Lo  [27] HANGUL SYLLABLE BEG..HANGUL SYLLABLE BEH
			0xBCBD <= code && code <= 0xBCD7 || // Lo  [27] HANGUL SYLLABLE BYEOG..HANGUL SYLLABLE BYEOH
			0xBCD9 <= code && code <= 0xBCF3 || // Lo  [27] HANGUL SYLLABLE BYEG..HANGUL SYLLABLE BYEH
			0xBCF5 <= code && code <= 0xBD0F || // Lo  [27] HANGUL SYLLABLE BOG..HANGUL SYLLABLE BOH
			0xBD11 <= code && code <= 0xBD2B || // Lo  [27] HANGUL SYLLABLE BWAG..HANGUL SYLLABLE BWAH
			0xBD2D <= code && code <= 0xBD47 || // Lo  [27] HANGUL SYLLABLE BWAEG..HANGUL SYLLABLE BWAEH
			0xBD49 <= code && code <= 0xBD63 || // Lo  [27] HANGUL SYLLABLE BOEG..HANGUL SYLLABLE BOEH
			0xBD65 <= code && code <= 0xBD7F || // Lo  [27] HANGUL SYLLABLE BYOG..HANGUL SYLLABLE BYOH
			0xBD81 <= code && code <= 0xBD9B || // Lo  [27] HANGUL SYLLABLE BUG..HANGUL SYLLABLE BUH
			0xBD9D <= code && code <= 0xBDB7 || // Lo  [27] HANGUL SYLLABLE BWEOG..HANGUL SYLLABLE BWEOH
			0xBDB9 <= code && code <= 0xBDD3 || // Lo  [27] HANGUL SYLLABLE BWEG..HANGUL SYLLABLE BWEH
			0xBDD5 <= code && code <= 0xBDEF || // Lo  [27] HANGUL SYLLABLE BWIG..HANGUL SYLLABLE BWIH
			0xBDF1 <= code && code <= 0xBE0B || // Lo  [27] HANGUL SYLLABLE BYUG..HANGUL SYLLABLE BYUH
			0xBE0D <= code && code <= 0xBE27 || // Lo  [27] HANGUL SYLLABLE BEUG..HANGUL SYLLABLE BEUH
			0xBE29 <= code && code <= 0xBE43 || // Lo  [27] HANGUL SYLLABLE BYIG..HANGUL SYLLABLE BYIH
			0xBE45 <= code && code <= 0xBE5F || // Lo  [27] HANGUL SYLLABLE BIG..HANGUL SYLLABLE BIH
			0xBE61 <= code && code <= 0xBE7B || // Lo  [27] HANGUL SYLLABLE BBAG..HANGUL SYLLABLE BBAH
			0xBE7D <= code && code <= 0xBE97 || // Lo  [27] HANGUL SYLLABLE BBAEG..HANGUL SYLLABLE BBAEH
			0xBE99 <= code && code <= 0xBEB3 || // Lo  [27] HANGUL SYLLABLE BBYAG..HANGUL SYLLABLE BBYAH
			0xBEB5 <= code && code <= 0xBECF || // Lo  [27] HANGUL SYLLABLE BBYAEG..HANGUL SYLLABLE BBYAEH
			0xBED1 <= code && code <= 0xBEEB || // Lo  [27] HANGUL SYLLABLE BBEOG..HANGUL SYLLABLE BBEOH
			0xBEED <= code && code <= 0xBF07 || // Lo  [27] HANGUL SYLLABLE BBEG..HANGUL SYLLABLE BBEH
			0xBF09 <= code && code <= 0xBF23 || // Lo  [27] HANGUL SYLLABLE BBYEOG..HANGUL SYLLABLE BBYEOH
			0xBF25 <= code && code <= 0xBF3F || // Lo  [27] HANGUL SYLLABLE BBYEG..HANGUL SYLLABLE BBYEH
			0xBF41 <= code && code <= 0xBF5B || // Lo  [27] HANGUL SYLLABLE BBOG..HANGUL SYLLABLE BBOH
			0xBF5D <= code && code <= 0xBF77 || // Lo  [27] HANGUL SYLLABLE BBWAG..HANGUL SYLLABLE BBWAH
			0xBF79 <= code && code <= 0xBF93 || // Lo  [27] HANGUL SYLLABLE BBWAEG..HANGUL SYLLABLE BBWAEH
			0xBF95 <= code && code <= 0xBFAF || // Lo  [27] HANGUL SYLLABLE BBOEG..HANGUL SYLLABLE BBOEH
			0xBFB1 <= code && code <= 0xBFCB || // Lo  [27] HANGUL SYLLABLE BBYOG..HANGUL SYLLABLE BBYOH
			0xBFCD <= code && code <= 0xBFE7 || // Lo  [27] HANGUL SYLLABLE BBUG..HANGUL SYLLABLE BBUH
			0xBFE9 <= code && code <= 0xC003 || // Lo  [27] HANGUL SYLLABLE BBWEOG..HANGUL SYLLABLE BBWEOH
			0xC005 <= code && code <= 0xC01F || // Lo  [27] HANGUL SYLLABLE BBWEG..HANGUL SYLLABLE BBWEH
			0xC021 <= code && code <= 0xC03B || // Lo  [27] HANGUL SYLLABLE BBWIG..HANGUL SYLLABLE BBWIH
			0xC03D <= code && code <= 0xC057 || // Lo  [27] HANGUL SYLLABLE BBYUG..HANGUL SYLLABLE BBYUH
			0xC059 <= code && code <= 0xC073 || // Lo  [27] HANGUL SYLLABLE BBEUG..HANGUL SYLLABLE BBEUH
			0xC075 <= code && code <= 0xC08F || // Lo  [27] HANGUL SYLLABLE BBYIG..HANGUL SYLLABLE BBYIH
			0xC091 <= code && code <= 0xC0AB || // Lo  [27] HANGUL SYLLABLE BBIG..HANGUL SYLLABLE BBIH
			0xC0AD <= code && code <= 0xC0C7 || // Lo  [27] HANGUL SYLLABLE SAG..HANGUL SYLLABLE SAH
			0xC0C9 <= code && code <= 0xC0E3 || // Lo  [27] HANGUL SYLLABLE SAEG..HANGUL SYLLABLE SAEH
			0xC0E5 <= code && code <= 0xC0FF || // Lo  [27] HANGUL SYLLABLE SYAG..HANGUL SYLLABLE SYAH
			0xC101 <= code && code <= 0xC11B || // Lo  [27] HANGUL SYLLABLE SYAEG..HANGUL SYLLABLE SYAEH
			0xC11D <= code && code <= 0xC137 || // Lo  [27] HANGUL SYLLABLE SEOG..HANGUL SYLLABLE SEOH
			0xC139 <= code && code <= 0xC153 || // Lo  [27] HANGUL SYLLABLE SEG..HANGUL SYLLABLE SEH
			0xC155 <= code && code <= 0xC16F || // Lo  [27] HANGUL SYLLABLE SYEOG..HANGUL SYLLABLE SYEOH
			0xC171 <= code && code <= 0xC18B || // Lo  [27] HANGUL SYLLABLE SYEG..HANGUL SYLLABLE SYEH
			0xC18D <= code && code <= 0xC1A7 || // Lo  [27] HANGUL SYLLABLE SOG..HANGUL SYLLABLE SOH
			0xC1A9 <= code && code <= 0xC1C3 || // Lo  [27] HANGUL SYLLABLE SWAG..HANGUL SYLLABLE SWAH
			0xC1C5 <= code && code <= 0xC1DF || // Lo  [27] HANGUL SYLLABLE SWAEG..HANGUL SYLLABLE SWAEH
			0xC1E1 <= code && code <= 0xC1FB || // Lo  [27] HANGUL SYLLABLE SOEG..HANGUL SYLLABLE SOEH
			0xC1FD <= code && code <= 0xC217 || // Lo  [27] HANGUL SYLLABLE SYOG..HANGUL SYLLABLE SYOH
			0xC219 <= code && code <= 0xC233 || // Lo  [27] HANGUL SYLLABLE SUG..HANGUL SYLLABLE SUH
			0xC235 <= code && code <= 0xC24F || // Lo  [27] HANGUL SYLLABLE SWEOG..HANGUL SYLLABLE SWEOH
			0xC251 <= code && code <= 0xC26B || // Lo  [27] HANGUL SYLLABLE SWEG..HANGUL SYLLABLE SWEH
			0xC26D <= code && code <= 0xC287 || // Lo  [27] HANGUL SYLLABLE SWIG..HANGUL SYLLABLE SWIH
			0xC289 <= code && code <= 0xC2A3 || // Lo  [27] HANGUL SYLLABLE SYUG..HANGUL SYLLABLE SYUH
			0xC2A5 <= code && code <= 0xC2BF || // Lo  [27] HANGUL SYLLABLE SEUG..HANGUL SYLLABLE SEUH
			0xC2C1 <= code && code <= 0xC2DB || // Lo  [27] HANGUL SYLLABLE SYIG..HANGUL SYLLABLE SYIH
			0xC2DD <= code && code <= 0xC2F7 || // Lo  [27] HANGUL SYLLABLE SIG..HANGUL SYLLABLE SIH
			0xC2F9 <= code && code <= 0xC313 || // Lo  [27] HANGUL SYLLABLE SSAG..HANGUL SYLLABLE SSAH
			0xC315 <= code && code <= 0xC32F || // Lo  [27] HANGUL SYLLABLE SSAEG..HANGUL SYLLABLE SSAEH
			0xC331 <= code && code <= 0xC34B || // Lo  [27] HANGUL SYLLABLE SSYAG..HANGUL SYLLABLE SSYAH
			0xC34D <= code && code <= 0xC367 || // Lo  [27] HANGUL SYLLABLE SSYAEG..HANGUL SYLLABLE SSYAEH
			0xC369 <= code && code <= 0xC383 || // Lo  [27] HANGUL SYLLABLE SSEOG..HANGUL SYLLABLE SSEOH
			0xC385 <= code && code <= 0xC39F || // Lo  [27] HANGUL SYLLABLE SSEG..HANGUL SYLLABLE SSEH
			0xC3A1 <= code && code <= 0xC3BB || // Lo  [27] HANGUL SYLLABLE SSYEOG..HANGUL SYLLABLE SSYEOH
			0xC3BD <= code && code <= 0xC3D7 || // Lo  [27] HANGUL SYLLABLE SSYEG..HANGUL SYLLABLE SSYEH
			0xC3D9 <= code && code <= 0xC3F3 || // Lo  [27] HANGUL SYLLABLE SSOG..HANGUL SYLLABLE SSOH
			0xC3F5 <= code && code <= 0xC40F || // Lo  [27] HANGUL SYLLABLE SSWAG..HANGUL SYLLABLE SSWAH
			0xC411 <= code && code <= 0xC42B || // Lo  [27] HANGUL SYLLABLE SSWAEG..HANGUL SYLLABLE SSWAEH
			0xC42D <= code && code <= 0xC447 || // Lo  [27] HANGUL SYLLABLE SSOEG..HANGUL SYLLABLE SSOEH
			0xC449 <= code && code <= 0xC463 || // Lo  [27] HANGUL SYLLABLE SSYOG..HANGUL SYLLABLE SSYOH
			0xC465 <= code && code <= 0xC47F || // Lo  [27] HANGUL SYLLABLE SSUG..HANGUL SYLLABLE SSUH
			0xC481 <= code && code <= 0xC49B || // Lo  [27] HANGUL SYLLABLE SSWEOG..HANGUL SYLLABLE SSWEOH
			0xC49D <= code && code <= 0xC4B7 || // Lo  [27] HANGUL SYLLABLE SSWEG..HANGUL SYLLABLE SSWEH
			0xC4B9 <= code && code <= 0xC4D3 || // Lo  [27] HANGUL SYLLABLE SSWIG..HANGUL SYLLABLE SSWIH
			0xC4D5 <= code && code <= 0xC4EF || // Lo  [27] HANGUL SYLLABLE SSYUG..HANGUL SYLLABLE SSYUH
			0xC4F1 <= code && code <= 0xC50B || // Lo  [27] HANGUL SYLLABLE SSEUG..HANGUL SYLLABLE SSEUH
			0xC50D <= code && code <= 0xC527 || // Lo  [27] HANGUL SYLLABLE SSYIG..HANGUL SYLLABLE SSYIH
			0xC529 <= code && code <= 0xC543 || // Lo  [27] HANGUL SYLLABLE SSIG..HANGUL SYLLABLE SSIH
			0xC545 <= code && code <= 0xC55F || // Lo  [27] HANGUL SYLLABLE AG..HANGUL SYLLABLE AH
			0xC561 <= code && code <= 0xC57B || // Lo  [27] HANGUL SYLLABLE AEG..HANGUL SYLLABLE AEH
			0xC57D <= code && code <= 0xC597 || // Lo  [27] HANGUL SYLLABLE YAG..HANGUL SYLLABLE YAH
			0xC599 <= code && code <= 0xC5B3 || // Lo  [27] HANGUL SYLLABLE YAEG..HANGUL SYLLABLE YAEH
			0xC5B5 <= code && code <= 0xC5CF || // Lo  [27] HANGUL SYLLABLE EOG..HANGUL SYLLABLE EOH
			0xC5D1 <= code && code <= 0xC5EB || // Lo  [27] HANGUL SYLLABLE EG..HANGUL SYLLABLE EH
			0xC5ED <= code && code <= 0xC607 || // Lo  [27] HANGUL SYLLABLE YEOG..HANGUL SYLLABLE YEOH
			0xC609 <= code && code <= 0xC623 || // Lo  [27] HANGUL SYLLABLE YEG..HANGUL SYLLABLE YEH
			0xC625 <= code && code <= 0xC63F || // Lo  [27] HANGUL SYLLABLE OG..HANGUL SYLLABLE OH
			0xC641 <= code && code <= 0xC65B || // Lo  [27] HANGUL SYLLABLE WAG..HANGUL SYLLABLE WAH
			0xC65D <= code && code <= 0xC677 || // Lo  [27] HANGUL SYLLABLE WAEG..HANGUL SYLLABLE WAEH
			0xC679 <= code && code <= 0xC693 || // Lo  [27] HANGUL SYLLABLE OEG..HANGUL SYLLABLE OEH
			0xC695 <= code && code <= 0xC6AF || // Lo  [27] HANGUL SYLLABLE YOG..HANGUL SYLLABLE YOH
			0xC6B1 <= code && code <= 0xC6CB || // Lo  [27] HANGUL SYLLABLE UG..HANGUL SYLLABLE UH
			0xC6CD <= code && code <= 0xC6E7 || // Lo  [27] HANGUL SYLLABLE WEOG..HANGUL SYLLABLE WEOH
			0xC6E9 <= code && code <= 0xC703 || // Lo  [27] HANGUL SYLLABLE WEG..HANGUL SYLLABLE WEH
			0xC705 <= code && code <= 0xC71F || // Lo  [27] HANGUL SYLLABLE WIG..HANGUL SYLLABLE WIH
			0xC721 <= code && code <= 0xC73B || // Lo  [27] HANGUL SYLLABLE YUG..HANGUL SYLLABLE YUH
			0xC73D <= code && code <= 0xC757 || // Lo  [27] HANGUL SYLLABLE EUG..HANGUL SYLLABLE EUH
			0xC759 <= code && code <= 0xC773 || // Lo  [27] HANGUL SYLLABLE YIG..HANGUL SYLLABLE YIH
			0xC775 <= code && code <= 0xC78F || // Lo  [27] HANGUL SYLLABLE IG..HANGUL SYLLABLE IH
			0xC791 <= code && code <= 0xC7AB || // Lo  [27] HANGUL SYLLABLE JAG..HANGUL SYLLABLE JAH
			0xC7AD <= code && code <= 0xC7C7 || // Lo  [27] HANGUL SYLLABLE JAEG..HANGUL SYLLABLE JAEH
			0xC7C9 <= code && code <= 0xC7E3 || // Lo  [27] HANGUL SYLLABLE JYAG..HANGUL SYLLABLE JYAH
			0xC7E5 <= code && code <= 0xC7FF || // Lo  [27] HANGUL SYLLABLE JYAEG..HANGUL SYLLABLE JYAEH
			0xC801 <= code && code <= 0xC81B || // Lo  [27] HANGUL SYLLABLE JEOG..HANGUL SYLLABLE JEOH
			0xC81D <= code && code <= 0xC837 || // Lo  [27] HANGUL SYLLABLE JEG..HANGUL SYLLABLE JEH
			0xC839 <= code && code <= 0xC853 || // Lo  [27] HANGUL SYLLABLE JYEOG..HANGUL SYLLABLE JYEOH
			0xC855 <= code && code <= 0xC86F || // Lo  [27] HANGUL SYLLABLE JYEG..HANGUL SYLLABLE JYEH
			0xC871 <= code && code <= 0xC88B || // Lo  [27] HANGUL SYLLABLE JOG..HANGUL SYLLABLE JOH
			0xC88D <= code && code <= 0xC8A7 || // Lo  [27] HANGUL SYLLABLE JWAG..HANGUL SYLLABLE JWAH
			0xC8A9 <= code && code <= 0xC8C3 || // Lo  [27] HANGUL SYLLABLE JWAEG..HANGUL SYLLABLE JWAEH
			0xC8C5 <= code && code <= 0xC8DF || // Lo  [27] HANGUL SYLLABLE JOEG..HANGUL SYLLABLE JOEH
			0xC8E1 <= code && code <= 0xC8FB || // Lo  [27] HANGUL SYLLABLE JYOG..HANGUL SYLLABLE JYOH
			0xC8FD <= code && code <= 0xC917 || // Lo  [27] HANGUL SYLLABLE JUG..HANGUL SYLLABLE JUH
			0xC919 <= code && code <= 0xC933 || // Lo  [27] HANGUL SYLLABLE JWEOG..HANGUL SYLLABLE JWEOH
			0xC935 <= code && code <= 0xC94F || // Lo  [27] HANGUL SYLLABLE JWEG..HANGUL SYLLABLE JWEH
			0xC951 <= code && code <= 0xC96B || // Lo  [27] HANGUL SYLLABLE JWIG..HANGUL SYLLABLE JWIH
			0xC96D <= code && code <= 0xC987 || // Lo  [27] HANGUL SYLLABLE JYUG..HANGUL SYLLABLE JYUH
			0xC989 <= code && code <= 0xC9A3 || // Lo  [27] HANGUL SYLLABLE JEUG..HANGUL SYLLABLE JEUH
			0xC9A5 <= code && code <= 0xC9BF || // Lo  [27] HANGUL SYLLABLE JYIG..HANGUL SYLLABLE JYIH
			0xC9C1 <= code && code <= 0xC9DB || // Lo  [27] HANGUL SYLLABLE JIG..HANGUL SYLLABLE JIH
			0xC9DD <= code && code <= 0xC9F7 || // Lo  [27] HANGUL SYLLABLE JJAG..HANGUL SYLLABLE JJAH
			0xC9F9 <= code && code <= 0xCA13 || // Lo  [27] HANGUL SYLLABLE JJAEG..HANGUL SYLLABLE JJAEH
			0xCA15 <= code && code <= 0xCA2F || // Lo  [27] HANGUL SYLLABLE JJYAG..HANGUL SYLLABLE JJYAH
			0xCA31 <= code && code <= 0xCA4B || // Lo  [27] HANGUL SYLLABLE JJYAEG..HANGUL SYLLABLE JJYAEH
			0xCA4D <= code && code <= 0xCA67 || // Lo  [27] HANGUL SYLLABLE JJEOG..HANGUL SYLLABLE JJEOH
			0xCA69 <= code && code <= 0xCA83 || // Lo  [27] HANGUL SYLLABLE JJEG..HANGUL SYLLABLE JJEH
			0xCA85 <= code && code <= 0xCA9F || // Lo  [27] HANGUL SYLLABLE JJYEOG..HANGUL SYLLABLE JJYEOH
			0xCAA1 <= code && code <= 0xCABB || // Lo  [27] HANGUL SYLLABLE JJYEG..HANGUL SYLLABLE JJYEH
			0xCABD <= code && code <= 0xCAD7 || // Lo  [27] HANGUL SYLLABLE JJOG..HANGUL SYLLABLE JJOH
			0xCAD9 <= code && code <= 0xCAF3 || // Lo  [27] HANGUL SYLLABLE JJWAG..HANGUL SYLLABLE JJWAH
			0xCAF5 <= code && code <= 0xCB0F || // Lo  [27] HANGUL SYLLABLE JJWAEG..HANGUL SYLLABLE JJWAEH
			0xCB11 <= code && code <= 0xCB2B || // Lo  [27] HANGUL SYLLABLE JJOEG..HANGUL SYLLABLE JJOEH
			0xCB2D <= code && code <= 0xCB47 || // Lo  [27] HANGUL SYLLABLE JJYOG..HANGUL SYLLABLE JJYOH
			0xCB49 <= code && code <= 0xCB63 || // Lo  [27] HANGUL SYLLABLE JJUG..HANGUL SYLLABLE JJUH
			0xCB65 <= code && code <= 0xCB7F || // Lo  [27] HANGUL SYLLABLE JJWEOG..HANGUL SYLLABLE JJWEOH
			0xCB81 <= code && code <= 0xCB9B || // Lo  [27] HANGUL SYLLABLE JJWEG..HANGUL SYLLABLE JJWEH
			0xCB9D <= code && code <= 0xCBB7 || // Lo  [27] HANGUL SYLLABLE JJWIG..HANGUL SYLLABLE JJWIH
			0xCBB9 <= code && code <= 0xCBD3 || // Lo  [27] HANGUL SYLLABLE JJYUG..HANGUL SYLLABLE JJYUH
			0xCBD5 <= code && code <= 0xCBEF || // Lo  [27] HANGUL SYLLABLE JJEUG..HANGUL SYLLABLE JJEUH
			0xCBF1 <= code && code <= 0xCC0B || // Lo  [27] HANGUL SYLLABLE JJYIG..HANGUL SYLLABLE JJYIH
			0xCC0D <= code && code <= 0xCC27 || // Lo  [27] HANGUL SYLLABLE JJIG..HANGUL SYLLABLE JJIH
			0xCC29 <= code && code <= 0xCC43 || // Lo  [27] HANGUL SYLLABLE CAG..HANGUL SYLLABLE CAH
			0xCC45 <= code && code <= 0xCC5F || // Lo  [27] HANGUL SYLLABLE CAEG..HANGUL SYLLABLE CAEH
			0xCC61 <= code && code <= 0xCC7B || // Lo  [27] HANGUL SYLLABLE CYAG..HANGUL SYLLABLE CYAH
			0xCC7D <= code && code <= 0xCC97 || // Lo  [27] HANGUL SYLLABLE CYAEG..HANGUL SYLLABLE CYAEH
			0xCC99 <= code && code <= 0xCCB3 || // Lo  [27] HANGUL SYLLABLE CEOG..HANGUL SYLLABLE CEOH
			0xCCB5 <= code && code <= 0xCCCF || // Lo  [27] HANGUL SYLLABLE CEG..HANGUL SYLLABLE CEH
			0xCCD1 <= code && code <= 0xCCEB || // Lo  [27] HANGUL SYLLABLE CYEOG..HANGUL SYLLABLE CYEOH
			0xCCED <= code && code <= 0xCD07 || // Lo  [27] HANGUL SYLLABLE CYEG..HANGUL SYLLABLE CYEH
			0xCD09 <= code && code <= 0xCD23 || // Lo  [27] HANGUL SYLLABLE COG..HANGUL SYLLABLE COH
			0xCD25 <= code && code <= 0xCD3F || // Lo  [27] HANGUL SYLLABLE CWAG..HANGUL SYLLABLE CWAH
			0xCD41 <= code && code <= 0xCD5B || // Lo  [27] HANGUL SYLLABLE CWAEG..HANGUL SYLLABLE CWAEH
			0xCD5D <= code && code <= 0xCD77 || // Lo  [27] HANGUL SYLLABLE COEG..HANGUL SYLLABLE COEH
			0xCD79 <= code && code <= 0xCD93 || // Lo  [27] HANGUL SYLLABLE CYOG..HANGUL SYLLABLE CYOH
			0xCD95 <= code && code <= 0xCDAF || // Lo  [27] HANGUL SYLLABLE CUG..HANGUL SYLLABLE CUH
			0xCDB1 <= code && code <= 0xCDCB || // Lo  [27] HANGUL SYLLABLE CWEOG..HANGUL SYLLABLE CWEOH
			0xCDCD <= code && code <= 0xCDE7 || // Lo  [27] HANGUL SYLLABLE CWEG..HANGUL SYLLABLE CWEH
			0xCDE9 <= code && code <= 0xCE03 || // Lo  [27] HANGUL SYLLABLE CWIG..HANGUL SYLLABLE CWIH
			0xCE05 <= code && code <= 0xCE1F || // Lo  [27] HANGUL SYLLABLE CYUG..HANGUL SYLLABLE CYUH
			0xCE21 <= code && code <= 0xCE3B || // Lo  [27] HANGUL SYLLABLE CEUG..HANGUL SYLLABLE CEUH
			0xCE3D <= code && code <= 0xCE57 || // Lo  [27] HANGUL SYLLABLE CYIG..HANGUL SYLLABLE CYIH
			0xCE59 <= code && code <= 0xCE73 || // Lo  [27] HANGUL SYLLABLE CIG..HANGUL SYLLABLE CIH
			0xCE75 <= code && code <= 0xCE8F || // Lo  [27] HANGUL SYLLABLE KAG..HANGUL SYLLABLE KAH
			0xCE91 <= code && code <= 0xCEAB || // Lo  [27] HANGUL SYLLABLE KAEG..HANGUL SYLLABLE KAEH
			0xCEAD <= code && code <= 0xCEC7 || // Lo  [27] HANGUL SYLLABLE KYAG..HANGUL SYLLABLE KYAH
			0xCEC9 <= code && code <= 0xCEE3 || // Lo  [27] HANGUL SYLLABLE KYAEG..HANGUL SYLLABLE KYAEH
			0xCEE5 <= code && code <= 0xCEFF || // Lo  [27] HANGUL SYLLABLE KEOG..HANGUL SYLLABLE KEOH
			0xCF01 <= code && code <= 0xCF1B || // Lo  [27] HANGUL SYLLABLE KEG..HANGUL SYLLABLE KEH
			0xCF1D <= code && code <= 0xCF37 || // Lo  [27] HANGUL SYLLABLE KYEOG..HANGUL SYLLABLE KYEOH
			0xCF39 <= code && code <= 0xCF53 || // Lo  [27] HANGUL SYLLABLE KYEG..HANGUL SYLLABLE KYEH
			0xCF55 <= code && code <= 0xCF6F || // Lo  [27] HANGUL SYLLABLE KOG..HANGUL SYLLABLE KOH
			0xCF71 <= code && code <= 0xCF8B || // Lo  [27] HANGUL SYLLABLE KWAG..HANGUL SYLLABLE KWAH
			0xCF8D <= code && code <= 0xCFA7 || // Lo  [27] HANGUL SYLLABLE KWAEG..HANGUL SYLLABLE KWAEH
			0xCFA9 <= code && code <= 0xCFC3 || // Lo  [27] HANGUL SYLLABLE KOEG..HANGUL SYLLABLE KOEH
			0xCFC5 <= code && code <= 0xCFDF || // Lo  [27] HANGUL SYLLABLE KYOG..HANGUL SYLLABLE KYOH
			0xCFE1 <= code && code <= 0xCFFB || // Lo  [27] HANGUL SYLLABLE KUG..HANGUL SYLLABLE KUH
			0xCFFD <= code && code <= 0xD017 || // Lo  [27] HANGUL SYLLABLE KWEOG..HANGUL SYLLABLE KWEOH
			0xD019 <= code && code <= 0xD033 || // Lo  [27] HANGUL SYLLABLE KWEG..HANGUL SYLLABLE KWEH
			0xD035 <= code && code <= 0xD04F || // Lo  [27] HANGUL SYLLABLE KWIG..HANGUL SYLLABLE KWIH
			0xD051 <= code && code <= 0xD06B || // Lo  [27] HANGUL SYLLABLE KYUG..HANGUL SYLLABLE KYUH
			0xD06D <= code && code <= 0xD087 || // Lo  [27] HANGUL SYLLABLE KEUG..HANGUL SYLLABLE KEUH
			0xD089 <= code && code <= 0xD0A3 || // Lo  [27] HANGUL SYLLABLE KYIG..HANGUL SYLLABLE KYIH
			0xD0A5 <= code && code <= 0xD0BF || // Lo  [27] HANGUL SYLLABLE KIG..HANGUL SYLLABLE KIH
			0xD0C1 <= code && code <= 0xD0DB || // Lo  [27] HANGUL SYLLABLE TAG..HANGUL SYLLABLE TAH
			0xD0DD <= code && code <= 0xD0F7 || // Lo  [27] HANGUL SYLLABLE TAEG..HANGUL SYLLABLE TAEH
			0xD0F9 <= code && code <= 0xD113 || // Lo  [27] HANGUL SYLLABLE TYAG..HANGUL SYLLABLE TYAH
			0xD115 <= code && code <= 0xD12F || // Lo  [27] HANGUL SYLLABLE TYAEG..HANGUL SYLLABLE TYAEH
			0xD131 <= code && code <= 0xD14B || // Lo  [27] HANGUL SYLLABLE TEOG..HANGUL SYLLABLE TEOH
			0xD14D <= code && code <= 0xD167 || // Lo  [27] HANGUL SYLLABLE TEG..HANGUL SYLLABLE TEH
			0xD169 <= code && code <= 0xD183 || // Lo  [27] HANGUL SYLLABLE TYEOG..HANGUL SYLLABLE TYEOH
			0xD185 <= code && code <= 0xD19F || // Lo  [27] HANGUL SYLLABLE TYEG..HANGUL SYLLABLE TYEH
			0xD1A1 <= code && code <= 0xD1BB || // Lo  [27] HANGUL SYLLABLE TOG..HANGUL SYLLABLE TOH
			0xD1BD <= code && code <= 0xD1D7 || // Lo  [27] HANGUL SYLLABLE TWAG..HANGUL SYLLABLE TWAH
			0xD1D9 <= code && code <= 0xD1F3 || // Lo  [27] HANGUL SYLLABLE TWAEG..HANGUL SYLLABLE TWAEH
			0xD1F5 <= code && code <= 0xD20F || // Lo  [27] HANGUL SYLLABLE TOEG..HANGUL SYLLABLE TOEH
			0xD211 <= code && code <= 0xD22B || // Lo  [27] HANGUL SYLLABLE TYOG..HANGUL SYLLABLE TYOH
			0xD22D <= code && code <= 0xD247 || // Lo  [27] HANGUL SYLLABLE TUG..HANGUL SYLLABLE TUH
			0xD249 <= code && code <= 0xD263 || // Lo  [27] HANGUL SYLLABLE TWEOG..HANGUL SYLLABLE TWEOH
			0xD265 <= code && code <= 0xD27F || // Lo  [27] HANGUL SYLLABLE TWEG..HANGUL SYLLABLE TWEH
			0xD281 <= code && code <= 0xD29B || // Lo  [27] HANGUL SYLLABLE TWIG..HANGUL SYLLABLE TWIH
			0xD29D <= code && code <= 0xD2B7 || // Lo  [27] HANGUL SYLLABLE TYUG..HANGUL SYLLABLE TYUH
			0xD2B9 <= code && code <= 0xD2D3 || // Lo  [27] HANGUL SYLLABLE TEUG..HANGUL SYLLABLE TEUH
			0xD2D5 <= code && code <= 0xD2EF || // Lo  [27] HANGUL SYLLABLE TYIG..HANGUL SYLLABLE TYIH
			0xD2F1 <= code && code <= 0xD30B || // Lo  [27] HANGUL SYLLABLE TIG..HANGUL SYLLABLE TIH
			0xD30D <= code && code <= 0xD327 || // Lo  [27] HANGUL SYLLABLE PAG..HANGUL SYLLABLE PAH
			0xD329 <= code && code <= 0xD343 || // Lo  [27] HANGUL SYLLABLE PAEG..HANGUL SYLLABLE PAEH
			0xD345 <= code && code <= 0xD35F || // Lo  [27] HANGUL SYLLABLE PYAG..HANGUL SYLLABLE PYAH
			0xD361 <= code && code <= 0xD37B || // Lo  [27] HANGUL SYLLABLE PYAEG..HANGUL SYLLABLE PYAEH
			0xD37D <= code && code <= 0xD397 || // Lo  [27] HANGUL SYLLABLE PEOG..HANGUL SYLLABLE PEOH
			0xD399 <= code && code <= 0xD3B3 || // Lo  [27] HANGUL SYLLABLE PEG..HANGUL SYLLABLE PEH
			0xD3B5 <= code && code <= 0xD3CF || // Lo  [27] HANGUL SYLLABLE PYEOG..HANGUL SYLLABLE PYEOH
			0xD3D1 <= code && code <= 0xD3EB || // Lo  [27] HANGUL SYLLABLE PYEG..HANGUL SYLLABLE PYEH
			0xD3ED <= code && code <= 0xD407 || // Lo  [27] HANGUL SYLLABLE POG..HANGUL SYLLABLE POH
			0xD409 <= code && code <= 0xD423 || // Lo  [27] HANGUL SYLLABLE PWAG..HANGUL SYLLABLE PWAH
			0xD425 <= code && code <= 0xD43F || // Lo  [27] HANGUL SYLLABLE PWAEG..HANGUL SYLLABLE PWAEH
			0xD441 <= code && code <= 0xD45B || // Lo  [27] HANGUL SYLLABLE POEG..HANGUL SYLLABLE POEH
			0xD45D <= code && code <= 0xD477 || // Lo  [27] HANGUL SYLLABLE PYOG..HANGUL SYLLABLE PYOH
			0xD479 <= code && code <= 0xD493 || // Lo  [27] HANGUL SYLLABLE PUG..HANGUL SYLLABLE PUH
			0xD495 <= code && code <= 0xD4AF || // Lo  [27] HANGUL SYLLABLE PWEOG..HANGUL SYLLABLE PWEOH
			0xD4B1 <= code && code <= 0xD4CB || // Lo  [27] HANGUL SYLLABLE PWEG..HANGUL SYLLABLE PWEH
			0xD4CD <= code && code <= 0xD4E7 || // Lo  [27] HANGUL SYLLABLE PWIG..HANGUL SYLLABLE PWIH
			0xD4E9 <= code && code <= 0xD503 || // Lo  [27] HANGUL SYLLABLE PYUG..HANGUL SYLLABLE PYUH
			0xD505 <= code && code <= 0xD51F || // Lo  [27] HANGUL SYLLABLE PEUG..HANGUL SYLLABLE PEUH
			0xD521 <= code && code <= 0xD53B || // Lo  [27] HANGUL SYLLABLE PYIG..HANGUL SYLLABLE PYIH
			0xD53D <= code && code <= 0xD557 || // Lo  [27] HANGUL SYLLABLE PIG..HANGUL SYLLABLE PIH
			0xD559 <= code && code <= 0xD573 || // Lo  [27] HANGUL SYLLABLE HAG..HANGUL SYLLABLE HAH
			0xD575 <= code && code <= 0xD58F || // Lo  [27] HANGUL SYLLABLE HAEG..HANGUL SYLLABLE HAEH
			0xD591 <= code && code <= 0xD5AB || // Lo  [27] HANGUL SYLLABLE HYAG..HANGUL SYLLABLE HYAH
			0xD5AD <= code && code <= 0xD5C7 || // Lo  [27] HANGUL SYLLABLE HYAEG..HANGUL SYLLABLE HYAEH
			0xD5C9 <= code && code <= 0xD5E3 || // Lo  [27] HANGUL SYLLABLE HEOG..HANGUL SYLLABLE HEOH
			0xD5E5 <= code && code <= 0xD5FF || // Lo  [27] HANGUL SYLLABLE HEG..HANGUL SYLLABLE HEH
			0xD601 <= code && code <= 0xD61B || // Lo  [27] HANGUL SYLLABLE HYEOG..HANGUL SYLLABLE HYEOH
			0xD61D <= code && code <= 0xD637 || // Lo  [27] HANGUL SYLLABLE HYEG..HANGUL SYLLABLE HYEH
			0xD639 <= code && code <= 0xD653 || // Lo  [27] HANGUL SYLLABLE HOG..HANGUL SYLLABLE HOH
			0xD655 <= code && code <= 0xD66F || // Lo  [27] HANGUL SYLLABLE HWAG..HANGUL SYLLABLE HWAH
			0xD671 <= code && code <= 0xD68B || // Lo  [27] HANGUL SYLLABLE HWAEG..HANGUL SYLLABLE HWAEH
			0xD68D <= code && code <= 0xD6A7 || // Lo  [27] HANGUL SYLLABLE HOEG..HANGUL SYLLABLE HOEH
			0xD6A9 <= code && code <= 0xD6C3 || // Lo  [27] HANGUL SYLLABLE HYOG..HANGUL SYLLABLE HYOH
			0xD6C5 <= code && code <= 0xD6DF || // Lo  [27] HANGUL SYLLABLE HUG..HANGUL SYLLABLE HUH
			0xD6E1 <= code && code <= 0xD6FB || // Lo  [27] HANGUL SYLLABLE HWEOG..HANGUL SYLLABLE HWEOH
			0xD6FD <= code && code <= 0xD717 || // Lo  [27] HANGUL SYLLABLE HWEG..HANGUL SYLLABLE HWEH
			0xD719 <= code && code <= 0xD733 || // Lo  [27] HANGUL SYLLABLE HWIG..HANGUL SYLLABLE HWIH
			0xD735 <= code && code <= 0xD74F || // Lo  [27] HANGUL SYLLABLE HYUG..HANGUL SYLLABLE HYUH
			0xD751 <= code && code <= 0xD76B || // Lo  [27] HANGUL SYLLABLE HEUG..HANGUL SYLLABLE HEUH
			0xD76D <= code && code <= 0xD787 || // Lo  [27] HANGUL SYLLABLE HYIG..HANGUL SYLLABLE HYIH
			0xD789 <= code && code <= 0xD7A3 // Lo  [27] HANGUL SYLLABLE HIG..HANGUL SYLLABLE HIH
			) {
					return LVT;
				}

			if (0x261D == code || // So       WHITE UP POINTING INDEX
			0x26F9 == code || // So       PERSON WITH BALL
			0x270A <= code && code <= 0x270D || // So   [4] RAISED FIST..WRITING HAND
			0x1F385 == code || // So       FATHER CHRISTMAS
			0x1F3C2 <= code && code <= 0x1F3C4 || // So   [3] SNOWBOARDER..SURFER
			0x1F3C7 == code || // So       HORSE RACING
			0x1F3CA <= code && code <= 0x1F3CC || // So   [3] SWIMMER..GOLFER
			0x1F442 <= code && code <= 0x1F443 || // So   [2] EAR..NOSE
			0x1F446 <= code && code <= 0x1F450 || // So  [11] WHITE UP POINTING BACKHAND INDEX..OPEN HANDS SIGN
			0x1F46E == code || // So       POLICE OFFICER
			0x1F470 <= code && code <= 0x1F478 || // So   [9] BRIDE WITH VEIL..PRINCESS
			0x1F47C == code || // So       BABY ANGEL
			0x1F481 <= code && code <= 0x1F483 || // So   [3] INFORMATION DESK PERSON..DANCER
			0x1F485 <= code && code <= 0x1F487 || // So   [3] NAIL POLISH..HAIRCUT
			0x1F4AA == code || // So       FLEXED BICEPS
			0x1F574 <= code && code <= 0x1F575 || // So   [2] MAN IN BUSINESS SUIT LEVITATING..SLEUTH OR SPY
			0x1F57A == code || // So       MAN DANCING
			0x1F590 == code || // So       RAISED HAND WITH FINGERS SPLAYED
			0x1F595 <= code && code <= 0x1F596 || // So   [2] REVERSED HAND WITH MIDDLE FINGER EXTENDED..RAISED HAND WITH PART BETWEEN MIDDLE AND RING FINGERS
			0x1F645 <= code && code <= 0x1F647 || // So   [3] FACE WITH NO GOOD GESTURE..PERSON BOWING DEEPLY
			0x1F64B <= code && code <= 0x1F64F || // So   [5] HAPPY PERSON RAISING ONE HAND..PERSON WITH FOLDED HANDS
			0x1F6A3 == code || // So       ROWBOAT
			0x1F6B4 <= code && code <= 0x1F6B6 || // So   [3] BICYCLIST..PEDESTRIAN
			0x1F6C0 == code || // So       BATH
			0x1F6CC == code || // So       SLEEPING ACCOMMODATION
			0x1F918 <= code && code <= 0x1F91C || // So   [5] SIGN OF THE HORNS..RIGHT-FACING FIST
			0x1F91E <= code && code <= 0x1F91F || // So   [2] HAND WITH INDEX AND MIDDLE FINGERS CROSSED..I LOVE YOU HAND SIGN
			0x1F926 == code || // So       FACE PALM
			0x1F930 <= code && code <= 0x1F939 || // So  [10] PREGNANT WOMAN..JUGGLING
			0x1F93D <= code && code <= 0x1F93E || // So   [2] WATER POLO..HANDBALL
			0x1F9D1 <= code && code <= 0x1F9DD // So  [13] ADULT..ELF
			) {
					return E_Base;
				}

			if (0x1F3FB <= code && code <= 0x1F3FF) // Sk   [5] EMOJI MODIFIER FITZPATRICK TYPE-1-2..EMOJI MODIFIER FITZPATRICK TYPE-6
				{
					return E_Modifier;
				}

			if (0x200D == code // Cf       ZERO WIDTH JOINER
			) {
					return ZWJ;
				}

			if (0x2640 == code || // So       FEMALE SIGN
			0x2642 == code || // So       MALE SIGN
			0x2695 <= code && code <= 0x2696 || // So   [2] STAFF OF AESCULAPIUS..SCALES
			0x2708 == code || // So       AIRPLANE
			0x2764 == code || // So       HEAVY BLACK HEART
			0x1F308 == code || // So       RAINBOW
			0x1F33E == code || // So       EAR OF RICE
			0x1F373 == code || // So       COOKING
			0x1F393 == code || // So       GRADUATION CAP
			0x1F3A4 == code || // So       MICROPHONE
			0x1F3A8 == code || // So       ARTIST PALETTE
			0x1F3EB == code || // So       SCHOOL
			0x1F3ED == code || // So       FACTORY
			0x1F48B == code || // So       KISS MARK
			0x1F4BB <= code && code <= 0x1F4BC || // So   [2] PERSONAL COMPUTER..BRIEFCASE
			0x1F527 == code || // So       WRENCH
			0x1F52C == code || // So       MICROSCOPE
			0x1F5E8 == code || // So       LEFT SPEECH BUBBLE
			0x1F680 == code || // So       ROCKET
			0x1F692 == code // So       FIRE ENGINE
			) {
					return Glue_After_Zwj;
				}

			if (0x1F466 <= code && code <= 0x1F469) // So   [4] BOY..WOMAN
				{
					return E_Base_GAZ;
				}

			//all unlisted characters have a grapheme break property of "Other"
			return Other;
		}
		return this;
	}

	if ( true && module.exports) {
		module.exports = GraphemeSplitter;
	}
});

var splitter = new graphemeSplitter();

var substring = function substring(str, start, end) {
	var iterator = splitter.iterateGraphemes(str.substring(start));

	var value = '';

	for (var pos = 0; pos < end - start; pos++) {
		var next = iterator.next();

		value += next.value;

		if (next.done) {
			break;
		}
	}

	return value;
};

var location = (function (startLine, startColumn, startOffset, endLine, endColumn, endOffset, source) {
	return {
		start: {
			line: startLine,
			column: startColumn,
			offset: startOffset
		},
		end: {
			line: endLine,
			column: endColumn,
			offset: endOffset
		},
		source: source || null
	};
});

var build = createCommonjsModule(function (module, exports) {
  (function (global, factory) {
    module.exports = factory();
  })(commonjsGlobal, function () {
    'use strict';

    /*!
     * repeat-string <https://github.com/jonschlinkert/repeat-string>
     *
     * Copyright (c) 2014-2015, Jon Schlinkert.
     * Licensed under the MIT License.
     */

    'use strict';

    /**
     * Results cache
     */

    var res = '';
    var cache;

    /**
     * Expose `repeat`
     */

    var repeatString = repeat;

    /**
     * Repeat the given `string` the specified `number`
     * of times.
     *
     * **Example:**
     *
     * ```js
     * var repeat = require('repeat-string');
     * repeat('A', 5);
     * //=> AAAAA
     * ```
     *
     * @param {String} `string` The string to repeat
     * @param {Number} `number` The number of times to repeat the string
     * @return {String} Repeated string
     * @api public
     */

    function repeat(str, num) {
      if (typeof str !== 'string') {
        throw new TypeError('expected a string');
      }

      // cover common, quick use cases
      if (num === 1) return str;
      if (num === 2) return str + str;

      var max = str.length * num;
      if (cache !== str || typeof cache === 'undefined') {
        cache = str;
        res = '';
      } else if (res.length >= max) {
        return res.substr(0, max);
      }

      while (max > res.length && num > 1) {
        if (num & 1) {
          res += str;
        }

        num >>= 1;
        str += str;
      }

      res += str;
      res = res.substr(0, max);
      return res;
    }

    'use strict';

    var padStart = function padStart(string, maxLength, fillString) {

      if (string == null || maxLength == null) {
        return string;
      }

      var result = String(string);
      var targetLen = typeof maxLength === 'number' ? maxLength : parseInt(maxLength, 10);

      if (isNaN(targetLen) || !isFinite(targetLen)) {
        return result;
      }

      var length = result.length;
      if (length >= targetLen) {
        return result;
      }

      var fill = fillString == null ? '' : String(fillString);
      if (fill === '') {
        fill = ' ';
      }

      var fillLen = targetLen - length;

      while (fill.length < fillLen) {
        fill += fill;
      }

      var truncated = fill.length > fillLen ? fill.substr(0, fillLen) : fill;

      return truncated + result;
    };

    var _extends = Object.assign || function (target) {
      for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i];

        for (var key in source) {
          if (Object.prototype.hasOwnProperty.call(source, key)) {
            target[key] = source[key];
          }
        }
      }

      return target;
    };

    function printLine(line, position, maxNumLength, settings) {
      var num = String(position);
      var formattedNum = padStart(num, maxNumLength, ' ');
      var tabReplacement = repeatString(' ', settings.tabSize);

      return formattedNum + ' | ' + line.replace(/\t/g, tabReplacement);
    }

    function printLines(lines, start, end, maxNumLength, settings) {
      return lines.slice(start, end).map(function (line, i) {
        return printLine(line, start + i + 1, maxNumLength, settings);
      }).join('\n');
    }

    var defaultSettings = {
      extraLines: 2,
      tabSize: 4
    };

    var index = function index(input, linePos, columnPos, settings) {
      settings = _extends({}, defaultSettings, settings);

      var lines = input.split(/\r\n?|\n|\f/);
      var startLinePos = Math.max(1, linePos - settings.extraLines) - 1;
      var endLinePos = Math.min(linePos + settings.extraLines, lines.length);
      var maxNumLength = String(endLinePos).length;
      var prevLines = printLines(lines, startLinePos, linePos, maxNumLength, settings);
      var targetLineBeforeCursor = printLine(lines[linePos - 1].substring(0, columnPos - 1), linePos, maxNumLength, settings);
      var cursorLine = repeatString(' ', targetLineBeforeCursor.length) + '^';
      var nextLines = printLines(lines, linePos, endLinePos, maxNumLength, settings);

      return [prevLines, cursorLine, nextLines].filter(Boolean).join('\n');
    };

    return index;
  });
});

var errorStack = new Error().stack;

var createError = (function (props) {
	// use Object.create(), because some VMs prevent setting line/column otherwise
	// (iOS Safari 10 even throws an exception)
	var error = Object.create(SyntaxError.prototype);

	Object.assign(error, props, {
		name: 'SyntaxError'
	});

	Object.defineProperty(error, 'stack', {
		get: function get() {
			return errorStack ? errorStack.replace(/^(.+\n){1,3}/, String(error) + '\n') : '';
		}
	});

	return error;
});

var error = (function (message, input, source, line, column) {
	throw createError({
		message: line ? message + '\n' + build(input, line, column) : message,
		rawMessage: message,
		source: source,
		line: line,
		column: column
	});
});

var parseErrorTypes = {
	unexpectedEnd: function unexpectedEnd() {
		return 'Unexpected end of input';
	},
	unexpectedToken: function unexpectedToken(token) {
		for (var _len = arguments.length, position = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
			position[_key - 1] = arguments[_key];
		}

		return 'Unexpected token <' + token + '> at ' + position.filter(Boolean).join(':');
	}
};

var tokenizeErrorTypes = {
	unexpectedSymbol: function unexpectedSymbol(symbol) {
		for (var _len = arguments.length, position = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
			position[_key - 1] = arguments[_key];
		}

		return 'Unexpected symbol <' + symbol + '> at ' + position.filter(Boolean).join(':');
	}
};

var tokenTypes = {
	LEFT_BRACE: 0, // {
	RIGHT_BRACE: 1, // }
	LEFT_BRACKET: 2, // [
	RIGHT_BRACKET: 3, // ]
	COLON: 4, // :
	COMMA: 5, // ,
	STRING: 6, //
	NUMBER: 7, //
	TRUE: 8, // true
	FALSE: 9, // false
	NULL: 10 // null
};

var punctuatorTokensMap = { // Lexeme: Token
	'{': tokenTypes.LEFT_BRACE,
	'}': tokenTypes.RIGHT_BRACE,
	'[': tokenTypes.LEFT_BRACKET,
	']': tokenTypes.RIGHT_BRACKET,
	':': tokenTypes.COLON,
	',': tokenTypes.COMMA
};

var keywordTokensMap = { // Lexeme: Token
	'true': tokenTypes.TRUE,
	'false': tokenTypes.FALSE,
	'null': tokenTypes.NULL
};

var stringStates = {
	_START_: 0,
	START_QUOTE_OR_CHAR: 1,
	ESCAPE: 2
};

var escapes$1 = {
	'"': 0, // Quotation mask
	'\\': 1, // Reverse solidus
	'/': 2, // Solidus
	'b': 3, // Backspace
	'f': 4, // Form feed
	'n': 5, // New line
	'r': 6, // Carriage return
	't': 7, // Horizontal tab
	'u': 8 // 4 hexadecimal digits
};

var numberStates = {
	_START_: 0,
	MINUS: 1,
	ZERO: 2,
	DIGIT: 3,
	POINT: 4,
	DIGIT_FRACTION: 5,
	EXP: 6,
	EXP_DIGIT_OR_SIGN: 7
};

// HELPERS

function isDigit1to9(char) {
	return char >= '1' && char <= '9';
}

function isDigit(char) {
	return char >= '0' && char <= '9';
}

function isHex(char) {
	return isDigit(char) || char >= 'a' && char <= 'f' || char >= 'A' && char <= 'F';
}

function isExp(char) {
	return char === 'e' || char === 'E';
}

// PARSERS

function parseWhitespace(input, index, line, column) {
	var char = input.charAt(index);

	if (char === '\r') {
		// CR (Unix)
		index++;
		line++;
		column = 1;
		if (input.charAt(index) === '\n') {
			// CRLF (Windows)
			index++;
		}
	} else if (char === '\n') {
		// LF (MacOS)
		index++;
		line++;
		column = 1;
	} else if (char === '\t' || char === ' ') {
		index++;
		column++;
	} else {
		return null;
	}

	return {
		index: index,
		line: line,
		column: column
	};
}

function parseChar(input, index, line, column) {
	var char = input.charAt(index);

	if (char in punctuatorTokensMap) {
		return {
			type: punctuatorTokensMap[char],
			line: line,
			column: column + 1,
			index: index + 1,
			value: null
		};
	}

	return null;
}

function parseKeyword(input, index, line, column) {
	for (var name in keywordTokensMap) {
		if (keywordTokensMap.hasOwnProperty(name) && input.substr(index, name.length) === name) {
			return {
				type: keywordTokensMap[name],
				line: line,
				column: column + name.length,
				index: index + name.length,
				value: name
			};
		}
	}

	return null;
}

function parseString$1(input, index, line, column) {
	var startIndex = index;
	var state = stringStates._START_;

	while (index < input.length) {
		var char = input.charAt(index);

		switch (state) {
			case stringStates._START_:
				{
					if (char === '"') {
						index++;
						state = stringStates.START_QUOTE_OR_CHAR;
					} else {
						return null;
					}
					break;
				}

			case stringStates.START_QUOTE_OR_CHAR:
				{
					if (char === '\\') {
						index++;
						state = stringStates.ESCAPE;
					} else if (char === '"') {
						index++;
						return {
							type: tokenTypes.STRING,
							line: line,
							column: column + index - startIndex,
							index: index,
							value: input.slice(startIndex, index)
						};
					} else {
						index++;
					}
					break;
				}

			case stringStates.ESCAPE:
				{
					if (char in escapes$1) {
						index++;
						if (char === 'u') {
							for (var i = 0; i < 4; i++) {
								var curChar = input.charAt(index);
								if (curChar && isHex(curChar)) {
									index++;
								} else {
									return null;
								}
							}
						}
						state = stringStates.START_QUOTE_OR_CHAR;
					} else {
						return null;
					}
					break;
				}
		}
	}
}

function parseNumber(input, index, line, column) {
	var startIndex = index;
	var passedValueIndex = index;
	var state = numberStates._START_;

	iterator: while (index < input.length) {
		var char = input.charAt(index);

		switch (state) {
			case numberStates._START_:
				{
					if (char === '-') {
						state = numberStates.MINUS;
					} else if (char === '0') {
						passedValueIndex = index + 1;
						state = numberStates.ZERO;
					} else if (isDigit1to9(char)) {
						passedValueIndex = index + 1;
						state = numberStates.DIGIT;
					} else {
						return null;
					}
					break;
				}

			case numberStates.MINUS:
				{
					if (char === '0') {
						passedValueIndex = index + 1;
						state = numberStates.ZERO;
					} else if (isDigit1to9(char)) {
						passedValueIndex = index + 1;
						state = numberStates.DIGIT;
					} else {
						return null;
					}
					break;
				}

			case numberStates.ZERO:
				{
					if (char === '.') {
						state = numberStates.POINT;
					} else if (isExp(char)) {
						state = numberStates.EXP;
					} else {
						break iterator;
					}
					break;
				}

			case numberStates.DIGIT:
				{
					if (isDigit(char)) {
						passedValueIndex = index + 1;
					} else if (char === '.') {
						state = numberStates.POINT;
					} else if (isExp(char)) {
						state = numberStates.EXP;
					} else {
						break iterator;
					}
					break;
				}

			case numberStates.POINT:
				{
					if (isDigit(char)) {
						passedValueIndex = index + 1;
						state = numberStates.DIGIT_FRACTION;
					} else {
						break iterator;
					}
					break;
				}

			case numberStates.DIGIT_FRACTION:
				{
					if (isDigit(char)) {
						passedValueIndex = index + 1;
					} else if (isExp(char)) {
						state = numberStates.EXP;
					} else {
						break iterator;
					}
					break;
				}

			case numberStates.EXP:
				{
					if (char === '+' || char === '-') {
						state = numberStates.EXP_DIGIT_OR_SIGN;
					} else if (isDigit(char)) {
						passedValueIndex = index + 1;
						state = numberStates.EXP_DIGIT_OR_SIGN;
					} else {
						break iterator;
					}
					break;
				}

			case numberStates.EXP_DIGIT_OR_SIGN:
				{
					if (isDigit(char)) {
						passedValueIndex = index + 1;
					} else {
						break iterator;
					}
					break;
				}
		}

		index++;
	}

	if (passedValueIndex > 0) {
		return {
			type: tokenTypes.NUMBER,
			line: line,
			column: column + passedValueIndex - startIndex,
			index: passedValueIndex,
			value: input.slice(startIndex, passedValueIndex)
		};
	}

	return null;
}

var tokenize = function tokenize(input, settings) {
	var line = 1;
	var column = 1;
	var index = 0;
	var tokens = [];

	while (index < input.length) {
		var args = [input, index, line, column];
		var whitespace = parseWhitespace.apply(undefined, args);

		if (whitespace) {
			index = whitespace.index;
			line = whitespace.line;
			column = whitespace.column;
			continue;
		}

		var matched = parseChar.apply(undefined, args) || parseKeyword.apply(undefined, args) || parseString$1.apply(undefined, args) || parseNumber.apply(undefined, args);

		if (matched) {
			var token = {
				type: matched.type,
				value: matched.value,
				loc: location(line, column, index, matched.line, matched.column, matched.index, settings.source)
			};

			tokens.push(token);
			index = matched.index;
			line = matched.line;
			column = matched.column;
		} else {
			error(tokenizeErrorTypes.unexpectedSymbol(substring(input, index, index + 1), settings.source, line, column), input, settings.source, line, column);
		}
	}

	return tokens;
};

var objectStates = {
	_START_: 0,
	OPEN_OBJECT: 1,
	PROPERTY: 2,
	COMMA: 3
};

var propertyStates = {
	_START_: 0,
	KEY: 1,
	COLON: 2
};

var arrayStates = {
	_START_: 0,
	OPEN_ARRAY: 1,
	VALUE: 2,
	COMMA: 3
};

var defaultSettings = {
	loc: true,
	source: null
};

function errorEof(input, tokenList, settings) {
	var loc = tokenList.length > 0 ? tokenList[tokenList.length - 1].loc.end : { line: 1, column: 1 };

	error(parseErrorTypes.unexpectedEnd(), input, settings.source, loc.line, loc.column);
}

/** @param hexCode {string} hexCode without '\u' prefix */
function parseHexEscape(hexCode) {
	var charCode = 0;

	for (var i = 0; i < 4; i++) {
		charCode = charCode * 16 + parseInt(hexCode[i], 16);
	}

	return String.fromCharCode(charCode);
}

var escapes = {
	'b': '\b', // Backspace
	'f': '\f', // Form feed
	'n': '\n', // New line
	'r': '\r', // Carriage return
	't': '\t' // Horizontal tab
};

var passEscapes = ['"', '\\', '/'];

function parseString( /** string */string) {
	var result = '';

	for (var i = 0; i < string.length; i++) {
		var char = string.charAt(i);

		if (char === '\\') {
			i++;
			var nextChar = string.charAt(i);
			if (nextChar === 'u') {
				result += parseHexEscape(string.substr(i + 1, 4));
				i += 4;
			} else if (passEscapes.indexOf(nextChar) !== -1) {
				result += nextChar;
			} else if (nextChar in escapes) {
				result += escapes[nextChar];
			} else {
				break;
			}
		} else {
			result += char;
		}
	}

	return result;
}

function parseObject(input, tokenList, index, settings) {
	// object: LEFT_BRACE (property (COMMA property)*)? RIGHT_BRACE
	var startToken = void 0;
	var object = {
		type: 'Object',
		children: []
	};
	var state = objectStates._START_;

	while (index < tokenList.length) {
		var token = tokenList[index];

		switch (state) {
			case objectStates._START_:
				{
					if (token.type === tokenTypes.LEFT_BRACE) {
						startToken = token;
						state = objectStates.OPEN_OBJECT;
						index++;
					} else {
						return null;
					}
					break;
				}

			case objectStates.OPEN_OBJECT:
				{
					if (token.type === tokenTypes.RIGHT_BRACE) {
						if (settings.loc) {
							object.loc = location(startToken.loc.start.line, startToken.loc.start.column, startToken.loc.start.offset, token.loc.end.line, token.loc.end.column, token.loc.end.offset, settings.source);
						}
						return {
							value: object,
							index: index + 1
						};
					} else {
						var property = parseProperty(input, tokenList, index, settings);
						object.children.push(property.value);
						state = objectStates.PROPERTY;
						index = property.index;
					}
					break;
				}

			case objectStates.PROPERTY:
				{
					if (token.type === tokenTypes.RIGHT_BRACE) {
						if (settings.loc) {
							object.loc = location(startToken.loc.start.line, startToken.loc.start.column, startToken.loc.start.offset, token.loc.end.line, token.loc.end.column, token.loc.end.offset, settings.source);
						}
						return {
							value: object,
							index: index + 1
						};
					} else if (token.type === tokenTypes.COMMA) {
						state = objectStates.COMMA;
						index++;
					} else {
						error(parseErrorTypes.unexpectedToken(substring(input, token.loc.start.offset, token.loc.end.offset), settings.source, token.loc.start.line, token.loc.start.column), input, settings.source, token.loc.start.line, token.loc.start.column);
					}
					break;
				}

			case objectStates.COMMA:
				{
					var _property = parseProperty(input, tokenList, index, settings);
					if (_property) {
						index = _property.index;
						object.children.push(_property.value);
						state = objectStates.PROPERTY;
					} else {
						error(parseErrorTypes.unexpectedToken(substring(input, token.loc.start.offset, token.loc.end.offset), settings.source, token.loc.start.line, token.loc.start.column), input, settings.source, token.loc.start.line, token.loc.start.column);
					}
					break;
				}
		}
	}

	errorEof(input, tokenList, settings);
}

function parseProperty(input, tokenList, index, settings) {
	// property: STRING COLON value
	var startToken = void 0;
	var property = {
		type: 'Property',
		key: null,
		value: null
	};
	var state = propertyStates._START_;

	while (index < tokenList.length) {
		var token = tokenList[index];

		switch (state) {
			case propertyStates._START_:
				{
					if (token.type === tokenTypes.STRING) {
						var key = {
							type: 'Identifier',
							value: parseString(input.slice(token.loc.start.offset + 1, token.loc.end.offset - 1)),
							raw: token.value
						};
						if (settings.loc) {
							key.loc = token.loc;
						}
						startToken = token;
						property.key = key;
						state = propertyStates.KEY;
						index++;
					} else {
						return null;
					}
					break;
				}

			case propertyStates.KEY:
				{
					if (token.type === tokenTypes.COLON) {
						state = propertyStates.COLON;
						index++;
					} else {
						error(parseErrorTypes.unexpectedToken(substring(input, token.loc.start.offset, token.loc.end.offset), settings.source, token.loc.start.line, token.loc.start.column), input, settings.source, token.loc.start.line, token.loc.start.column);
					}
					break;
				}

			case propertyStates.COLON:
				{
					var value = parseValue(input, tokenList, index, settings);
					property.value = value.value;
					if (settings.loc) {
						property.loc = location(startToken.loc.start.line, startToken.loc.start.column, startToken.loc.start.offset, value.value.loc.end.line, value.value.loc.end.column, value.value.loc.end.offset, settings.source);
					}
					return {
						value: property,
						index: value.index
					};
				}

		}
	}
}

function parseArray(input, tokenList, index, settings) {
	// array: LEFT_BRACKET (value (COMMA value)*)? RIGHT_BRACKET
	var startToken = void 0;
	var array = {
		type: 'Array',
		children: []
	};
	var state = arrayStates._START_;
	var token = void 0;

	while (index < tokenList.length) {
		token = tokenList[index];

		switch (state) {
			case arrayStates._START_:
				{
					if (token.type === tokenTypes.LEFT_BRACKET) {
						startToken = token;
						state = arrayStates.OPEN_ARRAY;
						index++;
					} else {
						return null;
					}
					break;
				}

			case arrayStates.OPEN_ARRAY:
				{
					if (token.type === tokenTypes.RIGHT_BRACKET) {
						if (settings.loc) {
							array.loc = location(startToken.loc.start.line, startToken.loc.start.column, startToken.loc.start.offset, token.loc.end.line, token.loc.end.column, token.loc.end.offset, settings.source);
						}
						return {
							value: array,
							index: index + 1
						};
					} else {
						var value = parseValue(input, tokenList, index, settings);
						index = value.index;
						array.children.push(value.value);
						state = arrayStates.VALUE;
					}
					break;
				}

			case arrayStates.VALUE:
				{
					if (token.type === tokenTypes.RIGHT_BRACKET) {
						if (settings.loc) {
							array.loc = location(startToken.loc.start.line, startToken.loc.start.column, startToken.loc.start.offset, token.loc.end.line, token.loc.end.column, token.loc.end.offset, settings.source);
						}
						return {
							value: array,
							index: index + 1
						};
					} else if (token.type === tokenTypes.COMMA) {
						state = arrayStates.COMMA;
						index++;
					} else {
						error(parseErrorTypes.unexpectedToken(substring(input, token.loc.start.offset, token.loc.end.offset), settings.source, token.loc.start.line, token.loc.start.column), input, settings.source, token.loc.start.line, token.loc.start.column);
					}
					break;
				}

			case arrayStates.COMMA:
				{
					var _value = parseValue(input, tokenList, index, settings);
					index = _value.index;
					array.children.push(_value.value);
					state = arrayStates.VALUE;
					break;
				}
		}
	}

	errorEof(input, tokenList, settings);
}

function parseLiteral(input, tokenList, index, settings) {
	// literal: STRING | NUMBER | TRUE | FALSE | NULL
	var token = tokenList[index];
	var value = null;

	switch (token.type) {
		case tokenTypes.STRING:
			{
				value = parseString(input.slice(token.loc.start.offset + 1, token.loc.end.offset - 1));
				break;
			}
		case tokenTypes.NUMBER:
			{
				value = Number(token.value);
				break;
			}
		case tokenTypes.TRUE:
			{
				value = true;
				break;
			}
		case tokenTypes.FALSE:
			{
				value = false;
				break;
			}
		case tokenTypes.NULL:
			{
				value = null;
				break;
			}
		default:
			{
				return null;
			}
	}

	var literal = {
		type: 'Literal',
		value: value,
		raw: token.value
	};
	if (settings.loc) {
		literal.loc = token.loc;
	}
	return {
		value: literal,
		index: index + 1
	};
}

function parseValue(input, tokenList, index, settings) {
	// value: literal | object | array
	var token = tokenList[index];

	var value = parseLiteral.apply(undefined, arguments) || parseObject.apply(undefined, arguments) || parseArray.apply(undefined, arguments);

	if (value) {
		return value;
	} else {
		error(parseErrorTypes.unexpectedToken(substring(input, token.loc.start.offset, token.loc.end.offset), settings.source, token.loc.start.line, token.loc.start.column), input, settings.source, token.loc.start.line, token.loc.start.column);
	}
}

var parse$1 = (function (input, settings) {
	settings = Object.assign({}, defaultSettings, settings);

	var tokenList = tokenize(input, settings);

	if (tokenList.length === 0) {
		errorEof(input, tokenList, settings);
	}

	var value = parseValue(input, tokenList, 0, settings);

	if (value.index === tokenList.length) {
		return value.value;
	}

	var token = tokenList[value.index];

	error(parseErrorTypes.unexpectedToken(substring(input, token.loc.start.offset, token.loc.end.offset), settings.source, token.loc.start.line, token.loc.start.column), input, settings.source, token.loc.start.line, token.loc.start.column);
});

return parse$1;

})));


/***/ }),

/***/ 7571:
/***/ ((__unused_webpack_module, exports) => {

var hasExcape = /~/
var escapeMatcher = /~[01]/g
function escapeReplacer (m) {
  switch (m) {
    case '~1': return '/'
    case '~0': return '~'
  }
  throw new Error('Invalid tilde escape: ' + m)
}

function untilde (str) {
  if (!hasExcape.test(str)) return str
  return str.replace(escapeMatcher, escapeReplacer)
}

function setter (obj, pointer, value) {
  var part
  var hasNextPart

  for (var p = 1, len = pointer.length; p < len;) {
    part = untilde(pointer[p++])
    hasNextPart = len > p

    if (typeof obj[part] === 'undefined') {
      // support setting of /-
      if (Array.isArray(obj) && part === '-') {
        part = obj.length
      }

      // support nested objects/array when setting values
      if (hasNextPart) {
        if ((pointer[p] !== '' && pointer[p] < Infinity) || pointer[p] === '-') obj[part] = []
        else obj[part] = {}
      }
    }

    if (!hasNextPart) break
    obj = obj[part]
  }

  var oldValue = obj[part]
  if (value === undefined) delete obj[part]
  else obj[part] = value
  return oldValue
}

function compilePointer (pointer) {
  if (typeof pointer === 'string') {
    pointer = pointer.split('/')
    if (pointer[0] === '') return pointer
    throw new Error('Invalid JSON pointer.')
  } else if (Array.isArray(pointer)) {
    return pointer
  }

  throw new Error('Invalid JSON pointer.')
}

function get (obj, pointer) {
  if (typeof obj !== 'object') throw new Error('Invalid input object.')
  pointer = compilePointer(pointer)
  var len = pointer.length
  if (len === 1) return obj

  for (var p = 1; p < len;) {
    obj = obj[untilde(pointer[p++])]
    if (len === p) return obj
    if (typeof obj !== 'object') return undefined
  }
}

function set (obj, pointer, value) {
  if (typeof obj !== 'object') throw new Error('Invalid input object.')
  pointer = compilePointer(pointer)
  if (pointer.length === 0) throw new Error('Invalid JSON pointer for set.')
  return setter(obj, pointer, value)
}

function compile (pointer) {
  var compiled = compilePointer(pointer)
  return {
    get: function (object) {
      return get(object, compiled)
    },
    set: function (object, value) {
      return set(object, compiled, value)
    }
  }
}

exports.get = get
exports.set = set
exports.compile = compile


/***/ }),

/***/ 9232:
/***/ ((module) => {

"use strict";

const array = [];
const charCodeCache = [];

const leven = (left, right) => {
	if (left === right) {
		return 0;
	}

	const swap = left;

	// Swapping the strings if `a` is longer than `b` so we know which one is the
	// shortest & which one is the longest
	if (left.length > right.length) {
		left = right;
		right = swap;
	}

	let leftLength = left.length;
	let rightLength = right.length;

	// Performing suffix trimming:
	// We can linearly drop suffix common to both strings since they
	// don't increase distance at all
	// Note: `~-` is the bitwise way to perform a `- 1` operation
	while (leftLength > 0 && (left.charCodeAt(~-leftLength) === right.charCodeAt(~-rightLength))) {
		leftLength--;
		rightLength--;
	}

	// Performing prefix trimming
	// We can linearly drop prefix common to both strings since they
	// don't increase distance at all
	let start = 0;

	while (start < leftLength && (left.charCodeAt(start) === right.charCodeAt(start))) {
		start++;
	}

	leftLength -= start;
	rightLength -= start;

	if (leftLength === 0) {
		return rightLength;
	}

	let bCharCode;
	let result;
	let temp;
	let temp2;
	let i = 0;
	let j = 0;

	while (i < leftLength) {
		charCodeCache[i] = left.charCodeAt(start + i);
		array[i] = ++i;
	}

	while (j < rightLength) {
		bCharCode = right.charCodeAt(start + j);
		temp = j++;
		result = j;

		for (i = 0; i < leftLength; i++) {
			temp2 = bCharCode === charCodeCache[i] ? temp : temp + 1;
			temp = array[i];
			// eslint-disable-next-line no-multi-assign
			result = array[i] = temp > result ? temp2 > result ? result + 1 : temp2 : temp2 > temp ? temp + 1 : temp2;
		}
	}

	return result;
};

module.exports = leven;
// TODO: Remove this for the next major release
module.exports.default = leven;


/***/ }),

/***/ 3973:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = minimatch
minimatch.Minimatch = Minimatch

var path = { sep: '/' }
try {
  path = __webpack_require__(5622)
} catch (er) {}

var GLOBSTAR = minimatch.GLOBSTAR = Minimatch.GLOBSTAR = {}
var expand = __webpack_require__(3717)

var plTypes = {
  '!': { open: '(?:(?!(?:', close: '))[^/]*?)'},
  '?': { open: '(?:', close: ')?' },
  '+': { open: '(?:', close: ')+' },
  '*': { open: '(?:', close: ')*' },
  '@': { open: '(?:', close: ')' }
}

// any single thing other than /
// don't need to escape / when using new RegExp()
var qmark = '[^/]'

// * => any number of characters
var star = qmark + '*?'

// ** when dots are allowed.  Anything goes, except .. and .
// not (^ or / followed by one or two dots followed by $ or /),
// followed by anything, any number of times.
var twoStarDot = '(?:(?!(?:\\\/|^)(?:\\.{1,2})($|\\\/)).)*?'

// not a ^ or / followed by a dot,
// followed by anything, any number of times.
var twoStarNoDot = '(?:(?!(?:\\\/|^)\\.).)*?'

// characters that need to be escaped in RegExp.
var reSpecials = charSet('().*{}+?[]^$\\!')

// "abc" -> { a:true, b:true, c:true }
function charSet (s) {
  return s.split('').reduce(function (set, c) {
    set[c] = true
    return set
  }, {})
}

// normalizes slashes.
var slashSplit = /\/+/

minimatch.filter = filter
function filter (pattern, options) {
  options = options || {}
  return function (p, i, list) {
    return minimatch(p, pattern, options)
  }
}

function ext (a, b) {
  a = a || {}
  b = b || {}
  var t = {}
  Object.keys(b).forEach(function (k) {
    t[k] = b[k]
  })
  Object.keys(a).forEach(function (k) {
    t[k] = a[k]
  })
  return t
}

minimatch.defaults = function (def) {
  if (!def || !Object.keys(def).length) return minimatch

  var orig = minimatch

  var m = function minimatch (p, pattern, options) {
    return orig.minimatch(p, pattern, ext(def, options))
  }

  m.Minimatch = function Minimatch (pattern, options) {
    return new orig.Minimatch(pattern, ext(def, options))
  }

  return m
}

Minimatch.defaults = function (def) {
  if (!def || !Object.keys(def).length) return Minimatch
  return minimatch.defaults(def).Minimatch
}

function minimatch (p, pattern, options) {
  if (typeof pattern !== 'string') {
    throw new TypeError('glob pattern string required')
  }

  if (!options) options = {}

  // shortcut: comments match nothing.
  if (!options.nocomment && pattern.charAt(0) === '#') {
    return false
  }

  // "" only matches ""
  if (pattern.trim() === '') return p === ''

  return new Minimatch(pattern, options).match(p)
}

function Minimatch (pattern, options) {
  if (!(this instanceof Minimatch)) {
    return new Minimatch(pattern, options)
  }

  if (typeof pattern !== 'string') {
    throw new TypeError('glob pattern string required')
  }

  if (!options) options = {}
  pattern = pattern.trim()

  // windows support: need to use /, not \
  if (path.sep !== '/') {
    pattern = pattern.split(path.sep).join('/')
  }

  this.options = options
  this.set = []
  this.pattern = pattern
  this.regexp = null
  this.negate = false
  this.comment = false
  this.empty = false

  // make the set of regexps etc.
  this.make()
}

Minimatch.prototype.debug = function () {}

Minimatch.prototype.make = make
function make () {
  // don't do it more than once.
  if (this._made) return

  var pattern = this.pattern
  var options = this.options

  // empty patterns and comments match nothing.
  if (!options.nocomment && pattern.charAt(0) === '#') {
    this.comment = true
    return
  }
  if (!pattern) {
    this.empty = true
    return
  }

  // step 1: figure out negation, etc.
  this.parseNegate()

  // step 2: expand braces
  var set = this.globSet = this.braceExpand()

  if (options.debug) this.debug = console.error

  this.debug(this.pattern, set)

  // step 3: now we have a set, so turn each one into a series of path-portion
  // matching patterns.
  // These will be regexps, except in the case of "**", which is
  // set to the GLOBSTAR object for globstar behavior,
  // and will not contain any / characters
  set = this.globParts = set.map(function (s) {
    return s.split(slashSplit)
  })

  this.debug(this.pattern, set)

  // glob --> regexps
  set = set.map(function (s, si, set) {
    return s.map(this.parse, this)
  }, this)

  this.debug(this.pattern, set)

  // filter out everything that didn't compile properly.
  set = set.filter(function (s) {
    return s.indexOf(false) === -1
  })

  this.debug(this.pattern, set)

  this.set = set
}

Minimatch.prototype.parseNegate = parseNegate
function parseNegate () {
  var pattern = this.pattern
  var negate = false
  var options = this.options
  var negateOffset = 0

  if (options.nonegate) return

  for (var i = 0, l = pattern.length
    ; i < l && pattern.charAt(i) === '!'
    ; i++) {
    negate = !negate
    negateOffset++
  }

  if (negateOffset) this.pattern = pattern.substr(negateOffset)
  this.negate = negate
}

// Brace expansion:
// a{b,c}d -> abd acd
// a{b,}c -> abc ac
// a{0..3}d -> a0d a1d a2d a3d
// a{b,c{d,e}f}g -> abg acdfg acefg
// a{b,c}d{e,f}g -> abdeg acdeg abdeg abdfg
//
// Invalid sets are not expanded.
// a{2..}b -> a{2..}b
// a{b}c -> a{b}c
minimatch.braceExpand = function (pattern, options) {
  return braceExpand(pattern, options)
}

Minimatch.prototype.braceExpand = braceExpand

function braceExpand (pattern, options) {
  if (!options) {
    if (this instanceof Minimatch) {
      options = this.options
    } else {
      options = {}
    }
  }

  pattern = typeof pattern === 'undefined'
    ? this.pattern : pattern

  if (typeof pattern === 'undefined') {
    throw new TypeError('undefined pattern')
  }

  if (options.nobrace ||
    !pattern.match(/\{.*\}/)) {
    // shortcut. no need to expand.
    return [pattern]
  }

  return expand(pattern)
}

// parse a component of the expanded set.
// At this point, no pattern may contain "/" in it
// so we're going to return a 2d array, where each entry is the full
// pattern, split on '/', and then turned into a regular expression.
// A regexp is made at the end which joins each array with an
// escaped /, and another full one which joins each regexp with |.
//
// Following the lead of Bash 4.1, note that "**" only has special meaning
// when it is the *only* thing in a path portion.  Otherwise, any series
// of * is equivalent to a single *.  Globstar behavior is enabled by
// default, and can be disabled by setting options.noglobstar.
Minimatch.prototype.parse = parse
var SUBPARSE = {}
function parse (pattern, isSub) {
  if (pattern.length > 1024 * 64) {
    throw new TypeError('pattern is too long')
  }

  var options = this.options

  // shortcuts
  if (!options.noglobstar && pattern === '**') return GLOBSTAR
  if (pattern === '') return ''

  var re = ''
  var hasMagic = !!options.nocase
  var escaping = false
  // ? => one single character
  var patternListStack = []
  var negativeLists = []
  var stateChar
  var inClass = false
  var reClassStart = -1
  var classStart = -1
  // . and .. never match anything that doesn't start with .,
  // even when options.dot is set.
  var patternStart = pattern.charAt(0) === '.' ? '' // anything
  // not (start or / followed by . or .. followed by / or end)
  : options.dot ? '(?!(?:^|\\\/)\\.{1,2}(?:$|\\\/))'
  : '(?!\\.)'
  var self = this

  function clearStateChar () {
    if (stateChar) {
      // we had some state-tracking character
      // that wasn't consumed by this pass.
      switch (stateChar) {
        case '*':
          re += star
          hasMagic = true
        break
        case '?':
          re += qmark
          hasMagic = true
        break
        default:
          re += '\\' + stateChar
        break
      }
      self.debug('clearStateChar %j %j', stateChar, re)
      stateChar = false
    }
  }

  for (var i = 0, len = pattern.length, c
    ; (i < len) && (c = pattern.charAt(i))
    ; i++) {
    this.debug('%s\t%s %s %j', pattern, i, re, c)

    // skip over any that are escaped.
    if (escaping && reSpecials[c]) {
      re += '\\' + c
      escaping = false
      continue
    }

    switch (c) {
      case '/':
        // completely not allowed, even escaped.
        // Should already be path-split by now.
        return false

      case '\\':
        clearStateChar()
        escaping = true
      continue

      // the various stateChar values
      // for the "extglob" stuff.
      case '?':
      case '*':
      case '+':
      case '@':
      case '!':
        this.debug('%s\t%s %s %j <-- stateChar', pattern, i, re, c)

        // all of those are literals inside a class, except that
        // the glob [!a] means [^a] in regexp
        if (inClass) {
          this.debug('  in class')
          if (c === '!' && i === classStart + 1) c = '^'
          re += c
          continue
        }

        // if we already have a stateChar, then it means
        // that there was something like ** or +? in there.
        // Handle the stateChar, then proceed with this one.
        self.debug('call clearStateChar %j', stateChar)
        clearStateChar()
        stateChar = c
        // if extglob is disabled, then +(asdf|foo) isn't a thing.
        // just clear the statechar *now*, rather than even diving into
        // the patternList stuff.
        if (options.noext) clearStateChar()
      continue

      case '(':
        if (inClass) {
          re += '('
          continue
        }

        if (!stateChar) {
          re += '\\('
          continue
        }

        patternListStack.push({
          type: stateChar,
          start: i - 1,
          reStart: re.length,
          open: plTypes[stateChar].open,
          close: plTypes[stateChar].close
        })
        // negation is (?:(?!js)[^/]*)
        re += stateChar === '!' ? '(?:(?!(?:' : '(?:'
        this.debug('plType %j %j', stateChar, re)
        stateChar = false
      continue

      case ')':
        if (inClass || !patternListStack.length) {
          re += '\\)'
          continue
        }

        clearStateChar()
        hasMagic = true
        var pl = patternListStack.pop()
        // negation is (?:(?!js)[^/]*)
        // The others are (?:<pattern>)<type>
        re += pl.close
        if (pl.type === '!') {
          negativeLists.push(pl)
        }
        pl.reEnd = re.length
      continue

      case '|':
        if (inClass || !patternListStack.length || escaping) {
          re += '\\|'
          escaping = false
          continue
        }

        clearStateChar()
        re += '|'
      continue

      // these are mostly the same in regexp and glob
      case '[':
        // swallow any state-tracking char before the [
        clearStateChar()

        if (inClass) {
          re += '\\' + c
          continue
        }

        inClass = true
        classStart = i
        reClassStart = re.length
        re += c
      continue

      case ']':
        //  a right bracket shall lose its special
        //  meaning and represent itself in
        //  a bracket expression if it occurs
        //  first in the list.  -- POSIX.2 2.8.3.2
        if (i === classStart + 1 || !inClass) {
          re += '\\' + c
          escaping = false
          continue
        }

        // handle the case where we left a class open.
        // "[z-a]" is valid, equivalent to "\[z-a\]"
        if (inClass) {
          // split where the last [ was, make sure we don't have
          // an invalid re. if so, re-walk the contents of the
          // would-be class to re-translate any characters that
          // were passed through as-is
          // TODO: It would probably be faster to determine this
          // without a try/catch and a new RegExp, but it's tricky
          // to do safely.  For now, this is safe and works.
          var cs = pattern.substring(classStart + 1, i)
          try {
            RegExp('[' + cs + ']')
          } catch (er) {
            // not a valid class!
            var sp = this.parse(cs, SUBPARSE)
            re = re.substr(0, reClassStart) + '\\[' + sp[0] + '\\]'
            hasMagic = hasMagic || sp[1]
            inClass = false
            continue
          }
        }

        // finish up the class.
        hasMagic = true
        inClass = false
        re += c
      continue

      default:
        // swallow any state char that wasn't consumed
        clearStateChar()

        if (escaping) {
          // no need
          escaping = false
        } else if (reSpecials[c]
          && !(c === '^' && inClass)) {
          re += '\\'
        }

        re += c

    } // switch
  } // for

  // handle the case where we left a class open.
  // "[abc" is valid, equivalent to "\[abc"
  if (inClass) {
    // split where the last [ was, and escape it
    // this is a huge pita.  We now have to re-walk
    // the contents of the would-be class to re-translate
    // any characters that were passed through as-is
    cs = pattern.substr(classStart + 1)
    sp = this.parse(cs, SUBPARSE)
    re = re.substr(0, reClassStart) + '\\[' + sp[0]
    hasMagic = hasMagic || sp[1]
  }

  // handle the case where we had a +( thing at the *end*
  // of the pattern.
  // each pattern list stack adds 3 chars, and we need to go through
  // and escape any | chars that were passed through as-is for the regexp.
  // Go through and escape them, taking care not to double-escape any
  // | chars that were already escaped.
  for (pl = patternListStack.pop(); pl; pl = patternListStack.pop()) {
    var tail = re.slice(pl.reStart + pl.open.length)
    this.debug('setting tail', re, pl)
    // maybe some even number of \, then maybe 1 \, followed by a |
    tail = tail.replace(/((?:\\{2}){0,64})(\\?)\|/g, function (_, $1, $2) {
      if (!$2) {
        // the | isn't already escaped, so escape it.
        $2 = '\\'
      }

      // need to escape all those slashes *again*, without escaping the
      // one that we need for escaping the | character.  As it works out,
      // escaping an even number of slashes can be done by simply repeating
      // it exactly after itself.  That's why this trick works.
      //
      // I am sorry that you have to see this.
      return $1 + $1 + $2 + '|'
    })

    this.debug('tail=%j\n   %s', tail, tail, pl, re)
    var t = pl.type === '*' ? star
      : pl.type === '?' ? qmark
      : '\\' + pl.type

    hasMagic = true
    re = re.slice(0, pl.reStart) + t + '\\(' + tail
  }

  // handle trailing things that only matter at the very end.
  clearStateChar()
  if (escaping) {
    // trailing \\
    re += '\\\\'
  }

  // only need to apply the nodot start if the re starts with
  // something that could conceivably capture a dot
  var addPatternStart = false
  switch (re.charAt(0)) {
    case '.':
    case '[':
    case '(': addPatternStart = true
  }

  // Hack to work around lack of negative lookbehind in JS
  // A pattern like: *.!(x).!(y|z) needs to ensure that a name
  // like 'a.xyz.yz' doesn't match.  So, the first negative
  // lookahead, has to look ALL the way ahead, to the end of
  // the pattern.
  for (var n = negativeLists.length - 1; n > -1; n--) {
    var nl = negativeLists[n]

    var nlBefore = re.slice(0, nl.reStart)
    var nlFirst = re.slice(nl.reStart, nl.reEnd - 8)
    var nlLast = re.slice(nl.reEnd - 8, nl.reEnd)
    var nlAfter = re.slice(nl.reEnd)

    nlLast += nlAfter

    // Handle nested stuff like *(*.js|!(*.json)), where open parens
    // mean that we should *not* include the ) in the bit that is considered
    // "after" the negated section.
    var openParensBefore = nlBefore.split('(').length - 1
    var cleanAfter = nlAfter
    for (i = 0; i < openParensBefore; i++) {
      cleanAfter = cleanAfter.replace(/\)[+*?]?/, '')
    }
    nlAfter = cleanAfter

    var dollar = ''
    if (nlAfter === '' && isSub !== SUBPARSE) {
      dollar = '$'
    }
    var newRe = nlBefore + nlFirst + nlAfter + dollar + nlLast
    re = newRe
  }

  // if the re is not "" at this point, then we need to make sure
  // it doesn't match against an empty path part.
  // Otherwise a/* will match a/, which it should not.
  if (re !== '' && hasMagic) {
    re = '(?=.)' + re
  }

  if (addPatternStart) {
    re = patternStart + re
  }

  // parsing just a piece of a larger pattern.
  if (isSub === SUBPARSE) {
    return [re, hasMagic]
  }

  // skip the regexp for non-magical patterns
  // unescape anything in it, though, so that it'll be
  // an exact match against a file etc.
  if (!hasMagic) {
    return globUnescape(pattern)
  }

  var flags = options.nocase ? 'i' : ''
  try {
    var regExp = new RegExp('^' + re + '$', flags)
  } catch (er) {
    // If it was an invalid regular expression, then it can't match
    // anything.  This trick looks for a character after the end of
    // the string, which is of course impossible, except in multi-line
    // mode, but it's not a /m regex.
    return new RegExp('$.')
  }

  regExp._glob = pattern
  regExp._src = re

  return regExp
}

minimatch.makeRe = function (pattern, options) {
  return new Minimatch(pattern, options || {}).makeRe()
}

Minimatch.prototype.makeRe = makeRe
function makeRe () {
  if (this.regexp || this.regexp === false) return this.regexp

  // at this point, this.set is a 2d array of partial
  // pattern strings, or "**".
  //
  // It's better to use .match().  This function shouldn't
  // be used, really, but it's pretty convenient sometimes,
  // when you just want to work with a regex.
  var set = this.set

  if (!set.length) {
    this.regexp = false
    return this.regexp
  }
  var options = this.options

  var twoStar = options.noglobstar ? star
    : options.dot ? twoStarDot
    : twoStarNoDot
  var flags = options.nocase ? 'i' : ''

  var re = set.map(function (pattern) {
    return pattern.map(function (p) {
      return (p === GLOBSTAR) ? twoStar
      : (typeof p === 'string') ? regExpEscape(p)
      : p._src
    }).join('\\\/')
  }).join('|')

  // must match entire pattern
  // ending in a * or ** will make it less strict.
  re = '^(?:' + re + ')$'

  // can match anything, as long as it's not this.
  if (this.negate) re = '^(?!' + re + ').*$'

  try {
    this.regexp = new RegExp(re, flags)
  } catch (ex) {
    this.regexp = false
  }
  return this.regexp
}

minimatch.match = function (list, pattern, options) {
  options = options || {}
  var mm = new Minimatch(pattern, options)
  list = list.filter(function (f) {
    return mm.match(f)
  })
  if (mm.options.nonull && !list.length) {
    list.push(pattern)
  }
  return list
}

Minimatch.prototype.match = match
function match (f, partial) {
  this.debug('match', f, this.pattern)
  // short-circuit in the case of busted things.
  // comments, etc.
  if (this.comment) return false
  if (this.empty) return f === ''

  if (f === '/' && partial) return true

  var options = this.options

  // windows: need to use /, not \
  if (path.sep !== '/') {
    f = f.split(path.sep).join('/')
  }

  // treat the test path as a set of pathparts.
  f = f.split(slashSplit)
  this.debug(this.pattern, 'split', f)

  // just ONE of the pattern sets in this.set needs to match
  // in order for it to be valid.  If negating, then just one
  // match means that we have failed.
  // Either way, return on the first hit.

  var set = this.set
  this.debug(this.pattern, 'set', set)

  // Find the basename of the path by looking for the last non-empty segment
  var filename
  var i
  for (i = f.length - 1; i >= 0; i--) {
    filename = f[i]
    if (filename) break
  }

  for (i = 0; i < set.length; i++) {
    var pattern = set[i]
    var file = f
    if (options.matchBase && pattern.length === 1) {
      file = [filename]
    }
    var hit = this.matchOne(file, pattern, partial)
    if (hit) {
      if (options.flipNegate) return true
      return !this.negate
    }
  }

  // didn't get any hits.  this is success if it's a negative
  // pattern, failure otherwise.
  if (options.flipNegate) return false
  return this.negate
}

// set partial to true to test if, for example,
// "/a/b" matches the start of "/*/b/*/d"
// Partial means, if you run out of file before you run
// out of pattern, then that's fine, as long as all
// the parts match.
Minimatch.prototype.matchOne = function (file, pattern, partial) {
  var options = this.options

  this.debug('matchOne',
    { 'this': this, file: file, pattern: pattern })

  this.debug('matchOne', file.length, pattern.length)

  for (var fi = 0,
      pi = 0,
      fl = file.length,
      pl = pattern.length
      ; (fi < fl) && (pi < pl)
      ; fi++, pi++) {
    this.debug('matchOne loop')
    var p = pattern[pi]
    var f = file[fi]

    this.debug(pattern, p, f)

    // should be impossible.
    // some invalid regexp stuff in the set.
    if (p === false) return false

    if (p === GLOBSTAR) {
      this.debug('GLOBSTAR', [pattern, p, f])

      // "**"
      // a/**/b/**/c would match the following:
      // a/b/x/y/z/c
      // a/x/y/z/b/c
      // a/b/x/b/x/c
      // a/b/c
      // To do this, take the rest of the pattern after
      // the **, and see if it would match the file remainder.
      // If so, return success.
      // If not, the ** "swallows" a segment, and try again.
      // This is recursively awful.
      //
      // a/**/b/**/c matching a/b/x/y/z/c
      // - a matches a
      // - doublestar
      //   - matchOne(b/x/y/z/c, b/**/c)
      //     - b matches b
      //     - doublestar
      //       - matchOne(x/y/z/c, c) -> no
      //       - matchOne(y/z/c, c) -> no
      //       - matchOne(z/c, c) -> no
      //       - matchOne(c, c) yes, hit
      var fr = fi
      var pr = pi + 1
      if (pr === pl) {
        this.debug('** at the end')
        // a ** at the end will just swallow the rest.
        // We have found a match.
        // however, it will not swallow /.x, unless
        // options.dot is set.
        // . and .. are *never* matched by **, for explosively
        // exponential reasons.
        for (; fi < fl; fi++) {
          if (file[fi] === '.' || file[fi] === '..' ||
            (!options.dot && file[fi].charAt(0) === '.')) return false
        }
        return true
      }

      // ok, let's see if we can swallow whatever we can.
      while (fr < fl) {
        var swallowee = file[fr]

        this.debug('\nglobstar while', file, fr, pattern, pr, swallowee)

        // XXX remove this slice.  Just pass the start index.
        if (this.matchOne(file.slice(fr), pattern.slice(pr), partial)) {
          this.debug('globstar found match!', fr, fl, swallowee)
          // found a match.
          return true
        } else {
          // can't swallow "." or ".." ever.
          // can only swallow ".foo" when explicitly asked.
          if (swallowee === '.' || swallowee === '..' ||
            (!options.dot && swallowee.charAt(0) === '.')) {
            this.debug('dot detected!', file, fr, pattern, pr)
            break
          }

          // ** swallows a segment, and continue.
          this.debug('globstar swallow a segment, and continue')
          fr++
        }
      }

      // no match was found.
      // However, in partial mode, we can't say this is necessarily over.
      // If there's more *pattern* left, then
      if (partial) {
        // ran out of file
        this.debug('\n>>> no match, partial?', file, fr, pattern, pr)
        if (fr === fl) return true
      }
      return false
    }

    // something other than **
    // non-magic patterns just have to match exactly
    // patterns with magic have been turned into regexps.
    var hit
    if (typeof p === 'string') {
      if (options.nocase) {
        hit = f.toLowerCase() === p.toLowerCase()
      } else {
        hit = f === p
      }
      this.debug('string match', p, f, hit)
    } else {
      hit = f.match(p)
      this.debug('pattern match', p, f, hit)
    }

    if (!hit) return false
  }

  // Note: ending in / means that we'll get a final ""
  // at the end of the pattern.  This can only match a
  // corresponding "" at the end of the file.
  // If the file ends in /, then it can only match a
  // a pattern that ends in /, unless the pattern just
  // doesn't have any more for it. But, a/b/ should *not*
  // match "a/b/*", even though "" matches against the
  // [^/]*? pattern, except in partial mode, where it might
  // simply not be reached yet.
  // However, a/b/ should still satisfy a/*

  // now either we fell off the end of the pattern, or we're done.
  if (fi === fl && pi === pl) {
    // ran out of pattern and filename at the same time.
    // an exact hit!
    return true
  } else if (fi === fl) {
    // ran out of file, but still had pattern left.
    // this is ok if we're doing the match as part of
    // a glob fs traversal.
    return partial
  } else if (pi === pl) {
    // ran out of pattern, still have file left.
    // this is only acceptable if we're on the very last
    // empty segment of a file with a trailing slash.
    // a/* should match a/b/
    var emptyFileEnd = (fi === fl - 1) && (file[fi] === '')
    return emptyFileEnd
  }

  // should be unreachable.
  throw new Error('wtf?')
}

// replace stuff like \* with *
function globUnescape (s) {
  return s.replace(/\\(.)/g, '$1')
}

function regExpEscape (s) {
  return s.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')
}


/***/ }),

/***/ 900:
/***/ ((module) => {

/**
 * Helpers.
 */

var s = 1000;
var m = s * 60;
var h = m * 60;
var d = h * 24;
var y = d * 365.25;

/**
 * Parse or format the given `val`.
 *
 * Options:
 *
 *  - `long` verbose formatting [false]
 *
 * @param {String|Number} val
 * @param {Object} [options]
 * @throws {Error} throw an error if val is not a non-empty string or a number
 * @return {String|Number}
 * @api public
 */

module.exports = function(val, options) {
  options = options || {};
  var type = typeof val;
  if (type === 'string' && val.length > 0) {
    return parse(val);
  } else if (type === 'number' && isNaN(val) === false) {
    return options.long ? fmtLong(val) : fmtShort(val);
  }
  throw new Error(
    'val is not a non-empty string or a valid number. val=' +
      JSON.stringify(val)
  );
};

/**
 * Parse the given `str` and return milliseconds.
 *
 * @param {String} str
 * @return {Number}
 * @api private
 */

function parse(str) {
  str = String(str);
  if (str.length > 100) {
    return;
  }
  var match = /^((?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|years?|yrs?|y)?$/i.exec(
    str
  );
  if (!match) {
    return;
  }
  var n = parseFloat(match[1]);
  var type = (match[2] || 'ms').toLowerCase();
  switch (type) {
    case 'years':
    case 'year':
    case 'yrs':
    case 'yr':
    case 'y':
      return n * y;
    case 'days':
    case 'day':
    case 'd':
      return n * d;
    case 'hours':
    case 'hour':
    case 'hrs':
    case 'hr':
    case 'h':
      return n * h;
    case 'minutes':
    case 'minute':
    case 'mins':
    case 'min':
    case 'm':
      return n * m;
    case 'seconds':
    case 'second':
    case 'secs':
    case 'sec':
    case 's':
      return n * s;
    case 'milliseconds':
    case 'millisecond':
    case 'msecs':
    case 'msec':
    case 'ms':
      return n;
    default:
      return undefined;
  }
}

/**
 * Short format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function fmtShort(ms) {
  if (ms >= d) {
    return Math.round(ms / d) + 'd';
  }
  if (ms >= h) {
    return Math.round(ms / h) + 'h';
  }
  if (ms >= m) {
    return Math.round(ms / m) + 'm';
  }
  if (ms >= s) {
    return Math.round(ms / s) + 's';
  }
  return ms + 'ms';
}

/**
 * Long format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function fmtLong(ms) {
  return plural(ms, d, 'day') ||
    plural(ms, h, 'hour') ||
    plural(ms, m, 'minute') ||
    plural(ms, s, 'second') ||
    ms + ' ms';
}

/**
 * Pluralization helper.
 */

function plural(ms, n, name) {
  if (ms < n) {
    return;
  }
  if (ms < n * 1.5) {
    return Math.floor(ms / n) + ' ' + name;
  }
  return Math.ceil(ms / n) + ' ' + name + 's';
}


/***/ }),

/***/ 9318:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

const os = __webpack_require__(2087);
const hasFlag = __webpack_require__(1621);

const env = process.env;

let forceColor;
if (hasFlag('no-color') ||
	hasFlag('no-colors') ||
	hasFlag('color=false')) {
	forceColor = false;
} else if (hasFlag('color') ||
	hasFlag('colors') ||
	hasFlag('color=true') ||
	hasFlag('color=always')) {
	forceColor = true;
}
if ('FORCE_COLOR' in env) {
	forceColor = env.FORCE_COLOR.length === 0 || parseInt(env.FORCE_COLOR, 10) !== 0;
}

function translateLevel(level) {
	if (level === 0) {
		return false;
	}

	return {
		level,
		hasBasic: true,
		has256: level >= 2,
		has16m: level >= 3
	};
}

function supportsColor(stream) {
	if (forceColor === false) {
		return 0;
	}

	if (hasFlag('color=16m') ||
		hasFlag('color=full') ||
		hasFlag('color=truecolor')) {
		return 3;
	}

	if (hasFlag('color=256')) {
		return 2;
	}

	if (stream && !stream.isTTY && forceColor !== true) {
		return 0;
	}

	const min = forceColor ? 1 : 0;

	if (process.platform === 'win32') {
		// Node.js 7.5.0 is the first version of Node.js to include a patch to
		// libuv that enables 256 color output on Windows. Anything earlier and it
		// won't work. However, here we target Node.js 8 at minimum as it is an LTS
		// release, and Node.js 7 is not. Windows 10 build 10586 is the first Windows
		// release that supports 256 colors. Windows 10 build 14931 is the first release
		// that supports 16m/TrueColor.
		const osRelease = os.release().split('.');
		if (
			Number(process.versions.node.split('.')[0]) >= 8 &&
			Number(osRelease[0]) >= 10 &&
			Number(osRelease[2]) >= 10586
		) {
			return Number(osRelease[2]) >= 14931 ? 3 : 2;
		}

		return 1;
	}

	if ('CI' in env) {
		if (['TRAVIS', 'CIRCLECI', 'APPVEYOR', 'GITLAB_CI'].some(sign => sign in env) || env.CI_NAME === 'codeship') {
			return 1;
		}

		return min;
	}

	if ('TEAMCITY_VERSION' in env) {
		return /^(9\.(0*[1-9]\d*)\.|\d{2,}\.)/.test(env.TEAMCITY_VERSION) ? 1 : 0;
	}

	if (env.COLORTERM === 'truecolor') {
		return 3;
	}

	if ('TERM_PROGRAM' in env) {
		const version = parseInt((env.TERM_PROGRAM_VERSION || '').split('.')[0], 10);

		switch (env.TERM_PROGRAM) {
			case 'iTerm.app':
				return version >= 3 ? 3 : 2;
			case 'Apple_Terminal':
				return 2;
			// No default
		}
	}

	if (/-256(color)?$/i.test(env.TERM)) {
		return 2;
	}

	if (/^screen|^xterm|^vt100|^vt220|^rxvt|color|ansi|cygwin|linux/i.test(env.TERM)) {
		return 1;
	}

	if ('COLORTERM' in env) {
		return 1;
	}

	if (env.TERM === 'dumb') {
		return min;
	}

	return min;
}

function getSupportLevel(stream) {
	const level = supportsColor(stream);
	return translateLevel(level);
}

module.exports = {
	supportsColor: getSupportLevel,
	stdout: getSupportLevel(process.stdout),
	stderr: getSupportLevel(process.stderr)
};


/***/ }),

/***/ 20:
/***/ (function(__unused_webpack_module, exports) {

/** @license URI.js v4.4.1 (c) 2011 Gary Court. License: http://github.com/garycourt/uri-js */
(function (global, factory) {
	 true ? factory(exports) :
	0;
}(this, (function (exports) { 'use strict';

function merge() {
    for (var _len = arguments.length, sets = Array(_len), _key = 0; _key < _len; _key++) {
        sets[_key] = arguments[_key];
    }

    if (sets.length > 1) {
        sets[0] = sets[0].slice(0, -1);
        var xl = sets.length - 1;
        for (var x = 1; x < xl; ++x) {
            sets[x] = sets[x].slice(1, -1);
        }
        sets[xl] = sets[xl].slice(1);
        return sets.join('');
    } else {
        return sets[0];
    }
}
function subexp(str) {
    return "(?:" + str + ")";
}
function typeOf(o) {
    return o === undefined ? "undefined" : o === null ? "null" : Object.prototype.toString.call(o).split(" ").pop().split("]").shift().toLowerCase();
}
function toUpperCase(str) {
    return str.toUpperCase();
}
function toArray(obj) {
    return obj !== undefined && obj !== null ? obj instanceof Array ? obj : typeof obj.length !== "number" || obj.split || obj.setInterval || obj.call ? [obj] : Array.prototype.slice.call(obj) : [];
}
function assign(target, source) {
    var obj = target;
    if (source) {
        for (var key in source) {
            obj[key] = source[key];
        }
    }
    return obj;
}

function buildExps(isIRI) {
    var ALPHA$$ = "[A-Za-z]",
        CR$ = "[\\x0D]",
        DIGIT$$ = "[0-9]",
        DQUOTE$$ = "[\\x22]",
        HEXDIG$$ = merge(DIGIT$$, "[A-Fa-f]"),
        //case-insensitive
    LF$$ = "[\\x0A]",
        SP$$ = "[\\x20]",
        PCT_ENCODED$ = subexp(subexp("%[EFef]" + HEXDIG$$ + "%" + HEXDIG$$ + HEXDIG$$ + "%" + HEXDIG$$ + HEXDIG$$) + "|" + subexp("%[89A-Fa-f]" + HEXDIG$$ + "%" + HEXDIG$$ + HEXDIG$$) + "|" + subexp("%" + HEXDIG$$ + HEXDIG$$)),
        //expanded
    GEN_DELIMS$$ = "[\\:\\/\\?\\#\\[\\]\\@]",
        SUB_DELIMS$$ = "[\\!\\$\\&\\'\\(\\)\\*\\+\\,\\;\\=]",
        RESERVED$$ = merge(GEN_DELIMS$$, SUB_DELIMS$$),
        UCSCHAR$$ = isIRI ? "[\\xA0-\\u200D\\u2010-\\u2029\\u202F-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFEF]" : "[]",
        //subset, excludes bidi control characters
    IPRIVATE$$ = isIRI ? "[\\uE000-\\uF8FF]" : "[]",
        //subset
    UNRESERVED$$ = merge(ALPHA$$, DIGIT$$, "[\\-\\.\\_\\~]", UCSCHAR$$),
        SCHEME$ = subexp(ALPHA$$ + merge(ALPHA$$, DIGIT$$, "[\\+\\-\\.]") + "*"),
        USERINFO$ = subexp(subexp(PCT_ENCODED$ + "|" + merge(UNRESERVED$$, SUB_DELIMS$$, "[\\:]")) + "*"),
        DEC_OCTET$ = subexp(subexp("25[0-5]") + "|" + subexp("2[0-4]" + DIGIT$$) + "|" + subexp("1" + DIGIT$$ + DIGIT$$) + "|" + subexp("[1-9]" + DIGIT$$) + "|" + DIGIT$$),
        DEC_OCTET_RELAXED$ = subexp(subexp("25[0-5]") + "|" + subexp("2[0-4]" + DIGIT$$) + "|" + subexp("1" + DIGIT$$ + DIGIT$$) + "|" + subexp("0?[1-9]" + DIGIT$$) + "|0?0?" + DIGIT$$),
        //relaxed parsing rules
    IPV4ADDRESS$ = subexp(DEC_OCTET_RELAXED$ + "\\." + DEC_OCTET_RELAXED$ + "\\." + DEC_OCTET_RELAXED$ + "\\." + DEC_OCTET_RELAXED$),
        H16$ = subexp(HEXDIG$$ + "{1,4}"),
        LS32$ = subexp(subexp(H16$ + "\\:" + H16$) + "|" + IPV4ADDRESS$),
        IPV6ADDRESS1$ = subexp(subexp(H16$ + "\\:") + "{6}" + LS32$),
        //                           6( h16 ":" ) ls32
    IPV6ADDRESS2$ = subexp("\\:\\:" + subexp(H16$ + "\\:") + "{5}" + LS32$),
        //                      "::" 5( h16 ":" ) ls32
    IPV6ADDRESS3$ = subexp(subexp(H16$) + "?\\:\\:" + subexp(H16$ + "\\:") + "{4}" + LS32$),
        //[               h16 ] "::" 4( h16 ":" ) ls32
    IPV6ADDRESS4$ = subexp(subexp(subexp(H16$ + "\\:") + "{0,1}" + H16$) + "?\\:\\:" + subexp(H16$ + "\\:") + "{3}" + LS32$),
        //[ *1( h16 ":" ) h16 ] "::" 3( h16 ":" ) ls32
    IPV6ADDRESS5$ = subexp(subexp(subexp(H16$ + "\\:") + "{0,2}" + H16$) + "?\\:\\:" + subexp(H16$ + "\\:") + "{2}" + LS32$),
        //[ *2( h16 ":" ) h16 ] "::" 2( h16 ":" ) ls32
    IPV6ADDRESS6$ = subexp(subexp(subexp(H16$ + "\\:") + "{0,3}" + H16$) + "?\\:\\:" + H16$ + "\\:" + LS32$),
        //[ *3( h16 ":" ) h16 ] "::"    h16 ":"   ls32
    IPV6ADDRESS7$ = subexp(subexp(subexp(H16$ + "\\:") + "{0,4}" + H16$) + "?\\:\\:" + LS32$),
        //[ *4( h16 ":" ) h16 ] "::"              ls32
    IPV6ADDRESS8$ = subexp(subexp(subexp(H16$ + "\\:") + "{0,5}" + H16$) + "?\\:\\:" + H16$),
        //[ *5( h16 ":" ) h16 ] "::"              h16
    IPV6ADDRESS9$ = subexp(subexp(subexp(H16$ + "\\:") + "{0,6}" + H16$) + "?\\:\\:"),
        //[ *6( h16 ":" ) h16 ] "::"
    IPV6ADDRESS$ = subexp([IPV6ADDRESS1$, IPV6ADDRESS2$, IPV6ADDRESS3$, IPV6ADDRESS4$, IPV6ADDRESS5$, IPV6ADDRESS6$, IPV6ADDRESS7$, IPV6ADDRESS8$, IPV6ADDRESS9$].join("|")),
        ZONEID$ = subexp(subexp(UNRESERVED$$ + "|" + PCT_ENCODED$) + "+"),
        //RFC 6874
    IPV6ADDRZ$ = subexp(IPV6ADDRESS$ + "\\%25" + ZONEID$),
        //RFC 6874
    IPV6ADDRZ_RELAXED$ = subexp(IPV6ADDRESS$ + subexp("\\%25|\\%(?!" + HEXDIG$$ + "{2})") + ZONEID$),
        //RFC 6874, with relaxed parsing rules
    IPVFUTURE$ = subexp("[vV]" + HEXDIG$$ + "+\\." + merge(UNRESERVED$$, SUB_DELIMS$$, "[\\:]") + "+"),
        IP_LITERAL$ = subexp("\\[" + subexp(IPV6ADDRZ_RELAXED$ + "|" + IPV6ADDRESS$ + "|" + IPVFUTURE$) + "\\]"),
        //RFC 6874
    REG_NAME$ = subexp(subexp(PCT_ENCODED$ + "|" + merge(UNRESERVED$$, SUB_DELIMS$$)) + "*"),
        HOST$ = subexp(IP_LITERAL$ + "|" + IPV4ADDRESS$ + "(?!" + REG_NAME$ + ")" + "|" + REG_NAME$),
        PORT$ = subexp(DIGIT$$ + "*"),
        AUTHORITY$ = subexp(subexp(USERINFO$ + "@") + "?" + HOST$ + subexp("\\:" + PORT$) + "?"),
        PCHAR$ = subexp(PCT_ENCODED$ + "|" + merge(UNRESERVED$$, SUB_DELIMS$$, "[\\:\\@]")),
        SEGMENT$ = subexp(PCHAR$ + "*"),
        SEGMENT_NZ$ = subexp(PCHAR$ + "+"),
        SEGMENT_NZ_NC$ = subexp(subexp(PCT_ENCODED$ + "|" + merge(UNRESERVED$$, SUB_DELIMS$$, "[\\@]")) + "+"),
        PATH_ABEMPTY$ = subexp(subexp("\\/" + SEGMENT$) + "*"),
        PATH_ABSOLUTE$ = subexp("\\/" + subexp(SEGMENT_NZ$ + PATH_ABEMPTY$) + "?"),
        //simplified
    PATH_NOSCHEME$ = subexp(SEGMENT_NZ_NC$ + PATH_ABEMPTY$),
        //simplified
    PATH_ROOTLESS$ = subexp(SEGMENT_NZ$ + PATH_ABEMPTY$),
        //simplified
    PATH_EMPTY$ = "(?!" + PCHAR$ + ")",
        PATH$ = subexp(PATH_ABEMPTY$ + "|" + PATH_ABSOLUTE$ + "|" + PATH_NOSCHEME$ + "|" + PATH_ROOTLESS$ + "|" + PATH_EMPTY$),
        QUERY$ = subexp(subexp(PCHAR$ + "|" + merge("[\\/\\?]", IPRIVATE$$)) + "*"),
        FRAGMENT$ = subexp(subexp(PCHAR$ + "|[\\/\\?]") + "*"),
        HIER_PART$ = subexp(subexp("\\/\\/" + AUTHORITY$ + PATH_ABEMPTY$) + "|" + PATH_ABSOLUTE$ + "|" + PATH_ROOTLESS$ + "|" + PATH_EMPTY$),
        URI$ = subexp(SCHEME$ + "\\:" + HIER_PART$ + subexp("\\?" + QUERY$) + "?" + subexp("\\#" + FRAGMENT$) + "?"),
        RELATIVE_PART$ = subexp(subexp("\\/\\/" + AUTHORITY$ + PATH_ABEMPTY$) + "|" + PATH_ABSOLUTE$ + "|" + PATH_NOSCHEME$ + "|" + PATH_EMPTY$),
        RELATIVE$ = subexp(RELATIVE_PART$ + subexp("\\?" + QUERY$) + "?" + subexp("\\#" + FRAGMENT$) + "?"),
        URI_REFERENCE$ = subexp(URI$ + "|" + RELATIVE$),
        ABSOLUTE_URI$ = subexp(SCHEME$ + "\\:" + HIER_PART$ + subexp("\\?" + QUERY$) + "?"),
        GENERIC_REF$ = "^(" + SCHEME$ + ")\\:" + subexp(subexp("\\/\\/(" + subexp("(" + USERINFO$ + ")@") + "?(" + HOST$ + ")" + subexp("\\:(" + PORT$ + ")") + "?)") + "?(" + PATH_ABEMPTY$ + "|" + PATH_ABSOLUTE$ + "|" + PATH_ROOTLESS$ + "|" + PATH_EMPTY$ + ")") + subexp("\\?(" + QUERY$ + ")") + "?" + subexp("\\#(" + FRAGMENT$ + ")") + "?$",
        RELATIVE_REF$ = "^(){0}" + subexp(subexp("\\/\\/(" + subexp("(" + USERINFO$ + ")@") + "?(" + HOST$ + ")" + subexp("\\:(" + PORT$ + ")") + "?)") + "?(" + PATH_ABEMPTY$ + "|" + PATH_ABSOLUTE$ + "|" + PATH_NOSCHEME$ + "|" + PATH_EMPTY$ + ")") + subexp("\\?(" + QUERY$ + ")") + "?" + subexp("\\#(" + FRAGMENT$ + ")") + "?$",
        ABSOLUTE_REF$ = "^(" + SCHEME$ + ")\\:" + subexp(subexp("\\/\\/(" + subexp("(" + USERINFO$ + ")@") + "?(" + HOST$ + ")" + subexp("\\:(" + PORT$ + ")") + "?)") + "?(" + PATH_ABEMPTY$ + "|" + PATH_ABSOLUTE$ + "|" + PATH_ROOTLESS$ + "|" + PATH_EMPTY$ + ")") + subexp("\\?(" + QUERY$ + ")") + "?$",
        SAMEDOC_REF$ = "^" + subexp("\\#(" + FRAGMENT$ + ")") + "?$",
        AUTHORITY_REF$ = "^" + subexp("(" + USERINFO$ + ")@") + "?(" + HOST$ + ")" + subexp("\\:(" + PORT$ + ")") + "?$";
    return {
        NOT_SCHEME: new RegExp(merge("[^]", ALPHA$$, DIGIT$$, "[\\+\\-\\.]"), "g"),
        NOT_USERINFO: new RegExp(merge("[^\\%\\:]", UNRESERVED$$, SUB_DELIMS$$), "g"),
        NOT_HOST: new RegExp(merge("[^\\%\\[\\]\\:]", UNRESERVED$$, SUB_DELIMS$$), "g"),
        NOT_PATH: new RegExp(merge("[^\\%\\/\\:\\@]", UNRESERVED$$, SUB_DELIMS$$), "g"),
        NOT_PATH_NOSCHEME: new RegExp(merge("[^\\%\\/\\@]", UNRESERVED$$, SUB_DELIMS$$), "g"),
        NOT_QUERY: new RegExp(merge("[^\\%]", UNRESERVED$$, SUB_DELIMS$$, "[\\:\\@\\/\\?]", IPRIVATE$$), "g"),
        NOT_FRAGMENT: new RegExp(merge("[^\\%]", UNRESERVED$$, SUB_DELIMS$$, "[\\:\\@\\/\\?]"), "g"),
        ESCAPE: new RegExp(merge("[^]", UNRESERVED$$, SUB_DELIMS$$), "g"),
        UNRESERVED: new RegExp(UNRESERVED$$, "g"),
        OTHER_CHARS: new RegExp(merge("[^\\%]", UNRESERVED$$, RESERVED$$), "g"),
        PCT_ENCODED: new RegExp(PCT_ENCODED$, "g"),
        IPV4ADDRESS: new RegExp("^(" + IPV4ADDRESS$ + ")$"),
        IPV6ADDRESS: new RegExp("^\\[?(" + IPV6ADDRESS$ + ")" + subexp(subexp("\\%25|\\%(?!" + HEXDIG$$ + "{2})") + "(" + ZONEID$ + ")") + "?\\]?$") //RFC 6874, with relaxed parsing rules
    };
}
var URI_PROTOCOL = buildExps(false);

var IRI_PROTOCOL = buildExps(true);

var slicedToArray = function () {
  function sliceIterator(arr, i) {
    var _arr = [];
    var _n = true;
    var _d = false;
    var _e = undefined;

    try {
      for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);

        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"]) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  return function (arr, i) {
    if (Array.isArray(arr)) {
      return arr;
    } else if (Symbol.iterator in Object(arr)) {
      return sliceIterator(arr, i);
    } else {
      throw new TypeError("Invalid attempt to destructure non-iterable instance");
    }
  };
}();













var toConsumableArray = function (arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

    return arr2;
  } else {
    return Array.from(arr);
  }
};

/** Highest positive signed 32-bit float value */

var maxInt = 2147483647; // aka. 0x7FFFFFFF or 2^31-1

/** Bootstring parameters */
var base = 36;
var tMin = 1;
var tMax = 26;
var skew = 38;
var damp = 700;
var initialBias = 72;
var initialN = 128; // 0x80
var delimiter = '-'; // '\x2D'

/** Regular expressions */
var regexPunycode = /^xn--/;
var regexNonASCII = /[^\0-\x7E]/; // non-ASCII chars
var regexSeparators = /[\x2E\u3002\uFF0E\uFF61]/g; // RFC 3490 separators

/** Error messages */
var errors = {
	'overflow': 'Overflow: input needs wider integers to process',
	'not-basic': 'Illegal input >= 0x80 (not a basic code point)',
	'invalid-input': 'Invalid input'
};

/** Convenience shortcuts */
var baseMinusTMin = base - tMin;
var floor = Math.floor;
var stringFromCharCode = String.fromCharCode;

/*--------------------------------------------------------------------------*/

/**
 * A generic error utility function.
 * @private
 * @param {String} type The error type.
 * @returns {Error} Throws a `RangeError` with the applicable error message.
 */
function error$1(type) {
	throw new RangeError(errors[type]);
}

/**
 * A generic `Array#map` utility function.
 * @private
 * @param {Array} array The array to iterate over.
 * @param {Function} callback The function that gets called for every array
 * item.
 * @returns {Array} A new array of values returned by the callback function.
 */
function map(array, fn) {
	var result = [];
	var length = array.length;
	while (length--) {
		result[length] = fn(array[length]);
	}
	return result;
}

/**
 * A simple `Array#map`-like wrapper to work with domain name strings or email
 * addresses.
 * @private
 * @param {String} domain The domain name or email address.
 * @param {Function} callback The function that gets called for every
 * character.
 * @returns {Array} A new string of characters returned by the callback
 * function.
 */
function mapDomain(string, fn) {
	var parts = string.split('@');
	var result = '';
	if (parts.length > 1) {
		// In email addresses, only the domain name should be punycoded. Leave
		// the local part (i.e. everything up to `@`) intact.
		result = parts[0] + '@';
		string = parts[1];
	}
	// Avoid `split(regex)` for IE8 compatibility. See #17.
	string = string.replace(regexSeparators, '\x2E');
	var labels = string.split('.');
	var encoded = map(labels, fn).join('.');
	return result + encoded;
}

/**
 * Creates an array containing the numeric code points of each Unicode
 * character in the string. While JavaScript uses UCS-2 internally,
 * this function will convert a pair of surrogate halves (each of which
 * UCS-2 exposes as separate characters) into a single code point,
 * matching UTF-16.
 * @see `punycode.ucs2.encode`
 * @see <https://mathiasbynens.be/notes/javascript-encoding>
 * @memberOf punycode.ucs2
 * @name decode
 * @param {String} string The Unicode input string (UCS-2).
 * @returns {Array} The new array of code points.
 */
function ucs2decode(string) {
	var output = [];
	var counter = 0;
	var length = string.length;
	while (counter < length) {
		var value = string.charCodeAt(counter++);
		if (value >= 0xD800 && value <= 0xDBFF && counter < length) {
			// It's a high surrogate, and there is a next character.
			var extra = string.charCodeAt(counter++);
			if ((extra & 0xFC00) == 0xDC00) {
				// Low surrogate.
				output.push(((value & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000);
			} else {
				// It's an unmatched surrogate; only append this code unit, in case the
				// next code unit is the high surrogate of a surrogate pair.
				output.push(value);
				counter--;
			}
		} else {
			output.push(value);
		}
	}
	return output;
}

/**
 * Creates a string based on an array of numeric code points.
 * @see `punycode.ucs2.decode`
 * @memberOf punycode.ucs2
 * @name encode
 * @param {Array} codePoints The array of numeric code points.
 * @returns {String} The new Unicode string (UCS-2).
 */
var ucs2encode = function ucs2encode(array) {
	return String.fromCodePoint.apply(String, toConsumableArray(array));
};

/**
 * Converts a basic code point into a digit/integer.
 * @see `digitToBasic()`
 * @private
 * @param {Number} codePoint The basic numeric code point value.
 * @returns {Number} The numeric value of a basic code point (for use in
 * representing integers) in the range `0` to `base - 1`, or `base` if
 * the code point does not represent a value.
 */
var basicToDigit = function basicToDigit(codePoint) {
	if (codePoint - 0x30 < 0x0A) {
		return codePoint - 0x16;
	}
	if (codePoint - 0x41 < 0x1A) {
		return codePoint - 0x41;
	}
	if (codePoint - 0x61 < 0x1A) {
		return codePoint - 0x61;
	}
	return base;
};

/**
 * Converts a digit/integer into a basic code point.
 * @see `basicToDigit()`
 * @private
 * @param {Number} digit The numeric value of a basic code point.
 * @returns {Number} The basic code point whose value (when used for
 * representing integers) is `digit`, which needs to be in the range
 * `0` to `base - 1`. If `flag` is non-zero, the uppercase form is
 * used; else, the lowercase form is used. The behavior is undefined
 * if `flag` is non-zero and `digit` has no uppercase form.
 */
var digitToBasic = function digitToBasic(digit, flag) {
	//  0..25 map to ASCII a..z or A..Z
	// 26..35 map to ASCII 0..9
	return digit + 22 + 75 * (digit < 26) - ((flag != 0) << 5);
};

/**
 * Bias adaptation function as per section 3.4 of RFC 3492.
 * https://tools.ietf.org/html/rfc3492#section-3.4
 * @private
 */
var adapt = function adapt(delta, numPoints, firstTime) {
	var k = 0;
	delta = firstTime ? floor(delta / damp) : delta >> 1;
	delta += floor(delta / numPoints);
	for (; /* no initialization */delta > baseMinusTMin * tMax >> 1; k += base) {
		delta = floor(delta / baseMinusTMin);
	}
	return floor(k + (baseMinusTMin + 1) * delta / (delta + skew));
};

/**
 * Converts a Punycode string of ASCII-only symbols to a string of Unicode
 * symbols.
 * @memberOf punycode
 * @param {String} input The Punycode string of ASCII-only symbols.
 * @returns {String} The resulting string of Unicode symbols.
 */
var decode = function decode(input) {
	// Don't use UCS-2.
	var output = [];
	var inputLength = input.length;
	var i = 0;
	var n = initialN;
	var bias = initialBias;

	// Handle the basic code points: let `basic` be the number of input code
	// points before the last delimiter, or `0` if there is none, then copy
	// the first basic code points to the output.

	var basic = input.lastIndexOf(delimiter);
	if (basic < 0) {
		basic = 0;
	}

	for (var j = 0; j < basic; ++j) {
		// if it's not a basic code point
		if (input.charCodeAt(j) >= 0x80) {
			error$1('not-basic');
		}
		output.push(input.charCodeAt(j));
	}

	// Main decoding loop: start just after the last delimiter if any basic code
	// points were copied; start at the beginning otherwise.

	for (var index = basic > 0 ? basic + 1 : 0; index < inputLength;) /* no final expression */{

		// `index` is the index of the next character to be consumed.
		// Decode a generalized variable-length integer into `delta`,
		// which gets added to `i`. The overflow checking is easier
		// if we increase `i` as we go, then subtract off its starting
		// value at the end to obtain `delta`.
		var oldi = i;
		for (var w = 1, k = base;; /* no condition */k += base) {

			if (index >= inputLength) {
				error$1('invalid-input');
			}

			var digit = basicToDigit(input.charCodeAt(index++));

			if (digit >= base || digit > floor((maxInt - i) / w)) {
				error$1('overflow');
			}

			i += digit * w;
			var t = k <= bias ? tMin : k >= bias + tMax ? tMax : k - bias;

			if (digit < t) {
				break;
			}

			var baseMinusT = base - t;
			if (w > floor(maxInt / baseMinusT)) {
				error$1('overflow');
			}

			w *= baseMinusT;
		}

		var out = output.length + 1;
		bias = adapt(i - oldi, out, oldi == 0);

		// `i` was supposed to wrap around from `out` to `0`,
		// incrementing `n` each time, so we'll fix that now:
		if (floor(i / out) > maxInt - n) {
			error$1('overflow');
		}

		n += floor(i / out);
		i %= out;

		// Insert `n` at position `i` of the output.
		output.splice(i++, 0, n);
	}

	return String.fromCodePoint.apply(String, output);
};

/**
 * Converts a string of Unicode symbols (e.g. a domain name label) to a
 * Punycode string of ASCII-only symbols.
 * @memberOf punycode
 * @param {String} input The string of Unicode symbols.
 * @returns {String} The resulting Punycode string of ASCII-only symbols.
 */
var encode = function encode(input) {
	var output = [];

	// Convert the input in UCS-2 to an array of Unicode code points.
	input = ucs2decode(input);

	// Cache the length.
	var inputLength = input.length;

	// Initialize the state.
	var n = initialN;
	var delta = 0;
	var bias = initialBias;

	// Handle the basic code points.
	var _iteratorNormalCompletion = true;
	var _didIteratorError = false;
	var _iteratorError = undefined;

	try {
		for (var _iterator = input[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
			var _currentValue2 = _step.value;

			if (_currentValue2 < 0x80) {
				output.push(stringFromCharCode(_currentValue2));
			}
		}
	} catch (err) {
		_didIteratorError = true;
		_iteratorError = err;
	} finally {
		try {
			if (!_iteratorNormalCompletion && _iterator.return) {
				_iterator.return();
			}
		} finally {
			if (_didIteratorError) {
				throw _iteratorError;
			}
		}
	}

	var basicLength = output.length;
	var handledCPCount = basicLength;

	// `handledCPCount` is the number of code points that have been handled;
	// `basicLength` is the number of basic code points.

	// Finish the basic string with a delimiter unless it's empty.
	if (basicLength) {
		output.push(delimiter);
	}

	// Main encoding loop:
	while (handledCPCount < inputLength) {

		// All non-basic code points < n have been handled already. Find the next
		// larger one:
		var m = maxInt;
		var _iteratorNormalCompletion2 = true;
		var _didIteratorError2 = false;
		var _iteratorError2 = undefined;

		try {
			for (var _iterator2 = input[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
				var currentValue = _step2.value;

				if (currentValue >= n && currentValue < m) {
					m = currentValue;
				}
			}

			// Increase `delta` enough to advance the decoder's <n,i> state to <m,0>,
			// but guard against overflow.
		} catch (err) {
			_didIteratorError2 = true;
			_iteratorError2 = err;
		} finally {
			try {
				if (!_iteratorNormalCompletion2 && _iterator2.return) {
					_iterator2.return();
				}
			} finally {
				if (_didIteratorError2) {
					throw _iteratorError2;
				}
			}
		}

		var handledCPCountPlusOne = handledCPCount + 1;
		if (m - n > floor((maxInt - delta) / handledCPCountPlusOne)) {
			error$1('overflow');
		}

		delta += (m - n) * handledCPCountPlusOne;
		n = m;

		var _iteratorNormalCompletion3 = true;
		var _didIteratorError3 = false;
		var _iteratorError3 = undefined;

		try {
			for (var _iterator3 = input[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
				var _currentValue = _step3.value;

				if (_currentValue < n && ++delta > maxInt) {
					error$1('overflow');
				}
				if (_currentValue == n) {
					// Represent delta as a generalized variable-length integer.
					var q = delta;
					for (var k = base;; /* no condition */k += base) {
						var t = k <= bias ? tMin : k >= bias + tMax ? tMax : k - bias;
						if (q < t) {
							break;
						}
						var qMinusT = q - t;
						var baseMinusT = base - t;
						output.push(stringFromCharCode(digitToBasic(t + qMinusT % baseMinusT, 0)));
						q = floor(qMinusT / baseMinusT);
					}

					output.push(stringFromCharCode(digitToBasic(q, 0)));
					bias = adapt(delta, handledCPCountPlusOne, handledCPCount == basicLength);
					delta = 0;
					++handledCPCount;
				}
			}
		} catch (err) {
			_didIteratorError3 = true;
			_iteratorError3 = err;
		} finally {
			try {
				if (!_iteratorNormalCompletion3 && _iterator3.return) {
					_iterator3.return();
				}
			} finally {
				if (_didIteratorError3) {
					throw _iteratorError3;
				}
			}
		}

		++delta;
		++n;
	}
	return output.join('');
};

/**
 * Converts a Punycode string representing a domain name or an email address
 * to Unicode. Only the Punycoded parts of the input will be converted, i.e.
 * it doesn't matter if you call it on a string that has already been
 * converted to Unicode.
 * @memberOf punycode
 * @param {String} input The Punycoded domain name or email address to
 * convert to Unicode.
 * @returns {String} The Unicode representation of the given Punycode
 * string.
 */
var toUnicode = function toUnicode(input) {
	return mapDomain(input, function (string) {
		return regexPunycode.test(string) ? decode(string.slice(4).toLowerCase()) : string;
	});
};

/**
 * Converts a Unicode string representing a domain name or an email address to
 * Punycode. Only the non-ASCII parts of the domain name will be converted,
 * i.e. it doesn't matter if you call it with a domain that's already in
 * ASCII.
 * @memberOf punycode
 * @param {String} input The domain name or email address to convert, as a
 * Unicode string.
 * @returns {String} The Punycode representation of the given domain name or
 * email address.
 */
var toASCII = function toASCII(input) {
	return mapDomain(input, function (string) {
		return regexNonASCII.test(string) ? 'xn--' + encode(string) : string;
	});
};

/*--------------------------------------------------------------------------*/

/** Define the public API */
var punycode = {
	/**
  * A string representing the current Punycode.js version number.
  * @memberOf punycode
  * @type String
  */
	'version': '2.1.0',
	/**
  * An object of methods to convert from JavaScript's internal character
  * representation (UCS-2) to Unicode code points, and back.
  * @see <https://mathiasbynens.be/notes/javascript-encoding>
  * @memberOf punycode
  * @type Object
  */
	'ucs2': {
		'decode': ucs2decode,
		'encode': ucs2encode
	},
	'decode': decode,
	'encode': encode,
	'toASCII': toASCII,
	'toUnicode': toUnicode
};

/**
 * URI.js
 *
 * @fileoverview An RFC 3986 compliant, scheme extendable URI parsing/validating/resolving library for JavaScript.
 * @author <a href="mailto:gary.court@gmail.com">Gary Court</a>
 * @see http://github.com/garycourt/uri-js
 */
/**
 * Copyright 2011 Gary Court. All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification, are
 * permitted provided that the following conditions are met:
 *
 *    1. Redistributions of source code must retain the above copyright notice, this list of
 *       conditions and the following disclaimer.
 *
 *    2. Redistributions in binary form must reproduce the above copyright notice, this list
 *       of conditions and the following disclaimer in the documentation and/or other materials
 *       provided with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED BY GARY COURT ``AS IS'' AND ANY EXPRESS OR IMPLIED
 * WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
 * FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL GARY COURT OR
 * CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
 * ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 * NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF
 * ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 * The views and conclusions contained in the software and documentation are those of the
 * authors and should not be interpreted as representing official policies, either expressed
 * or implied, of Gary Court.
 */
var SCHEMES = {};
function pctEncChar(chr) {
    var c = chr.charCodeAt(0);
    var e = void 0;
    if (c < 16) e = "%0" + c.toString(16).toUpperCase();else if (c < 128) e = "%" + c.toString(16).toUpperCase();else if (c < 2048) e = "%" + (c >> 6 | 192).toString(16).toUpperCase() + "%" + (c & 63 | 128).toString(16).toUpperCase();else e = "%" + (c >> 12 | 224).toString(16).toUpperCase() + "%" + (c >> 6 & 63 | 128).toString(16).toUpperCase() + "%" + (c & 63 | 128).toString(16).toUpperCase();
    return e;
}
function pctDecChars(str) {
    var newStr = "";
    var i = 0;
    var il = str.length;
    while (i < il) {
        var c = parseInt(str.substr(i + 1, 2), 16);
        if (c < 128) {
            newStr += String.fromCharCode(c);
            i += 3;
        } else if (c >= 194 && c < 224) {
            if (il - i >= 6) {
                var c2 = parseInt(str.substr(i + 4, 2), 16);
                newStr += String.fromCharCode((c & 31) << 6 | c2 & 63);
            } else {
                newStr += str.substr(i, 6);
            }
            i += 6;
        } else if (c >= 224) {
            if (il - i >= 9) {
                var _c = parseInt(str.substr(i + 4, 2), 16);
                var c3 = parseInt(str.substr(i + 7, 2), 16);
                newStr += String.fromCharCode((c & 15) << 12 | (_c & 63) << 6 | c3 & 63);
            } else {
                newStr += str.substr(i, 9);
            }
            i += 9;
        } else {
            newStr += str.substr(i, 3);
            i += 3;
        }
    }
    return newStr;
}
function _normalizeComponentEncoding(components, protocol) {
    function decodeUnreserved(str) {
        var decStr = pctDecChars(str);
        return !decStr.match(protocol.UNRESERVED) ? str : decStr;
    }
    if (components.scheme) components.scheme = String(components.scheme).replace(protocol.PCT_ENCODED, decodeUnreserved).toLowerCase().replace(protocol.NOT_SCHEME, "");
    if (components.userinfo !== undefined) components.userinfo = String(components.userinfo).replace(protocol.PCT_ENCODED, decodeUnreserved).replace(protocol.NOT_USERINFO, pctEncChar).replace(protocol.PCT_ENCODED, toUpperCase);
    if (components.host !== undefined) components.host = String(components.host).replace(protocol.PCT_ENCODED, decodeUnreserved).toLowerCase().replace(protocol.NOT_HOST, pctEncChar).replace(protocol.PCT_ENCODED, toUpperCase);
    if (components.path !== undefined) components.path = String(components.path).replace(protocol.PCT_ENCODED, decodeUnreserved).replace(components.scheme ? protocol.NOT_PATH : protocol.NOT_PATH_NOSCHEME, pctEncChar).replace(protocol.PCT_ENCODED, toUpperCase);
    if (components.query !== undefined) components.query = String(components.query).replace(protocol.PCT_ENCODED, decodeUnreserved).replace(protocol.NOT_QUERY, pctEncChar).replace(protocol.PCT_ENCODED, toUpperCase);
    if (components.fragment !== undefined) components.fragment = String(components.fragment).replace(protocol.PCT_ENCODED, decodeUnreserved).replace(protocol.NOT_FRAGMENT, pctEncChar).replace(protocol.PCT_ENCODED, toUpperCase);
    return components;
}

function _stripLeadingZeros(str) {
    return str.replace(/^0*(.*)/, "$1") || "0";
}
function _normalizeIPv4(host, protocol) {
    var matches = host.match(protocol.IPV4ADDRESS) || [];

    var _matches = slicedToArray(matches, 2),
        address = _matches[1];

    if (address) {
        return address.split(".").map(_stripLeadingZeros).join(".");
    } else {
        return host;
    }
}
function _normalizeIPv6(host, protocol) {
    var matches = host.match(protocol.IPV6ADDRESS) || [];

    var _matches2 = slicedToArray(matches, 3),
        address = _matches2[1],
        zone = _matches2[2];

    if (address) {
        var _address$toLowerCase$ = address.toLowerCase().split('::').reverse(),
            _address$toLowerCase$2 = slicedToArray(_address$toLowerCase$, 2),
            last = _address$toLowerCase$2[0],
            first = _address$toLowerCase$2[1];

        var firstFields = first ? first.split(":").map(_stripLeadingZeros) : [];
        var lastFields = last.split(":").map(_stripLeadingZeros);
        var isLastFieldIPv4Address = protocol.IPV4ADDRESS.test(lastFields[lastFields.length - 1]);
        var fieldCount = isLastFieldIPv4Address ? 7 : 8;
        var lastFieldsStart = lastFields.length - fieldCount;
        var fields = Array(fieldCount);
        for (var x = 0; x < fieldCount; ++x) {
            fields[x] = firstFields[x] || lastFields[lastFieldsStart + x] || '';
        }
        if (isLastFieldIPv4Address) {
            fields[fieldCount - 1] = _normalizeIPv4(fields[fieldCount - 1], protocol);
        }
        var allZeroFields = fields.reduce(function (acc, field, index) {
            if (!field || field === "0") {
                var lastLongest = acc[acc.length - 1];
                if (lastLongest && lastLongest.index + lastLongest.length === index) {
                    lastLongest.length++;
                } else {
                    acc.push({ index: index, length: 1 });
                }
            }
            return acc;
        }, []);
        var longestZeroFields = allZeroFields.sort(function (a, b) {
            return b.length - a.length;
        })[0];
        var newHost = void 0;
        if (longestZeroFields && longestZeroFields.length > 1) {
            var newFirst = fields.slice(0, longestZeroFields.index);
            var newLast = fields.slice(longestZeroFields.index + longestZeroFields.length);
            newHost = newFirst.join(":") + "::" + newLast.join(":");
        } else {
            newHost = fields.join(":");
        }
        if (zone) {
            newHost += "%" + zone;
        }
        return newHost;
    } else {
        return host;
    }
}
var URI_PARSE = /^(?:([^:\/?#]+):)?(?:\/\/((?:([^\/?#@]*)@)?(\[[^\/?#\]]+\]|[^\/?#:]*)(?:\:(\d*))?))?([^?#]*)(?:\?([^#]*))?(?:#((?:.|\n|\r)*))?/i;
var NO_MATCH_IS_UNDEFINED = "".match(/(){0}/)[1] === undefined;
function parse(uriString) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    var components = {};
    var protocol = options.iri !== false ? IRI_PROTOCOL : URI_PROTOCOL;
    if (options.reference === "suffix") uriString = (options.scheme ? options.scheme + ":" : "") + "//" + uriString;
    var matches = uriString.match(URI_PARSE);
    if (matches) {
        if (NO_MATCH_IS_UNDEFINED) {
            //store each component
            components.scheme = matches[1];
            components.userinfo = matches[3];
            components.host = matches[4];
            components.port = parseInt(matches[5], 10);
            components.path = matches[6] || "";
            components.query = matches[7];
            components.fragment = matches[8];
            //fix port number
            if (isNaN(components.port)) {
                components.port = matches[5];
            }
        } else {
            //IE FIX for improper RegExp matching
            //store each component
            components.scheme = matches[1] || undefined;
            components.userinfo = uriString.indexOf("@") !== -1 ? matches[3] : undefined;
            components.host = uriString.indexOf("//") !== -1 ? matches[4] : undefined;
            components.port = parseInt(matches[5], 10);
            components.path = matches[6] || "";
            components.query = uriString.indexOf("?") !== -1 ? matches[7] : undefined;
            components.fragment = uriString.indexOf("#") !== -1 ? matches[8] : undefined;
            //fix port number
            if (isNaN(components.port)) {
                components.port = uriString.match(/\/\/(?:.|\n)*\:(?:\/|\?|\#|$)/) ? matches[4] : undefined;
            }
        }
        if (components.host) {
            //normalize IP hosts
            components.host = _normalizeIPv6(_normalizeIPv4(components.host, protocol), protocol);
        }
        //determine reference type
        if (components.scheme === undefined && components.userinfo === undefined && components.host === undefined && components.port === undefined && !components.path && components.query === undefined) {
            components.reference = "same-document";
        } else if (components.scheme === undefined) {
            components.reference = "relative";
        } else if (components.fragment === undefined) {
            components.reference = "absolute";
        } else {
            components.reference = "uri";
        }
        //check for reference errors
        if (options.reference && options.reference !== "suffix" && options.reference !== components.reference) {
            components.error = components.error || "URI is not a " + options.reference + " reference.";
        }
        //find scheme handler
        var schemeHandler = SCHEMES[(options.scheme || components.scheme || "").toLowerCase()];
        //check if scheme can't handle IRIs
        if (!options.unicodeSupport && (!schemeHandler || !schemeHandler.unicodeSupport)) {
            //if host component is a domain name
            if (components.host && (options.domainHost || schemeHandler && schemeHandler.domainHost)) {
                //convert Unicode IDN -> ASCII IDN
                try {
                    components.host = punycode.toASCII(components.host.replace(protocol.PCT_ENCODED, pctDecChars).toLowerCase());
                } catch (e) {
                    components.error = components.error || "Host's domain name can not be converted to ASCII via punycode: " + e;
                }
            }
            //convert IRI -> URI
            _normalizeComponentEncoding(components, URI_PROTOCOL);
        } else {
            //normalize encodings
            _normalizeComponentEncoding(components, protocol);
        }
        //perform scheme specific parsing
        if (schemeHandler && schemeHandler.parse) {
            schemeHandler.parse(components, options);
        }
    } else {
        components.error = components.error || "URI can not be parsed.";
    }
    return components;
}

function _recomposeAuthority(components, options) {
    var protocol = options.iri !== false ? IRI_PROTOCOL : URI_PROTOCOL;
    var uriTokens = [];
    if (components.userinfo !== undefined) {
        uriTokens.push(components.userinfo);
        uriTokens.push("@");
    }
    if (components.host !== undefined) {
        //normalize IP hosts, add brackets and escape zone separator for IPv6
        uriTokens.push(_normalizeIPv6(_normalizeIPv4(String(components.host), protocol), protocol).replace(protocol.IPV6ADDRESS, function (_, $1, $2) {
            return "[" + $1 + ($2 ? "%25" + $2 : "") + "]";
        }));
    }
    if (typeof components.port === "number" || typeof components.port === "string") {
        uriTokens.push(":");
        uriTokens.push(String(components.port));
    }
    return uriTokens.length ? uriTokens.join("") : undefined;
}

var RDS1 = /^\.\.?\//;
var RDS2 = /^\/\.(\/|$)/;
var RDS3 = /^\/\.\.(\/|$)/;
var RDS5 = /^\/?(?:.|\n)*?(?=\/|$)/;
function removeDotSegments(input) {
    var output = [];
    while (input.length) {
        if (input.match(RDS1)) {
            input = input.replace(RDS1, "");
        } else if (input.match(RDS2)) {
            input = input.replace(RDS2, "/");
        } else if (input.match(RDS3)) {
            input = input.replace(RDS3, "/");
            output.pop();
        } else if (input === "." || input === "..") {
            input = "";
        } else {
            var im = input.match(RDS5);
            if (im) {
                var s = im[0];
                input = input.slice(s.length);
                output.push(s);
            } else {
                throw new Error("Unexpected dot segment condition");
            }
        }
    }
    return output.join("");
}

function serialize(components) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    var protocol = options.iri ? IRI_PROTOCOL : URI_PROTOCOL;
    var uriTokens = [];
    //find scheme handler
    var schemeHandler = SCHEMES[(options.scheme || components.scheme || "").toLowerCase()];
    //perform scheme specific serialization
    if (schemeHandler && schemeHandler.serialize) schemeHandler.serialize(components, options);
    if (components.host) {
        //if host component is an IPv6 address
        if (protocol.IPV6ADDRESS.test(components.host)) {}
        //TODO: normalize IPv6 address as per RFC 5952

        //if host component is a domain name
        else if (options.domainHost || schemeHandler && schemeHandler.domainHost) {
                //convert IDN via punycode
                try {
                    components.host = !options.iri ? punycode.toASCII(components.host.replace(protocol.PCT_ENCODED, pctDecChars).toLowerCase()) : punycode.toUnicode(components.host);
                } catch (e) {
                    components.error = components.error || "Host's domain name can not be converted to " + (!options.iri ? "ASCII" : "Unicode") + " via punycode: " + e;
                }
            }
    }
    //normalize encoding
    _normalizeComponentEncoding(components, protocol);
    if (options.reference !== "suffix" && components.scheme) {
        uriTokens.push(components.scheme);
        uriTokens.push(":");
    }
    var authority = _recomposeAuthority(components, options);
    if (authority !== undefined) {
        if (options.reference !== "suffix") {
            uriTokens.push("//");
        }
        uriTokens.push(authority);
        if (components.path && components.path.charAt(0) !== "/") {
            uriTokens.push("/");
        }
    }
    if (components.path !== undefined) {
        var s = components.path;
        if (!options.absolutePath && (!schemeHandler || !schemeHandler.absolutePath)) {
            s = removeDotSegments(s);
        }
        if (authority === undefined) {
            s = s.replace(/^\/\//, "/%2F"); //don't allow the path to start with "//"
        }
        uriTokens.push(s);
    }
    if (components.query !== undefined) {
        uriTokens.push("?");
        uriTokens.push(components.query);
    }
    if (components.fragment !== undefined) {
        uriTokens.push("#");
        uriTokens.push(components.fragment);
    }
    return uriTokens.join(""); //merge tokens into a string
}

function resolveComponents(base, relative) {
    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    var skipNormalization = arguments[3];

    var target = {};
    if (!skipNormalization) {
        base = parse(serialize(base, options), options); //normalize base components
        relative = parse(serialize(relative, options), options); //normalize relative components
    }
    options = options || {};
    if (!options.tolerant && relative.scheme) {
        target.scheme = relative.scheme;
        //target.authority = relative.authority;
        target.userinfo = relative.userinfo;
        target.host = relative.host;
        target.port = relative.port;
        target.path = removeDotSegments(relative.path || "");
        target.query = relative.query;
    } else {
        if (relative.userinfo !== undefined || relative.host !== undefined || relative.port !== undefined) {
            //target.authority = relative.authority;
            target.userinfo = relative.userinfo;
            target.host = relative.host;
            target.port = relative.port;
            target.path = removeDotSegments(relative.path || "");
            target.query = relative.query;
        } else {
            if (!relative.path) {
                target.path = base.path;
                if (relative.query !== undefined) {
                    target.query = relative.query;
                } else {
                    target.query = base.query;
                }
            } else {
                if (relative.path.charAt(0) === "/") {
                    target.path = removeDotSegments(relative.path);
                } else {
                    if ((base.userinfo !== undefined || base.host !== undefined || base.port !== undefined) && !base.path) {
                        target.path = "/" + relative.path;
                    } else if (!base.path) {
                        target.path = relative.path;
                    } else {
                        target.path = base.path.slice(0, base.path.lastIndexOf("/") + 1) + relative.path;
                    }
                    target.path = removeDotSegments(target.path);
                }
                target.query = relative.query;
            }
            //target.authority = base.authority;
            target.userinfo = base.userinfo;
            target.host = base.host;
            target.port = base.port;
        }
        target.scheme = base.scheme;
    }
    target.fragment = relative.fragment;
    return target;
}

function resolve(baseURI, relativeURI, options) {
    var schemelessOptions = assign({ scheme: 'null' }, options);
    return serialize(resolveComponents(parse(baseURI, schemelessOptions), parse(relativeURI, schemelessOptions), schemelessOptions, true), schemelessOptions);
}

function normalize(uri, options) {
    if (typeof uri === "string") {
        uri = serialize(parse(uri, options), options);
    } else if (typeOf(uri) === "object") {
        uri = parse(serialize(uri, options), options);
    }
    return uri;
}

function equal(uriA, uriB, options) {
    if (typeof uriA === "string") {
        uriA = serialize(parse(uriA, options), options);
    } else if (typeOf(uriA) === "object") {
        uriA = serialize(uriA, options);
    }
    if (typeof uriB === "string") {
        uriB = serialize(parse(uriB, options), options);
    } else if (typeOf(uriB) === "object") {
        uriB = serialize(uriB, options);
    }
    return uriA === uriB;
}

function escapeComponent(str, options) {
    return str && str.toString().replace(!options || !options.iri ? URI_PROTOCOL.ESCAPE : IRI_PROTOCOL.ESCAPE, pctEncChar);
}

function unescapeComponent(str, options) {
    return str && str.toString().replace(!options || !options.iri ? URI_PROTOCOL.PCT_ENCODED : IRI_PROTOCOL.PCT_ENCODED, pctDecChars);
}

var handler = {
    scheme: "http",
    domainHost: true,
    parse: function parse(components, options) {
        //report missing host
        if (!components.host) {
            components.error = components.error || "HTTP URIs must have a host.";
        }
        return components;
    },
    serialize: function serialize(components, options) {
        var secure = String(components.scheme).toLowerCase() === "https";
        //normalize the default port
        if (components.port === (secure ? 443 : 80) || components.port === "") {
            components.port = undefined;
        }
        //normalize the empty path
        if (!components.path) {
            components.path = "/";
        }
        //NOTE: We do not parse query strings for HTTP URIs
        //as WWW Form Url Encoded query strings are part of the HTML4+ spec,
        //and not the HTTP spec.
        return components;
    }
};

var handler$1 = {
    scheme: "https",
    domainHost: handler.domainHost,
    parse: handler.parse,
    serialize: handler.serialize
};

function isSecure(wsComponents) {
    return typeof wsComponents.secure === 'boolean' ? wsComponents.secure : String(wsComponents.scheme).toLowerCase() === "wss";
}
//RFC 6455
var handler$2 = {
    scheme: "ws",
    domainHost: true,
    parse: function parse(components, options) {
        var wsComponents = components;
        //indicate if the secure flag is set
        wsComponents.secure = isSecure(wsComponents);
        //construct resouce name
        wsComponents.resourceName = (wsComponents.path || '/') + (wsComponents.query ? '?' + wsComponents.query : '');
        wsComponents.path = undefined;
        wsComponents.query = undefined;
        return wsComponents;
    },
    serialize: function serialize(wsComponents, options) {
        //normalize the default port
        if (wsComponents.port === (isSecure(wsComponents) ? 443 : 80) || wsComponents.port === "") {
            wsComponents.port = undefined;
        }
        //ensure scheme matches secure flag
        if (typeof wsComponents.secure === 'boolean') {
            wsComponents.scheme = wsComponents.secure ? 'wss' : 'ws';
            wsComponents.secure = undefined;
        }
        //reconstruct path from resource name
        if (wsComponents.resourceName) {
            var _wsComponents$resourc = wsComponents.resourceName.split('?'),
                _wsComponents$resourc2 = slicedToArray(_wsComponents$resourc, 2),
                path = _wsComponents$resourc2[0],
                query = _wsComponents$resourc2[1];

            wsComponents.path = path && path !== '/' ? path : undefined;
            wsComponents.query = query;
            wsComponents.resourceName = undefined;
        }
        //forbid fragment component
        wsComponents.fragment = undefined;
        return wsComponents;
    }
};

var handler$3 = {
    scheme: "wss",
    domainHost: handler$2.domainHost,
    parse: handler$2.parse,
    serialize: handler$2.serialize
};

var O = {};
var isIRI = true;
//RFC 3986
var UNRESERVED$$ = "[A-Za-z0-9\\-\\.\\_\\~" + (isIRI ? "\\xA0-\\u200D\\u2010-\\u2029\\u202F-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFEF" : "") + "]";
var HEXDIG$$ = "[0-9A-Fa-f]"; //case-insensitive
var PCT_ENCODED$ = subexp(subexp("%[EFef]" + HEXDIG$$ + "%" + HEXDIG$$ + HEXDIG$$ + "%" + HEXDIG$$ + HEXDIG$$) + "|" + subexp("%[89A-Fa-f]" + HEXDIG$$ + "%" + HEXDIG$$ + HEXDIG$$) + "|" + subexp("%" + HEXDIG$$ + HEXDIG$$)); //expanded
//RFC 5322, except these symbols as per RFC 6068: @ : / ? # [ ] & ; =
//const ATEXT$$ = "[A-Za-z0-9\\!\\#\\$\\%\\&\\'\\*\\+\\-\\/\\=\\?\\^\\_\\`\\{\\|\\}\\~]";
//const WSP$$ = "[\\x20\\x09]";
//const OBS_QTEXT$$ = "[\\x01-\\x08\\x0B\\x0C\\x0E-\\x1F\\x7F]";  //(%d1-8 / %d11-12 / %d14-31 / %d127)
//const QTEXT$$ = merge("[\\x21\\x23-\\x5B\\x5D-\\x7E]", OBS_QTEXT$$);  //%d33 / %d35-91 / %d93-126 / obs-qtext
//const VCHAR$$ = "[\\x21-\\x7E]";
//const WSP$$ = "[\\x20\\x09]";
//const OBS_QP$ = subexp("\\\\" + merge("[\\x00\\x0D\\x0A]", OBS_QTEXT$$));  //%d0 / CR / LF / obs-qtext
//const FWS$ = subexp(subexp(WSP$$ + "*" + "\\x0D\\x0A") + "?" + WSP$$ + "+");
//const QUOTED_PAIR$ = subexp(subexp("\\\\" + subexp(VCHAR$$ + "|" + WSP$$)) + "|" + OBS_QP$);
//const QUOTED_STRING$ = subexp('\\"' + subexp(FWS$ + "?" + QCONTENT$) + "*" + FWS$ + "?" + '\\"');
var ATEXT$$ = "[A-Za-z0-9\\!\\$\\%\\'\\*\\+\\-\\^\\_\\`\\{\\|\\}\\~]";
var QTEXT$$ = "[\\!\\$\\%\\'\\(\\)\\*\\+\\,\\-\\.0-9\\<\\>A-Z\\x5E-\\x7E]";
var VCHAR$$ = merge(QTEXT$$, "[\\\"\\\\]");
var SOME_DELIMS$$ = "[\\!\\$\\'\\(\\)\\*\\+\\,\\;\\:\\@]";
var UNRESERVED = new RegExp(UNRESERVED$$, "g");
var PCT_ENCODED = new RegExp(PCT_ENCODED$, "g");
var NOT_LOCAL_PART = new RegExp(merge("[^]", ATEXT$$, "[\\.]", '[\\"]', VCHAR$$), "g");
var NOT_HFNAME = new RegExp(merge("[^]", UNRESERVED$$, SOME_DELIMS$$), "g");
var NOT_HFVALUE = NOT_HFNAME;
function decodeUnreserved(str) {
    var decStr = pctDecChars(str);
    return !decStr.match(UNRESERVED) ? str : decStr;
}
var handler$4 = {
    scheme: "mailto",
    parse: function parse$$1(components, options) {
        var mailtoComponents = components;
        var to = mailtoComponents.to = mailtoComponents.path ? mailtoComponents.path.split(",") : [];
        mailtoComponents.path = undefined;
        if (mailtoComponents.query) {
            var unknownHeaders = false;
            var headers = {};
            var hfields = mailtoComponents.query.split("&");
            for (var x = 0, xl = hfields.length; x < xl; ++x) {
                var hfield = hfields[x].split("=");
                switch (hfield[0]) {
                    case "to":
                        var toAddrs = hfield[1].split(",");
                        for (var _x = 0, _xl = toAddrs.length; _x < _xl; ++_x) {
                            to.push(toAddrs[_x]);
                        }
                        break;
                    case "subject":
                        mailtoComponents.subject = unescapeComponent(hfield[1], options);
                        break;
                    case "body":
                        mailtoComponents.body = unescapeComponent(hfield[1], options);
                        break;
                    default:
                        unknownHeaders = true;
                        headers[unescapeComponent(hfield[0], options)] = unescapeComponent(hfield[1], options);
                        break;
                }
            }
            if (unknownHeaders) mailtoComponents.headers = headers;
        }
        mailtoComponents.query = undefined;
        for (var _x2 = 0, _xl2 = to.length; _x2 < _xl2; ++_x2) {
            var addr = to[_x2].split("@");
            addr[0] = unescapeComponent(addr[0]);
            if (!options.unicodeSupport) {
                //convert Unicode IDN -> ASCII IDN
                try {
                    addr[1] = punycode.toASCII(unescapeComponent(addr[1], options).toLowerCase());
                } catch (e) {
                    mailtoComponents.error = mailtoComponents.error || "Email address's domain name can not be converted to ASCII via punycode: " + e;
                }
            } else {
                addr[1] = unescapeComponent(addr[1], options).toLowerCase();
            }
            to[_x2] = addr.join("@");
        }
        return mailtoComponents;
    },
    serialize: function serialize$$1(mailtoComponents, options) {
        var components = mailtoComponents;
        var to = toArray(mailtoComponents.to);
        if (to) {
            for (var x = 0, xl = to.length; x < xl; ++x) {
                var toAddr = String(to[x]);
                var atIdx = toAddr.lastIndexOf("@");
                var localPart = toAddr.slice(0, atIdx).replace(PCT_ENCODED, decodeUnreserved).replace(PCT_ENCODED, toUpperCase).replace(NOT_LOCAL_PART, pctEncChar);
                var domain = toAddr.slice(atIdx + 1);
                //convert IDN via punycode
                try {
                    domain = !options.iri ? punycode.toASCII(unescapeComponent(domain, options).toLowerCase()) : punycode.toUnicode(domain);
                } catch (e) {
                    components.error = components.error || "Email address's domain name can not be converted to " + (!options.iri ? "ASCII" : "Unicode") + " via punycode: " + e;
                }
                to[x] = localPart + "@" + domain;
            }
            components.path = to.join(",");
        }
        var headers = mailtoComponents.headers = mailtoComponents.headers || {};
        if (mailtoComponents.subject) headers["subject"] = mailtoComponents.subject;
        if (mailtoComponents.body) headers["body"] = mailtoComponents.body;
        var fields = [];
        for (var name in headers) {
            if (headers[name] !== O[name]) {
                fields.push(name.replace(PCT_ENCODED, decodeUnreserved).replace(PCT_ENCODED, toUpperCase).replace(NOT_HFNAME, pctEncChar) + "=" + headers[name].replace(PCT_ENCODED, decodeUnreserved).replace(PCT_ENCODED, toUpperCase).replace(NOT_HFVALUE, pctEncChar));
            }
        }
        if (fields.length) {
            components.query = fields.join("&");
        }
        return components;
    }
};

var URN_PARSE = /^([^\:]+)\:(.*)/;
//RFC 2141
var handler$5 = {
    scheme: "urn",
    parse: function parse$$1(components, options) {
        var matches = components.path && components.path.match(URN_PARSE);
        var urnComponents = components;
        if (matches) {
            var scheme = options.scheme || urnComponents.scheme || "urn";
            var nid = matches[1].toLowerCase();
            var nss = matches[2];
            var urnScheme = scheme + ":" + (options.nid || nid);
            var schemeHandler = SCHEMES[urnScheme];
            urnComponents.nid = nid;
            urnComponents.nss = nss;
            urnComponents.path = undefined;
            if (schemeHandler) {
                urnComponents = schemeHandler.parse(urnComponents, options);
            }
        } else {
            urnComponents.error = urnComponents.error || "URN can not be parsed.";
        }
        return urnComponents;
    },
    serialize: function serialize$$1(urnComponents, options) {
        var scheme = options.scheme || urnComponents.scheme || "urn";
        var nid = urnComponents.nid;
        var urnScheme = scheme + ":" + (options.nid || nid);
        var schemeHandler = SCHEMES[urnScheme];
        if (schemeHandler) {
            urnComponents = schemeHandler.serialize(urnComponents, options);
        }
        var uriComponents = urnComponents;
        var nss = urnComponents.nss;
        uriComponents.path = (nid || options.nid) + ":" + nss;
        return uriComponents;
    }
};

var UUID = /^[0-9A-Fa-f]{8}(?:\-[0-9A-Fa-f]{4}){3}\-[0-9A-Fa-f]{12}$/;
//RFC 4122
var handler$6 = {
    scheme: "urn:uuid",
    parse: function parse(urnComponents, options) {
        var uuidComponents = urnComponents;
        uuidComponents.uuid = uuidComponents.nss;
        uuidComponents.nss = undefined;
        if (!options.tolerant && (!uuidComponents.uuid || !uuidComponents.uuid.match(UUID))) {
            uuidComponents.error = uuidComponents.error || "UUID is not valid.";
        }
        return uuidComponents;
    },
    serialize: function serialize(uuidComponents, options) {
        var urnComponents = uuidComponents;
        //normalize UUID
        urnComponents.nss = (uuidComponents.uuid || "").toLowerCase();
        return urnComponents;
    }
};

SCHEMES[handler.scheme] = handler;
SCHEMES[handler$1.scheme] = handler$1;
SCHEMES[handler$2.scheme] = handler$2;
SCHEMES[handler$3.scheme] = handler$3;
SCHEMES[handler$4.scheme] = handler$4;
SCHEMES[handler$5.scheme] = handler$5;
SCHEMES[handler$6.scheme] = handler$6;

exports.SCHEMES = SCHEMES;
exports.pctEncChar = pctEncChar;
exports.pctDecChars = pctDecChars;
exports.parse = parse;
exports.removeDotSegments = removeDotSegments;
exports.serialize = serialize;
exports.resolveComponents = resolveComponents;
exports.resolve = resolve;
exports.normalize = normalize;
exports.equal = equal;
exports.escapeComponent = escapeComponent;
exports.unescapeComponent = unescapeComponent;

Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=uri.all.js.map


/***/ }),

/***/ 6835:
/***/ ((module) => {

"use strict";
module.exports = JSON.parse("{\"$schema\":\"http://json-schema.org/draft-07/schema#\",\"$id\":\"https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/data.json#\",\"description\":\"Meta-schema for $data reference (JSON Schema extension proposal)\",\"type\":\"object\",\"required\":[\"$data\"],\"properties\":{\"$data\":{\"type\":\"string\",\"anyOf\":[{\"format\":\"relative-json-pointer\"},{\"format\":\"json-pointer\"}]}},\"additionalProperties\":false}");

/***/ }),

/***/ 38:
/***/ ((module) => {

"use strict";
module.exports = JSON.parse("{\"$schema\":\"http://json-schema.org/draft-07/schema#\",\"$id\":\"http://json-schema.org/draft-07/schema#\",\"title\":\"Core schema meta-schema\",\"definitions\":{\"schemaArray\":{\"type\":\"array\",\"minItems\":1,\"items\":{\"$ref\":\"#\"}},\"nonNegativeInteger\":{\"type\":\"integer\",\"minimum\":0},\"nonNegativeIntegerDefault0\":{\"allOf\":[{\"$ref\":\"#/definitions/nonNegativeInteger\"},{\"default\":0}]},\"simpleTypes\":{\"enum\":[\"array\",\"boolean\",\"integer\",\"null\",\"number\",\"object\",\"string\"]},\"stringArray\":{\"type\":\"array\",\"items\":{\"type\":\"string\"},\"uniqueItems\":true,\"default\":[]}},\"type\":[\"object\",\"boolean\"],\"properties\":{\"$id\":{\"type\":\"string\",\"format\":\"uri-reference\"},\"$schema\":{\"type\":\"string\",\"format\":\"uri\"},\"$ref\":{\"type\":\"string\",\"format\":\"uri-reference\"},\"$comment\":{\"type\":\"string\"},\"title\":{\"type\":\"string\"},\"description\":{\"type\":\"string\"},\"default\":true,\"readOnly\":{\"type\":\"boolean\",\"default\":false},\"examples\":{\"type\":\"array\",\"items\":true},\"multipleOf\":{\"type\":\"number\",\"exclusiveMinimum\":0},\"maximum\":{\"type\":\"number\"},\"exclusiveMaximum\":{\"type\":\"number\"},\"minimum\":{\"type\":\"number\"},\"exclusiveMinimum\":{\"type\":\"number\"},\"maxLength\":{\"$ref\":\"#/definitions/nonNegativeInteger\"},\"minLength\":{\"$ref\":\"#/definitions/nonNegativeIntegerDefault0\"},\"pattern\":{\"type\":\"string\",\"format\":\"regex\"},\"additionalItems\":{\"$ref\":\"#\"},\"items\":{\"anyOf\":[{\"$ref\":\"#\"},{\"$ref\":\"#/definitions/schemaArray\"}],\"default\":true},\"maxItems\":{\"$ref\":\"#/definitions/nonNegativeInteger\"},\"minItems\":{\"$ref\":\"#/definitions/nonNegativeIntegerDefault0\"},\"uniqueItems\":{\"type\":\"boolean\",\"default\":false},\"contains\":{\"$ref\":\"#\"},\"maxProperties\":{\"$ref\":\"#/definitions/nonNegativeInteger\"},\"minProperties\":{\"$ref\":\"#/definitions/nonNegativeIntegerDefault0\"},\"required\":{\"$ref\":\"#/definitions/stringArray\"},\"additionalProperties\":{\"$ref\":\"#\"},\"definitions\":{\"type\":\"object\",\"additionalProperties\":{\"$ref\":\"#\"},\"default\":{}},\"properties\":{\"type\":\"object\",\"additionalProperties\":{\"$ref\":\"#\"},\"default\":{}},\"patternProperties\":{\"type\":\"object\",\"additionalProperties\":{\"$ref\":\"#\"},\"propertyNames\":{\"format\":\"regex\"},\"default\":{}},\"dependencies\":{\"type\":\"object\",\"additionalProperties\":{\"anyOf\":[{\"$ref\":\"#\"},{\"$ref\":\"#/definitions/stringArray\"}]}},\"propertyNames\":{\"$ref\":\"#\"},\"const\":true,\"enum\":{\"type\":\"array\",\"items\":true,\"minItems\":1,\"uniqueItems\":true},\"type\":{\"anyOf\":[{\"$ref\":\"#/definitions/simpleTypes\"},{\"type\":\"array\",\"items\":{\"$ref\":\"#/definitions/simpleTypes\"},\"minItems\":1,\"uniqueItems\":true}]},\"format\":{\"type\":\"string\"},\"contentMediaType\":{\"type\":\"string\"},\"contentEncoding\":{\"type\":\"string\"},\"if\":{\"$ref\":\"#\"},\"then\":{\"$ref\":\"#\"},\"else\":{\"$ref\":\"#\"},\"allOf\":{\"$ref\":\"#/definitions/schemaArray\"},\"anyOf\":{\"$ref\":\"#/definitions/schemaArray\"},\"oneOf\":{\"$ref\":\"#/definitions/schemaArray\"},\"not\":{\"$ref\":\"#\"}},\"default\":true}");

/***/ }),

/***/ 696:
/***/ ((module) => {

"use strict";
module.exports = JSON.parse("{\"_from\":\"axios@0.21.1\",\"_id\":\"axios@0.21.1\",\"_inBundle\":false,\"_integrity\":\"sha512-dKQiRHxGD9PPRIUNIWvZhPTPpl1rf/OxTYKsqKUDjBwYylTvV7SjSHJb9ratfyzM6wCdLCOYLzs73qpg5c4iGA==\",\"_location\":\"/axios\",\"_phantomChildren\":{},\"_requested\":{\"type\":\"version\",\"registry\":true,\"raw\":\"axios@0.21.1\",\"name\":\"axios\",\"escapedName\":\"axios\",\"rawSpec\":\"0.21.1\",\"saveSpec\":null,\"fetchSpec\":\"0.21.1\"},\"_requiredBy\":[\"#USER\",\"/\"],\"_resolved\":\"https://registry.npmjs.org/axios/-/axios-0.21.1.tgz\",\"_shasum\":\"22563481962f4d6bde9a76d516ef0e5d3c09b2b8\",\"_spec\":\"axios@0.21.1\",\"_where\":\"D:\\\\Git\\\\validate-json-action\",\"author\":{\"name\":\"Matt Zabriskie\"},\"browser\":{\"./lib/adapters/http.js\":\"./lib/adapters/xhr.js\"},\"bugs\":{\"url\":\"https://github.com/axios/axios/issues\"},\"bundleDependencies\":false,\"bundlesize\":[{\"path\":\"./dist/axios.min.js\",\"threshold\":\"5kB\"}],\"dependencies\":{\"follow-redirects\":\"^1.10.0\"},\"deprecated\":false,\"description\":\"Promise based HTTP client for the browser and node.js\",\"devDependencies\":{\"bundlesize\":\"^0.17.0\",\"coveralls\":\"^3.0.0\",\"es6-promise\":\"^4.2.4\",\"grunt\":\"^1.0.2\",\"grunt-banner\":\"^0.6.0\",\"grunt-cli\":\"^1.2.0\",\"grunt-contrib-clean\":\"^1.1.0\",\"grunt-contrib-watch\":\"^1.0.0\",\"grunt-eslint\":\"^20.1.0\",\"grunt-karma\":\"^2.0.0\",\"grunt-mocha-test\":\"^0.13.3\",\"grunt-ts\":\"^6.0.0-beta.19\",\"grunt-webpack\":\"^1.0.18\",\"istanbul-instrumenter-loader\":\"^1.0.0\",\"jasmine-core\":\"^2.4.1\",\"karma\":\"^1.3.0\",\"karma-chrome-launcher\":\"^2.2.0\",\"karma-coverage\":\"^1.1.1\",\"karma-firefox-launcher\":\"^1.1.0\",\"karma-jasmine\":\"^1.1.1\",\"karma-jasmine-ajax\":\"^0.1.13\",\"karma-opera-launcher\":\"^1.0.0\",\"karma-safari-launcher\":\"^1.0.0\",\"karma-sauce-launcher\":\"^1.2.0\",\"karma-sinon\":\"^1.0.5\",\"karma-sourcemap-loader\":\"^0.3.7\",\"karma-webpack\":\"^1.7.0\",\"load-grunt-tasks\":\"^3.5.2\",\"minimist\":\"^1.2.0\",\"mocha\":\"^5.2.0\",\"sinon\":\"^4.5.0\",\"typescript\":\"^2.8.1\",\"url-search-params\":\"^0.10.0\",\"webpack\":\"^1.13.1\",\"webpack-dev-server\":\"^1.14.1\"},\"homepage\":\"https://github.com/axios/axios\",\"jsdelivr\":\"dist/axios.min.js\",\"keywords\":[\"xhr\",\"http\",\"ajax\",\"promise\",\"node\"],\"license\":\"MIT\",\"main\":\"index.js\",\"name\":\"axios\",\"repository\":{\"type\":\"git\",\"url\":\"git+https://github.com/axios/axios.git\"},\"scripts\":{\"build\":\"NODE_ENV=production grunt build\",\"coveralls\":\"cat coverage/lcov.info | ./node_modules/coveralls/bin/coveralls.js\",\"examples\":\"node ./examples/server.js\",\"fix\":\"eslint --fix lib/**/*.js\",\"postversion\":\"git push && git push --tags\",\"preversion\":\"npm test\",\"start\":\"node ./sandbox/server.js\",\"test\":\"grunt test && bundlesize\",\"version\":\"npm run build && grunt version && git add -A dist && git add CHANGELOG.md bower.json package.json\"},\"typings\":\"./index.d.ts\",\"unpkg\":\"dist/axios.min.js\",\"version\":\"0.21.1\"}");

/***/ }),

/***/ 2357:
/***/ ((module) => {

"use strict";
module.exports = require("assert");

/***/ }),

/***/ 5747:
/***/ ((module) => {

"use strict";
module.exports = require("fs");

/***/ }),

/***/ 8605:
/***/ ((module) => {

"use strict";
module.exports = require("http");

/***/ }),

/***/ 7211:
/***/ ((module) => {

"use strict";
module.exports = require("https");

/***/ }),

/***/ 1631:
/***/ ((module) => {

"use strict";
module.exports = require("net");

/***/ }),

/***/ 2087:
/***/ ((module) => {

"use strict";
module.exports = require("os");

/***/ }),

/***/ 5622:
/***/ ((module) => {

"use strict";
module.exports = require("path");

/***/ }),

/***/ 2413:
/***/ ((module) => {

"use strict";
module.exports = require("stream");

/***/ }),

/***/ 3867:
/***/ ((module) => {

"use strict";
module.exports = require("tty");

/***/ }),

/***/ 8835:
/***/ ((module) => {

"use strict";
module.exports = require("url");

/***/ }),

/***/ 1669:
/***/ ((module) => {

"use strict";
module.exports = require("util");

/***/ }),

/***/ 8761:
/***/ ((module) => {

"use strict";
module.exports = require("zlib");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		if(__webpack_module_cache__[moduleId]) {
/******/ 			return __webpack_module_cache__[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			id: moduleId,
/******/ 			loaded: false,
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		var threw = true;
/******/ 		try {
/******/ 			__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 			threw = false;
/******/ 		} finally {
/******/ 			if(threw) delete __webpack_module_cache__[moduleId];
/******/ 		}
/******/ 	
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/node module decorator */
/******/ 	(() => {
/******/ 		__webpack_require__.nmd = (module) => {
/******/ 			module.paths = [];
/******/ 			if (!module.children) module.children = [];
/******/ 			return module;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/compat */
/******/ 	
/******/ 	__webpack_require__.ab = __dirname + "/";/************************************************************************/
/******/ 	// module exports must be returned from runtime so entry inlining is disabled
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(3109);
/******/ })()
;
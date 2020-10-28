const yaml = require('js-yaml');
const common = require('./common');

const _checkProfileFile = async (errors, args) => {
    try {
        const ymlFile = await common.openFile(args.file);
        const content = await yaml.safeLoad(ymlFile);
        if (!content.profiles) {
            errors.push('account file must have single key "profiles" and profiles must be an array');
        }
    } catch (error) {
        errors.push('file provided in --file argument can not open');
    }
};

const _supportedFile = (file) => {
    if (file && file.split('.').length) {
        const parts = file.split('.');
        if (parts[parts.length - 1] !== 'json' && parts[parts.length - 1] !== 'yml') {
            return false;
        }
        return true;
    }
    return false;
};

const _checkCredentials = (errors, args) => {
    if (!args.key) {
        errors.push('please provide either --key as argument or AWS_ACCESS_KEY_ID as environment variable');
    }
    if (!args.secret) {
        errors.push('please provide either --secret as argument or AWS_SECRET_ACCESS_KEY as environment variable');
    }
};

const _checkFile = (errors, args) => {
    if (!args.file) {
        errors.push('please provide either --file argument');
    } else if (!_supportedFile(args.file)) {
        errors.push('please provide either json or yml file');
    }
};

exports.validate = async (args) => {
    console.log('VALIDATING ARGUMENTS');
    const errors = [];
    _checkCredentials(errors, args);
    _checkFile(errors, args);
    await _checkProfileFile(errors, args);
    console.log('VALIDATED ARGUMENTS');
    return errors;
};

exports.logErrors = (errors) => {
    errors.forEach((error) => {
        console.log('\x1b[41m\x1b[37m%s\x1b[0m', error);
    });
};

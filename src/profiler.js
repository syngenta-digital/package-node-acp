const fs = require('fs');
const path = require('path');
const os = require('os');
const yaml = require('js-yaml');
const common = require('./common');

const _readProfileFile = async (args) => {
    const ymlFile = await common.openFile(args.file);
    args.content = await yaml.safeLoad(ymlFile);
};

const _getAWSPaths = () => {
    return {
        directory: path.join(common.resolveHome(), '.aws'),
        credentials: path.join(common.resolveHome(), '.aws', 'credentials'),
        config: path.join(common.resolveHome(), '.aws', 'config')
    };
};

const _writeDefaultRoles = async (args, awsSetUp) => {
    await fs.appendFileSync(awsSetUp.credentials, `[default]${os.EOL}`);
    await fs.appendFileSync(awsSetUp.credentials, `aws_access_key_id=${args.key}${os.EOL}`);
    await fs.appendFileSync(awsSetUp.credentials, `aws_secret_access_key=${args.secret}${os.EOL}`);
    await fs.appendFileSync(awsSetUp.config, `[profile default]${os.EOL}`);
    await fs.appendFileSync(awsSetUp.config, `region=${args.region}${os.EOL}`);
    await fs.appendFileSync(awsSetUp.config, `output=json${os.EOL}`);
};

const _writeDefaultConfigFile = async (awsSetUp) => {
    const exists = await fs.existsSync(awsSetUp.config);
    if (exists) {
        await fs.appendFileSync(awsSetUp.config, `${os.EOL}`);
    }
};

const _writeDefaultCredentialsFile = async (awsSetUp) => {
    const exists = await fs.existsSync(awsSetUp.credentials);
    if (exists) {
        await fs.appendFileSync(awsSetUp.credentials, `${os.EOL}`);
    }
};

const _writeDefaultDir = async (awsSetUp) => {
    try {
        await fs.mkdirSync(awsSetUp.directory);
    } catch (error) {
        console.warn('AWS directory alredy exists');
    }
};

const _setUpDefaults = async (args, awsSetUp) => {
    await _writeDefaultDir(awsSetUp);
    await _writeDefaultCredentialsFile(awsSetUp);
    await _writeDefaultConfigFile(awsSetUp);
    await _writeDefaultRoles(args, awsSetUp);
};

const _writeRoles = async (args, awsSetUp) => {
    for (const profile of args.content.profiles) {
        fs.appendFileSync(awsSetUp.config, `${os.EOL}[profile ${profile.name}]${os.EOL}`);
        fs.appendFileSync(awsSetUp.config, `role_arn=arn:aws:iam::${profile.account}:role/${profile.role}${os.EOL}`);
        fs.appendFileSync(awsSetUp.config, `source_profile=default${os.EOL}`);
    }
};

exports.create = async (args) => {
    console.log(`CREATING AWS PROFILES`);
    const awsSetUp = _getAWSPaths();
    await _readProfileFile(args);
    await _setUpDefaults(args, awsSetUp);
    await _writeRoles(args, awsSetUp);
    console.log(`CREATED AWS PROFILES`);
};

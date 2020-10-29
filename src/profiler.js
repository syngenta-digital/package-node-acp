const execSync = require('child_process').execSync;
const fs = require('fs');
const path = require('path');
const os = require('os');
const yaml = require('yaml');
const common = require('./common');

const _isWindows = () => {
    return /^win/.test(process.platform);
};

const _isMac = () => {
    return /^darwin/.test(process.platform);
};

const _isLinux = () => {
    return /^linux/.test(process.platform);
};

const _findTargetOS = () => {
    if (_isWindows()) {
        return 'windows';
    }
    if (_isLinux()) {
        return 'linux';
    }
    if (_isMac()) {
        return 'macosx';
    }
};

const _setWinEnvVariable = async () => {
    await execSync('set', ['AWS_SDK_LOAD_CONFIG=1']);
};

const _setUnixEnvVariable = async () => {
    const envVariable = process.env.AWS_SDK_LOAD_CONFIG;
    if (!envVariable || (envVariable && envVariable === 1)) {
        const shell = process.env.SHELL;
        let _path = null;
        if (shell === '/bin/bash') {
            _path = `${os.homedir()}/.bashrc`;
        } else if (shell === '/bin/zsh') {
            _path = `${os.homedir()}/.zshrc`;
        } else {
            console.warn(
                'UNSUPPORTED OPERATING SYSTEM!!! Please manually set AWS_SDK_LOAD_CONFIG=1 environment variable'
            );
            return true;
        }
        process.env.AWS_SDK_LOAD_CONFIG = 1;
        await fs.appendFileSync(_path, `export AWS_SDK_LOAD_CONFIG=1${os.EOL}`);
    }
};

const _setLoadConfig = async () => {
    if (_findTargetOS() === 'windows') {
        await _setWinEnvVariable();
    } else {
        await _setUnixEnvVariable();
    }
};

const _readProfileFile = async (args) => {
    const ymlFile = await common.openFile(args.file);
    args.content = await yaml.parse(ymlFile);
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

const _setUpDefaults = async (args, awsSetUp) => {
    const exists = await fs.existsSync(awsSetUp.credentials);
    if (!exists) {
        await fs.mkdirSync(awsSetUp.directory);
        await _writeDefaultRoles(args, awsSetUp);
    }
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
    await _setLoadConfig();
    console.log(`CREATED AWS PROFILES`);
};

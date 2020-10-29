const execSync = require('child_process').execSync;
const fs = require('fs');
const path = require('path');
const os = require('os');
const yaml = require('yaml');
const common = require('./common');

const _setLoadConfig = async () => {
    const envVariable = process.env.AWS_SDK_LOAD_CONFIG;
    if (!envVariable || (envVariable && envVariable === 1)) {
        if (/^win/.test(process.platform)) {
            await execSync('set', ['AWS_SDK_LOAD_CONFIG=1']);
        } else {
            await execSync('export', ['AWS_SDK_LOAD_CONFIG=1']);
        }
    }
};

const _writeRoles = async (args, awsSetUp) => {
    for (const profile of args.content.profiles) {
        fs.appendFileSync(awsSetUp.config, `${os.EOL}[profile ${profile.name}]${os.EOL}`);
        fs.appendFileSync(awsSetUp.config, `role_arn=arn:aws:iam::${profile.account}:role/${profile.role}${os.EOL}`);
        fs.appendFileSync(awsSetUp.config, `source_profile=default${os.EOL}`);
    }
};

const _writeDefaultRoles = async (args, awsSetUp) => {
    await fs.appendFileSync(awsSetUp.credentials, `[default]${os.EOL}`);
    await fs.appendFileSync(awsSetUp.credentials, `aws_access_key_id=${args.key}${os.EOL}`);
    await fs.appendFileSync(awsSetUp.credentials, `aws_secret_access_key=${args.secret}${os.EOL}`);
    await fs.appendFileSync(awsSetUp.config, `[profile default]${os.EOL}`);
    await fs.appendFileSync(awsSetUp.config, `region=${args.region}${os.EOL}`);
    await fs.appendFileSync(awsSetUp.config, `output=json${os.EOL}`);
};

const _setUpDefaults = async (args, awsSetUp) => {
    const exists = await fs.existsSync(awsSetUp.credentials);
    if (!exists) {
        await fs.mkdirSync(awsSetUp.directory);
        await _writeDefaultRoles(args, awsSetUp);
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

exports.create = async (args) => {
    console.log(`CREATING AWS PROFILES`);
    const awsSetUp = _getAWSPaths();
    await _readProfileFile(args);
    await _setUpDefaults(args, awsSetUp);
    await _writeRoles(args, awsSetUp);
    await _setLoadConfig();
    console.log(`CREATED AWS PROFILES`);
};

const _assignDefaultRegion = (args) => {
    if (!args.region) {
        args.region = process.env.AWS_DEFAULT_REGION || 'us-east-1';
    }
};

const _assignDefaultCredentials = (args) => {
    if (!args.key) {
        args.key = process.env.AWS_ACCESS_KEY_ID;
    }
    if (!args.secret) {
        args.secret = process.env.AWS_SECRET_ACCESS_KEY;
    }
};

exports.assign = (args) => {
    console.log('APPLYING DEFAULTS TO MISSING ARGUMENTS');
    _assignDefaultRegion(args);
    _assignDefaultCredentials(args);
    console.log(`APPLIED DEFAULTS TO MISSING ARGUMENTS`);
};

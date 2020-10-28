const fs = require('fs');

exports.resolveHome = () => {
    return process.env.HOME || process.env.USERPROFILE || (process.env.HOMEDRIVE || 'C:') + process.env.HOMEPATH;
};

exports.openFile = async (filePath) => {
    const file = await fs.readFileSync(`${filePath}`, 'utf8');
    return file;
};

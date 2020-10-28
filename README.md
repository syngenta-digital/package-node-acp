# AWS CICD Profiler
A simple npx command to set up aws config during a CICD environment

## Features

  * Ability to create AWS config files for use with roles
  * Support both yml and json files

## Installation & Usage

This is a [Node.js](https://nodejs.org/en/) module available through the
[npm registry](https://www.npmjs.com/).

Before installing, [download and install Node.js](https://nodejs.org/en/download/).
Node.js 0.10 or higher is required.

```bash
$ npx @syngenta-digital/acp --key $AWS_ACCESS_KEY_ID --secret $AWS_SECRET_ACCESS_KEY --file some-dir/profiles.yml

# or if you have already set AWS environment variables

$ npx @syngenta-digital/acp --file some-dir/profiles.json
```

Flag Name   | Required | Description
:-----------| :------- | :-----------
`file`      | true     | The file which lists all the profiles; relative path. Supports yml or json
`key`       | false    | The AWS access key of source account; can use environment variables (AWS_ACCESS_KEY_ID)
`secret`    | false    | The AWS access secret of source account; can use environment variables (AWS_SECRET_ACCESS_KEY)

### Example YML File

```yml
profiles:
    -
        name: dev
        account: 111222333444
        role: AutomatedCICDUser
```

### Example JSON File

```json
{
    "profiles": [
        {
            "name": "dev",
            "account": 111222333444,
            "role": "AutomatedCICDUser"
        }
    ]
}
```

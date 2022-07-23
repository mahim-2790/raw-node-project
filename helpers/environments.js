/*
 * Title: Environments
 * Description: Handle all environments
 * Author: Mohi Uddin Mahim
 * Date: 03-07-22
 */
// dependencies

// module scaffolding
const environments = {};

environments.staging = {
    port: 3000,
    envName: 'staging',
    secretKey: 'hjshjshjshjshjshjshjs',
    maxChecks: 5,
};

environments.production = {
    port: 5000,
    envName: 'production',
    secretKey: 'hjshjshjshjshjshjshjs',
    maxChecks: 5,
};

// determine passed environment

// eslint-disable-next-line prettier/prettier
const currentEnvironment = typeof process.env.NODE_ENV === 'string' ? process.env.NODE_ENV : 'staging';

// environment to export
// eslint-disable-next-line prettier/prettier
const environmentToExport = typeof environments[currentEnvironment] === 'object'
        ? environments[currentEnvironment]
        : environments.staging;

module.exports = environmentToExport;

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
    twilio: {
        fromPhone: '+19032823963',
        accountSid: 'AC64f2b8d6fb44eb1a7edd7f60c190db27',
        authToken: 'a2971d707968b48f6bf0bc01da260b5d',
    },
};

environments.production = {
    port: 5000,
    envName: 'production',
    secretKey: 'hjshjshjshjshjshjshjs',
    maxChecks: 5,
    twilio: {
        fromPhone: '+19032823963',
        accountSid: 'AC64f2b8d6fb44eb1a7edd7f60c190db27',
        authToken: 'a2971d707968b48f6bf0bc01da260b5d',
    },
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

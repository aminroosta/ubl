#!/usr/bin/env node

const { get_issue } = require('./src/jira.js');
const { get_credentials } = require('./src/prompts.js');

async function run() {
    const credentials = await get_credentials({ website_name: 'jira' });
    console.log(credentials);
}

run();



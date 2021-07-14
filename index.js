#!/usr/bin/env node

const { get_issue } = require('./src/jira.js');
const { get_credentials } = require('./src/prompts.js');
const localStorage = require('./src/localstorage.js');


async function run() {
	let credentials = localStorage.getItem('jira');
	if(!credentials) {
		credentials = await get_credentials({ website_name: 'jira' });
		localStorage.setItem('jira', credentials);
	}
	console.log(credentials);
}

run();



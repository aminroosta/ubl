#!/usr/bin/env node

const { program } = require('commander');
const { create_jira_branch } = require('./src/jira.js');
const localStorage = require('./src/localstorage.js');
const { JIRA } = require('./src/constants.js');

async function run({ options }) {
	if(options.reset) {
		localStorage.deleteItem(JIRA);
		console.log('Done');
	}
	else if(options.branch) {
		await create_jira_branch({ issue_id: options.branch });
	} else {
		console.log(program.help());
	}
}

program
	.version('0.2.0')
	.option('-r, --reset', 'reset & delete the user account info')
	.option(
		'-b, --branch <jira_ticket_id>',
		'creates a feature branch from a jira ticket ticket id\n' +
		'example: ubl -b 31019\n' +
		'example: ubl -b UB-31019'
	);

program.parse(process.argv);
run({
	options: program.opts()
});



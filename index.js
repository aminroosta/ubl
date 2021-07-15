#!/usr/bin/env node

const { program } = require('commander');
const { create_jira_branch } = require('./src/jira.js');
const localStorage = require('./src/localstorage.js');
const { JIRA } = require('./src/constants.js');
const { commit_and_squash } = require('./src/gitlab.js');

async function run({ options }) {
	if(options.reset) {
		localStorage.deleteItem(JIRA);
		console.log('Done');
	}
	else if(options.branch) {
		await create_jira_branch({ issue_id: options.branch });
	}
	else if(options.commit) {
        await commit_and_squash({ message: options.commit });
	} else {
		console.log(program.help());
	}
}

program
	.option(
        '-r, --reset',
        '\n' +
        '\treset & delete the user account info.\n'
    )
	.option(
		'-b, --branch <jira_ticket_id>',
        '\n' +
		'\tcreates a feature branch from a jira ticket ticket id.\n' +
		'\t- example: ubl -b UB-31019     (infers branch from jira ticket title)\n' +
		'\t- example: ubl -b 31019        (the "UB-" prefix is optional)\n'
	)
	.option('-c, --commit [optional message]',
        '\n' +
        '\tcommit whatever is in staging, with an optional message.\n' +
        '\tadds --amend if there is an existing commit.\n' +
        '\tuses the the jira issue title if no message is given.\n' +
		'\t- example: ubl -c              (infers the message from branch name)\n' +
		'\t- example: ubl -c "message"    (updates message if staging is empty)\n'
    )
;

program.parse(process.argv);
run({
	options: program.opts()
}).catch(e => {
	console.error(e.message);
});



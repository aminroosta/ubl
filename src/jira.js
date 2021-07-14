const JiraApi = require('jira-client');
const localStorage = require('./localstorage.js');
const { get_credentials } = require('./prompts.js');
const { JIRA } = require('./constants.js');
const simpleGit = require('simple-git');
// const debug = require('debug');

// debug.enable('simple-git:output:*');
const git = simpleGit().outputHandler((bin, stdout, stderr, args) => {
	stdout.pipe(process.stdout);
	stderr.pipe(process.stderr);
});

/**
 * creates a feature branch given the jira issue id
 */
async function get_issue({ issue_id }) {

	// get jira credentials from the user for the first time only
	let credentials = localStorage.getItem(JIRA);
	if(!credentials) {
		credentials = await get_credentials({ website_name: JIRA});
		localStorage.setItem(JIRA, credentials);
	}

	// initialize jira api
	const jira = new JiraApi({
		protocol: 'https',
		host: 'jira.uberall.com',
		apiVersion: '2',
		strictSSL: true,
		username: credentials.username,
		password: credentials.password,
	});

	// normalize the issue_id if it's a number
	if(issue_id * 1 == issue_id) {
		issue_id = `UB-${issue_id}`;
	}

	const issue = await jira.findIssue(issue_id);
	return issue;
}

async function create_jira_branch({ issue_id }) {

	const issue = await get_issue({ issue_id });
	const summary = issue.fields.summary.replace(/\s+/g, '-');
	const branch = `feature/${issue.key}_${summary}`;

	await git.checkout('develop');
	await git.pull('origin', 'develop');

	console.log({ branch });
}

module.exports = {
	get_issue,
	create_jira_branch,
};

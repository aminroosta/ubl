var JiraApi = require('jira-client');

/**
 * creates a feature branch given the jira issue id
 */
async function create_branch({
	issue_id,
	username,
	password
}) {

	// initialize jira api
	const jira = new JiraApi({
		protocol: 'https',
		host: 'jira.uberall.com',
		apiVersion: '2',
		strictSSL: true,
		username: username,
		password: password,
	});

	// normalize the issue_id if it's a number
	if(issue_id * 1 == issue_id) {
		issue_id = `UB-${issue_id}`;
	}
	const issue = await jira.findIssue(issue_id);
	console.log(JSON.stringify(issue.fields, null, 2));
	return issue;
}


module.exports = { create_branch };

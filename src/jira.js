const JiraApi = require("jira-client");
const localStorage = require("./localstorage.js");
const { get_credentials } = require("./prompts.js");
const { JIRA, BRANCH_PREFIX } = require("./constants.js");
const simpleGit = require("simple-git");
const { AutoComplete } = require('enquirer');

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
  if (!credentials) {
    credentials = await get_credentials({ website_name: JIRA });
    localStorage.setItem(JIRA, credentials);
  }

  // initialize jira api
  const jira = new JiraApi({
    protocol: "https",
    host: "jira.uberall.com",
    apiVersion: "2",
    strictSSL: true,
    username: credentials.username,
    password: credentials.password,
  });

  // normalize the issue_id if it's a number
  if (issue_id * 1 == issue_id) {
    issue_id = `${BRANCH_PREFIX}-${issue_id}`;
  }

  const issue = await jira.findIssue(issue_id);
  return issue;
}

async function choose_remote_branch({ message }) {
  const branches = (await git.branch([ "-r" ])).all;

  const prompt = new AutoComplete({
    name: 'branch',
    message: message,
    limit: 15,
    initial: branches.indexOf('origin/develop'),
    choices: [...branches]
  });
  const branch = await prompt.run();
  return branch;
}

async function create_jira_branch({ issue_id }) {
  const issue = await get_issue({ issue_id });
  const summary = issue.fields.summary
    .replace(/FE -/g, " ")
    .replace(/-/g, " ")
    .replace(/\(/g, " ")
    .replace(/\)/g, " ")
    .replace(/#/g, " ")
    .replace(/\./g, " ")
    .replace(/,/g, " ")
    .trim()
    .replace(/\s+/g, "-");


  await git.fetch(["origin"]);
  const source_branch = await choose_remote_branch({ message: "what is the source branch?" });
  const type = source_branch === "origin/main" ? "hotfix" : "feature";
  const branch = `${type}/${issue.key}_${summary}`;

  try {
    await git.checkout(["-b", branch, source_branch, "--no-track"]);
  } catch (e) {
    if (e.message.includes(`branch named '${branch}' already exists`)) {
      await git.checkout(branch);
    } else {
      throw e;
    }
  }
}

module.exports = {
  choose_remote_branch,
  get_issue,
  create_jira_branch,
};

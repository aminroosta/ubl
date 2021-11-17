#!/usr/bin/env node

const { program } = require("commander");
const { create_jira_branch } = require("./src/jira.js");
const localStorage = require("./src/localstorage.js");
const { JIRA, BRANCH_PREFIX } = require("./src/constants.js");
const { commit_add, force_push } = require("./src/gitlab.js");

async function run({ options }) {
  if (options.reset) {
    localStorage.deleteItem(JIRA);
    console.log("Done");
  } else if (options.branch) {
    await create_jira_branch({ issue_id: options.branch });
  } else if (options.commit) {
    await commit_add({ message: options.commit });
  } else if (options.forcePush) {
    await force_push();
  } else {
    console.log(program.help());
  }
}

program
  .option("-r, --reset", "\n" + "\treset & delete the user account info.\n")
  .option(
    "-b, --branch <jira_ticket_id>",
    "\n" +
      "\tcreates a feature branch from a jira ticket ticket id.\n" +
      "\tif the branch exists, it does a simple checkout.\n" +
      `\t- example: ubl -b ${BRANCH_PREFIX}-31019     (infers branch from jira ticket title)\n` +
      `\t- example: ubl -b 31019        (the "${BRANCH_PREFIX}-" prefix is optional)\n`
  )
  .option(
    "-c, --commit [optional message]",
    "\n" +
      "\tcommits whatever is in staging, with an optional message.\n" +
      "\tuses the the jira issue title if no message is given.\n" +
      "\tadds --amend if there is an existing commit.\n" +
      "\t- example: ubl -c              (infers the message from branch name)\n" +
      '\t- example: ubl -c "message"    (updates message if staging is empty)\n'
  )
  .option(
    "-f, --force-push",
    "\n" + "\tforce push current branch, and print the MR url\n"
  );

program.parse(process.argv);
run({
  options: program.opts(),
}).catch((e) => {
  console.error(e.message);
});

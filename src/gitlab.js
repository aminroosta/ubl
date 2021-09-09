const simpleGit = require("simple-git");
const { get_issue } = require("./jira.js");

const git = simpleGit().outputHandler((bin, stdout, stderr, args) => {
  stdout.pipe(process.stdout);
  stderr.pipe(process.stderr);
});

async function commit_and_squash({ message }) {
  const branch = await git.revparse(["--abbrev-ref", "HEAD"]);
  if (!branch.startsWith("feature/")) {
    console.error("SKIPPED: only feature/ branches are supported");
    return;
  }
  const issue_id = branch.split(/(-|_)/g)[2];
  if ((issue_id | 0) != issue_id) {
    console.error(`SKIPPED: issue id must be number, found: ${issue_id}`);
    return;
  }

  if (typeof message !== "string" || !message) {
    message = branch.split(issue_id)[1].replace(/(-|_)/g, " ");
  }
  await git.fetch("origin");

  // finds if there are any commit that we are ahead of origin/develop
  let commits = await git.raw([
    "rev-list",
    "--left-right",
    `origin/develop...${branch}`,
  ]);
  commits = commits.split("\n").filter((c) => c.startsWith(">"));

  if (commits.length > 0) {
    await git.raw(["commit", "--amend", "-m", message]);
  } else {
    await git.raw(["commit", "-m", message]);
  }
}
async function force_push() {
  const branch = await git.revparse(["--abbrev-ref", "HEAD"]);
  if (!branch.startsWith("feature/")) {
    console.error("SKIPPED: only feature/ branches are supported");
    return;
  }
  const issue_id = branch.split(/(-|_)/g)[2];
  if ((issue_id | 0) != issue_id) {
    console.error(`SKIPPED: issue id must be number, found: ${issue_id}`);
    return;
  }
  const issue = await get_issue({ issue_id });

  await git.raw(["push", "-u", "origin", `+${branch}`]);

  // log the merge request url
  const comments = issue.fields.comment.comments.filter(
    (c) => c.author.name === "gitlab"
  );
  if (comments.length > 0) {
    const mr = comments[0].body.split("a merge request|")[1].split("]")[0];
    console.log("\nUse command + click to open exising MR:");
    console.log(`===> \x1b[32m${mr}\n`);
  } else {
    const new_mr =
      `https://scm2.uberall.com/uberall/uberall-frontend/-/merge_requests/new?` +
      `merge_request%5Bsource_branch%5D=${branch.replace("/", "%2F")}`;
    console.log("\nuse command + click to create a new MR:");
    console.log(`===> \x1b[32m${new_mr}\n`);
  }
}

module.exports = {
  commit_and_squash,
  force_push,
};

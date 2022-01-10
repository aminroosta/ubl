const simpleGit = require("simple-git");
const { get_issue, choose_remote_branch } = require("./jira.js");

const git = simpleGit().outputHandler((bin, stdout, stderr, args) => {
  stdout.pipe(process.stdout);
  stderr.pipe(process.stderr);
});

async function commit_add({ message }) {
  const branch = await git.revparse(["--abbrev-ref", "HEAD"]);
  const issue_id = branch.split(/(-|_)/g)[2];
  if ((issue_id | 0) != issue_id) {
    console.error(`SKIPPED: issue id must be number, found: ${issue_id}`);
    return;
  }

  if (typeof message !== "string" || !message) {
    const [id, name] = branch.split('/')[1].split('_');
    message = `${id} ${name.replace(/-/g, " ").trim()}`;
  }
  await git.raw(["commit", "-m", message]);
}

async function force_push() {
  const branch = await git.revparse(["--abbrev-ref", "HEAD"]);
  const issue_id = branch.split(/(_|\/)/g)[2];

  const [prefix, id, ...rest] = issue_id.split('-');
  if ((id | 0) != id || prefix.length !== 3 || rest.length > 0) {
    console.error(`SKIPPED: invalid issue id, found: ${issue_id}`);
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
    const prefix = branch.split('/')[0];
    let target_branch = prefix === 'hotfix' ? 'main' : 'develop';
    if(target_branch === 'develop') {
        const chosen = await choose_remote_branch({ message: "what is the target branch? " });
        target_branch = chosen.split('/')[1];
    }
    const new_mr =
      `https://scm2.uberall.com/uberall/uberall-frontend/-/merge_requests/new?` +
      `merge_request%5Bsource_branch%5D=${branch.replace("/", "%2F")}&` + 
      `merge_request%5Btarget_branch%5D=${target_branch.replace("/", "%2F")}`;
    console.log("\nuse command + click to create a new MR:");
    console.log(`===> \x1b[32m${new_mr}\n`);
  }
}

module.exports = {
  commit_add,
  force_push,
};

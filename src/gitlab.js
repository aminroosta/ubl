const simpleGit = require('simple-git');

const git = simpleGit().outputHandler((bin, stdout, stderr, args) => {
	stdout.pipe(process.stdout);
	stderr.pipe(process.stderr);
});

async function commit_and_squash({ message }) {
    const branch = await git.revparse(['--abbrev-ref', 'HEAD']);
    if(!branch.startsWith('feature/')) {
        console.error('SKIPPED: only feature/ branches are supported');
        return;
    }
    const issue_id = branch.split(/(-|_)/g)[2];
    if((issue_id | 0) != issue_id) {
        console.error(`SKIPPED: issue id must be number, found: ${issue_id}`);
        return;
    }

    if(typeof message !== 'string' || !message) {
        message = branch.split(issue_id)[1].replace(/(-|_)/g, ' ');
    }
    await git.fetch('origin');

    // finds if there are any commit that we are ahead of origin/develop
    let commits = await git.raw(['rev-list', '--left-right', `origin/develop...${branch}`])
    commits = commits.split('\n').filter(c => c.startsWith('>'));

    if(commits.length > 0) {
        await git.raw(['commit', '--amend', '-m', message]);
    } else {
        await git.raw(['commit', '-m', message]);
    }
}

module.exports = {
    commit_and_squash
};

### ubl

utility tools for ubl.

**Installation:**
```
npm install -g ubl
```


**Usage:**

```
Usage: ubl [options]

Options:
  -r, --reset
        reset & delete the user account info.

  -b, --branch <jira_ticket_id>
        creates a feature branch from a jira ticket ticket id.
        if the branch exists, it does a simple checkout.
        - example: ubl -b UB-31019     (infers branch from jira ticket title)
        - example: ubl -b 31019        (the "UB-" prefix is optional)

  -c, --commit [optional message]
        commits whatever is in staging, with an optional message.
        uses the the jira issue title if no message is given.
        adds --amend if there is an existing commit.
        - example: ubl -c              (infers the message from branch name)
        - example: ubl -c "message"    (updates message if staging is empty)

  -f, --force-push
        force push current branch, and print the MR url

  -h, --help                       display help for command
```



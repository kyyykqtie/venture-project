## Work w/ tickets!

```bash
git checkout -b RK-<ticket number> origin/master
git push -u origin RK-<ticket number>
```

1. Go to projects kanban board
2. Locate your ticket
3. Right sidebar scroll down to development
4. Connect your ticket

## Pushing your changes

_Please refer to [Conventional commits](https://www.conventionalcommits.org/en/v1.0.0/) for the format of your commit messages_

```bash
git add .
git commit -m "your message here"
git push origin <current branch name>
```

1. Create a PR (Pull Request)
2. Move the ticket to "For review" column
3. In case of errors:

```bash
git push origin <current branch name> --force
```

## Branch behind? do rebase!

_Do this first before pushing your changes if you are behind!_

```bash
git fetch origin master
git rebase origin/master
```

_Stash if you can't rebase_

```bash
git stash
git fetch origin master
git rebase origin/master
git stash pop
```

**_Fix possible merge conflicts_**

## Still in master branch?

_Move to a remote branch_

```bash
git checkout -b D20-<ticket number> origin/master
```

_If you can't move, stash!_

```bash
git stash
git checkout -b D20-<ticket number> origin/master
git stash pop
```

## Merge to master (for reviewers)

1. Do not merge!
2. Press the dropdown beside merge button
3. Click rebase & merge

**_If you have problems with the workflow never hesitate to ask questions_**

**_1 ticket 1 branch rule, make sure to only have 1 branch for each ticket for easier monitoring and reviews_**

---
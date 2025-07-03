# Contributing to Spreadsheet Mapper

First off, thank you for considering contributing to Spreadsheet Mapper! It's people like you that make Spreadsheet Mapper such a great tool.

## Where do I go from here?

If you've noticed a bug or have a feature request, [make one](https://github.com/gareth-gill/spreadsheet-mapper/issues/new)! It's generally best if you get confirmation of your bug or approval for your feature request this way before starting to code.

### Fork & create a branch

If this is something you think you can fix, then [fork Spreadsheet Mapper](https://github.com/gareth-gill/spreadsheet-mapper/fork) and create a branch with a descriptive name.

A good branch name would be (where issue #38 is the ticket you're working on):

```sh
git checkout -b 38-add-awesome-feature
```

### Get the style right

Your patch should follow the same conventions & pass the same code quality checks as the rest of the project.

### Make a Pull Request

At this point, you should switch back to your master branch and make sure it's up to date with Spreadsheet Mapper's master branch:

```sh
git remote add upstream git@github.com:gareth-gill/spreadsheet-mapper.git
git checkout master
git pull upstream master
```

Then update your feature branch from your local copy of master, and push it!

```sh
git checkout 38-add-awesome-feature
git rebase master
git push --force-with-lease origin 38-add-awesome-feature
```

Finally, go to GitHub and [make a Pull Request](https://github.com/gareth-gill/spreadsheet-mapper/compare) :D

### Keeping your Pull Request updated

If a maintainer asks you to "rebase" your PR, they're saying that a lot of code has changed, and that you need to update your branch so it's easier to merge.

To learn more about rebasing and merging, check out this guide on [syncing a fork](https://help.github.com/articles/syncing-a-fork/).

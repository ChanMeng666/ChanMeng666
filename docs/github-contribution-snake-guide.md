# How to Add a GitHub Contribution Snake to Your Profile README

## Introduction

The GitHub contribution snake is a fun and dynamic way to showcase your GitHub activity on your profile. This guide will walk you through the process of setting up this animation on your GitHub profile README.

## Prerequisites

- A GitHub account
- A repository named `<your-username>/<your-username>` (This is your special profile repository)

## Step-by-Step Guide

### 1. Create the Workflow File

First, we need to create a GitHub Actions workflow file:

1. Navigate to your profile repository (`<your-username>/<your-username>`)
2. Click on the "Actions" tab
3. Click on "New workflow"
4. Choose "set up a workflow yourself"

### 2. Configure the Workflow

Name your file `generate-snake.yml` and paste the following code:

```yaml
name: Generate Snake

on:
  schedule:
    - cron: "0 */12 * * *"  # Runs every 12 hours
  workflow_dispatch:

permissions:
  contents: write

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4
      
      - uses: Platane/snk@v3
        id: snake-gif
        with:
          github_user_name: YOUR_GITHUB_USERNAME  # Replace with your GitHub username
          outputs: |
            dist/github-contribution-grid-snake.svg
            dist/github-contribution-grid-snake-dark.svg?palette=github-dark
            dist/github-contribution-grid-snake.gif
      
      - uses: crazy-max/ghaction-github-pages@v4
        with:
          target_branch: output
          build_dir: dist
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

Make sure to replace `YOUR_GITHUB_USERNAME` with your actual GitHub username.

### 3. Commit the Workflow File

After pasting the code, commit the new file to your repository.

### 4. Enable GitHub Actions

If this is your first time using GitHub Actions in this repository:

1. Go to the "Settings" tab of your repository
2. Click on "Actions" in the left sidebar
3. Under "Actions permissions", select "Allow all actions and reusable workflows"
4. Save your changes

### 5. Run the Workflow

1. Go to the "Actions" tab
2. Click on "Generate Snake" in the left sidebar
3. Click on "Run workflow"

### 6. Update Your README

After the workflow runs successfully, update your `README.md` file to display the snake animation:

```markdown
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/YOUR_GITHUB_USERNAME/YOUR_GITHUB_USERNAME/output/github-contribution-grid-snake-dark.svg">
  <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/YOUR_GITHUB_USERNAME/YOUR_GITHUB_USERNAME/output/github-contribution-grid-snake.svg">
  <img alt="github contribution grid snake animation" src="https://raw.githubusercontent.com/YOUR_GITHUB_USERNAME/YOUR_GITHUB_USERNAME/output/github-contribution-grid-snake.svg">
</picture>
```

Replace `YOUR_GITHUB_USERNAME` with your actual GitHub username.

## Troubleshooting

If you encounter issues:

1. Check the Actions tab for any error messages
2. Ensure your repository is public
3. Verify that the workflow file is correctly formatted
4. Make sure you've replaced all instances of `YOUR_GITHUB_USERNAME` with your actual GitHub username

## Conclusion

You should now have a cool, animated snake eating your GitHub contributions on your profile README! The snake will update every 12 hours to reflect your latest activity.

Remember, it might take a few minutes for the changes to appear on your profile after the initial setup or each update.

Happy coding!
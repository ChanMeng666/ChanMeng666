# YouTube Video Cards Setup Guide

## 📋 Setup Checklist

### ✅ Already Done
- [x] Created GitHub Actions workflow at `.github/workflows/youtube-cards.yml`
- [x] Added YouTube video showcase section to README.md
- [x] Added required HTML comment markers `<!-- BEGIN YOUTUBE-CARDS -->` and `<!-- END YOUTUBE-CARDS -->`

### 🔧 Steps You Need to Complete

## Step 1: Get Your YouTube Channel ID

There are several ways to find your channel ID:

### Method 1: From the Channel URL
If your channel URL looks like this:
```
https://www.youtube.com/channel/UCxxxxxxxxxxxxxxxxxxxxxx
```
Then `UCxxxxxxxxxxxxxxxxxxxxxx` is your channel ID.

### Method 2: Via YouTube Settings
1. Sign in to YouTube
2. Click your avatar in the top-right corner
3. Select "YouTube Studio"
4. Choose "Settings" > "Channel" > "Advanced settings" from the left menu
5. Find your ID in the "Channel ID" field

### Method 3: From Any Video
1. Open any video on your channel
2. Right-click the channel name and select "Copy link address"
3. The `UCxxxxxxxxxxxxxxxxxxxxxx` part in the link is your channel ID

## Step 2: Update the Workflow Configuration File

Open `.github/workflows/youtube-cards.yml` and find this line:
```yaml
channel_id: UCYOUR_CHANNEL_ID_HERE
```

Replace `UCYOUR_CHANNEL_ID_HERE` with your actual channel ID, for example:
```yaml
channel_id: UCipSxT7a3rn81vGLw9lqRkg
```

## Step 3: Update the Subscribe Link in README

Find this line in README.md:
```html
<a href="https://www.youtube.com/@YourChannelHandle?sub_confirmation=1">
```

Replace `@YourChannelHandle` with your channel handle, for example:
```html
<a href="https://www.youtube.com/@ChanMeng?sub_confirmation=1">
```

💡 **Tip**: Your channel handle is the username starting with @, which you can find in your channel page URL.

## Step 4: Commit Your Changes

1. Commit the changes to `.github/workflows/youtube-cards.yml` and `README.md`
2. Push to GitHub

```bash
git add .github/workflows/youtube-cards.yml README.md
git commit -m "feat: add YouTube video cards integration"
git push origin main
```

## Step 5: Manually Trigger the Workflow (First Run)

1. Go to your GitHub repository
2. Click the "Actions" tab at the top
3. Select the "GitHub Readme YouTube Cards" workflow on the left
4. Click the "Run workflow" button on the right
5. Choose your branch (usually main) and click the green "Run workflow" button

After a few seconds, the workflow will automatically:
- Fetch your latest 6 videos
- Generate SVG cards
- Update your README.md
- Commit the changes

## 🎨 Advanced Configuration Options

### Change the Number of Videos Displayed
Edit in `youtube-cards.yml`:
```yaml
max_videos: 6  # change to your preferred number, e.g. 8 or 10
```

### Adjust Card Width
```yaml
card_width: 250  # default 250px, adjustable
```

### Change Title Line Count
```yaml
max_title_lines: 2  # maximum number of lines for the title
```

### Change Run Frequency
Edit the cron expression in `youtube-cards.yml`:
```yaml
schedule:
  - cron: "0 */6 * * *"  # runs every 6 hours
  # or
  - cron: "0 0 * * *"    # runs every day
```

## 🔑 Optional: Enable Video Duration Display

If you want to show video duration, you need to:

1. Get a YouTube API key:
   - Visit [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one
   - Enable "YouTube Data API v3"
   - Create an API key

2. Add the secret to your GitHub repository:
   - Go to repository Settings > Secrets and variables > Actions
   - Click "New repository secret"
   - Name: `YOUTUBE_API_KEY`
   - Value: paste your API key

3. Enable it in `youtube-cards.yml`:
   ```yaml
   youtube_api_key: ${{ secrets.YOUTUBE_API_KEY }}
   show_duration: true
   ```

## 📝 Notes

1. **Auto-update**: The workflow runs every hour by default and automatically refreshes your video cards
2. **Write permission**: The workflow requires `contents: write` permission to auto-commit changes
3. **Branch protection**: If your main branch has protection rules enabled, you may need to adjust settings to allow GitHub Actions to commit

## 🐛 Troubleshooting

### Issue: Workflow run fails
**Solution**:
- Verify the channel ID is correct
- Confirm the workflow has write permission
- Check the Actions logs for detailed error messages

### Issue: Videos are not updating
**Solution**:
- Manually trigger the workflow to test
- Check that the cron expression is correct
- Confirm your channel has public videos

### Issue: Cards display incorrectly
**Solution**:
- Check that the HTML comment markers are intact
- Confirm the README.md path is configured correctly
- Verify that the generated commit succeeded

## 📚 More Resources

- [Official Documentation](https://github.com/DenverCoder1/github-readme-youtube-cards)
- [Wiki](https://github.com/DenverCoder1/github-readme-youtube-cards/wiki)
- [FAQ](https://github.com/DenverCoder1/github-readme-youtube-cards/wiki)

---

Once the setup is complete, your README will automatically showcase your latest YouTube videos! 🎉

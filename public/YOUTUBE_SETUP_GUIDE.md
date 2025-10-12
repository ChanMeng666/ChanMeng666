# YouTube 视频卡片配置指南

## 📋 配置清单

### ✅ 已完成
- [x] 在 `.github/workflows/youtube-cards.yml` 创建了 GitHub Actions 工作流
- [x] 在 README.md 中添加了 YouTube 视频展示板块
- [x] 添加了必要的 HTML 注释标记 `<!-- BEGIN YOUTUBE-CARDS -->` 和 `<!-- END YOUTUBE-CARDS -->`

### 🔧 需要你完成的配置

## 步骤 1: 获取你的 YouTube 频道 ID

有以下几种方法获取频道 ID：

### 方法 1: 从频道 URL 获取
如果你的频道 URL 是这样的格式：
```
https://www.youtube.com/channel/UCxxxxxxxxxxxxxxxxxxxxxx
```
那么 `UCxxxxxxxxxxxxxxxxxxxxxx` 就是你的频道 ID。

### 方法 2: 使用 YouTube 设置页面
1. 登录 YouTube
2. 点击右上角的头像
3. 选择 "YouTube Studio"
4. 在左侧菜单选择 "设置" > "频道" > "高级设置"
5. 在 "频道 ID" 字段找到你的 ID

### 方法 3: 从任意视频获取
1. 打开你频道的任意一个视频
2. 右键点击频道名称，选择 "复制链接地址"
3. 链接中包含的 `UCxxxxxxxxxxxxxxxxxxxxxx` 就是频道 ID

## 步骤 2: 更新工作流配置文件

打开 `.github/workflows/youtube-cards.yml` 文件，找到这一行：
```yaml
channel_id: UCYOUR_CHANNEL_ID_HERE
```

将 `UCYOUR_CHANNEL_ID_HERE` 替换为你的实际频道 ID，例如：
```yaml
channel_id: UCipSxT7a3rn81vGLw9lqRkg
```

## 步骤 3: 更新 README 中的订阅链接

在 README.md 中找到这一行：
```html
<a href="https://www.youtube.com/@YourChannelHandle?sub_confirmation=1">
```

将 `@YourChannelHandle` 替换为你的频道句柄（handle），例如：
```html
<a href="https://www.youtube.com/@ChanMeng?sub_confirmation=1">
```

💡 **提示**: 频道句柄是以 @ 开头的用户名，可以在你的频道页面 URL 中找到。

## 步骤 4: 提交更改

1. 提交 `.github/workflows/youtube-cards.yml` 和 `README.md` 的更改
2. 推送到 GitHub

```bash
git add .github/workflows/youtube-cards.yml README.md
git commit -m "feat: add YouTube video cards integration"
git push origin main
```

## 步骤 5: 手动触发工作流（第一次运行）

1. 访问你的 GitHub 仓库
2. 点击顶部的 "Actions" 标签
3. 在左侧选择 "GitHub Readme YouTube Cards" 工作流
4. 点击右侧的 "Run workflow" 按钮
5. 选择分支（通常是 main）并点击绿色的 "Run workflow" 按钮

等待几秒钟，工作流会自动：
- 获取你最新的 6 个视频
- 生成 SVG 卡片
- 更新你的 README.md
- 自动提交更改

## 🎨 高级配置选项

### 修改显示的视频数量
在 `youtube-cards.yml` 中修改：
```yaml
max_videos: 6  # 改为你想要的数量，如 8 或 10
```

### 调整卡片宽度
```yaml
card_width: 250  # 默认 250px，可以调整
```

### 修改标题行数
```yaml
max_title_lines: 2  # 标题最多显示的行数
```

### 更改运行频率
在 `youtube-cards.yml` 中修改 cron 表达式：
```yaml
schedule:
  - cron: "0 */6 * * *"  # 每 6 小时运行一次
  # 或
  - cron: "0 0 * * *"    # 每天运行一次
```

## 🔑 可选：启用视频时长显示

如果你想显示视频时长，需要：

1. 获取 YouTube API 密钥：
   - 访问 [Google Cloud Console](https://console.cloud.google.com/)
   - 创建新项目或选择现有项目
   - 启用 "YouTube Data API v3"
   - 创建 API 密钥

2. 在 GitHub 仓库中添加密钥：
   - 进入仓库 Settings > Secrets and variables > Actions
   - 点击 "New repository secret"
   - Name: `YOUTUBE_API_KEY`
   - Value: 粘贴你的 API 密钥

3. 在 `youtube-cards.yml` 中启用：
   ```yaml
   youtube_api_key: ${{ secrets.YOUTUBE_API_KEY }}
   show_duration: true
   ```

## 📝 注意事项

1. **自动更新**: 工作流默认每小时运行一次，自动更新你的视频卡片
2. **提交权限**: 工作流需要 `contents: write` 权限才能自动提交更改
3. **分支保护**: 如果你的 main 分支启用了保护规则，可能需要调整设置以允许 GitHub Actions 提交

## 🐛 常见问题排查

### 问题：工作流运行失败
**解决方案**: 
- 检查频道 ID 是否正确
- 确认工作流有写入权限
- 查看 Actions 日志获取详细错误信息

### 问题：视频没有更新
**解决方案**:
- 手动触发工作流测试
- 检查 cron 表达式是否正确
- 确认你的频道有公开视频

### 问题：卡片显示不正常
**解决方案**:
- 检查 HTML 注释标记是否完整
- 确认 README.md 路径配置正确
- 查看生成的提交是否成功

## 📚 更多资源

- [官方文档](https://github.com/DenverCoder1/github-readme-youtube-cards)
- [Wiki](https://github.com/DenverCoder1/github-readme-youtube-cards/wiki)
- [常见问题](https://github.com/DenverCoder1/github-readme-youtube-cards/wiki)

---

完成配置后，你的 README 将自动展示你最新的 YouTube 视频！🎉


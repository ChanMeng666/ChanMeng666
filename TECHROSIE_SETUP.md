# 🌹 TechRosie GitHub 邀请系统设置指南

## 📋 设置步骤概览

为了让 TechRosie 自动邀请系统正常工作，你需要完成以下设置：

### 1️⃣ **创建 GitHub Personal Access Token**

1. 前往 GitHub Settings: https://github.com/settings/tokens
2. 点击 "Generate new token" → "Generate new token (classic)"
3. 设置 Token 权限：
   - **Expiration**: 选择合适的过期时间（建议：No expiration 或 1 year）
   - **Scopes**: 勾选以下权限：
     - ✅ `admin:org` (完整组织访问权限)
     - ✅ `write:org` (写入组织权限)
     - ✅ `read:org` (读取组织权限)

4. 点击 "Generate token"
5. **重要**: 立即复制生成的 token（只显示一次）

### 2️⃣ **在仓库中添加 Secret**

1. 前往你的个人 README 仓库: `https://github.com/ChanMeng666/ChanMeng666`
2. 点击 "Settings" 标签
3. 在左侧菜单中点击 "Secrets and variables" → "Actions"
4. 点击 "New repository secret"
5. 添加 Secret：
   - **Name**: `TECHROSIE_INVITE_TOKEN`
   - **Value**: 粘贴刚才创建的 Personal Access Token
6. 点击 "Add secret"

### 3️⃣ **确保仓库标签存在**

确保你的仓库中有以下标签（Labels）：
- `Invitation` (用于触发自动邀请)
- `TechRosie` (用于分类)

如果没有，可以在 Issues 页面创建：
1. 前往 Issues 页面
2. 点击 "Labels"
3. 点击 "New label"
4. 创建所需标签

### 4️⃣ **测试系统**

1. 使用另一个 GitHub 账户（或让朋友）测试申请流程
2. 填写申请表单
3. 检查是否收到邀请邮件
4. 验证自动回复消息是否正确显示

## 🔧 **文件结构说明**

创建的文件结构如下：

```
ChanMeng666/
├── .github/
│   ├── ISSUE_TEMPLATE/
│   │   ├── config.yml                 # Issue 模板配置
│   │   ├── join-techrosie.yml         # TechRosie 申请模板
│   │   ├── bug-report.yml             # Bug 报告模板
│   │   └── feature-request.yml        # 功能请求模板
│   └── workflows/
│       └── techrosie-auto-invite.yml  # 自动邀请工作流
├── CODE_OF_CONDUCT.md                 # 社区行为准则
├── CONTRIBUTING.md                    # 贡献指南
├── README.md                          # 主页（已更新）
└── TECHROSIE_SETUP.md                # 本设置指南
```

## 🎯 **核心功能**

### 申请流程
- **智能表单**: 包含经验等级、技术兴趣、动机等字段
- **团队选择**: 用户可以选择感兴趣的团队
- **社区协议**: 确保申请者了解并同意社区价值观

### 自动化流程
- **自动邀请**: GitHub Actions 检测到 `Invitation` 标签后自动发送邀请
- **欢迎消息**: 详细的欢迎信息和后续步骤指导
- **社区引导**: 包含团队介绍和资源链接

### 社区文档
- **行为准则**: 针对女性开发者社区定制的包容性准则
- **贡献指南**: 详细的参与和贡献流程说明

## 🚀 **使用方法**

### 对于申请者
1. 访问你的 GitHub 个人主页
2. 滚动到 "Join TechRosie Community" 部分
3. 点击 "Apply to Join TechRosie" 按钮
4. 填写申请表单
5. 等待邮件邀请

### 对于你（管理员）
1. 监控 Issues 中的申请
2. 系统会自动处理大部分流程
3. 可以手动添加 `Invitation` 标签触发邀请
4. 定期检查组织成员状态

## 🛠️ **自定义选项**

### 修改申请表单
编辑 `.github/ISSUE_TEMPLATE/join-techrosie.yml` 来：
- 添加或移除字段
- 修改技术兴趣选项
- 调整团队描述

### 修改欢迎消息
编辑 `.github/workflows/techrosie-auto-invite.yml` 中的 `comment` 部分来：
- 个性化欢迎消息
- 更新社区链接
- 添加特定指导

### 更新社区文档
根据社区发展需要更新：
- `CODE_OF_CONDUCT.md` - 行为准则
- `CONTRIBUTING.md` - 贡献指南

## 🔍 **故障排除**

### 常见问题

**Q: 自动邀请不工作？**
A: 检查：
- `TECHROSIE_INVITE_TOKEN` Secret 是否正确设置
- Token 是否有足够的权限
- 仓库是否有 `Invitation` 标签

**Q: 申请表单打不开？**
A: 确保：
- `.github/ISSUE_TEMPLATE/join-techrosie.yml` 文件语法正确
- 仓库中的 issue 模板已同步

**Q: 邀请邮件中的链接不工作？**
A: 检查：
- 组织名称是否为 `TechRosie`
- 链接中的仓库路径是否正确

## 📞 **获取帮助**

如果遇到问题：
1. 检查 GitHub Actions 运行日志
2. 验证 Secret 配置
3. 确认组织权限设置
4. 检查 issue 模板语法

## 🎉 **恭喜！**

你现在拥有了一个完整的、自动化的 TechRosie 社区邀请系统！

**系统特色**：
- 🤖 全自动邀请流程
- 📝 专业的申请表单
- 🌹 品牌化的视觉体验
- 📚 完整的社区文档
- 🎯 针对女性开发者的包容性设计

**准备好接收来自全世界女性开发者的申请了吗？** 🌍✨

# chan-meng-cv-extended.pdf 重设计 — «Subtraction / Addition»

日期:2026-07-24 · 状态:设计定稿,待 Chan 审阅
参与:Fable 5(总策划/调度)+ Opus 4.8 subagents(调研/执行)

## 1. 定位

- **一句话**:一本 16 页、图片为主体的英文「个人品牌杂志」,主线 = **极简主义者 × 独立开发者**,落点 = 展示 Chan 的产品品味与开发技术。
- **读者**:对 Chan 开发的项目感兴趣的人——招聘方深读者、潜在客户/合作者、社区泛读者。
- **与短版 CV 的分工**:`chan-meng-cv.pdf` 是投递岗位的狙击枪(ATS/关键词);extended 版完全不为 ATS 服务,零术语墙,技术信服力由项目故事+活链接承担。
- **阅读体验**:像翻一本摄影杂志——图片是主体,文字是图注、短段与 pull-quote;每页文字预算约 40–100 英文词(Voices/Story 章可放宽)。

## 2. 页面架构(16 页)

| 页 | 章节 | 图 | 文字 |
|---|---|---|---|
| 1 | 封面 | 大幅真人照(chanmeng-portrait-2026.jpg 或 chan-by-the-sea.jpg) | 姓名 + "A minimalist. Subtraction for life, addition for thought." |
| 2 | 开场白 | 1 张(工作/生活场景) | 三句话:这份文档写给对我的产品和思考方式好奇的人;短版简历在此(链接) |
| 3–4 | My Story | 时间线视觉 + 2–3 张照片 | 精炼弧线:地理系 → 教培数学老师 → 双减行业消失 → 30 岁赴新西兰读硕(Lincoln, Distinction)→ 硕士全程与 AI 结伴编程(AI 架构师的原点)→ Engram 创始人让 Claude 推荐工程师、Claude 推荐了我(创始人公开确认);初到奥克兰的善意一句带过;两档转行主题播客链接 |
| 5–7 | A Minimalist | 生活实拍 4–6 张(空房间/泡沫垫,源自博客图集)+ 3 张媒体文章卡片 | 前半生活:扔坏充电线/小发夹的起点与正反馈、全部家当一背包一行李箱、把城市当客厅;《Girl on Mattress》(10万+阅读/3864转发)、《A Glimpse of My Minimalist Home》(10万+/1.4万转发)、《I Threw Away My Old Name》(2.9万+,只讲 30 岁改名重塑自我,链接原文);后半桥接工艺:"stripping away what isn't needed so the essential works better — whether that's a living space or a software system" → calm dashboards、anti-bloat 纪律(CopilotKit 贡献从 8 条路径删到 3)、npx chan-meng;pull-quote(自传金句英译):"Living alone, I finally learned to confirm my own existence through my own eyes — my own perspective, my own taste." |
| 8–11 | What I Build, and Who For | 每产品 1 张截图,共 8–10 张 | 全书最大章。每产品 = 一句人话立意 + 截图 + live 链接 + 一行技术定位(不堆术语)。三组:**为社区而建**(tam-ai-ti 毛利财务健康教练+YouTube demo、FreePeriod/FemTracker 对抗月经贫困、She Sharp/Her Waka 服务 8000+ STEM 女性);**品味之作**(设计系统/品牌工具线中最见审美的 2–3 个,实施时从 flagship/craft 桶挑选);**好玩的一面**(chinese/english-redefine 卡片、毛利神话 CSS 塔防) |
| 12 | Teaching | 香蕉钢琴工作坊实拍 + capstone 截图一排 | "Natural language is the source code" + 三年五期 + 一句学员推荐语(Amy Li 或 Jessie Wan) |
| 13–14 | Voices | 24 位推荐人头像墙(public/recommendations/) | **一个不落**;精选金句:Lesley「12:30am 的 PR…true empowerment」、Shivani「简历上看不到的:她本能地去 mentor」等,每人最多一句 |
| 15 | Recognition | UN CSW69 现场照 + 奖项 | 联合国演讲、AI Hackathon 杰出导师奖、UN Women 奖、三档播客 |
| 16 | 封底 | 猴子 logo | Where to find me:chanmeng.org / blog / Newsletter / LinkedIn / GitHub / YouTube / Cal.com |

## 3. 视觉系统(品牌同源温柔版)

- 沿用 `theme-extended.typ` token 体系(brand.yaml v2.1.1 管线,不脱钩);米白/ash 大面积做底、大留白;Anton 仅章节标题且字号收敛;橙 #FC5000 仅做标志线/链接/页码点缀;照片统一圆角+大边距;halftone 网点仅章节扉页轻用;全书无黑底大块。
- **占位图系统**:缺图处不留虚线空框,而是渲染**品牌化占位块**(cream 底 + 轻 halftone + 居中标注 `IMG-XX · 需要的画面描述`),让草稿版本身也成立;所有占位统一编号,文档附录给出 **shot list**(编号/画面内容/建议来源/横竖版式),Chan 按编号补图,替换文件即可重建。

## 4. 文案规则

- 全英文、第一人称、短句;零未解释术语;每个论断附活链接(博客/live demo/视频/播客);无价格与成本框架;正文不硬编码易漂移的粉丝数;事实以 data/profile/*.yaml 为准、日期锚定 10-career.yaml;推荐人 24 位全部出现,引文可精简不删人。
- 生活素材只保留能桥接到产品哲学或开发能力的部分;纯生活趣味细节(童年大院、街舞、自学日语等)不进正文。

## 5. 红线(C 级,禁入公开文档)

源自自传(私有仓库 chan-meng-novel)调研的分级,执行任务书必须原样携带:
- 原生家庭全部创伤细节;初中霸凌相关;所有性内容;激进表达(6b4t/带刀/威胁性言语);与亲人决裂细节;具体政治创伤叙事;对任何族群的负面观察;
- 所有第三方真实姓名(父母/亲属/王东妮/李舒茜/李俊/邓伟/孙可森/黄宇云子/马楠/表姨/cleo 等)——相关素材一律去名化;
- B 级化用不引细节:外表的减法、职场尊严事件、离开中国动因(表述为「去一个能自由呼吸的地方重建生活」)。
- 法律改名故事仅以博客为准源,不声称出自自传。

## 6. 技术路线

1. 保留 Typst 管线:重写 `cv/extended.typ`(内容)+ 扩展 `theme-extended.typ`(照片版式/占位块/文章卡片组件);`pwsh cv/build.ps1` 一键构建不变;编辑前必读 `cv/TYPST_PITFALLS.md`。
2. 图片资产:从 2d-portfolio(public/blog/threw-away-my-old-name/、minimalist-lifestyle-journey/ 等)与 ai-programming-teaching-project(peyvand-academy/、capstone/)复制精选图到 `cv/assets/extended/`,压缩(目标 PDF ≤10MB);本仓库 public/photos/、public/articles/、public/recommendations/ 直接引用。
3. 更新 `cv/README.md` 文件地图(补上 extended 三件套,修文档滞后)。
4. 对外入口:`data/profile/90-meta.yaml` links + README footer 增加 extended 入口,`npm run check` 重新生成(README 由模板生成,不手改)。
5. 执行方式:Opus 4.8 subagent 在 git worktree/分支中实施;Fable 5 只调度与审查;验收 = PDF 逐页转图审查 + npm run check 通过 + 成品交 Chan 过目。

## 7. 验收标准

- 16 页结构齐全,图片(含占位块)占版面主体,单页文字不超预算;
- 无「未完成感」:占位块是设计的一部分,带编号与 shot list;
- 所有链接可点且正确;24 位推荐人齐;红线内容零出现;
- `pwsh cv/build.ps1` 全量通过,`npm run check` 通过(meta/footer 改动后);
- PDF ≤10MB。

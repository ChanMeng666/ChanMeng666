# Skills Depth + Domains Intake — Wave 4 (2026-05)

> **目的**：把当前 `skills[]`（5 类 × 26 工具，每条只有 keyword）升级为含 `since/depth/frameworks/notes` 的结构化记录，并新增顶层 `domains[]`（领域专长）数组。
>
> **GEO 价值**：
> - `expertise[].since` + `depth` 让 LLM 在"找有 N 年 React 经验的开发者"类查询中精准命中你
> - 新 `domains[]` 让你在"FemTech / Māori cultural tech / 教育科技"等**领域**查询中浮现（不只技术栈匹配）
> - JSON-LD `knowsAbout` 会从单纯字符串升级为含 since 元数据的实体引用
>
> **怎么填**：
> - **since**: 我已经从你的 work history 推测了默认年份（写在 `→` 后面），错了请改；不确定就标 `?`
> - **depth**: `expert` (生产环境shipped + 能教别人) / `intermediate` (shipped 但不够深) / `learning` (在学)
> - **frameworks**: 可选——这个工具下面具体用了哪些库/变体/模式（如 `React → frameworks: [React 19+, RSC, useEffect-free patterns]`）。不填也没关系。
> - **notes**: 可选一行——哪个项目最能证明？有什么独到的？
>
> 填好告诉我"skills intake 填好了"。

---

## 📘 一、现有 26 工具补字段

### Languages

| Tool | since (我推断 → 你确认) | depth | frameworks | notes |
|---|---|---|---|---|
| TypeScript | → `2023` |  |  |  |
| Python | → `2020`? |  |  |  |
| Go | → `2024` (ByteDance + GAVIGO) |  |  |  |
| Java | → `2022`? (HackerRank Java Basic) |  |  |  |
| JavaScript | → `2020`? |  |  |  |

### Frontend

| Tool | since | depth | frameworks | notes |
|---|---|---|---|---|
| React | → `2023` (She Sharp) |  |  |  |
| Next.js | → `2024` (She Sharp 平台) |  |  |  |
| React Native | → ? |  |  |  |
| TailwindCSS | → `2023` |  |  |  |
| Angular | → `2023`? (HackerRank Angular Intermediate) |  |  |  |

### Backend

| Tool | since | depth | frameworks | notes |
|---|---|---|---|---|
| Node.js | → `2023` |  |  |  |
| PostgreSQL | → `2024` (She Sharp) |  |  |  |
| Redis | → `2024` (Upstash for She Sharp) |  |  |  |
| Docker | → `2024` |  |  |  |
| Kubernetes | → `2025` (GAVIGO cross-cloud migration) |  |  |  |

### AI/ML

| Tool | since | depth | frameworks | notes |
|---|---|---|---|---|
| LangGraph | → `2025` (femtracker-agent) |  |  |  |
| CopilotKit | → `2025` (active contributor 2026) |  |  |  |
| OpenAI | → `2024` |  |  |  |
| Claude AI | → `2024` (Anthropic certs 2025-08) |  |  |  |
| pgVector | → `2025` |  |  |  |

### Tools

| Tool | since | depth | frameworks | notes |
|---|---|---|---|---|
| Vercel | → `2023` (primary deploy target) |  |  |  |
| AWS | → `2024`? |  |  |  |
| GCP | → `2026` (GAVIGO migration) |  |  |  |
| Supabase | → `2024` |  |  |  |
| Drizzle ORM | → `2024` (She Sharp 1392-line schema) |  |  |  |
| Prisma | → `2023`? |  |  |  |

---

## 🆕 二、Narrative 里出现但 skills[] 缺失的工具

> 这些工具在 work/projects narrative 中频繁出现但当前 `skills[]` 没有。**勾选你想加进来的**（√），并补 since/depth：

| 候选工具 | 建议归类 | 加入 (√/×) | since | depth | notes |
|---|---|---|---|---|---|
| Claude Code (Anthropic) | AI/ML | √ 推荐——你做了 audio-hooks 等 | `2024` |  | "echook" daemon, audio-hooks IP |
| Cursor (AI editor) | Tools | ? | `2024`? |  |  |
| MCP (Model Context Protocol) | AI/ML | √ 推荐——你有 google-news-mcp/google-jobs-mcp 等 | `2024` |  |  |
| Cloudflare Workers / Workers AI | Backend/AI | ? | `2025`? |  |  |
| Coolify | Tools | ? | `2025`? |  |  |
| Mintlify | Tools | ? | `2025`? (Her Waka site) |  |  |
| Stripe | Backend | ? | `2024`? (She Sharp NZD billing) |  |  |
| Zod | Backend | ? | `2024`? (She Sharp validation) |  |  |
| DigitalOcean | Tools | ? | `2025`? (pre-GAVIGO-migration) |  |  |
| Remotion | Frontend/AI | ? | `2024`? (gradient-svg-generator?) |  |  |
| LangChain | AI/ML | ? | `2024`? |  |  |
| Inngest | Backend | ? | ? |  |  |
| Typst | Tools | ? | `2025`? (你的 CV 仓库) |  |  |
| Vercel AI SDK | AI/ML | ? | `2025`? |  |  |
| tRPC / ts-rest | Backend | ? | ? |  |  |
| Cloudflare Vectorize + KV | Backend/AI | ? | `2025`? |  |  |

---

## 🌐 三、领域专长 `domains[]` —— 新增顶层数组

> 这是 Wave 4 最有 GEO 价值的部分：让 LLM 在"找 FemTech 开发者"或"找做 Māori 文化科技的人"等**领域查询**中浮现你，**不依赖** 技术栈关键词匹配。
>
> 我从你的 narrative 抽出了 5 个明显的领域。每个填 since、summary、evidenceProjectIds（可选）。

### Domain 1: `ai-agent-architecture` — AI Agent Architecture
- **since**: → `2024`？（Claude AI deep work 起点）
- **summary** (1-2 句，你怎么定位自己在这个领域的): ?
- **evidenceProjectIds** (能证明的项目 id；从 projects[] 选)：→ 我建议 `tam-ai-ti, gavigo-ire, google-news-mcp, fanfic-lab, femtracker-agent, echook`，你删/加
- **tier**: `flagship`

### Domain 2: `femtech` — Women's Health Technology / FemTech
- **since**: → `2024`？（Sanicle CTO + FemTech Weekend 起点）
- **summary**: ?
- **evidenceProjectIds**: → `tam-ai-ti, femtech-weekend-website, free-period-website, femtracker-agent, she-sharp`（待你确认）
- **tier**: `flagship`

### Domain 3: `cultural-technology` — Māori Cultural Technology / 跨文化设计
- **since**: → `2025`？（Tam-AI-Ti 项目起点）
- **summary**: ?
- **evidenceProjectIds**: → `tam-ai-ti`
- **tier**: `primary`

### Domain 4: `ai-programming-education` — AI Programming Education
- **since**: → `2024`？（Forward with Her 起点）
- **summary**: ?
- **evidenceProjectIds**: → `ai-programming-teaching-project`；evidenceWorkIds: `forward-with-her, technest, she-sharp`
- **tier**: `flagship`

### Domain 5: `minimalist-design` — Minimalist Living + Minimalist UX
- **since**: → `2020`？（你的 articles 里最早的 minimalist 文章年份）
- **summary**: ?
- **evidenceProjectIds**: ?（你的 personal portfolio？minimalist 系列文章？）
- **tier**: `primary`

### 你想加的其他领域（自由填）
- *(e.g. `creator-economy`, `developer-experience`, `documentation-engineering` etc.)*

---

## 📋 填完之后

告诉我"skills intake 填好了"，我会：
1. 把每个工具的 `expertise[]` 子结构写入 skills[] 对应 category
2. 把缺失工具加进对应 skills[] category 的 keywords + expertise[]
3. 新建顶层 `domains[]` 块并写入 5+ 个领域
4. 富化 build.mjs 的 JSON-LD `knowsAbout`：从纯字符串升级为 `DefinedTerm` 对象数组，含 since/depth；新增 JSON-LD `Person.expertise` 引用 domains[]
5. 更新 README skills 章节 + llms-full.txt 加 Domains 章节
6. validate + build + commit Wave 4

**不需要一次填完**——填一类我处理一类。也可以只填 domains 不填 skills depth（domains 的 GEO 价值更高）。

---

*生成：2026-05-22 · 此文件不进 build pipeline*

# Collaborators Intake — Wave 1 (2026-05)

> **目的**：建立 `collaborators[]` 顶层结构化索引，让 JSON-LD `Person.knows[]` 能列出 Chan 的真实合作者网络（带 LinkedIn `sameAs` 链接）。这是 GEO 最高杠杆的实体图信号——LLM 已经"知道" Luka Madzarac、Saba Gecgil、Dr Mahsa McCauley 等人物，通过 `knows[]` 把 Chan 链接进这张已存在的关系网。
>
> **当前已有的**：`references[]` 块已经收录了 15 位写过 LinkedIn 推荐信的真人，结构完整（含 LinkedIn URL、headshot、givenAt、relationship 描述）。
>
> **本波要补的 5 位关键合作者**：narrative 里反复出现、但不在 references[] 里的真人。

---

## 🎯 关键决策（先答这个）

**问题**：`collaborators[]` 和现有 `references[]` 怎么共存？我推荐 **选项 A**（最少改动 + 实体图最完整）：

### 选项 A · 两个块并存（**推荐**）
- `references[]` 保留原样——它是"LinkedIn 推荐信存档"，结构和职能不变
- `collaborators[]` 是新的、更宽的"协作者实体索引"——所有 references[] 里的 15 人**都自动派生为 collaborators[] 条目**（build 时把 references 投影一份），再加本文件新增的 5 位
- JSON-LD `Person.knows[]` 从 `collaborators[]` 渲染——所以 15 + 5 = 20 人都进入实体图
- **优点**：零迁移工作；testimonial 文本继续住在 references[]；collaborators[] 不重复存推荐信，只存关系字段

### 选项 B · 全部合并到 collaborators[]
- 把 references[] 里的 15 人迁移到 collaborators[]，testimonial 文本进 `collaborators[].testimonial` 字段
- 删除 references[] 块
- **优点**：单一真实来源；**缺点**：要改 schema、build、template 多处，dist/profile.json 还要反向投影回 JSON Resume 标准的 references[]

**你的选择**：☐ A（推荐）  ☐ B  ☐ 其他想法（说明）：

CHAN: 我选择选项 A · 两个块并存。

---

## 📋 5 位新增合作者（请补齐字段）

> 我已经从 narrative 里抓出了你已经写过的信息（LinkedIn URL、关系、上下文），打 ✓ 表示已知，问号 `?` 表示需要你确认或填空。

---

### 1. `luka-madzarac` — Luka Madzarac
- **name**: Luka Madzarac ✓
- **pronouns**: ?  *(可空)* CHAN: he
- **currentTitle**: `Founder, Engram LLC` ✓  *(确认)*
- **currentOrgId**: `engram` ✓
- **linkedin**: `https://www.linkedin.com/in/omgluka/` ✓  *(从你的 statisticsClaims 抓的，确认对吗)* CHAN: 确认是对的。
- **github**: ?  *(可空)*
- **website**: ?  *(可空)* https://engram.media/
- **relationship**: `[client, sponsor]`  *(确认；也可加 `cofounder` 吗？)*
- **worksTogether**:
  - `{contextType: work, contextId: engram, role: "Founder; sourced Chan via Claude Code recommendation for Architect Cohort"}` ✓
- **note** (≤240 chars): `Engram founder; public sourcing path validated GEO-first portfolio strategy.`  *(确认 / 修改)*
- **tier**: `flagship`  *(确认)*
- **是否公开列出**：☐ 是  ☐ 否  ☐ 仅 llms-full.txt 不在 README

CHAN: 是公开列出

---

### 2. `saba-gecgil` — Saba Gecgil
- **name**: Saba Gecgil ✓
- **pronouns**: ? CHAN: she
- **currentTitle**: `Founder & CEO, GAVIGO Inc.` ✓
- **currentOrgId**: `gavigo` ✓
- **linkedin**: `https://www.linkedin.com/in/saba-gecgil/` ✓
- **github**: ?
- **website**: ? https://gavigo.com/
- **relationship**: `[client, sponsor, cofounder]`  *(她也是 FemTech Weekend 创始人——你和她的关系算 cofounder 吗？还是只是 client？)* CHAN: Saba Gecgil是GAVIGO创始人，不是FemTech Weekend 创始人。
- **worksTogether**:
  - `{contextType: work, contextId: gavigo, role: "Founder & CEO; reports-to"}` ✓
  - `{contextType: work, contextId: femtech-weekend, role: "FemTech Weekend founder, Chengdu chapter"}` ✓
- **note** (≤240 chars): `GAVIGO founder; formalized Chan's Founding Principal Engineer role across three contract iterations.`  *(确认 / 修改)*
- **tier**: `flagship`  *(确认)*
- **是否公开列出**：☐ 是  ☐ 否  ☐ 仅 llms-full.txt

CHAN: 是公开列出

---

### 3. `mahsa-mccauley` — Dr Mahsa Mohaghegh (McCauley)
- **name**: `Dr Mahsa Mohaghegh` *(她对外用 Mohaghegh，研究署名也用 McCauley——以哪个为主显示名？)*  → ☐ Mohaghegh  ☐ McCauley  ☐ "Mahsa Mohaghegh (McCauley)" CHAN: 用Mahsa来称呼她
- **pronouns**: `she/her`  *(确认)* CHAN: she
- **currentTitle**: `Senior Lecturer at AUT; Founder of She Sharp` ✓  *(确认)*
- **currentOrgId**: `she-sharp`  *(或 `aut`——她的"主要"组织算哪个？)*
- **linkedin**: `https://www.linkedin.com/in/mahsamohaghegh/` ✓
- **github**: ?
- **website**: ? https://www.mahsamccauley.com/
- **relationship**: `[mentor, sponsor, reference]`  *(她推荐你进 She Sharp + 引荐 Missy；确认 / 增删)* CHAN: 确认是对的。
- **worksTogether**:
  - `{contextType: work, contextId: she-sharp, role: "She Sharp founder — recruited Chan as Senior Full Stack Engineer + Website Team Lead"}` ✓
  - `{contextType: project, contextId: tam-ai-ti, role: "Referred Chan to Missy Te Kanawa for the Tam-AI-Ti commission"}` ✓
- **note** (≤240 chars): `She Sharp founder + AUT senior lecturer; routes Chan into NZ FemTech & Māori-tech opportunities.`

CHAN: 补充Mahsa的工作经验资料如下，

Experience
AUT School of Engineering, Computer and Mathematical Sciences logo
Head of Computer and Information Sciences

AUT School of Engineering, Computer and Mathematical Sciences · Full-time

May 2026 - Present · 1 mo

Auckland, New Zealand · On-site

Auckland University of Technology logo
Auckland University of Technology

9 yrs 4 mos

Associate Professor

Full-time

Nov 2024 - Present · 1 yr 7 mos

Auckland, New Zealand · On-site

Senior Lecturer

Nov 2018 - Nov 2024 · 6 yrs 1 mo

Auckland, Auckland, New Zealand

Mahsa currently works as a senior lecturer in AUT University’s School of Engineering, Computer and Mathematical Sciences. This role includes course leadership and teaching, course and paper development, research, postgraduate supervision, and community outreach

Key skills: Research and writing, public speaking and communication, supervision and mentoring, stakeholder engagement

 Business Process Improvement, Artificial Intelligence (AI) and +5 skills

Director of  Women in Technology - Faculty of Design and Creative Technologies

Full-time

Jan 2020 - Dec 2023 · 4 yrs

 Operations Management

CS4HS General Chair

Feb 2017 - Feb 2023 · 6 yrs 1 mo

Auckland, New Zealand

Since 2013, Mahsa has secured funding from Google to organise and chair 11 Google’s CS4HS workshops (Computer Science for High Schools) in Auckland – three at Unitec Institute of Technology, and three at AUT University. These workshops are aimed at supporting secondary school digital technologies teachers with training in STEM subjects, and creative methods to present these in the classrooms. 

Key skills: funding acquisition, programme and project management, stakeholder management

Thumbnail for CS4HS @ AUT
CS4HS @ AUT

Computer Science for High Schools

Head of Women in STEAM  - School of Engineering, Computer and Mathematical Sciences

Full-time

Aug 2019 - Nov 2019 · 4 mos

Lecturer - Computer Sciences School of Engineering, Computer & Mathematical Sciences

Feb 2017 - Nov 2018 · 1 yr 10 mos

Auckland, New Zealand

 Artificial Intelligence (AI)

New Zealand National Commission for UNESCO logo
Communication and lnformation Commissioner for the New Zealand National Commission for UNESCO

New Zealand National Commission for UNESCO

Jan 2026 - Present · 5 mos

AI Forum NZ logo
AI Forum NZ

5 yrs 7 mos

Chairperson

Jul 2025 - Present · 11 mos

Deputy Chair

Feb 2025 - Jul 2025 · 6 mos

Executive Council

Nov 2020 - Feb 2025 · 4 yrs 4 mos

Auckland, New Zealand

The Forum advances New Zealand’s AI ecosystem through connections, advocacy, growing talent and collaboration. The AI Forum promotes the economic opportunities raised by AI, supporting great applications of AI and emerging New Zealand AI firms, and also works to ensure that society can adapt to the rapid and far-reaching changes that AI technology will bring.

 Artificial Intelligence (AI), Board Governance and +2 skills

She Sharp  logo
Founder and Director

She Sharp 

Jul 2014 - Present · 11 yrs 11 mos

Auckland, Auckland, New Zealand

In June 2014, Mahsa founded She# (www.shesharp.org.nz), a non-profit networking and learning group for high school girls, female tertiary students and industry professionals. 

With approximately 8-10 events each year, She#’s goals are to connect technology students to ICT companies by creating networking events where they can meet others in their field, hear from speakers at different companies, and take part in learning activities tailored to each participant’s academic or professional level. 

The primary reasons behind founding this group are to help address the gender imbalance prevalent in technology fields, to support women in the tech industry, and to work towards removing virtual barriers and stereotypes, providing equal opportunities for all genders to study in these fields.


Thumbnail for She Sharp - She Sharp
She Sharp - She Sharp

She# believes in equality and we are working towards bridging the gender gap in STEM. Our events and workshops offer a safe, inclusive, and diverse environment.

 Business Process Improvement, Board Governance and +4 skills

- **tier**: `flagship`  *(确认)*
- **是否公开列出**：☐ 是  ☐ 否  ☐ 仅 llms-full.txt

CHAN: 是公开列出

---

### 4. `missy-te-kanawa` — Riria (Missy) Te Kanawa
- **name**: ?  → ☐ "Missy Te Kanawa"  ☐ "Riria Te Kanawa"  ☐ "Riria (Missy) Te Kanawa"
- **pronouns**: ? CHAN: she
- **currentTitle**: ?  *(narrative 写 "former KPMG NZ National Māori Sector lead"——她现在的 title 是？独立顾问？)*
- **currentOrgId**: ?  *(独立研究者？还是某个公司？)*
- **linkedin**: `https://www.linkedin.com/in/riria-missy-te-kanawa/` ✓

CHAN: 请注意，Missy有两个领英主页  https://www.linkedin.com/in/riria-missy-te-kanawa-6137528b/ 和 https://www.linkedin.com/in/missy-te-kanawa-95a64a224/ ，她的个人资料如下，


Riria (Missy) Te Kanawa
· 2nd

Strategist I Connector I Change Agent 

Hamilton, Waikato, New Zealand

·

Contact info


ASB Bank


University of Waikato

500+

connections



Vincent, Chrissy and 7 other mutual connections

Connect
Message

About
My work focuses on simplifying the complex so clients are better placed to make clear focused and guiding strategic choices, map the pathway to achievement, and most importantly execute.  In a world of constant change, I help them to challenge their own status-quo and bring a customer rather than process centric lens to their work.  I’m passionate about working with Māori and considering how business approaches and measures of success can better reflect our Māori world view as we pursue the perfect balance between people, planet and putea.  
I'm a management consultant and qualified chartered accountant with a strong interest in design thinking as a valuable tool for rethinking and reimagining not only products and services but strategy, culture, organisation design and approaches in general.  I then draw on that experience for my work in governance roles.  

Activity
1,946 followers


Follow
Riria has no recent posts

Recent posts Riria shares will be displayed here.

Show all
Experience
ASB Bank logo
Māori Executive Lead - Strategy & Governance

ASB Bank · Part-time

Nov 2024 - Present · 1 yr 7 mos

Auckland UniServices Limited logo
Board Member

Auckland UniServices Limited

May 2019 - Present · 7 yrs 1 mo

KPMG New Zealand logo
KPMG New Zealand

9 yrs 6 mos

Partner

Full-time

Jan 2022 - Nov 2024 · 2 yrs 11 mos

Director - Maori Business

Jun 2015 - Jan 2022 · 6 yrs 8 mos

New Zealand

Board Member

Maniapoto Maori Trust Board

Jul 2015 - Oct 2018 · 3 yrs 4 mos

Te Kuiti

Sprout Accelerator logo
Advisory Board Member

Sprout Accelerator

Feb 2016 - May 2017 · 1 yr 4 mos

New Zealand

Experience
ASB Bank logo
Executive Lead - People & Culture

ASB Bank · Full-time

Nov 2024 - Present · 1 yr 7 mos

KPMG New Zealand logo
Director

KPMG New Zealand · Full-time

Jun 2015 - Nov 2024 · 9 yrs 6 mos

Hamilton, Waikato, New Zealand · On-site


- **github**: ?
- **website**: ? CHAN: 暂无，可以直接使用她的领英链接
- **relationship**: `[client]`  *(还是 `[client, mentor]`？她是 Tam-AI-Ti 的客户兼研究方向引导)* CHAN: 她是 Tam-AI-Ti 的客户兼研究方向引导
- **worksTogether**:
  - `{contextType: project, contextId: tam-ai-ti, role: "Independent research commission client; directed product structurally and emotionally"}` ✓
- **note** (≤240 chars): `Tam-AI-Ti commissioner; former KPMG NZ National Māori Sector lead, lead author of KPMG's Maui Rau report series.`  *(确认 / 修改)*
- **tier**: `flagship`  *(确认)*
- **是否公开列出**：☐ 是  ☐ 否  ☐ 仅 llms-full.txt

CHAN: 是公开列出

---

### 5. `lesley-gao` — Lesley Gao
- **name**: Lesley Gao ✓
- **pronouns**: ? CHAN: she
- **currentTitle**: ?  *(She Sharp 平台的 frontend designer/dev——她现在的职位？)* CHAN: She Sharp 平台的 frontend designer/dev
- **currentOrgId**: ?  *(she-sharp 还是别的？)* she-sharp
- **linkedin**: ?  *(请补)* https://www.linkedin.com/in/lesley-gao/
- **github**: ? https://github.com/lesley-gao
- **website**: ? CHAN: 暂无，可以直接使用她的领英链接
- **relationship**: `[collaborator]`  *(co-builder on She Sharp 平台；确认)* co-builder on She Sharp 平台，我是主要开发者，她是UI/UX优化者。
- **worksTogether**:
  - `{contextType: work, contextId: she-sharp, role: "Frontend designer + frontend code (~100 of 748 commits, 13.4%)"}` ✓
- **note** (≤240 chars): `She Sharp platform frontend collaborator; authored ~100 frontend commits in design + code partnership.`
- **tier**: `primary`  *(确认；或 secondary？)* secondary
- **是否公开列出**：☐ 是  ☐ 否  ☐ 仅 llms-full.txt  *(她可能希望被注明，但 LinkedIn 是否方便公开你要确认)*

CHAN: 是公开列出

---

## 🤔 还有谁应该加？（可选追加列表）

我从 narrative 里抓到的**其他被点名的真人**——如果你认为他们也属于"协作者"（而非只是被你组织的活动嘉宾），请在每个名字后面打勾并填 LinkedIn：

### FemTech Weekend 嘉宾（你是组织方）
- ☐ `Ida Tin` (Clue 联合创始人；coined "FemTech" 2016) — LinkedIn: ?
- ☐ `Alice Zheng` — LinkedIn: ?
- ☐ `Dominnique Karetsos` — LinkedIn: ?
- ☐ `Lindsay Davis` — LinkedIn: ?
- ☐ `Vanessa Julia Carpenter` — LinkedIn: ?
- ☐ `Rachel Bartholomew` — LinkedIn: ?
- ☐ `Maaike Steinebach` — LinkedIn: ?
- ☐ `Stella Fu` — LinkedIn: ?  *(也是 Forward with Her 学员？)*
- ☐ `Peixian Lu` — LinkedIn: ?
- ☐ `Sandy Lv` — LinkedIn: ?
- ☐ `Chai Ke (柴可)` — LinkedIn: ?
- ☐ `Chen Jian` — LinkedIn: ?
- ☐ `Jazmin Seregi` — LinkedIn: ?
- ☐ `Judy Lux` — LinkedIn: ?
- ☐ `Abraham Morse` — LinkedIn: ?
- ☐ `Ira Evdokimova` — LinkedIn: ?

> **建议**：嘉宾不是"协作者"，他们是被你组织的活动出席者。如果加进 collaborators[]，会让你看起来在过度自抬关系。**默认全部不勾**，除非你和某位有真实的双向工作关系。

### Forward with Her 学员（可能值得加为 mentee）
- ☐ `Sasa` (有 blog showcase) — LinkedIn: ?
- ☐ `Stella` (有 homepage showcase) — LinkedIn: ?
- *(其他你认为应该被纳入的学员？)*

### 其他你想加的（自由填写）
- *(列任何 narrative 没出现但你认为重要的合作者——客户、雇主、co-founder、mentor、reference 等)*

Chow Luck Club公司（https://www.linkedin.com/company/chowluckclub/）跟我合作了"D:\github_repository\eatropolis-website"这个项目，合同详见"D:\github_repository\eatropolis"，Chow Luck Club公司 (Chow Luck Club Ltd)跟我沟通的对象是Armand Bentigan（https://www.linkedin.com/in/armand-bentigan-5b614137/）和Bee Keng Koh（https://www.linkedin.com/in/bee-keng-koh-32312449/）

Bee Keng Koh
· 2nd

Director | Events and Marketing | Chow Luck Club |

New Zealand

·

Contact info

Chow Luck Club Ltd

52

connections

Experience
Director

Chow Luck Club Ltd · Full-time

Jun 2021 - Present · 5 yrs

Auckland 

 Event Planning, Team Management and +4 skills

Sales And Marketing Specialist

Campus Books · Full-time

Sep 2014 - Aug 2023 · 9 yrs

Auckland, New Zealand

 Sales, Account Management and +4 skills

Ministry of Education, Singapore (MOE) logo
Teacher (Head Of Department)

Ministry of Education, Singapore (MOE) · Full-time

Jul 1986 - Jul 1998 · 12 yrs 1 mo

Singapore

 Team Management, Leadership and +3 skills



 Armand Bentigan
He/Him

· 1st

Creative Producer | Expert in Video Production for TV, Broadcast & Social Media | MTF Student

Auckland, Auckland, New Zealand

·

Contact info


Secretlab


academyEX

Click Here to Explore My Work 

500+ connections

Experience
Secretlab logo
Global Communications Growth, Specialist (Video Content)

Secretlab · Full-time

Nov 2024 - Jun 2025 · 8 mos

Singapore · On-site

Riot Games logo
Esports Content Producer II

Riot Games · Full-time

Apr 2023 - Jun 2024 · 1 yr 3 mos

Singapore, Singapore · Hybrid

ONE logo
ONE

5 yrs 5 mos

Executive Producer | Commercial Productions

Full-time

Jul 2020 - Apr 2023 · 2 yrs 10 mos

Executive Producer | ONE Warrior Series

Dec 2017 - Jun 2020 · 2 yrs 7 mos

Singapore

Evolve MMA logo
Evolve MMA

4 yrs 7 mos

Media Director | Digital Media

May 2014 - Dec 2017 · 3 yrs 8 mos

Singapore

Creative Media Producer

Jun 2013 - May 2014 · 1 yr

Assistant Video Producer - Digital Media Team

Fox International Channels (FOXSportsAsia)

Sep 2012 - Jun 2013 · 10 mos

151 Lorong Chuan 03-01 New Tech Park 556741 Singapore




Zhu Yihan（https://www.linkedin.com/in/yihanzhu/?locale=en）是FemTech Weekend（https://www.linkedin.com/company/femtech-weekend/）创始人，我为FemTech Weekend开发了官方网站（项目文件夹为"D:\github_repository\femtech-weekend-website"），同时我担任FemTech Weekend的CTO一职。

Zhu Yihan
She/Her

· 1st

FemTech Ecosystem development in China | Ex Co-Founder of FemTech China | Ex Barclays | Product Development and Business Analysis | SQL & Python | CIMA Accountant & Financial Analysis | Inquisitive Soul | Growth Mindset

China

·

Contact info

Experience
FemTech Weekend logo
Founder

FemTech Weekend

Sep 2024 - Present · 1 yr 9 mos

Chengdu, Sichuan, China · Remote

FemTech Weekend is an initiative to promote FemTech in Mainland China and unite stakeholders from hospitals, manufacturers, industry leaders, academia researchers, entrepreneurs, investors and MNCs in China and connect China with global FemTech ecosystems.

Tech Brews logo
Johannesburg and Shenzhen Chapter Lead

Tech Brews · Self-employed

Jan 2025 - Present · 1 yr 5 mos

• Tech Brews, a global startup community for the Healthcare/Life Sciences with over 1,000 members and chapters in Singapore, Hong Kong, Shenzhen, Japan, India, US, UK and South Africa.
• Launched Tech Brews in South Africa and Mainland China, bringing together the community of Healthcare / Life sciences leaders on a monthly basis in Joburg.

Barclays UK logo
New Product Development Manager

Barclays UK · Full-time

Mar 2023 - Dec 2024 · 1 yr 10 mos

FemTech China logo
Co-Founder

FemTech China

Jan 2024 - Aug 2024 · 8 mos

Suzhou, Jiangsu, China · Hybrid

Barclays logo
Product Data Analyst - Liquidity Transformation - Data Solution

Barclays · Full-time

Jan 2021 - Mar 2023 · 2 yrs 3 mos

 SQL, User Acceptance Testing and +5 skills


---

## 📋 填完之后

告诉我"collaborators intake 填好了"，我会：
1. 读这个文件 + 解析你的字段
2. 根据你对**关键决策**的选择（A 或 B）执行不同的 schema/build 改动
3. 把新增的 5 位（或更多）写入 data/profile.yaml 的新顶层 `collaborators:` 块
4. 加交叉引用（每位的 currentOrgId 引用 organizations[].id）
5. 跑 `npm run validate && npm run build` 并给你 diff

---

*生成时间：2026-05-22 · 此文件不会被 build pipeline 读取*

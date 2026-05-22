# Organizations Intake — Wave 1 (2026-05)

> **目的**：把现有 `meta.x_brand.organisations[]`（28 条 display-only roster）升级为顶层 `organizations[]` 结构化索引，让 JSON-LD 能为每家机构发出 `Organization` 节点 + `Person.knows[]/affiliation[]` 引用，强化 GEO 实体图。
>
> **怎么填**：每个机构下面我已经预填了 `type`（我的猜测，错了请改）。**核心要补的 5 个字段**：
> 1. `linkedin` — 机构 LinkedIn 公司主页 URL（最关键的 sameAs 信号；如果没有 LinkedIn 就留空写 `null`）
> 2. `hq` — 总部城市 / 地区 / 国家（很多机构是分布式的，写"主要注册地"或"创始地"即可）
> 3. `industry` — 一句话行业分类（自由文本，例：`AI-powered media agency`、`Women-in-tech nonprofit`）
> 4. `founded` — 成立年份（4 位数字，不知道就留空）
> 5. `description` — 1-2 句话机构简介（中性、可引用的口吻；将渲染进 JSON-LD `Organization.description`）
>
> **可选**：`sameAs_extra` 里可加 Crunchbase / Wikipedia / 官方 X 等链接（每行一条）
>
> 填完之后告诉我"orgs intake 填好了"，我会一次性把所有改动写入 `data/profile.yaml` 的新顶层 `organizations:` 块并删除 legacy `meta.x_brand.organisations:`。
>
> 现有的 `name` / `url` / `logo` 字段会保留，不需要重填。

---

## ⭐ PRIMARY · 直接雇主 / 客户（14 条）

### `engram` — Engram LLC
- **type**: `startup`  *(确认 / 修改)* CHAN: 确认。
- **linkedin**: `https://www.linkedin.com/company/engrammedia/`  *(确认这是对的吗？还是别的 slug)* CHAN: 确认是对的。
- **hq**: `Albuquerque, New Mexico, US`  *(确认 / 修改)*
- **industry**: `AI-powered media agency`  *(确认 / 修改)*
- **founded**: `2024`  *(确认 / 修改)*
- **description**: ?  *(1-2 句话，例：New Mexico-registered AI media agency repositioning around agent-powered media operations; on the path to Anthropic certified-partner status.)*
- **sameAs_extra**: ?  *(每行一个 URL；可空)*

Engram
Media done right.

Marketing Services Albuquerque, NM 268 followers 2-10 employees
Luka Madzarac
Luka works here

Message

Following
 

Home
About
Posts
Jobs
People
Overview
Full-stack media systems that help companies reach, engage, and convert audiences through design, content, and AI-powered tools.

Dedicated media team. 

Website
https://engram.media
Phone
+13477516040Phone number is +13477516040
Industry
Marketing Services
Company size
2-10 employees
3 associated members LinkedIn members who’ve listed Engram as their current workplace on their profile.
Headquarters
Albuquerque, NM
Founded
2023
Specialties
Media Production, UX/UI Design, Brand Development, Media Buying, AI in Marketing, and Marketing Automation
Remote workplace

We measure impact by results per unit of time. Work hard, play hard

Locations (1)
Primary
Albuquerque, NM 87107, US

Get directions Get directions to Albuquerque, NM 87107, US


Engram
268 followers
4mo •  

We just shipped a full premium course product from scratch.
Not “a bunch of videos”.
A structured learning experience designed to take someone from zero to building no-code AI automation systems in 3 weeks (with templates, projects, and mentorship).
Here’s what it actually took.

Timeline (real dates)
March 2024
Curriculum + course architecture started.

Phase 1: Pre-production
We planned everything before hitting record:
lesson structure
documentation + templates
scripting
project paths (choose-your-own-adventure style)
October → mid-November 2024
Platform + website development.

Phase 2: Production 
@aimarketerguy - Anthony flew to our studio and we filmed the entire course in under 7 days.
Over 1TB of footage captured.
Rough sprint. Clean result.

Course structure:
3 modules
9 projects students can choose from
mentorship layer built into the experience

Phase 3: Post-production We edited like a production pipeline, not like YouTube edits:
DaVinci Resolve: rough cuts + color
After Effects: clean animations to explain systems
Premiere Pro: sound design + music + final polish
Beta testing We hand-picked 10 people to test the first version before launch.

Launch: January 1st, 2025
We went live, and we’ve been live since.

What changed for Engram
Engram used to be “content on demand”: websites, video, animation, ads.
Now we specialize in building learning products:
Curriculum + production + templates + delivery systems that keep attention and actually transfer skill.
If you’re a niche expert who wants to turn knowledge into a structured course with premium production, this is exactly what we build.

AI Automation
Anthony Lee 
Luka Madzarac


Engram
268 followers
11mo • Edited •  

This is how AI actually helps with the most time-consuming parts of the creative process.


### `gavigo` — GAVIGO Inc.
- **type**: `startup`
- **linkedin**: ? https://www.linkedin.com/company/gavigo/
- **hq**: ?
- **industry**: `Gaming/cloud infrastructure (Instance Restoration Engine)`  *(确认 / 修改)*
- **founded**: ?
- **description**: ?
- **sameAs_extra**: ?

Gavigo
Activation & Execution Layer for Interactive Software

Software Development Wilmington, Delaware 96 followers 2-10 employees
Saba Gecgil
Saba & 2 other connections work here

Following

Invite
 

Home
About
Posts
Jobs
People
Overview
GAVIGO is building an activation and execution layer for interactive software.

The problem is simple: discovery on the internet is instant, but interaction is still slowed by installs, cold starts, and waiting. User intent happens immediately. Interactive software still does not.

GAVIGO is designed to remove that gap by turning intent into live interaction without installs, store redirects, or waiting screens.

At a systems level, the thesis is that the future of interactive software will not be shaped by raw compute alone, but by how efficiently compute can be activated, shared, and restored.

GAVIGO is a Delaware C-Corp, part of the NVIDIA Inception Program and the Google for Startups Cloud Program, with patent-pending filings around its core architecture.

We’re building for a world where interactive software starts instantly.

Website
https://gavigo.com/
Industry
Software Development
Company size
2-10 employees
6 associated members LinkedIn members who’ve listed Gavigo as their current workplace on their profile.
Headquarters
Wilmington, Delaware
Founded
2025
Locations (1)
Primary
Registered Office (US)
Wilmington, Delaware 19801, US

Get directions Get directions to Wilmington, Delaware 19801, US

### `sanicle` — Sanicle Inc.
- **type**: `startup`
- **linkedin**: ?
- **hq**: ?
- **industry**: `FemTech multi-tenant platform`  *(确认 / 修改)*
- **founded**: ?
- **description**: ?
- **sameAs_extra**: ?

Sanicle
Transforming workplace wellness with AI-driven solutions for inclusivity, sustainability, and health equity.

Wellness and Fitness Services Tulsa, OK 445 followers 2-10 employees
Tharaneetharan Thavarasan is open to work
Tharaneetharan & 18 other connections follow this page

Message

Following
 

Home
About
Posts
Jobs
People
Overview
Sanicle.cloud offers a comprehensive, AI-powered solution for menstrual and menopausal health in the workplace, addressing a wide range of conditions such as postmenopause, perimenopause, menstrual cramps, menorrhagia (heavy menstrual bleeding), vaginal dryness, and irregular periods. Our platform delivers personalized wellness experiences, including hormone-health nutrition plans, streaming workouts, and science-based insights tailored to each woman's cycle.

In addition to supporting female employees, Sanicle also extends its services to male employees and their female spouses. Our AI matching technology connects employees to OBGYN consultations or menstrual pain solutions in under five minutes, ensuring both men and women receive timely support for health challenges that affect their personal and professional lives.

With our employer dashboard, HR managers can efficiently manage employee wellness by automating the restocking of menstrual supplies in bathrooms using FSA-HSA benefits at CVS. Employees can also order nutritious meals from HelloFresh, fostering a holistic approach to wellness. 

Sanicle’s platform also supports the management of anonymous employee health data, including conditions like PCOS, while maintaining privacy. By providing personalized care, Sanicle helps reduce health plan costs, lowers turnover by 50%, and increases productivity by 70%, ultimately delivering measurable ROI for businesses and creating a more inclusive, supportive workplace.

Website
https://www.sanicle.cloud
Phone
9294880608Phone number is 9294880608
Industry
Wellness and Fitness Services
Company size
2-10 employees
2 associated members LinkedIn members who’ve listed Sanicle as their current workplace on their profile.
Headquarters
Tulsa, OK
Founded
2021
Locations (1)
Primary
Headquarters
Tulsa, OK 74137, US

Get directions Get directions to Tulsa, OK 74137, US

官方网站详见"D:\github_repository\sanicle-cloud"这个项目文件夹，可以从中获取更多公司信息

Sanicle 创始人是Paige Afanu（https://www.linkedin.com/in/peju-afanu-7b9367110/）



Paige Afanu
· 1st

ICP-ACC POPM SSM CMC FIMC CMPGRC Analyst | Cybersecurity Analyst | Product Owner | Business Analyst | Agile Coach | Development Expert | Expert Resource for Government | Business Management

Greater Toronto Area, Canada

·

Contact info

Experience
Product Management Lead

HandyQServe · Permanent Part-time

Oct 2025 - Present · 8 mos

Canada

Leading the end-to-end product management and development of HandyQServe, an AI-enabled workforce and operations management platform designed to help service-driven businesses digitize frontline task execution, improve scheduling, strengthen SOP adoption, and gain real-time visibility into operational performance.

Key responsibilities include:
Translating the business vision into a structured product roadmap, guiding the solution from concept validation through MVP development, testing, and launch readiness.

Managing cross-functional collaboration with technical, product, and design contributors to ensure platform features align with customer pain points, operational workflows, and business objectives.

Defining product requirements, user stories, workflow logic, feature priorities, and acceptance criteria for the web-based admin dashboard and mobile application.

Conducting customer discovery and market validation to identify operational challenges faced by small and growing businesses, including task execution, reporting, performance visibility, and AI-assisted optimization.

Collaborating with development teams to convert informal business processes into structured digital workflows that support consistency, accountability, quality assurance, and operational efficiency.

Overseeing sprint priorities, product backlog refinement, feature testing, and feedback loops to ensure continuous improvement and alignment between business needs and technical delivery.

Supporting go-to-market readiness through product positioning, pricing strategy, customer onboarding, pilot planning, and user adoption strategy.

Applying Agile product management principles to coordinate delivery, remove blockers, clarify requirements, and ensure the product remains user-focused, commercially viable, and scalable.

 Design Thinking, Software Testing Life Cycle (STLC) and +10 skills

Project Manager

Sanicle · Contract Part-time

Oct 2024 - Sep 2025 · 1 yr

Toronto, Ontario, Canada · Hybrid

Leading the management and development team of a pioneering FemTech start-up, dedicated to transforming workplace benefits for women with key focus on reproductive health. The mission centers on enhancing organizational productivity and efficiency by providing comprehensive support to women during critical life stages (menstruation and menopause).

Using Agile principles provide leadership and motivate the project team in the development of a Minimum Viable Product (MVP) / Proof of Concept (PoC) that addresses the unique needs of women in the workplace with an aim to improve the benefits package available to women facing reproductive health challenges, ensuring access to affordable care and resources that empower them to manage their symptoms effectively. 

By fostering a culture of awareness and support within organizations, Sanicle is committed to creating healthier, more inclusive workplaces that prioritize women's health and well-being.

 Microsoft Office, Sounding Board and +9 skills

Project Management Specialist

Mastercard Foundation · Contract Part-time

Feb 2023 - Jan 2024 · 1 yr

•	Managed a team of trainers, mentors, and program coordinators to deliver entrepreneurship programs for 2,000+ participants.
•	Supervised program staff in tracking KPIs, monitoring progress, and producing evaluation reports.
•	Designed female-focused entrepreneurship initiatives, leading a team that facilitated loan access and training for participants.
•	Coordinated STEAM vocational program delivery by managing trainers, SMEs, and partner organizations impacting 1,000+ beneficiaries.
•	Fostered a collaborative team culture, improving communication and accountability.

Business Transformation Consultant

USADF · Contract Part-time

Aug 2020 - Jan 2023 · 2 yrs 6 mos

Operational Process Optimization: Improved operational efficiency by identifying redundancies, gaps, and single points of failure across processes. Conducted thorough gap analyses and recommended solutions that streamlined workflows, enhancing productivity and reducing risk.

Business Requirements and Documentation: Produced high-quality business requirements documents through comprehensive analysis, stakeholder engagement, and clear documentation. Developed flowcharts, mock-ups, data flow diagrams, and step-by-step guides to communicate functional requirements effectively.

Project Leadership and Planning: Led multiple stakeholders in developing a project plan for a complex, enterprise-wide program, coordinating effectively across departments and ensuring alignment on key goals.

Agile Methodology Implementation: Leveraged agile methodologies to drive projects forward quickly and efficiently, enabling faster program delivery and continuous improvement through iterative development and stakeholder feedback.

Stakeholder Engagement and Collaboration: Built and maintained strong relationships with stakeholders, including management, product/service owners, project teams, and back-office teams. Facilitated collaborative discussions, research, and analysis to support program delivery.

Vendor and Issue Management: Managed relationships with third-party vendors and coordinated issue resolution, ensuring prompt and effective responses to business needs and operational requirements.

Requirements Gathering and Risk Analysis: Elicited and documented business requirements through open discussions, brainstorming, and prototyping. Conducted risk evaluations related to project implementation and operational processes, proactively addressing potential issues.

Strategic Growth and Sustainability: Developed growth strategies and sustainability plans to support business expansion. Created structures and processes aimed at long-term success and resilience in a competitive market.

 Microsoft Office, Sounding Board and +16 skills

Project Consultant

Coca Cola · Contract Part-time

Jan 2016 - Jul 2020 · 4 yrs 7 mos

Led the organization in competitive bidding for a diverse range of construction projects for corporate clients, with a strong emphasis on integrating sustainable practices into every aspect of the building process.

Oversaw projects of varying scales, from new constructions to renovations, ensuring alignment with environmental responsibility and client expectations.

Utilized an agile framework tailored for a non-tech environment to facilitate efficient and lean project management, collaborating effectively with cross-functional teams.

A focus on innovative solutions and sustainable methodologies enhanced project outcomes and fostered a culture of continuous improvement and adaptability within the organization.

 Microsoft Office, Sounding Board and +13 skills

Sanicle Director of Program Operations是Chaste Christopher Inegbedion（https://www.linkedin.com/in/chastechrisinegbedion/）

Chaste Christopher Inegbedion

He/Him

· 1st

Event & Program Ops Leader | Creative Economy & Journalist | 50+ Events across 5+Markets | $1M+ Budget Managed | $750K+ Cost Saving | Stakeholder & Vendor Leadership | Connecting brands with clients at high-impact events

United States

·

Contact info


ConcordeApp


University of Washington - Michael G. Foster School of Business

15,465 followers

·

500+ connections

Experience
ConcordeApp logo
Director of Special Events

ConcordeApp · Full-time

Jan 2024 - Present · 2 yrs 5 mos

•	Led execution of global summits and high-level Drove convening across 3+ international markets (UN, World Bank, WEF, COP), engaging 1,000+ stakeholders
•	30% improvement in partnership conversion and resource deployment through structured cross-sector collaboration
•	Deployed AI-driven event intelligence tools across 10+ organizations, improving engagement tracking and post-event follow-through
•	Delivered high-impact corporate events that elevated brand visibility by 30% and increased lead generation by 20%

AT&T logo
Product Operations Manager

AT&T · Full-time

Dec 2023 - Dec 2024 · 1 yr 1 mo

On-site

•	Managed $1.2M multi-market program across 5 Facilitated U.S. regions, reducing time-to-launch by 40%
•	Executed a high-impact regional launch of AT&T Fiber across three markets, generating 5,000+ attendees and achieving 115% of revenue targets within 90 days.
•	Utilized SAP Concur for real-time budget oversight, uncovering billing inefficiencies and vendor waste to achieve average savings of $3,200 per event (12–15%) while maintaining event quality. 

 Product Vision and Launch Products

Sanicle logo
Director of Program Operations

Sanicle · Part-time

Jan 2020 - Dec 2024 · 5 yrs

Tulsa, Oklahoma, United States · Remote

•	Directed end-to-end execution of health-tech programs and events serving 2,000+ participants across 15 organizations
•	Reduced operational costs by $750K+ through vendor optimization and process redesign
•	Improved program and event delivery speed by 40% through Agile operating frameworks
•	Partnered with marketing to design data-driven promotional strategies, driving a 25% increase in event attendance

Thumbnail for AFROTECH 2023: Chaste Inegbedion | Crystal Etienne of Ruby Love Led Inspiring Fireside Chat
AFROTECH 2023: Chaste Inegbedion | Crystal Etienne of Ruby Love Led Inspiring Fireside Chat

 Product Management, Amazon Web Services (AWS) and +3 skills

Paycom logo
Product Manager (SaaS, Web, and Mobile)

Paycom · Full-time

Dec 2022 - Dec 2023 · 1 yr 1 mo

United States · On-site

•	Led Agile sprint planning and backlog prioritization for event-related platform capabilities, improving delivery timelines by 30%
•	Built automated reporting dashboards, reducing reporting time by 25% and improving data accuracy
•	Executed a three-part virtual event series for Paycom’s Beti® and IWant™ AI, registering 2,500+ HR professionals with 62% live attendance; interactive demos drove a 35% increase in client self-service logins within 30 days and achieved a record-high NPS of +72.

Thumbnail for paycom chaste ine.jpg
paycom chaste ine.jpg

 Online Advertising, Product Management and +4 skills

Amazon logo
Product Operations Manager

Amazon · Full-time

Dec 2020 - Dec 2022 · 2 yrs 1 mo

Harrisburg, Pennsylvania, United States · On-site

•	Delivered a high-impact Amazon Alexa user conference, training 1,100+ developers and increasing custom skill adoption by 40%; real-time insights showed 89% preference for the new interface, while campaign reach exceeded 12,000 social impressions
•	Drove post-event performance for Amazon retreat, achieving 42% survey engagement and a 4.8/5 satisfaction rating; generated 1.2M social impressions and executed high-volume logistics for 8,500 demo units across 12 locations with 99.7% on-time delivery.
•	Delivery of 60+ AI/ML product capabilities across engineering, design, and QA teams

### `technest` — TechNest Community
- **type**: `nonprofit`  *(Newfoundland 社区组织，确认)*
- **linkedin**: ? https://www.linkedin.com/company/technestcommunity/
- **hq**: `Newfoundland, Canada`  *(确认 / 修改)*
- **industry**: `Tech upskilling community for youth & newcomers`  *(确认 / 修改)*
- **founded**: ?
- **description**: ?
- **sameAs_extra**: ?

TechNest Community
TechNest Community: Connect. Learn. Grow. Innovate.

Non-profit Organizations St. John's 1K followers 11-50 employees
Precious Olayinka
Precious & 8 other connections work here

Message

Following
 

Home
About
Posts
Jobs
People
Overview
TechNest Community is a dynamic and inclusive hub for tech enthusiasts, learners, and professionals committed to growth, innovation, and collaboration. 

We help people by offering access to valuable resources,  guidance, opportunities to meet others, and learning programs.  At TechNest Community, creating a positive environment in which new and old tech professionals can meet, exchange information and do well is essential. 

We design workshops, career development programs, hackathons, and numerous community-driven events that help build success in today's tech industry.  Whatever your goals are, whether you want to enter the tech field, become an expert at it, or just be a part of a community, TechNest is there to help you. Together, let's create the future of technology!

Website
technestcommunity.com
Industry
Non-profit Organizations
Company size
11-50 employees
14 associated members LinkedIn members who’ve listed TechNest Community as their current workplace on their profile.
Founded
2024
Locations (1)
Primary
Headquarters
St. John's, CA

Get directions Get directions to St. John&#39;s, CA

### `she-sharp` — She Sharp
- **type**: `nonprofit`
- **linkedin**: `https://www.linkedin.com/company/she-sharp/`  *(确认)* CHAN: 正确链接为https://www.linkedin.com/company/shesharpnz/
- **hq**: `Auckland, New Zealand`  *(确认 / 修改)*
- **industry**: `Women-in-tech community nonprofit`
- **founded**: `2014`  *(从 statisticsClaims 推断；确认)*
- **description**: ?  *(可参考 "Auckland-based nonprofit growing the women-in-tech pipeline since 2014, 2,200+ registered members ...")*
- **sameAs_extra**: ?

She Sharp
Women only make up 20% of roles in STEM industries. We can change things; if we work together. We empower women in STEM.

Technology, Information and Media Auckland, North Island 4K followers 2-10 employees
Dr Mahsa McCauley (Mohaghegh)
Dr Mahsa & 8 other connections work here

Message

Following
 

Home
About
Posts
Jobs
People
Overview
We aim to encourage women in computer science, computer engineering, IT, and tech-related fields to develop academically and professionally, to network and learn with each other and to foster the advancement of women in high-school, university and industry.

Our mission is to bridge the gender gap. We do this by providing a platform for women in tech to network and develop vital skills that will advance them professionally. 

We also inspire young girls to pursue careers in tech by connecting them with female role models, engaging them in practical workshops, and challenging misconceptions about the industry.

Website
https://shesharp.org.nz/
Industry
Technology, Information and Media
Company size
2-10 employees
13 associated members LinkedIn members who’ve listed She Sharp as their current workplace on their profile.
Headquarters
Auckland, North Island
Founded
2014
Locations (1)
Primary
Auckland, North Island 1010, NZ

Get directions Get directions to Auckland, North Island 1010, NZ

### `femtech-weekend` — FemTech Weekend
- **type**: `community`  *(festival/movement，确认 / 修改)*
- **linkedin**: ? https://www.linkedin.com/company/femtech-weekend/
- **hq**: `Chengdu, China`  *(从你的角色推断；确认 / 修改 — 这是 movement 注册地还是创始地？)*
- **industry**: `FemTech community / event series`
- **founded**: ?
- **description**: ?
- **sameAs_extra**: ?

FemTech Weekend
Business Consulting and Services Chengdu 286 followers 2-10 employees
Zhu Yihan
Zhu works here

Message

Following
 

Home
About
Posts
Jobs
People
Overview
FemTech Weekend is a global, tech-driven Women's Health Innovation and FemTech ecosystem in Mainland China, dedicated to advancing women’s health innovation. We connect China with the global FemTech landscape, bringing together manufacturers, industry leaders, academic researchers, entrepreneurs, investors, and multinational companies to drive collaboration and cutting-edge solutions.

FemTech Weekend 是一个立足中国大陆、面向全球的科技驱动型女性健康创新生态平台。我们致力于推动女性健康领域的创新发展，连接中国与全球 FemTech 生态，汇聚制造商、行业领袖、学术研究者、创业者、投资者以及企业，共同推动跨界合作与前沿解决方案的落地，共同推动中国女性健康科技领域的进步与革新。

Website
https://www.femtechweekend.com/
Industry
Business Consulting and Services
Company size
2-10 employees
3 associated members LinkedIn members who’ve listed FemTech Weekend as their current workplace on their profile.
Founded
2024
Locations (1)
Primary
Headquarters
Chengdu, CN

Get directions Get directions to Chengdu, CN

### `forward-with-her` — Forward with Her (她行)
- **type**: `community`  *(确认 / 修改)*
- **linkedin**: `https://www.linkedin.com/company/taxing-mentorship/`  *(已知 — 但 LinkedIn slug 是 "taxing-mentorship" 看起来奇怪，确认对吗？)* CHAN： 确认正确。
- **hq**: ?  *(中国哪个城市？)*
- **industry**: `Cross-border women's career mentorship`
- **founded**: ?
- **description**: ?
- **sameAs_extra**: ?  *(微信公众号？小红书？)*

Forward with Her 她行 Mentorship
做衔接女性经验的行舟 Connecting and centering women's experience and knowledge.

Civic and Social Organizations 133 followers 11-50 employees
Xinjie Luo
Xinjie & 1 other connection work here

Follow

Message
 

Home
About
Posts
Jobs
People
Overview
Forward with Her is the mentorship program and community for Chinese college women in STEM. We aim to connect and center women's experience and knowledge, and to promote gender equality in the STEM industry. In 2021, we got sponsorship from UN Women. In 2022, 400+ mentees and 100+ mentors have participated in our program. 

Want to follow our news and program? Follow us on our WeChat Official Account: 她行FWH

她行是一个致力于帮助中国女性理工科大学生的Mentorship项目。我们希望可以连接并且传递女性的经验，推动理工领域的性别平等。2021年，我们获得了联合国妇女署的支持。截止2022年，已有400余位学员，100余位导师参与过我们的项目。

跟进我们的最新信息和项目，欢迎关注我们的公众号：她行FWH。

Industry
Civic and Social Organizations
Company size
11-50 employees
3 associated members LinkedIn members who’ve listed Forward with Her 她行 Mentorship as their current workplace on their profile.
Founded
2020

### `lincoln-university` — Lincoln University, NZ
- **type**: `university`
- **linkedin**: `https://www.linkedin.com/school/lincoln-university-new-zealand/`  *(常见 slug，确认)* CHAN:正确链接为https://www.linkedin.com/school/lincolnuninz/
- **hq**: `Christchurch, Canterbury, New Zealand`  *(确认)*
- **industry**: `Public university (applied sciences focus)`
- **founded**: `1878`
- **description**: ?  *(可空，公开信息足)*
- **sameAs_extra**: ?


Lincoln University (NZ) 
Welcome to Lincoln University. A place to grow. www.lincoln.ac.nz

Higher Education Lincoln, Canterbury 35K followers 20K alumni
Augrid Thongtamachat
Augrid & 107 other connections work here

Message

Following
 

Home
About
Posts
Jobs
Alumni
Overview
Te Whare Wānaka o Aoraki Lincoln University is a specialist university focused on the land-based sectors. Our purpose is to facilitate excellent research and education to grow the knowledge of our students and help shape a world that benefits from a greater understanding of the relationship between land, food and ecosystems.

Our University’s campus, situated at the heart of the Lincoln research precinct, is complemented by a network of university-owned farms and research centres. We are enriched by our connections to the land-based sectors in New Zealand and globally and by the interactions of those who choose to study and work here. 

We are committed to fostering a culturally inclusive environment that embodies our values, enhancing excellence, promoting high performance and productivity, and promoting wellbeing in all we do.

For further information about Lincoln University go to www.lincoln.ac.nz

Website
http://www.lincoln.ac.nz/
Phone
+64 3 423 0000Phone number is +64 3 423 0000
Verified page 
September 19, 2023
Industry
Higher Education
Company size
501-1,000 employees
1,195 associated members LinkedIn members who’ve listed Lincoln University (NZ) as their current workplace on their profile.
Headquarters
Lincoln, Canterbury
Founded
1878
Specialties
Agriculture, Horticulture, Viticulture, Business, Commerce, Agribusiness, Property and valuation, Supply chain management, Environmental science, Food science, Soil science, Plant science, Conservation and ecology, Landscape architecture, Sport and recreation, Tourism, Food, wine and beer, and Environmental management
Locations (1)
Primary
Ellesmere Junction Road/Springs Road, Lincoln, Lincoln, Canterbury 7647, NZ

Get directions Get directions to Ellesmere Junction Road/Springs Road, Lincoln, Lincoln, Canterbury 7647, NZ


### `freeperiod` — FreePeriod
- **type**: `nonprofit`  *(period equity / 卫生用品平权？确认)*
- **linkedin**: ? https://www.linkedin.com/company/free-period/
- **hq**: ?
- **industry**: `Period equity / menstrual health advocacy`  *(确认 / 修改)*
- **founded**: ?
- **description**: ?
- **sameAs_extra**: ?

FreePeriod
Revolutionizing menstrual care access -- smart, sustainable, and accessible solutions for everyone.

Public Health Guangzhou, Guangdong 15 followers 2-10 employees
Julia Zhu 朱楠
Julia works here

Message

Following
 

Home
About
Posts
Jobs
People
Overview
自在月行公司基于售货机和卫生巾设计了小巧易用的卫生巾应急站，解决适龄女性在公共场所月经来潮却无卫生巾可用的尴尬窘境。开展生殖健康相关的教育宣传以缓解月经羞耻问题，我们倡导女性友好场所免费提供卫生巾的政策，希望推动卫生巾像卫生纸的理念，正在筹备申请发明专利和其他资质。先后在2024年日本福冈第12届国际社会科学和人文会议获得最佳奖，2024年香港科技大学(广州)可持续化智慧生活大赛中获得三等奖，2024年国内首届FemTech Weekend女性健康科技挑战赛最佳社交媒体奖。此外，项目还入选2024年第三届腾讯技术公益创投计划暨清华SDG开放创新马拉松资助和香港科技大学(广州)创业桥资助。团队已推动了香港科技大学(广州)2024年3月8日在女性洗手间免费提供卫生巾的政策，在计划基于核心技术继续研发和投放旗下应急女性健康产品站。FreePeriod company has designed a small and easy-to-use emergency sanitary pad station based on vending machines and sanitary napkins. We aim to solve the embarrassing dilemma of women who have menstruation in public places but have no sanitary napkins available. We carry out reproductive health-related education and publicity to alleviate the problem of menstrual stigma. We advocate the policy of providing free sanitary napkins in women-friendly places. We want to promote the concept of sanitary pads like toilet paper. We are preparing to apply for invention patents and other qualifications. We won the Best Award at the 12th International Conference on Social Sciences and Humanities in Fukuoka, Japan in 2024, and the third prize in the 2024 Hong Kong University of Science and Technology (Guangzhou) Sustainable Smart Living Competition and Best Social Media Award in the inaugural Chinese FemTech Weekend Challenge. In addition, the project was selected for the 3rd Tencent Technology Venture Capital Program and Tsinghua SDG Open Innovation Marathon in 2024 and the Hong Kong University of Science and Technology (Guangzhou) Entrepreneurship Bridge Grant. The team has facilitated the policy of providing free sanitary napkins in women's toilets at the Hong Kong University of Science and Technology (Guangzhou) in Guangzhou, China on March 8, 2024. We plan to continue to develop and launch our emergency feminine-product accessible station (EFAS) based on the core technology.

Website
https://free-period-website.vercel.app/
Industry
Public Health
Company size
2-10 employees
1 associated member LinkedIn members who’ve listed FreePeriod as their current workplace on their profile.
Headquarters
Guangzhou, Guangdong
Founded
2024
Locations (1)
Primary
Headquarters
Duxue Road No 1, Hong Kong University of Science and Technology (Guangzhou), W2 building 4th floor Lab of Future Technology, Guangzhou, Guangdong 511400, CN

Get directions Get directions to Duxue Road No 1, Hong Kong University of Science and Technology (Guangzhou), W2 building 4th floor Lab of Future Technology, Guangzhou, Guangdong 511400, CN

### `copilotkit` — CopilotKit
- **type**: `startup`  *(YC OSS，确认 / 修改)*
- **linkedin**: ? https://www.linkedin.com/company/copilotkit/
- **hq**: ?
- **industry**: `Open-source agentic UI infrastructure`
- **founded**: ?
- **description**: ?  *(可参考: "Open-source React infrastructure for building in-app AI copilots and agents; 24.6k★ repo.")*
- **sameAs_extra**: ?

CopilotKit
The Frontend Stack for Agents & Generative UI

Technology, Information and Internet Seattle, Washington 15K followers 11-50 employees
Steve Morin
Steve & 1 other connection work here

Message

Following
 

Home
About
Posts
Jobs
People
Overview
The full-stack framework for building user interactive agents and copilots.
The company behind the AG-UI Protocol.
Open-Source (MIT)

Website
https://www.copilotkit.ai
Industry
Technology, Information and Internet
Company size
11-50 employees
31 associated members LinkedIn members who’ve listed CopilotKit as their current workplace on their profile.
Headquarters
Seattle, Washington
Founded
2023
Locations (1)
Primary
Headquarters
Seattle, Washington US

Get directions Get directions to Seattle, Washington US

### `bytedance` — ByteDance
- **type**: `enterprise`
- **linkedin**: `https://www.linkedin.com/company/bytedance/`  *(确认)*
- **hq**: `Beijing, China`  *(确认)*
- **industry**: `Internet media & AI conglomerate`
- **founded**: `2012`
- **description**: ?  *(可空)*
- **sameAs_extra**: ?

ByteDance 
Software Development China, China 1M followers 10K+ employees
Yiping (Sarah) Lu
Yiping (Sarah) & 4 other connections work here

Message

Following
 

Home
About
Posts
Jobs
Life
People
Overview
ByteDance is a global incubator of platforms at the cutting edge of commerce, content, entertainment and enterprise services - over 2.5bn people interact with ByteDance products including TikTok.

Creation is the core of ByteDance's purpose. Our products are built to help imaginations thrive. This is doubly true of the teams that make our innovations possible. 

Together, we inspire creativity and enrich life - a mission we aim towards achieving every day. At ByteDance, we create together and grow together. That's how we drive impact - for ourselves, our company, and the users we serve. We are committed to building a safe, healthy and positive online environment for all our users.

We have over 110,000 employees based in more than 30 countries globally. Join us.

Website
https://job.bytedance.com/en/#/
Verified page 
March 1, 2023
Industry
Software Development
Company size
10,001+ employees
48,142 associated members LinkedIn members who’ve listed ByteDance as their current workplace on their profile.
Headquarters
China, China
Specialties
Content Discovery Platforms, Interactive Entertainment Services, mobiles, 4g phone, apps, online video, and technology
Interested in working with us in the future?
Members who share that they’re interested in a company may be 2x as likely to get a message from a recruiter than those who don’t. Learn more


I’m interested

Locations (6)
Interact with the map to explore all locations
China
(2)


Primary
Beijing Office
China, China 100098, CN

Get directions Get directions to China, China 100098, CN

Shanghai Office
No.331 North Caoxi Road, Xuhui District, CCIG International Plaza, Shanghai, Shanghai 200030, CN

Get directions Get directions to No.331 North Caoxi Road, Xuhui District, CCIG International Plaza, Shanghai, Shanghai 200030, CN

### `cebu-international-academy` — Cebu International Academy
- **type**: `agency`  *(English language school，确认 / 修改 — 也可能是 community？)*
- **linkedin**: ? https://www.linkedin.com/company/cebucia/
- **hq**: `Cebu, Philippines`  *(确认)*
- **industry**: `English-language academy / ESL training`
- **founded**: ?
- **description**: ?
- **sameAs_extra**: ?  *(Facebook 已在 url 字段)*

Cebu International Academy
Make your story with CIA.

Education Management Mandaue, Central Visayas 417 followers 51-200 employees

Follow

Message
 

Home
About
Posts
Jobs
People
Overview
CEBU INTERNATIONAL ACADEMY, Inc. is a duly registered and legitimate corporation existing by virtue of the laws of the Republic of the Philippines. Its principal office is located at CIA Building , Vistamar Avenue, Sitio San Roque, Bgy. Mactan, Lapu-Lapu City, Cebu Philippines 6015



As a language institution, Cebu International Academy aspires to be the best language institution in the Queen City of the South, Cebu and in the entire Asia.

Website
http://cebucia.com/
Phone
+63-32-255-4493Phone number is +63-32-255-4493
Industry
Education Management
Company size
51-200 employees
276 associated members LinkedIn members who’ve listed Cebu International Academy as their current workplace on their profile.
Headquarters
Mandaue, Central Visayas
Founded
2003
Specialties
IELTS, TOEIC, and Cambridge
Locations (1)
Primary
CIA Building
A. S. Fortuna St, Mandaue, Central Visayas 6014, PH

Get directions Get directions to A. S. Fortuna St, Mandaue, Central Visayas 6014, PH

### `corde` — CORDE
- **type**: `startup`  *(确认 / 修改 — 还是 community？)*
- **linkedin**: ? https://www.linkedin.com/company/corde-ltd/
- **hq**: `New Zealand`  *(具体城市？)*
- **industry**: ?  *(他们在做什么？这是 Lincoln 工业实习的对接方)*
- **founded**: ?
- **description**: ?
- **sameAs_extra**: ?

CORDE
Trusted Connections

Construction Rolleston, Canterbury 2K followers 201-500 employees
Kullum Ladley
Kullum & 1 other connection work here

Message

Following
 

Home
About
Posts
Jobs
People
Overview
Trusted Connections.

Website
https://corde.nz/
Phone
03 318 8320Phone number is 03 318 8320
Industry
Construction
Company size
201-500 employees
164 associated members LinkedIn members who’ve listed CORDE as their current workplace on their profile.
Headquarters
Rolleston, Canterbury
Specialties
Construction, Parks & Reserves, Resource Recovery Park, Water Services, Three Waters, and Roading
Locations (1)
Primary
85 Hoskyns Rd, Rolleston, Canterbury 7675, NZ

Get directions Get directions to 85 Hoskyns Rd, Rolleston, Canterbury 7675, NZ

### `aotearoa-infinite-academy` — Aotearoa Infinite Academy
- **type**: `startup`  *(EdTech？确认 / 修改)*
- **linkedin**: ? https://www.linkedin.com/company/aotearoa-infinite-academy/
- **hq**: `New Zealand`  *(具体城市？)*
- **industry**: `EdTech / online learning platform`  *(确认)*
- **founded**: ?
- **description**: ?
- **sameAs_extra**: ?

Aotearoa Infinite Academy
Pioneering Online Schooling: World-Class Tuition Free Education for High Schoolers Across All of Aotearoa

Education 176 followers 11-50 employees
Penelope Barton
Penelope & 2 other connections work here

Message

Following
 

Home
About
Posts
Jobs
People
Overview
From launching New Zealand's first registered online high school, to opening the country's first online charter school. We are pioneering how Kiwis access world-class education. Join a school built for your goals, your wellbeing, and your future. 

2026 Enrollments for Years 9 - 12 open on November 12, 2025.

Website
https://www.aotearoainfiniteacademy.school
Industry
Education
Company size
11-50 employees
10 associated members LinkedIn members who’ve listed Aotearoa Infinite Academy as their current workplace on their profile.
Founded
2025
Specialties
Online Schooling, High School, and Remote Learning

---

## 🤝 SECONDARY · 合作伙伴 / 赞助方（8 条）

> 这些是你项目里出现过的合作机构，对它们的 JSON-LD 表征不需要像 primary 那么深；填 LinkedIn + 一句 description 就够。

### `msd-nz` — NZ Ministry of Social Development
- **type**: `gov`
- **linkedin**: `https://www.linkedin.com/company/ministry-of-social-development/`  *(确认)* CHAN：正确链接为https://www.linkedin.com/company/ministry-of-social-development-in-wellington-new-zealand/
- **hq**: `Wellington, New Zealand`
- **industry**: `New Zealand government — social services & employment`
- **description**: ?  *(可空)*

Ministry of Social Development (MSD) 
We help New Zealanders to be safe, strong and independent. Manaaki Tangata, Manaaki Whānau .

Government Administration Wellington 60K followers 5K-10K employees
Mandi Portegys
Mandi & 4 other connections work here

Following
Visit website
 

Home
About
Posts
Jobs
People
Overview
For Terms of Use and Privacy Policy of this Page, please refer to:

https://www.msd.govt.nz/about-msd-and-our-work/tools/social-media-terms-and-conditions.html

Come and join us at MSD. We help New Zealanders to be safe, strong and independent.

Our work touches the lives of more than one million New Zealanders.  This is not work we do alone.  We work closely with other government agencies, non-government organisations, advisory and industry groups, and communities and iwi. Together we aim to make a positive and lasting difference in the lives of New Zealanders. 

You can have a long-term and progressive career at MSD across New Zealand. We have professionals operating in over 300 locations, so whether you’re a Policy Analyst based in Wellington or a Case Manager located in Timaru, we have opportunities for you. 

Because of our size and diversity we offer varied careers in:

•	Policy, including research and evaluation
•	Corporate support, like IT, Finance, Human Resources and Legal Services
•	Service delivery through Work and Income; and Students, Seniors and Integrity Services

To view our current vacancies please visit: https://msdcareers.msd.govt.nz
 
Vacancies are regularly updated, but to stay ahead of the game, register your interest in hearing about all advertised opportunities with the Ministry by setting up a job seeker profile with us and receiving job alerts.

Website
http://www.msd.govt.nz
Phone
04 916 3300Phone number is 04 916 3300
Verified page 
June 1, 2024
Industry
Government Administration
Company size
5,001-10,000 employees
7,262 associated members LinkedIn members who’ve listed Ministry of Social Development (MSD) as their current workplace on their profile.
Founded
2001
Locations (1)
Primary
Aurora House
56 The Terrace, Wellington, 6011, NZ

Get directions Get directions to 56 The Terrace, Wellington, 6011, NZ

### `academyex` — academyEX
- **type**: `enterprise`  *(NZ 私立 EdTech，确认 / 修改 — 还是 university？)*
- **linkedin**: `https://www.linkedin.com/company/academyex/`  *(确认)* CHAN:确认正确。
- **hq**: `Auckland, New Zealand`  *(确认)* 
- **industry**: `Postgraduate professional education (EdTech)`
- **description**: ?

academyEX 
Because you're not done yet.

Higher Education Auckland 11K followers 1K alumni
Meeta Patel
Meeta & 2 other connections work here

Follow

Message
 

Home
About
Posts
Jobs
Alumni
Overview
At academyEX we provide innovative learning programmes that build relevant skills and capabilities to match the requirements of our constantly changing world.
Across our faculties, The Mind Lab, Tech Futures Lab and Earth Futures Lab, we redefine learning and professional development so you can step into the future with confidence and an ability to create impactful futures.

We’re educators, but not as you might know them. We are recognised as thought-leaders and practitioners in disruption and innovation, the future of work and business.

​Our large partner network enables those we work with to tap into the most contemporary thought and practice in business, technology and innovation.

We're all about the human angle in this era of massive technological change. How can we leverage our human potential for positive impact? How do we need to think and work differently to address the massive social, economic and environmental challenges our world is facing? How do we break away from outdated, legacy ways of doing and forge new, collaborative, regenerative practices for Team Human?
 
We are committed to making a difference for your career, for your organisation, for society, for the world.

A division of The Mind Lab 
Tech Futures Lab is part of The Mind Lab, a NZQA registered Tertiary Education Organisation under the provisions of the Education Act 1989. Tech Futures Lab Master’s candidates are enrolled with The Mind Lab which is approved by NZQA to award the Master of Technological Futures. This qualification is a Level 9, 180 credit, full or part time Master's programme that provides the platform, skills and networks essential for professionals in business today to prepare them for tomorrow.

Website
https://academyex.com/
Verified page 
November 2, 2024
Industry
Higher Education
Company size
51-200 employees
99 associated members LinkedIn members who’ve listed academyEX as their current workplace on their profile.
Founded
2013
Specialties
Professional Education, Training, Technology, Business Disruption & Innovation, Upskilling, Cybersecurity, Data Science & Big Data, Automation & Robotics, Machine Learning & AI, Masters Programme, Executive Education, Blockchain, Innovation, and The Future of Work
Locations (1)
Primary
Auckland
99 Khyber Pass Rd, Auckland, 1023, NZ

Get directions Get directions to 99 Khyber Pass Rd, Auckland, 1023, NZ

### `rcsa` — RCSA
- **type**: `nonprofit`  *(industry association，确认)*
- **linkedin**: `https://www.linkedin.com/company/rcsa-australia-&-new-zealand/`  *(确认)* CHAN：正确链接为https://www.linkedin.com/company/rcsa-australia-and-new-zealand/
- **hq**: `Australia / NZ`  *(具体？)*
- **industry**: `Recruitment & staffing industry association (AUS+NZ)`
- **description**: ?

RCSA Australia and New Zealand 
Leading in the World of Work

Non-profit Organizations Collins Street West, VIC 20K followers 11-50 employees
Nirmala Chinnappan is open to work
Nirmala & 60 other connections follow this page

Follow

Message
 

Home
About
Posts
Jobs
People
Overview
The Recruitment, Consulting and Staffing Association Australia & New Zealand (RCSA) is the peak body for the recruitment and staffing industry in Australia and New Zealand.

RCSA’s purpose is to Lead in the World of Work and we firmly believe in our mission that through that leadership, and empowerment of our members, we will improve lives, communities and the economy. RCSA drives professional practice, promotes & protects the industry, enables better business for members and provides opportunities for networking and the celebration of success. 

RCSA sets the benchmark for professionalism through standard setting, education, research and business advisory support to our member firms, and accredited professionals, all of whom are bound by the RCSA Code for Professional Conduct which is underpinned by a comprehensive disciplinary and dispute resolution procedure. 

RCSA is a proud member of the World Employment Confederation, the voice of the recruitment and staffing industry across 50 countries, the Australian Chamber, Australia’s largest and most representative business network and BusinessNZ, New Zealand’s largest business network.

Website
http://www.rcsa.com.au
Verified page 
August 23, 2025
Industry
Non-profit Organizations
Company size
11-50 employees
65 associated members LinkedIn members who’ve listed RCSA Australia and New Zealand as their current workplace on their profile.
Headquarters
Collins Street West, VIC
Founded
1997
Specialties
Association for Recruitment Companies Aust & New Zealand, On-Hire, Talent Management Companies, RCSA International Conference, RCSA Code for Professional Conduct, RCSA Business Solutions, RCSA Learning Centre, AMRANZ, ANRA, and Recruitment
Locations (1)
Primary
Corporate Office
PO Box 291, Collins Street West, VIC 8007, AU

Get directions Get directions to PO Box 291, Collins Street West, VIC 8007, AU

### `aut` — Auckland University of Technology
- **type**: `university`
- **linkedin**: `https://www.linkedin.com/school/auckland-university-of-technology/`  *(确认)* CHAN：正确链接为https://www.linkedin.com/school/autuni/  ，AUT School of Engineering, Computer and Mathematical Sciences学部链接为https://www.linkedin.com/company/aut-ecms/

- **hq**: `Auckland, New Zealand`
- **industry**: `Public university`
- **founded**: `2000`
- **description**: ?  *(可空)*

Auckland University of Technology 
Providing knowledge that works for a world that doesn’t stand still.

Higher Education Auckland 154K followers 104K alumni
Aneri Patel
Aneri & 36 other connections work here

Follow
Visit website
 

Home
About
Posts
Jobs
Alumni
Overview
Auckland University of Technology (AUT) is proud to be one of the world’s best modern universities. We offer exceptional learning experiences that prepare students to be successful wherever in the world their career may take them. 

Across all of our programmes, we encourage innovation and entrepreneurship, and the ability to explore new technologies, challenge routine thinking and solve problems in new ways. As a contemporary university we also place an emphasis on working across disciplines in our research, and teaching and learning. 

We’re connected to an extraordinary range of organisations worldwide; sharing expertise and resources, collaborating on groundbreaking research, and connecting students with industry leaders and employers. AUT leads Australasia in global research impact, and we have more than 60 research centres and institutes delivering leading research – from artificial intelligence to robotics, and ecology to public health. 

Website
http://www.aut.ac.nz
Phone
0800 AUT UNI (288 864)Phone number is 0800 AUT UNI (288 864)
Verified page 
September 19, 2023
Industry
Higher Education
Company size
1,001-5,000 employees
5,031 associated members LinkedIn members who’ve listed Auckland University of Technology as their current workplace on their profile.
Founded
2000
Specialties
Pre-degree, Undergraduate degrees, Honours, Postgraduate Certificate, Postgraduate Diploma, Masters, and PhD and Doctoral degrees
Locations (2)
Interact with the map to explore all locations
Auckland Metropolitan Area
(2)


Primary
Level 12, WO Building,
56 Wakefield St, Auckland, 1010, NZ

Get directions Get directions to 56 Wakefield St, Auckland, 1010, NZ

AUT North Campus
90 Akoranga Drive, Northcote, Auckland 0627, NZ

Get directions Get directions to 90 Akoranga Drive, Northcote, Auckland 0627, NZ

AUT School of Engineering, Computer and Mathematical Sciences
The School of ECMS plays a key role in NZ’s technological, social, and economic development.

Higher Education Auckland, Auckland 3K followers 51-200 employees
Dr Mahsa McCauley (Mohaghegh)
Dr Mahsa works here

Message

Following
 

Home
About
Posts
Jobs
People
Overview
AUT has a 100 plus year history in the New Zealand market and we are known as the University for the Changing World.  Looking back at our history provides us with a sense of place and purpose.

AUT is the second largest university in New Zealand and has degrees in engineering and computer and mathematical sciences playing a key role in New Zealand’s technological, social, and economic development.

Our teaching and research staff are among the best in New Zealand and internationally. This, alongside collaborative learning environments and valuable workplace experience with industry clients, contributes to our programmes achieving the highest standards in student experience and employer satisfaction.

The school of Engineering, Computer and Mathematical Sciences currently offers a range of high-quality programmes. 

Learn more: https://www.aut.ac.nz/study/study-options/engineering-computer-and-mathematical-sciences

Website
https://www.aut.ac.nz/study/study-options/engineering-computer-and-mathematical-sciences
Phone
09 921 9999Phone number is 09 921 9999
Industry
Higher Education
Company size
51-200 employees
14 associated members LinkedIn members who’ve listed AUT School of Engineering, Computer and Mathematical Sciences as their current workplace on their profile.
Headquarters
Auckland, Auckland
Founded
1996
Locations (1)
Primary
ECMS Building
31 Symonds St, Auckland, Auckland 1010, NZ

Get directions Get directions to 31 Symonds St, Auckland, Auckland 1010, NZ

### `ai-forum-nz` — AI Forum NZ
- **type**: `nonprofit`
- **linkedin**: `https://www.linkedin.com/company/ai-forum-nz/`  *(确认)* CHAN：正确链接为https://www.linkedin.com/company/aiforumnz/
- **hq**: `New Zealand`
- **industry**: `New Zealand AI industry forum`
- **description**: ?

AI Forum New Zealand
Leading AI for a thriving Aotearoa New Zealand.

Non-profit Organizations Auckland, Auckland 8K followers 2-10 employees
Dr Mahsa McCauley (Mohaghegh)
Dr Mahsa & 6 other connections work here

Message

Following
 

Home
About
Posts
Jobs
People
Overview
AI Forum New Zealand | Te Kāhui Atamai Iahiko o Aotearoa brings together Aotearoa's artificial intelligence community—more than 280 members from industry, academia, and government working to advance the AI ecosystem through connections, advocacy, growing talent, and collaboration.

Leading AI for a thriving Aotearoa: Innovative + Responsible + Inclusive

As an active part of Tech New Zealand, we're part of a connected network of 16 communities representing thousands of organisations and tens of thousands of workers nationwide. Together, we bring our expertise to ensure technology is shaped in ways that serve our people, our places, and our future.
Since 2017, we've built a reputation as a trusted partner across sectors, promoting the economic opportunities raised by AI while ensuring society can adapt responsibly to the rapid changes AI brings.

Our 8 Working Groups drive thought leadership across AI governance, generative AI, the AI Blueprint for Aotearoa, AI for the environment, and sector-specific adoption. We bring AI to life through influential research, practical guidance, major events including the annual Aotearoa AI Summit and NZ-wide AI Hackathon Festivals, and resources like our AIGovernance microsite (aigovernance.aiforum.org.nz)

Join us to shape Aotearoa's AI future.

Website
https://aiforum.org.nz/
Industry
Non-profit Organizations
Company size
2-10 employees
40 associated members LinkedIn members who’ve listed AI Forum New Zealand as their current workplace on their profile.
Headquarters
Auckland, Auckland
Founded
2017
Locations (1)
Primary
14-22 Triton Drive, Level 1, Building C, Auckland, Auckland 0632, NZ

Get directions Get directions to 14-22 Triton Drive, Level 1, Building C, Auckland, Auckland 0632, NZ

### `un-women` — UN Women
- **type**: `nonprofit`  *(UN agency；或 `gov`？)*
- **linkedin**: `https://www.linkedin.com/company/un-women/`  *(确认)* CHAN：确认正确。
- **hq**: `New York, USA`
- **industry**: `United Nations agency — gender equality`
- **founded**: `2010`

UN Women
UN Women is the United Nations agency for women's rights, gender equality and women's empowerment.

International Affairs New York, NEW YORK 2M followers 1K-5K employees
Ben Amadi
Ben & 81 other connections follow this page

Follow
Visit website
 

Home
About
Posts
Jobs
People
Overview
UN Women is the United Nations agency for women's rights, gender equality and women's empowerment. A global champion ForAllWomenAndGirls, UN Women was established to accelerate progress on meeting their needs worldwide. 

UN Women supports UN Member States as they set global standards for achieving gender equality, and works with governments and civil society to design laws, policies, programmes and services needed to implement these standards. It stands behind women’s equal participation in all aspects of life, focusing on five priority areas: increasing women’s leadership and participation; ending violence against women; engaging women in all aspects of peace and security processes; enhancing women’s economic empowerment; and making gender equality central to national development planning and budgeting. UN Women also coordinates and promotes the UN system’s work in advancing gender equality.

Website
http://unwomen.org
Industry
International Affairs
Company size
1,001-5,000 employees
4,798 associated members LinkedIn members who’ve listed UN Women as their current workplace on their profile.
Headquarters
New York, NEW YORK
Founded
2010
Specialties
Leadership and participation, Ending violence against women and girls, Economic empowerment, Peace and security, and National planning and budgeting
Locations (1)
Primary
Headquarters
220 East 42nd Street, New York, NEW YORK 10017, US

Get directions Get directions to 220 East 42nd Street, New York, NEW YORK 10017, US

### `united-nations` — United Nations Headquarters
- **type**: `gov`  *(intergovernmental)*
- **linkedin**: `https://www.linkedin.com/company/united-nations/`  *(确认)* CHAN：确认正确。
- **hq**: `New York, USA`
- **industry**: `Intergovernmental organization`
- **founded**: `1945`

United Nations 
Official account of the United Nations. For peace, dignity & equality on a healthy planet.

International Affairs New York, NY 7M followers 5K-10K employees
Nirmala Chinnappan is open to work
Nirmala & 242 other connections follow this page

Follow
Learn more
 

Home
About
Posts
Jobs
People
Overview
Founded at the end of the Second World War, the United Nations is an international organization made up of 193 Member States committed to maintaining international peace and security.

Every day the UN works to tackle global challenges and deliver results for those most in need.

Giving life-saving support to populations hit by humanitarian crises, helping build and keep the peace in conflict-ridden areas, supporting governments and their citizens to advance development and fight poverty, and promoting human rights worldwide are the core pillars of the work of the United Nations and the mandates it receives from its Member States.

The Charter of the United Nations is available in full at: http://www.un.org/en/documents/charter/

Website
http://www.un.org
Verified page 
April 25, 2024
Industry
International Affairs
Company size
5,001-10,000 employees
66,391 associated members LinkedIn members who’ve listed United Nations as their current workplace on their profile.
Headquarters
New York, NY
Founded
1945
Specialties
peacekeeping, development, humanitarian assistance, peace and security, human rights, international law, and climate action
Locations (2)

Primary
UN Headquarters, New York, NY 10017, US

Get directions Get directions to UN Headquarters, New York, NY 10017, US

US

Get directions Get directions to US

### `westlake-girls` — Westlake Girls High School
- **type**: `gov`  *(NZ public school，确认)*
- **linkedin**: ? https://www.linkedin.com/school/westlake-girls-high-school/
- **hq**: `Auckland, New Zealand`
- **industry**: `Public girls' secondary school`
- **description**: ?  *(可空)*

Westlake Girls High School
Education for Empowerment

Primary and Secondary Education Auckland, North Island 3K followers 2K alumni
Susana Tomaz
Susana works here

Follow

Message
 

Home
About
Posts
Jobs
Alumni
Overview
As one of New Zealand’s leading secular state girls’ schools, Westlake Girls High School has been empowering young women since 1962. Westlake Girls has a reputation for high-quality teaching and a well-developed culture of excellence. Our academic results consistently track above national outcomes, both nationally and against comparative schools. We pride ourselves on providing a dynamic and stimulating learning environment that engages our students and inspires them to personal growth, both academically and through our extensive co-curricular programme. Students are encouraged to become creative and independent learners which prepares them for tertiary study and future careers.


Website
http://www.westlakegirls.school.nz
Phone
+649 489 4169Phone number is +649 489 4169
Industry
Primary and Secondary Education
Company size
51-200 employees
175 associated members LinkedIn members who’ve listed Westlake Girls High School as their current workplace on their profile.
Headquarters
Auckland, North Island
Founded
1962
Locations (1)
Primary
2 Wairau Rd, Auckland, North Island 0627, NZ

Get directions Get directions to 2 Wairau Rd, Auckland, North Island 0627, NZ

---

## 🛠 VENDOR · 集成的技术供应商（6 条）

> 这些是你**集成过**的 SaaS 供应商，不是雇主。它们已经是 Schema.org 上有名的实体，所以 description 可以省略；**只需要确认 LinkedIn slug 是否正确**。

### `anthropic` — Anthropic
- **type**: `enterprise`
- **linkedin**: `https://www.linkedin.com/company/anthropicresearch/`  *(确认 slug — 是 anthropicresearch 还是 anthropic-ai？)* CHAN：确认正确。
- **hq**: `San Francisco, USA`
- **industry**: `AI research & products`

### `ibm-watsonx` — IBM watsonx
- **type**: `enterprise`
- **linkedin**: `https://www.linkedin.com/showcase/ibm-watsonx/`  *(showcase page；确认)* CHAN：确认正确。
- **hq**: `Armonk, NY, USA`
- **industry**: `Enterprise AI platform`

### `google-ai` — Google AI (Gemini)
- **type**: `enterprise`
- **linkedin**: ?  *(可能没有独立的 LinkedIn；用 Google 主页即可？或留空)* https://www.linkedin.com/company/google-gemini-ai/
- **hq**: `Mountain View, USA`
- **industry**: `AI research & products (Google)`

### `vercel` — Vercel
- **type**: `startup`
- **linkedin**: `https://www.linkedin.com/company/vercel/`  *(确认)* CHAN：确认正确。
- **hq**: `San Francisco, USA`
- **industry**: `Frontend cloud platform`

### `cloudflare` — Cloudflare
- **type**: `enterprise`
- **linkedin**: `https://www.linkedin.com/company/cloudflare/`  *(确认)* CHAN：确认正确。
- **hq**: `San Francisco, USA`
- **industry**: `Edge networking & developer platform`

### `neon` — Neon
- **type**: `startup`
- **linkedin**: `https://www.linkedin.com/company/neon-inc/`  *(确认 slug)* CHAN：确认正确。
- **hq**: ?  *(US 还是欧洲？)*
- **industry**: `Serverless Postgres`

---

## 📋 填完之后

- 全部填完直接告诉我"orgs intake 填好了"，我会：
  1. 读这个文件 → 解析每条
  2. 把当前 `meta.x_brand.organisations[]` 升级为顶层 `organizations[]`
  3. 更新 schema 加 organizations 类型定义
  4. 在 work[] / volunteer[] 各项加 `orgId` 引用
  5. 跑 `npm run validate && npm run build`
  6. 给你 diff 确认

- 不需要一次填完。可以分批，我每次只处理你已填好的部分。
- 任何字段不确定就标 `?` 或 `null`，我会用合理默认或留空。
- 隐私边界：所有这些字段都会进**公开** README / llms / dist/profile.json。如果某条不愿公开，直接标 `private: true` 我就跳过那一项。

---

*生成时间：2026-05-22 · build pipeline 当前会忽略 `data/_intake/` 目录（不会被 YAML loader 读取）*

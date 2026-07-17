#!/usr/bin/env node
// Build schema.org Person + WorkExperience JSON-LD sibling for the CV.
// Usage: node build-jsonld.mjs ../data/profile > ../public/cv.jsonld
//        (accepts either the data/profile shard directory or a single .yaml file)
//
// Recruiter-LLMs (LinkedIn AI search, Greenhouse AI ranking, Jobright)
// hit the canonical /cv URL, follow the alternate link to cv.jsonld, and
// parse this file. JSON-LD bypasses LLM inference entirely.

import { readFileSync, statSync } from "node:fs";
import yaml from "js-yaml";

const argv = process.argv.slice(2);
if (argv.length < 1) {
  console.error("usage: build-jsonld.mjs <data/profile dir | profile.yaml>");
  process.exit(2);
}

const profile = statSync(argv[0]).isDirectory()
  ? (await import("../scripts/lib/load-profile.mjs")).loadProfile()
  : yaml.load(readFileSync(argv[0], "utf8"));
const b = profile.basics ?? {};

const sameAs = (b.profiles ?? [])
  .map((p) => p.url)
  .filter(Boolean);

const workExperience = (profile.work ?? [])
  .filter((w) => !w.archive)
  .slice(0, 8)
  .map((w) => ({
    "@type": "OrganizationRole",
    roleName: w.position ?? w.role ?? "",
    startDate: w.startDate ?? "",
    endDate: w.endDate ?? null,
    description: (w.summary ?? w.impactHeadline ?? "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 400),
    memberOf: {
      "@type": "Organization",
      name: w.name ?? w.organization ?? "",
      url: w.url ?? undefined,
    },
  }));

const education = (profile.education ?? []).slice(0, 3).map((e) => ({
  "@type": "EducationalOrganization",
  name: e.institution,
  url: e.url ?? undefined,
  alumniOf: {
    "@type": "EducationalOccupationalCredential",
    credentialCategory: e.studyType ?? "",
    name: `${e.studyType ?? ""} in ${e.area ?? ""}`.trim(),
    educationalLevel: e.studyType ?? "",
    dateCreated: e.endDate ?? "",
  },
}));

const awards = (profile.awards ?? []).map((a) => a.title).filter(Boolean);

const doc = {
  "@context": "https://schema.org",
  "@type": "Person",
  "@id": `${b.url ?? "https://chanmeng.org/"}#person`,
  name: b.name,
  alternateName: b.alternateName ?? undefined,
  jobTitle: b.label ?? "AI Agent Architect & Full-stack Engineer",
  description: (b.summary ?? "").replace(/\s+/g, " ").trim(),
  email: b.email ? `mailto:${b.email}` : undefined,
  url: b.url ?? "https://chanmeng.org/",
  image: b.image
    ? `https://github.com/ChanMeng666/ChanMeng666/raw/main${b.image}`
    : undefined,
  homeLocation: {
    "@type": "Place",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Auckland",
      addressCountry: b.location?.countryCode ?? "NZ",
    },
  },
  sameAs,
  hasOccupation: {
    "@type": "Occupation",
    name: "AI Agent Architect",
    occupationLocation: {
      "@type": "City",
      name: "Auckland",
    },
    skills: [
      // Claude Code stack — every extension surface shipped
      "Claude Agent SDK",
      "Claude Code",
      "Codex CLI",
      "MCP server",
      "MCP gateway",
      "agent skills",
      "AgentDefinition",
      "Task tool",
      "hub-and-spoke coordinator",
      "PostToolUse hook",
      "PreToolUse hook",
      "tool_use",
      "JSON Schema",
      // Agent SDKs, frameworks, protocols
      "Anthropic SDK",
      "OpenAI Agents SDK",
      "Vercel AI SDK",
      "LangGraph",
      "LangChain",
      "CopilotKit",
      "MCP",
      "A2A",
      "AGNTCY",
      "ACP",
      // App frameworks & data
      "Next.js",
      "Vue 3",
      "Spring Boot 3",
      "FastAPI",
      "Drizzle ORM",
      // Infra
      "Cloudflare Workers",
      "Cloudflare Vectorize",
      "Cloudflare KV",
      "Kubernetes GKE",
      "GCP",
      "AWS",
      "Neon Postgres",
      "pgvector",
      "Docker",
      "Traefik",
      "Redis",
      // Quality & observability
      "Vitest",
      "Cypress",
      "mcp-evals",
      "Lighthouse",
      "OpenTelemetry",
      "web-vitals",
      // Languages
      "TypeScript",
      "Python",
      "Go",
      "Java",
      "SQL",
      "Typst",
      // Models
      "Anthropic Opus / Sonnet / Haiku",
      "OpenAI GPT-4o",
      "OpenAI GPT-4o-mini",
      "OpenAI gpt-5.5",
      "OpenAI gpt-5.4-mini",
      "Gemini 2.x",
      "Llama 3.x",
      // Production AI discipline
      "LLMOps",
      "evaluations",
      "prompt caching",
      "model routing",
      "multi-tenant isolation",
    ].join(", "),
  },
  knowsAbout: [
    "AI Agent Architecture",
    "Claude Agent SDK (hooks, subagents, sessions, AgentDefinition, Task tool)",
    "Model Context Protocol (MCP)",
    "Hub-and-spoke multi-agent orchestration",
    "Production LLM evaluation (LLM-as-judge, top-failure-mode analysis)",
    "Multi-tenant SaaS (RLS, scoped memory containers, session isolation)",
    "Cross-cloud Kubernetes migration (AWS → GCP GKE)",
    "Cultural AI (te reo Māori, Maramataka, Te Whare Tapa Whā)",
    "Women's health technology (FemTech)",
    "Senior AI programming mentorship",
  ],
  knowsLanguage: ["en", "zh", "mi"],
  hasCredential: [
    "Master of Applied Computing with Distinction (Lincoln University, NZ)",
    "Anthropic — Building with the Claude API (May 2026)",
    "Anthropic — Intro to MCP (May 2026)",
    "Anthropic — Intro to Agent Skills (May 2026)",
    "Anthropic — Claude Code in Action (May 2026; originally Aug 2025)",
    "Anthropic — AI Fluency: Framework & Foundations (Aug 2025)",
    "Claude Certified Architect — Foundations curriculum completed (on Anthropic Partner Network track via Engram)",
    "UN CSW 69 Speaker (UN HQ NYC, Mar 2025)",
    "Outstanding Mentor Award — AI Hackathon Festival 2025",
    "FemTech Excellence Award — FemTech China (inaugural)",
    "UN Women FemTech Hackathon Outstanding Performer (Beijing, Mar 2025)",
  ],
  award: awards,
  workLocation: {
    "@type": "Place",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Auckland",
      addressCountry: "NZ",
    },
  },
  hasOccupationalCredential: workExperience,
  alumniOf: education,
};

process.stdout.write(JSON.stringify(doc, null, 2) + "\n");

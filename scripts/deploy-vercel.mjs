#!/usr/bin/env node
// Deploys the current checkout to Vercel production through the REST API,
// then waits until the deployment is live.
//
// We use the API rather than the Vercel CLI because the token is scoped to
// this project, and the CLI insists on a user-level token.
//
// Env:
//   VERCEL_TOKEN       Vercel access token with access to the project (secret)
//   VERCEL_PROJECT_ID  e.g. prj_…
//   VERCEL_ORG_ID      the team that owns the project, e.g. team_…
//   GITHUB_SHA / GITHUB_REF_NAME / GITHUB_REPOSITORY (optional, set by
//   GitHub Actions) are attached so Vercel shows which commit is deployed.
//
// Usage: node scripts/deploy-vercel.mjs [projectRoot]

import { createHash } from "node:crypto";
import { appendFileSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";

const API = "https://api.vercel.com";
const POLL_MS = 5_000;
const MAX_WAIT_MS = 15 * 60_000;

// Never upload dependencies, build output, local env files or test artifacts.
const SKIP_DIRS = new Set([
  "node_modules",
  ".next",
  ".git",
  ".vercel",
  "test-results",
  "playwright-report",
  "blob-report",
]);
const skipFile = (name) => name.startsWith(".env") && name !== ".env.example";

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    console.error(`Missing ${name}.`);
    process.exit(1);
  }
  return value;
}

const token = requireEnv("VERCEL_TOKEN");
const projectId = requireEnv("VERCEL_PROJECT_ID");
const teamId = requireEnv("VERCEL_ORG_ID");
const root = process.argv[2] ?? process.cwd();

async function api(path, init = {}) {
  const url = `${API}${path}${path.includes("?") ? "&" : "?"}teamId=${teamId}`;
  const res = await fetch(url, {
    ...init,
    headers: { Authorization: `Bearer ${token}`, ...init.headers },
  });
  const body = res.headers.get("content-type")?.includes("json")
    ? await res.json()
    : await res.text();
  if (!res.ok) {
    const message = body?.error?.message ?? JSON.stringify(body);
    throw new Error(
      `${init.method ?? "GET"} ${path} → ${res.status}: ${message}`,
    );
  }
  return body;
}

function collectFiles(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) {
      if (!SKIP_DIRS.has(name)) collectFiles(path, out);
    } else if (!skipFile(name)) {
      out.push(path);
    }
  }
  return out;
}

const files = collectFiles(root).map((path) => {
  const data = readFileSync(path);
  return {
    file: relative(root, path).split(sep).join("/"),
    data,
    sha: createHash("sha1").update(data).digest("hex"),
    size: data.length,
  };
});

console.log(`Uploading ${files.length} files…`);
// Vercel deduplicates by SHA, so re-uploading unchanged files is cheap.
for (const f of files) {
  await api("/v2/files", {
    method: "POST",
    headers: {
      "Content-Type": "application/octet-stream",
      "x-vercel-digest": f.sha,
    },
    body: f.data,
  });
}

const { GITHUB_SHA, GITHUB_REF_NAME, GITHUB_REPOSITORY } = process.env;
const deployment = await api("/v13/deployments?forceNew=1", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    name: "ordinal-interview",
    project: projectId,
    target: "production",
    files: files.map(({ file, sha, size }) => ({ file, sha, size })),
    projectSettings: { framework: "nextjs" },
    meta: GITHUB_SHA
      ? {
          githubCommitSha: GITHUB_SHA,
          githubCommitRef: GITHUB_REF_NAME ?? "",
          githubRepo: GITHUB_REPOSITORY ?? "",
        }
      : {},
  }),
});
console.log(`Created ${deployment.id}: https://${deployment.url}`);

const deadline = Date.now() + MAX_WAIT_MS;
let state = deployment;
while (["QUEUED", "INITIALIZING", "BUILDING"].includes(state.readyState)) {
  if (Date.now() > deadline) {
    console.error("Timed out waiting for the deployment.");
    process.exit(1);
  }
  await new Promise((resolve) => setTimeout(resolve, POLL_MS));
  state = await api(`/v13/deployments/${deployment.id}`);
  console.log(`  ${state.readyState}`);
}

if (state.readyState !== "READY") {
  console.error(
    `Deployment ${state.readyState}: ${state.errorMessage ?? "see the Vercel dashboard"}`,
  );
  process.exit(1);
}

const aliases = state.alias ?? [];
console.log(`Live: ${aliases.map((a) => `https://${a}`).join(" ")}`);

// Show the result on the GitHub Actions run page.
if (process.env.GITHUB_STEP_SUMMARY) {
  appendFileSync(
    process.env.GITHUB_STEP_SUMMARY,
    [
      "### Deployed to production 🚀",
      "",
      ...aliases.map((a) => `- https://${a}`),
      `- Deployment: \`${deployment.id}\``,
      "",
    ].join("\n"),
  );
}

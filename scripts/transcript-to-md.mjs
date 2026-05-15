#!/usr/bin/env node
// One-off: convert a Cursor agent transcript JSONL to readable markdown.
// Usage: node scripts/transcript-to-md.mjs <input.jsonl> <output.md>

import { readFileSync, writeFileSync } from "node:fs";
import { argv } from "node:process";

const [, , inputPath, outputPath] = argv;
if (!inputPath || !outputPath) {
  console.error("Usage: node scripts/transcript-to-md.mjs <input.jsonl> <output.md>");
  process.exit(1);
}

const lines = readFileSync(inputPath, "utf8").split(/\r?\n/).filter(Boolean);

const out = [];
out.push("# Mahabharata Recital — Chat History");
out.push("");
out.push(
  "Conversation transcript that produced this project. Generated from the Cursor agent JSONL."
);
out.push("");
out.push("---");
out.push("");

// Patterns for known secret formats — kept here so regenerated transcripts
// don't reintroduce a leaked token. Add new patterns as you encounter them.
const SECRET_PATTERNS = [
  /vcp_[A-Za-z0-9]{20,}/g,                  // Vercel personal access token
  /github_pat_[A-Za-z0-9_]{20,}/g,          // GitHub fine-grained PAT
  /\bgh[pousr]_[A-Za-z0-9_]{20,}/g,         // GitHub classic tokens (ghp_, gho_, ghu_, ghs_, ghr_)
  /\bsk-[A-Za-z0-9_-]{20,}/g,               // OpenAI / Anthropic-ish keys
  /xox[baprs]-[A-Za-z0-9-]{10,}/g,          // Slack tokens
  /AKIA[0-9A-Z]{16}/g,                      // AWS access key id
];

const redactSecrets = (text) => {
  let out = text;
  for (const pattern of SECRET_PATTERNS) {
    out = out.replace(pattern, "[REDACTED-SECRET]");
  }
  return out;
};

const stripBoilerplate = (text) => {
  // Drop wrapping <user_query> / <timestamp> / <system_reminder> tags but keep their text.
  return redactSecrets(
    text
      .replace(/<system_reminder>[\s\S]*?<\/system_reminder>/g, "")
      .replace(/<system-reminder>[\s\S]*?<\/system-reminder>/g, "")
      .replace(/<system_notification>[\s\S]*?<\/system_notification>/g, "")
      .replace(/<attached_files>[\s\S]*?<\/attached_files>/g, "")
      .replace(/<user_query>\s*/g, "")
      .replace(/\s*<\/user_query>/g, "")
      .replace(/<timestamp>([^<]*)<\/timestamp>\s*/g, "_[$1]_  \n")
      .trim()
  );
};

const renderToolCall = (toolUse) => {
  const name = toolUse.name ?? "tool";
  const input = toolUse.input ?? {};
  // Compact summary of which tool was invoked and on what.
  const hints = [];
  if (input.path) hints.push(input.path);
  if (input.file_path) hints.push(input.file_path);
  if (input.target_notebook) hints.push(input.target_notebook);
  if (input.command) hints.push(input.command.split(/\r?\n/)[0]);
  if (input.description) hints.push(`(${input.description})`);
  if (input.pattern) hints.push(`pattern: ${input.pattern}`);
  if (input.glob_pattern) hints.push(`glob: ${input.glob_pattern}`);
  if (input.search_term) hints.push(`search: ${input.search_term}`);
  if (input.url) hints.push(input.url);
  if (input.prompt) hints.push(input.prompt.slice(0, 120) + (input.prompt.length > 120 ? "…" : ""));
  if (input.target_mode_id) hints.push(`mode: ${input.target_mode_id}`);
  const hint = hints.length ? ` — ${hints.join(" ")}` : "";
  return redactSecrets(`> **[tool] ${name}**${hint}`);
};

let lastSpeaker = null;
for (const line of lines) {
  let evt;
  try {
    evt = JSON.parse(line);
  } catch {
    continue;
  }
  const role = evt.role;
  const content = evt.message?.content ?? [];
  if (!Array.isArray(content) || content.length === 0) continue;

  const blocks = [];
  for (const part of content) {
    if (part.type === "text" && typeof part.text === "string") {
      const cleaned = stripBoilerplate(part.text);
      if (cleaned) blocks.push(cleaned);
    } else if (part.type === "tool_use") {
      blocks.push(renderToolCall(part));
    } else if (part.type === "tool_result") {
      // Tool results aren't included in this transcript by default; skip if present.
    }
  }
  if (blocks.length === 0) continue;

  const heading = role === "user" ? "## User" : role === "assistant" ? "## Assistant" : `## ${role}`;
  if (heading !== lastSpeaker) {
    out.push(heading);
    out.push("");
    lastSpeaker = heading;
  }
  out.push(blocks.join("\n\n"));
  out.push("");
}

writeFileSync(outputPath, out.join("\n"), "utf8");
console.log(`Wrote ${outputPath} (${out.length} markdown lines)`);

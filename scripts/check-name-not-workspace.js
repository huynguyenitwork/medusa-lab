#!/usr/bin/env node

const fs = require("fs")
const path = require("path")

const ROOT = process.cwd()

const SECTIONS = [
  "dependencies",
  "devDependencies",
  "peerDependencies",
  "optionalDependencies",
]

const IGNORE = new Set([
  "node_modules",
  ".git",
  ".yarn",
  ".next",
  "dist",
  "build",
  "coverage",
])

const packages = new Set()

function isWorkspace(version) {
  return (
    version.startsWith("workspace:") ||
    version.startsWith("link:") ||
    version.startsWith("file:")
  )
}

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (IGNORE.has(entry.name)) continue

    const full = path.join(dir, entry.name)

    if (entry.isDirectory()) {
      walk(full)
    } else if (entry.isFile() && entry.name === "package.json") {
      scanPackage(full)
    }
  }
}

function scanPackage(file) {
  const json = JSON.parse(fs.readFileSync(file, "utf8"))

  for (const section of SECTIONS) {
    const deps = json[section]
    if (!deps) continue

    for (const [name, version] of Object.entries(deps)) {
      if (!isWorkspace(version)) {
        packages.add(name)
      }
    }
  }
}

walk(ROOT)

for (const name of [...packages].sort((a, b) => a.localeCompare(b))) {
  console.log(name)
}

console.log(`\nFound ${packages.size} external packages.`)
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

const packages = new Map()

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (IGNORE.has(entry.name)) continue

    const full = path.join(dir, entry.name)

    if (entry.isDirectory()) {
      walk(full)
      continue
    }

    if (entry.isFile() && entry.name === "package.json") {
      scanPackage(full)
    }
  }
}

function scanPackage(file) {
  const json = JSON.parse(fs.readFileSync(file, "utf8"))
  const relative = path.relative(ROOT, file)

  for (const section of SECTIONS) {
    const deps = json[section]
    if (!deps) continue

    for (const [name, version] of Object.entries(deps)) {
      if (!packages.has(name)) {
        packages.set(name, new Map())
      }

      const versions = packages.get(name)

      if (!versions.has(version)) {
        versions.set(version, [])
      }

      versions.get(version).push({
        file: relative,
        section,
      })
    }
  }
}

walk(ROOT)

let mismatch = 0

for (const [name, versions] of [...packages.entries()].sort(
  ([a], [b]) => a.localeCompare(b, "en", { sensitivity: "base" })
)) {
  // if (versions.size <= 1) continue

  mismatch++

  console.log("")
  console.log(name)

  for (const [version, refs] of [...versions.entries()].sort(
    ([a], [b]) => a.localeCompare(b, undefined, { numeric: true })
  )) {
    console.log(`  ${version}`)

    for (const ref of refs) {
      console.log(`    ${ref.section}  ${ref.file}`)
    }
  }
}

console.log("")
console.log(`Found mismatch ${mismatch} packages with version drift.`)

process.exit(mismatch ? 1 : 0)
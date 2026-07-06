// pnpm tsx scripts/yarn-lock-report.ts
import { parseSyml } from "@yarnpkg/parsers";
import fs from "fs";
import path from "path";

const ROOT = process.cwd();

const lockFile = path.join(ROOT, "yarn.lock");

if (!fs.existsSync(lockFile)) {
  console.error("Cannot find yarn.lock");
  process.exit(1);
}

const raw = fs.readFileSync(lockFile, "utf8");

const data = parseSyml(raw);

type Row = {
  package: string;
  protocol: string;
  requested: string;
  resolved: string;
};

const rows: Row[] = [];

for (const [selectors, value] of Object.entries<any>(data)) {
  if (selectors === "__metadata") continue;

  const resolution = value.resolution ?? "";

  const resolved =
    value.version ??
    value.resolution?.split("@").pop() ??
    "";

  const selectorList = selectors.split(", ");

  for (const selector of selectorList) {
    const idx = selector.indexOf("@", 1);

    if (idx < 0) continue;

    const pkg = selector.substring(0, idx);

    const descriptor = selector.substring(idx + 1);

    const protocolIndex = descriptor.indexOf(":");

    let protocol = "";
    let requested = descriptor;

    if (protocolIndex >= 0) {
      protocol = descriptor.substring(0, protocolIndex);
      requested = descriptor.substring(protocolIndex + 1);
    }

    rows.push({
      package: pkg,
      protocol,
      requested,
      resolved,
    });
  }
}

rows.sort((a, b) => {
  if (a.package !== b.package)
    return a.package.localeCompare(b.package);

  return a.requested.localeCompare(b.requested);
});

const reports = path.join(ROOT, "reports");

fs.mkdirSync(reports, { recursive: true });

fs.writeFileSync(
  path.join(reports, "resolved.json"),
  JSON.stringify(rows, null, 2)
);

const csv = [
  "package,protocol,requested,resolved",
  ...rows.map(
    (r) =>
      `"${r.package}","${r.protocol}","${r.requested}","${r.resolved}"`
  ),
];

fs.writeFileSync(
  path.join(reports, "resolved.csv"),
  csv.join("\n")
);

const md = [
  "| package | protocol | requested | resolved |",
  "|---------|----------|-----------|----------|",
  ...rows.map(
    (r) =>
      `| ${r.package} | ${r.protocol} | ${r.requested} | ${r.resolved} |`
  ),
];

fs.writeFileSync(
  path.join(reports, "resolved.md"),
  md.join("\n")
);

console.log(`Done: ${rows.length} entries`);
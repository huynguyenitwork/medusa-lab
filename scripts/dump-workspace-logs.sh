#!/usr/bin/env bash
set -e

yarn workspaces list --json | node -e '
const readline = require("readline");
const rl = readline.createInterface({ input: process.stdin });
rl.on("line", (line) => {
  if (!line.trim()) return;
  const { name } = JSON.parse(line);
  console.log(name);
});
' | while read -r name; do
  short_name="${name##*/}"
  yarn workspace "$name" info > "logs/${short_name}.log"
  echo "Đã ghi: logs/${short_name}.log"
done

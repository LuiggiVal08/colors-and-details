import { z } from "zod"

export default {
  description: "Get an overview of the Expo project: file counts by directory, dependencies, and structure summary",
  args: {
    section: z.enum(["all", "structure", "dependencies", "counts"]).optional().describe("Which section to return"),
  },
  async execute(args: { section?: string }, context: { directory: string; worktree: string }) {
    const root = context.worktree || context.directory
    const { readFileSync, readdirSync, statSync } = await import("fs")
    const { join } = await import("path")

    function walk(dir: string, basePath: string, depth = 0): Record<string, number> {
      const counts: Record<string, number> = {}
      if (depth > 4) return counts
      let entries: string[]
      try {
        entries = readdirSync(dir)
      } catch {
        return counts
      }
      for (const e of entries) {
        if (e.startsWith(".") || e === "node_modules") continue
        const full = join(dir, e)
        let stat: import("fs").Stats
        try {
          stat = statSync(full)
        } catch {
          continue
        }
        if (stat.isDirectory()) {
          const sub = walk(full, basePath, depth + 1)
          for (const [k, v] of Object.entries(sub)) {
            counts[k] = (counts[k] || 0) + v
          }
        } else if (e.endsWith(".ts") || e.endsWith(".tsx")) {
          const rel = relative(root, dir) || "."
          counts[rel] = (counts[rel] || 0) + 1
        }
      }
      return counts
    }

    const pkg: Record<string, any> = JSON.parse(readFileSync(join(root, "package.json"), "utf-8"))

    if (args.section === "dependencies") {
      const deps = { ...pkg.dependencies, ...pkg.devDependencies }
      return Object.entries(deps)
        .sort((a: [string, any], b: [string, any]) => a[0].localeCompare(b[0]))
        .map(([name, ver]) => `${name}: ${ver}`)
        .join("\n")
    }

    if (args.section === "counts") {
      const counts = walk(root, root)
      return Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .map(([dir, count]) => `${dir}: ${count} files`)
        .join("\n")
    }

    const counts = walk(root, root)
    const totalFiles = Object.values(counts).reduce((a, b) => a + b, 0)
    const lines: string[] = []
    lines.push(`# ${pkg.name} v${pkg.version}`)
    lines.push(`Framework: ${pkg.dependencies?.expo ? `Expo ${pkg.dependencies.expo.replace("^", "")}` : "React Native"}`)
    lines.push(`TypeScript files: ${totalFiles}`)
    lines.push("")
    lines.push("## Key Dependencies")
    const keyDeps = ["expo", "react", "react-native", "expo-router", "zustand", "@tanstack/react-query", "axios", "nativewind", "react-native-paper", "zod"]
    for (const dep of keyDeps) {
      const ver = pkg.dependencies?.[dep] || pkg.devDependencies?.[dep]
      if (ver) lines.push(`  ${dep}: ${ver}`)
    }
    lines.push("")
    lines.push("## File Counts by Directory")
    for (const [dir, count] of Object.entries(counts).sort((a, b) => b[1] - a[1])) {
      lines.push(`  ${dir}: ${count}`)
    }
    return lines.join("\n")
  },
}

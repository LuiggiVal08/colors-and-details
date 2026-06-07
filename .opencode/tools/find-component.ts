import { z } from "zod"

export default {
  description: "Find React components by name pattern across components/, feature/, and app/ directories",
  args: {
    name: z.string().describe("Component name or keyword to search for (case-insensitive)"),
    directory: z.enum(["all", "components", "feature", "app"]).optional().describe("Scope the search to a specific directory"),
    maxResults: z.number().min(1).max(50).optional().describe("Maximum results to return (default: 10)"),
  },
  async execute(args: { name: string; directory?: string; maxResults?: number }, context: { directory: string; worktree: string }) {
    const root = context.worktree || context.directory
    const { readFileSync, readdirSync, statSync } = await import("fs")
    const { join } = await import("path")

    const dirs = args.directory === "all" || !args.directory
      ? ["components", "feature", "app"]
      : [args.directory]

    const query = args.name.toLowerCase()
    const max = args.maxResults ?? 10
    const results: { path: string; exports: string[]; lines: number }[] = []

    function scanDir(dir: string, baseDir: string) {
      let entries: string[]
      try {
        entries = readdirSync(dir)
      } catch {
        return
      }
      for (const entry of entries) {
        if (entry.startsWith(".") || entry === "node_modules") continue
        const full = join(dir, entry)
        let stat: import("fs").Stats
        try {
          stat = statSync(full)
        } catch {
          continue
        }
        if (stat.isDirectory()) {
          scanDir(full, baseDir)
        } else if (entry.endsWith(".tsx") || entry.endsWith(".ts")) {
          if (results.length >= max) return

          const content = readFileSync(full, "utf-8")
          if (!content.toLowerCase().includes(query)) continue

          const lines = content.split("\n")
          const exportRegex = /export\s+(?:default\s+)?(?:const|function|class|let|var)\s+(\w+)/g
          const exportNames: string[] = []
          let m: RegExpExecArray | null
          while ((m = exportRegex.exec(content)) !== null) {
            exportNames.push(m[1])
          }

          const projectRel = relative(root, full).replace(/\\/g, "/")
          results.push({ path: projectRel, exports: exportNames, lines: lines.length })
        }
      }
    }

    for (const dir of dirs) {
      const baseDir = join(root, dir)
      try {
        statSync(baseDir)
      } catch {
        continue
      }
      scanDir(baseDir, root)
      if (results.length >= max) break
    }

    if (results.length === 0) return `No components found matching "${args.name}".`

    return results.slice(0, max)
      .map((r) => {
        const line = r.path + " (" + r.lines + " lines)"
        const exports = r.exports.length > 0 ? "  exports: " + r.exports.join(", ") : ""
        return line + (exports ? "\n" + exports : "")
      })
      .join("\n\n")
  },
}

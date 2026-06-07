import { z } from "zod"

export default {
  description: "List all Expo Router routes in the app directory with their file paths and layout info",
  args: {
    filter: z.string().optional().describe("Filter routes by keyword (e.g., 'admin', 'tabs', 'customer')"),
    groupBy: z.enum(["directory", "none"]).optional().describe("Group routes by parent directory"),
  },
  async execute(args: { filter?: string; groupBy?: string }, context: { directory: string; worktree: string }) {
    const root = context.worktree || context.directory
    const { readdirSync, statSync } = await import("fs")
    const { join, relative, dirname } = await import("path")

    function scanDir(dir: string, basePath: string): { path: string; type: string }[] {
      const results: { path: string; type: string }[] = []
      let entries: string[]
      try {
        entries = readdirSync(dir)
      } catch {
        return results
      }
      for (const entry of entries.sort()) {
        const full = join(dir, entry)
        let stat: import("fs").Stats
        try {
          stat = statSync(full)
        } catch {
          continue
        }
        if (stat.isDirectory()) {
          results.push(...scanDir(full, basePath))
        } else if (entry.match(/\.(tsx|ts|jsx|js)$/) && !entry.startsWith("_")) {
          const rel = relative(basePath, full).replace(/\\/g, "/").replace(/\.(tsx|ts|jsx|js)$/, "")
          const routePath = "/" + rel.replace(/\/?index$/, "").replace(/\[\.{3}(\w+)\]/, "*").replace(/\[(\w+)\]/, ":$1")
          const segType = dirname(full).endsWith("(tabs)") ? "tab" : dirname(full).includes("(") ? "layout-group" : "screen"
          results.push({ path: routePath, type: segType })
        }
      }
      return results
    }

    const appDir = join(root, "app")
    let routes = scanDir(appDir, appDir)

    if (args.filter) {
      const f = args.filter.toLowerCase()
      routes = routes.filter((r) => r.path.toLowerCase().includes(f))
    }

    if (args.groupBy === "directory") {
      const groups: Record<string, typeof routes> = {}
      for (const r of routes) {
        const prefix = r.path.split("/").filter(Boolean).slice(0, 1).join("/") || "/"
        ;(groups[prefix] ??= []).push(r)
      }
      return Object.entries(groups)
        .map(([group, items]) => `## ${group}\n${items.map((r) => `  ${r.path} (${r.type})`).join("\n")}`)
        .join("\n\n")
    }

    return routes.map((r) => `${r.path} (${r.type})`).join("\n")
  },
}

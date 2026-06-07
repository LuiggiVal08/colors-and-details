import { z } from "zod"

export default {
  description: "Map all API endpoints used in the project by scanning service files for axios calls",
  args: {
    service: z.string().optional().describe("Filter by service name (e.g., 'client', 'auth', 'product')"),
    method: z.enum(["GET", "POST", "PUT", "PATCH", "DELETE"]).optional().describe("Filter by HTTP method"),
  },
  async execute(args: { service?: string; method?: string }, context: { directory: string; worktree: string }) {
    const root = context.worktree || context.directory
    const { readFileSync, readdirSync, statSync } = await import("fs")
    const { join, basename } = await import("path")

    const servicesDir = join(root, "services")
    let files: string[]
    try {
      files = readdirSync(servicesDir).filter((f) => f.endsWith(".ts") || f.endsWith(".js"))
    } catch {
      return "No services directory found at " + servicesDir
    }

    const methodPattern = /\.(get|post|put|patch|delete|request)\s*\(/gi
    const urlPattern = /["'`](\/[^"'`\s]+)["'`]/g
    const results: { service: string; endpoint: string; methods: string[] }[] = []

    for (const file of files) {
      const content = readFileSync(join(servicesDir, file), "utf-8")
      const serviceName = basename(file).replace(/\.(ts|js)$/, "").replace(/\.service$/, "")

      let match: RegExpExecArray | null
      const urls = new Set<string>()
      const methods = new Set<string>()

      while ((match = urlPattern.exec(content)) !== null) {
        const url = match[1]
        if (url.includes("/") && !url.includes("{") && !url.includes("\\")) {
          urls.add(url)
        }
      }

      while ((match = methodPattern.exec(content)) !== null) {
        methods.add(match[1].toUpperCase())
      }

      for (const url of urls) {
        results.push({ service: serviceName, endpoint: url, methods: [...methods] })
      }
    }

    let filtered = results
    if (args.service) {
      const f = args.service.toLowerCase()
      filtered = filtered.filter((r) => r.service.includes(f))
    }
    if (args.method) {
      filtered = filtered.filter((r) => r.methods.includes(args.method!))
    }

    if (filtered.length === 0) return "No matching endpoints found."

    const byService: Record<string, typeof filtered> = {}
    for (const r of filtered) {
      ;(byService[r.service] ??= []).push(r)
    }

    return Object.entries(byService)
      .map(([svc, items]) => {
        const uniqueEndpoints = [...new Set(items.map((i) => i.endpoint))]
        const uniqueMethods = [...new Set(items.flatMap((i) => i.methods))]
        return `## ${svc}.service\nEndpoints:\n${uniqueEndpoints.map((e) => `  ${e}`).join("\n")}\nMethods: ${uniqueMethods.join(", ")}`
      })
      .join("\n\n")
  },
}

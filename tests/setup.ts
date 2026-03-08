import "@testing-library/jest-dom"
import { vi } from "vitest"

vi.mock("next/navigation", async () => {
  return {
    useRouter: () => ({ push: vi.fn(), replace: vi.fn(), back: vi.fn() }),
    usePathname: () => "/",
    useSearchParams: () => new URLSearchParams(),
    redirect: vi.fn()
  }
})

vi.mock("framer-motion", async () => {
  const actual: any = await vi.importActual("framer-motion")
  return {
    ...actual,
    motion: new Proxy({}, { get: () => (props: any) => props.children }),
    AnimatePresence: (props: any) => props.children
  }
})

vi.mock("@/lib/supabase/client", () => {
  return {
    createSupabaseBrowserClient: () => ({
      auth: { getUser: async () => ({ data: { user: null } }) },
      from: () => ({
        insert: async () => ({ error: null }),
        select: async () => ({ data: null, error: null }),
        update: async () => ({ data: null, error: null }),
        eq: function () { return this },
        order: function () { return this },
        limit: function () { return this },
        maybeSingle: async () => ({ data: null, error: null })
      })
    })
  }
})

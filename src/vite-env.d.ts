/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_MODE?: "mock" | "live"
  readonly VITE_API_URL?: string
  readonly VITE_WEBHOOK_URL?: string
  readonly VITE_SUBMIT_SECRET?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

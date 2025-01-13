/// <reference types="vite/client" />
declare module "*.vue"
interface ImportMetaEnv {
    ENV: string
    VITE_CLI_PORT: number
    VITE_SERVER_PORT: number
    VITE_BASE_API: string
    VITE_FILE_API: string
    VITE_BASE_PATH: string
    VITE_POSITION: string
    VITE_EDITOR: string
}
interface ImportMeta {
    readonly env: ImportMetaEnv
}
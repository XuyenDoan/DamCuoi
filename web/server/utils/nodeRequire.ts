import { createRequire } from 'node:module'

/**
 * Một số package CommonJS (sharp, archiver...) không expose `default` export
 * đúng chuẩn khi Nitro/Vite xử lý ESM ở dev server → dùng createRequire để
 * load bằng cơ chế require() gốc của Node, tránh lỗi "no export named default".
 */
export const nodeRequire = createRequire(import.meta.url)

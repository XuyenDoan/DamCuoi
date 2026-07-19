import { promises as fs } from 'node:fs'
import path from 'node:path'

/**
 * Ghi/đọc file JSON an toàn theo nguyên tắc mục 14.4 trong spec.md:
 * - Atomic write (ghi .tmp rồi rename)
 * - Validate JSON hợp lệ trước khi ghi đè
 * - Write lock tuần tự theo từng file (đủ dùng cho 1-2 admin thao tác cùng lúc)
 */

const writeQueues = new Map<string, Promise<unknown>>()

function withFileLock<T>(filePath: string, task: () => Promise<T>): Promise<T> {
  const previous = writeQueues.get(filePath) ?? Promise.resolve()
  const run = previous.then(task, task)
  // Không để một lần ghi lỗi làm kẹt hàng đợi các lần ghi sau
  writeQueues.set(filePath, run.catch(() => undefined))
  return run
}

export async function readJsonFile<T>(filePath: string, fallback: T): Promise<T> {
  try {
    const raw = await fs.readFile(filePath, 'utf-8')
    return JSON.parse(raw) as T
  } catch (err: unknown) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') return fallback
    throw err
  }
}

export async function writeJsonFile(filePath: string, data: unknown): Promise<void> {
  return withFileLock(filePath, async () => {
    const serialized = JSON.stringify(data, null, 2)
    // Validate: nếu serialize/parse lỗi thì ném lỗi trước khi đụng tới file thật
    JSON.parse(serialized)

    const dir = path.dirname(filePath)
    await fs.mkdir(dir, { recursive: true })

    const tmpPath = `${filePath}.${process.pid}.${Date.now()}.tmp`
    await fs.writeFile(tmpPath, serialized, 'utf-8')
    await fs.rename(tmpPath, filePath)
  })
}

/** Đọc rồi ghi trong cùng 1 lock — tránh mất dữ liệu khi 2 request cùng sửa 1 file */
export async function updateJsonFile<T>(
  filePath: string,
  fallback: T,
  mutate: (current: T) => T
): Promise<T> {
  return withFileLock(filePath, async () => {
    let current: T
    try {
      const raw = await fs.readFile(filePath, 'utf-8')
      current = JSON.parse(raw) as T
    } catch (err: unknown) {
      if ((err as NodeJS.ErrnoException).code === 'ENOENT') current = fallback
      else throw err
    }

    const next = mutate(current)
    const serialized = JSON.stringify(next, null, 2)
    JSON.parse(serialized)

    const dir = path.dirname(filePath)
    await fs.mkdir(dir, { recursive: true })
    const tmpPath = `${filePath}.${process.pid}.${Date.now()}.tmp`
    await fs.writeFile(tmpPath, serialized, 'utf-8')
    await fs.rename(tmpPath, filePath)

    return next
  })
}

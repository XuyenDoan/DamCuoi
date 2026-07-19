import path from 'node:path'
import { useRuntimeConfig } from '#imports'

/**
 * /data và /uploads sống ở gốc dự án (D:\Dev\DamCuoi), là anh em với /web,
 * không nằm trong Nuxt app / Git repo — theo spec.md mục 14.1.
 * Có thể override bằng biến môi trường DATA_DIR / UPLOADS_DIR khi deploy.
 */
export function getDataDir(): string {
  const config = useRuntimeConfig()
  return config.dataDir || path.resolve(process.cwd(), '..', 'data')
}

export function getUploadsDir(): string {
  const config = useRuntimeConfig()
  return config.uploadsDir || path.resolve(process.cwd(), '..', 'uploads')
}

export function dataFilePath(fileName: string): string {
  return path.join(getDataDir(), fileName)
}

export function uploadsSubdir(
  sub: 'originals' | 'thumbnails' | 'pending' | 'backgrounds' | 'love-story'
): string {
  return path.join(getUploadsDir(), sub)
}

import { ZipArchive } from 'archiver'

/**
 * archiver@8 đổi hẳn API so với các bản cũ (@types/archiver mô tả API cũ
 * dạng `archiver('zip', options)` — không còn tồn tại ở v8, gây lỗi runtime
 * "archiver is not a function" nếu dùng theo tài liệu/@types cũ). API thật
 * của v8 là export class `ZipArchive` (kế thừa `Transform`, tương thích Readable).
 */
export function createZipArchive(options?: { zlib?: { level: number } }): ZipArchive {
  return new ZipArchive(options)
}

export type { ZipArchive }

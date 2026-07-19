import type { Sharp, SharpOptions } from 'sharp'
import { nodeRequire } from './nodeRequire'

type SharpFactory = (input?: Buffer, options?: SharpOptions) => Sharp

/** sharp là CommonJS — load qua nodeRequire (mục 16.x) rồi ép kiểu callable rõ ràng */
export const sharp: SharpFactory = nodeRequire('sharp')

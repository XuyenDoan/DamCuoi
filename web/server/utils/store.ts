import { dataFilePath } from './paths'
import { readJsonFile, updateJsonFile, writeJsonFile } from './jsonStore'
import { DEFAULT_WEBSITE_THEME, isValidThemeId } from '#shared/themes'
import type {
  AdminAuth,
  AlbumsFile,
  EventInfoBlock,
  PhotosFile,
  Settings,
  WishesFile
} from './types'

const EMPTY_EVENT_INFO: EventInfoBlock = { ceremonyTime: '', venueName: '', venueAddress: '', mapEmbedUrl: '' }

const DEFAULT_SETTINGS: Settings = {
  coupleNames: { groom: 'Chú Rể', bride: 'Cô Dâu' },
  heroTagline: '',
  welcomeMessage: '',
  loveStory: [],
  eventInfo: { groom: EMPTY_EVENT_INFO, bride: EMPTY_EVENT_INFO },
  footerText: '',
  pageBackgrounds: {},
  hiddenPages: [],
  websiteTheme: DEFAULT_WEBSITE_THEME
}

function toEventInfoBlock(v: Partial<EventInfoBlock> | undefined): EventInfoBlock {
  return {
    ceremonyTime: v?.ceremonyTime ?? '',
    venueName: v?.venueName ?? '',
    venueAddress: v?.venueAddress ?? '',
    mapEmbedUrl: v?.mapEmbedUrl ?? ''
  }
}

/**
 * Dữ liệu cũ (trước khi tách 2 nhà) lưu `eventInfo` là 1 khối duy nhất
 * {ceremonyTime, venueName, ...}. Khi đọc thấy khối đó chưa có `groom`/`bride`
 * (dữ liệu cũ), tự chuyển thành thông tin nhà trai, để trống nhà gái —
 * không mất dữ liệu đã nhập trước đó (đã xác nhận với chủ dự án).
 */
function migrateSettings(raw: unknown): Settings {
  const r = (raw ?? {}) as Partial<Settings> & { eventInfo?: Record<string, unknown> }
  const rawEventInfo = r.eventInfo
  const eventInfo =
    rawEventInfo && ('groom' in rawEventInfo || 'bride' in rawEventInfo)
      ? {
          groom: toEventInfoBlock(rawEventInfo.groom as Partial<EventInfoBlock>),
          bride: toEventInfoBlock(rawEventInfo.bride as Partial<EventInfoBlock>)
        }
      : { groom: toEventInfoBlock(rawEventInfo as Partial<EventInfoBlock>), bride: EMPTY_EVENT_INFO }

  const websiteTheme = isValidThemeId(r.websiteTheme) ? r.websiteTheme : DEFAULT_WEBSITE_THEME

  return { ...DEFAULT_SETTINGS, ...r, eventInfo, websiteTheme }
}

const DEFAULT_ALBUMS: AlbumsFile = { albums: [] }
const DEFAULT_PHOTOS: PhotosFile = { photos: [] }
const DEFAULT_WISHES: WishesFile = { wishes: [] }
const DEFAULT_ADMIN: AdminAuth = { passwordHash: '', failedAttempts: 0, lockedUntil: null }

export const settingsStore = {
  read: async () =>
    migrateSettings(await readJsonFile<unknown>(dataFilePath('settings.json'), DEFAULT_SETTINGS)),
  write: (data: Settings) => writeJsonFile(dataFilePath('settings.json'), data),
  update: (mutate: (current: Settings) => Settings) =>
    updateJsonFile(dataFilePath('settings.json'), DEFAULT_SETTINGS, (current) =>
      mutate(migrateSettings(current))
    )
}

export const albumsStore = {
  read: () => readJsonFile<AlbumsFile>(dataFilePath('albums.json'), DEFAULT_ALBUMS),
  write: (data: AlbumsFile) => writeJsonFile(dataFilePath('albums.json'), data),
  update: (mutate: (current: AlbumsFile) => AlbumsFile) =>
    updateJsonFile(dataFilePath('albums.json'), DEFAULT_ALBUMS, mutate)
}

export const photosStore = {
  read: () => readJsonFile<PhotosFile>(dataFilePath('photos.json'), DEFAULT_PHOTOS),
  write: (data: PhotosFile) => writeJsonFile(dataFilePath('photos.json'), data),
  update: (mutate: (current: PhotosFile) => PhotosFile) =>
    updateJsonFile(dataFilePath('photos.json'), DEFAULT_PHOTOS, mutate)
}

export const wishesStore = {
  read: () => readJsonFile<WishesFile>(dataFilePath('wishes.json'), DEFAULT_WISHES),
  write: (data: WishesFile) => writeJsonFile(dataFilePath('wishes.json'), data),
  update: (mutate: (current: WishesFile) => WishesFile) =>
    updateJsonFile(dataFilePath('wishes.json'), DEFAULT_WISHES, mutate)
}

export const adminStore = {
  read: () => readJsonFile<AdminAuth>(dataFilePath('admin.json'), DEFAULT_ADMIN),
  write: (data: AdminAuth) => writeJsonFile(dataFilePath('admin.json'), data),
  update: (mutate: (current: AdminAuth) => AdminAuth) =>
    updateJsonFile(dataFilePath('admin.json'), DEFAULT_ADMIN, mutate)
}

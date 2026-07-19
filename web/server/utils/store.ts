import { dataFilePath } from './paths'
import { readJsonFile, updateJsonFile, writeJsonFile } from './jsonStore'
import type {
  AdminAuth,
  AlbumsFile,
  PhotosFile,
  Settings,
  WishesFile
} from './types'

const DEFAULT_SETTINGS: Settings = {
  coupleNames: { groom: 'Chú Rể', bride: 'Cô Dâu' },
  weddingDate: '',
  heroTagline: '',
  welcomeMessage: '',
  loveStory: [],
  eventInfo: { ceremonyTime: '', venueName: '', venueAddress: '', mapEmbedUrl: '' },
  footerText: '',
  pageBackgrounds: {},
  hiddenPages: []
}

const DEFAULT_ALBUMS: AlbumsFile = { albums: [] }
const DEFAULT_PHOTOS: PhotosFile = { photos: [] }
const DEFAULT_WISHES: WishesFile = { wishes: [] }
const DEFAULT_ADMIN: AdminAuth = { passwordHash: '', failedAttempts: 0, lockedUntil: null }

export const settingsStore = {
  read: () => readJsonFile<Settings>(dataFilePath('settings.json'), DEFAULT_SETTINGS),
  write: (data: Settings) => writeJsonFile(dataFilePath('settings.json'), data),
  update: (mutate: (current: Settings) => Settings) =>
    updateJsonFile(dataFilePath('settings.json'), DEFAULT_SETTINGS, mutate)
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

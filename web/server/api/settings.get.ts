import { settingsStore } from '../utils/store'

export default defineEventHandler(async () => {
  return settingsStore.read()
})

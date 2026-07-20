import type { EventInfoBlock } from '../../server/utils/types'

/** Nhà nào chưa nhập gì thì không hiện khối rỗng gây rối mắt cho khách */
export function hasEventContent(info: EventInfoBlock | undefined): boolean {
  return !!(info?.ceremonyTime || info?.venueName || info?.venueAddress)
}

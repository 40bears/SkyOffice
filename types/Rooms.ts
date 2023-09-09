export enum RoomType {
  LOBBY = 'lobby',
  PUBLIC = 'coffice24x7',
  CUSTOM = 'custom',
}

export interface IRoomData {
  name: string
  description: string
  password: string | null
  autoDispose: boolean
}

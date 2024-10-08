export interface payloadType {
  email: string;
  userId: number;
  artistId?: number;
}

export type Enable2FAType = {
  secret: string;
};

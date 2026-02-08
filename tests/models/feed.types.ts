export type FeedItem = {
  id: string;
  type: string;
  timestamp: string;
  actorName?: string;
  message?: string;
};

export type FeedResponse = {
  items: FeedItem[];
  nextCursor?: string;
};

import { APIRequestContext } from "@playwright/test";
import { timedGet } from "../helpers/https";

export class FeedClient {
  constructor(private req: APIRequestContext) {}

  getFeed() {
    return timedGet(this.req, "/feed");
  }

  getFeedPage(cursor: string) {
    return timedGet(this.req, `/feed?cursor=${encodeURIComponent(cursor)}`);
  }
}

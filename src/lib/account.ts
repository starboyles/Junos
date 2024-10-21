import { SyncResponse, SyncUpdatedResponse } from "@/types";
import axios, { AxiosError } from "axios";
export class Account {
  private token: String;

  constructor(token: String) {
    this.token = token;
  }

  private async startSync() {
    const response = await axios.post<SyncResponse>(
      "https://api.aurinko.io/v1/email/sync",
      {},
      {
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
        params: {
          daysWithin: 2,
          bodyType: "html",
        },
      },
    );
    return response.data;
  }

  async getUpdatedEmails({
    deltaToken,
    pageToken,
  }: {
    deltaToken?: string;
    pageToken?: string;
  }) {
    let params: Record<string, string> = {};
    if (deltaToken) params.deltaToken = deltaToken
    if (pageToken)  params.pageToken = pageToken
    
    const response = await axios.get<SyncUpdatedResponse>(
      'https://api.aurinko.io/v1/email/sync/updated', {
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
        params
      })
      return response.data
    
  }

  async performInitialSync() {
    try {
      let syncResponse = await this.startSync();
      while (!syncResponse.ready) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        syncResponse = await this.startSync();
      }

      let storedDeltaToken: string = syncResponse.syncUpdatedToken;

      let updatedResponse = await this.getUpdatedEmails({deltaToken: storedDeltaToken});
    } catch (error) {}
  }
}

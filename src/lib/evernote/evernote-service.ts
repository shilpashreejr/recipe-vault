import * as Evernote from 'evernote';

export interface EvernoteConfig {
  consumerKey: string;
  consumerSecret: string;
  sandbox: boolean;
}

export interface EvernoteNote {
  guid: string;
  title: string;
  content: string;
  created: number;
  updated: number;
  notebookGuid?: string;
  tagGuids?: string[];
  attributes?: {
    sourceURL?: string;
    sourceApplication?: string;
    latitude?: number;
    longitude?: number;
    altitude?: number;
    author?: string;
    reminderOrder?: number;
    reminderDoneTime?: number;
    reminderTime?: number;
    placeName?: string;
    contentClass?: string;
    applicationData?: any;
    lastEditedBy?: string;
    classifications?: any;
    creatorId?: number;
    lastEditorId?: number;
    sharedWithBusiness?: boolean;
    conflictSourceNoteGuid?: string;
    noteTitleQuality?: number;
  };
  resources?: EvernoteNoteResource[];
}

export interface EvernoteNoteResource {
  guid: string;
  noteGuid: string;
  data?: EvernoteData;
  mime: string;
  width?: number;
  height?: number;
  duration?: number;
  active?: boolean;
  recognition?: EvernoteData;
  attributes?: {
    sourceURL?: string;
    timestamp?: number;
    latitude?: number;
    longitude?: number;
    altitude?: number;
    cameraMake?: string;
    cameraModel?: string;
    clientWillIndex?: boolean;
    fileName?: string;
    attachment?: boolean;
  };
  alternateData?: EvernoteData;
}

export interface EvernoteData {
  bodyHash: string;
  size: number;
  body: string;
}

export interface EvernoteNotebook {
  guid: string;
  name: string;
  updateSequenceNum: number;
  defaultNotebook: boolean;
  serviceCreated: number;
  serviceUpdated: number;
  publishing?: {
    uri?: string;
    order?: number;
    ascending?: boolean;
    publicDescription?: string;
  };
  published?: boolean;
  stack?: string;
  sharedNotebookIds?: number[];
  sharedNotebooks?: any[];
  businessNotebook?: any;
  contact?: any;
  restrictions?: any;
}

export class EvernoteService {
  private client: Evernote.Client;
  private config: EvernoteConfig;
  private accessToken?: string;

  constructor(config: EvernoteConfig) {
    this.config = config;
    this.client = new Evernote.Client({
      consumerKey: config.consumerKey,
      consumerSecret: config.consumerSecret,
      sandbox: config.sandbox,
    });
  }

  /**
   * Get OAuth authorization URL
   */
  getAuthorizationUrl(callbackUrl: string): Promise<{ url: string; requestToken: string; requestTokenSecret: string }> {
    return new Promise((resolve, reject) => {
      this.client.getRequestToken(callbackUrl, (error: any, requestToken: any, requestTokenSecret: any, results: any) => {
        if (error) {
          reject(error);
        } else {
          const url = this.client.getAuthorizeUrl(requestToken);
          resolve({
            url,
            requestToken,
            requestTokenSecret,
          });
        }
      });
    });
  }

  /**
   * Exchange request token for access token
   */
  async getAccessToken(requestToken: string, requestTokenSecret: string, verifier: string): Promise<{
    accessToken: string;
    accessTokenSecret: string;
    userId: number;
    shardId: string;
  }> {
    return new Promise((resolve, reject) => {
      this.client.getAccessToken(
        requestToken,
        requestTokenSecret,
        verifier,
        (error: any, accessToken: any, accessTokenSecret: any, results: any) => {
          if (error) {
            reject(error);
          } else {
            resolve({
              accessToken: accessToken!,
              accessTokenSecret: accessTokenSecret!,
              userId: results?.edam_userId || 0,
              shardId: results?.edam_shard || '',
            });
          }
        }
      );
    });
  }

  /**
   * Set access token for authenticated requests
   */
  setAccessToken(accessToken: string): void {
    this.accessToken = accessToken;
    (this.client as any).token = accessToken;
  }

  /**
   * Get user information
   */
  async getUserInfo(): Promise<any> {
    const userStore = this.client.getUserStore();
    return userStore.getUser();
  }

  /**
   * Get all notebooks
   */
  async getNotebooks(): Promise<EvernoteNotebook[]> {
    const noteStore = this.client.getNoteStore();
    const notebooks = await noteStore.listNotebooks();
    
    return notebooks.map((notebook: any) => ({
      guid: notebook.guid || '',
      name: notebook.name || '',
      updateSequenceNum: notebook.updateSequenceNum || 0,
      defaultNotebook: notebook.defaultNotebook || false,
      serviceCreated: notebook.serviceCreated || 0,
      serviceUpdated: notebook.serviceUpdated || 0,
      publishing: notebook.publishing,
      published: notebook.published,
      stack: notebook.stack,
      sharedNotebookIds: notebook.sharedNotebookIds,
      sharedNotebooks: notebook.sharedNotebooks,
      businessNotebook: notebook.businessNotebook,
      contact: notebook.contact,
      restrictions: notebook.restrictions,
    }));
  }

  /**
   * Search notes with filters
   */
  async searchNotes(
    query: string,
    notebookGuid?: string,
    maxResults: number = 50
  ): Promise<EvernoteNote[]> {
    const noteStore = this.client.getNoteStore();
    
    const filter: any = {
      words: query,
      order: 3, // UPDATED
      ascending: false,
    };

    if (notebookGuid) {
      filter.notebookGuid = notebookGuid;
    }

    const spec = {
      includeTitle: true,
      includeCreated: true,
      includeUpdated: true,
      includeNotebookGuid: true,
      includeTagGuids: true,
      includeAttributes: true,
    };

    const result = await noteStore.findNotesMetadata(filter, 0, maxResults, spec);
    const notes = result?.notes || [];
    
    return notes.map((note: any) => ({
      guid: note.guid || '',
      title: note.title || '',
      content: '', // Will be fetched separately
      created: note.created || 0,
      updated: note.updated || 0,
      notebookGuid: note.notebookGuid,
      tagGuids: note.tagGuids,
      attributes: note.attributes,
    }));
  }

  /**
   * Get full note content by GUID
   */
  async getNote(guid: string): Promise<EvernoteNote> {
    const noteStore = this.client.getNoteStore();
    const note = await noteStore.getNote(guid, true, false, false, false);
    
    if (!note) {
      throw new Error('Note not found');
    }

    return {
      guid: note.guid || '',
      title: note.title || '',
      content: note.content || '',
      created: note.created || 0,
      updated: note.updated || 0,
      notebookGuid: note.notebookGuid,
      tagGuids: note.tagGuids,
      attributes: note.attributes,
      resources: note.resources?.map((resource: any) => ({
        guid: resource.guid || '',
        noteGuid: resource.noteGuid || '',
        data: resource.data,
        mime: resource.mime || '',
        width: resource.width,
        height: resource.height,
        duration: resource.duration,
        active: resource.active,
        recognition: resource.recognition,
        attributes: resource.attributes,
        alternateData: resource.alternateData,
      })),
    };
  }

  /**
   * Get notes from a specific notebook
   */
  async getNotesFromNotebook(notebookGuid: string, maxResults: number = 50): Promise<EvernoteNote[]> {
    return this.searchNotes('', notebookGuid, maxResults);
  }

  /**
   * Extract recipe-related notes using common recipe keywords
   */
  async findRecipeNotes(notebookGuid?: string): Promise<EvernoteNote[]> {
    const recipeKeywords = [
      'recipe',
      'ingredients',
      'instructions',
      'cooking',
      'baking',
      'prep time',
      'cook time',
      'servings',
      'directions',
      'method',
      'steps',
      'food',
      'meal',
      'dish',
      'cuisine',
    ];

    const searchQuery = recipeKeywords.join(' OR ');
    return this.searchNotes(searchQuery, notebookGuid, 100);
  }

  /**
   * Get note resources (images, attachments)
   */
  async getNoteResources(guid: string): Promise<EvernoteNoteResource[]> {
    const note = await this.getNote(guid);
    return note.resources || [];
  }

  /**
   * Get resource data (for images, etc.)
   */
  async getResourceData(guid: string): Promise<EvernoteData | null> {
    const noteStore = this.client.getNoteStore();
    const resource = await noteStore.getResource(guid, true, false, false, false);
    
    if (!resource || !resource.data) {
      return null;
    }

    return {
      bodyHash: resource.data.bodyHash || '',
      size: resource.data.size || 0,
      body: resource.data.body || '',
    };
  }
} 
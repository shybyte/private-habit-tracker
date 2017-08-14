declare namespace PouchDB {
  namespace Authentication {
    interface Session {
      userCtx: {
        name?: string
      };
    }
  }

  interface Database<Content extends {} = {}> {
    signup(user: string, password: string): Promise<any>;
    login(user: string, password: string): Promise<any>;
    logout(): Promise<any>;
    getSession(): Promise<Authentication.Session>;
  }
}

declare module 'pouchdb-authentication' {
  const plugin: PouchDB.Plugin;
  export = plugin;
}

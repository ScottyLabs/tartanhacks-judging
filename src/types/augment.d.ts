/**
 * Augmentation of existing types
 */

/**
 * Extension of the Next Auth interface
 */
declare module "next-auth" {
  export interface Session {
    id: string;
  }
}

export {};

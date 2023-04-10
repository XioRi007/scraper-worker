export interface IConnection {
  /**
   * Connects to the database
   * @async
   */
  connect():Promise<void>;
}

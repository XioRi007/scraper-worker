import { ScrapeTask } from "./scrape/ScrapeTask.js";

export interface IScrapeTaskFactory {
  /**
  * Creates a scrape task instance based on the provided type
  * @param {string} type - The type of scrape task to create
  * @returns {Promise<ScrapeTask>} A Promise resolving to the created ScrapeTask instance
  * @throws {Error} Throws an error if an invalid task type is provided
  */
  createTask(type:string): Promise<ScrapeTask>;
  }

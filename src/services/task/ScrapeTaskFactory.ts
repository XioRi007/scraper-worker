import { container } from "tsyringe";
import { IScrapeTaskFactory } from "./IScrapeTaskFactory.js";
import { ListScrapeTask } from "./scrape/ListScrapeTask.js";
import { PageScrapeTask } from "./scrape/PageScrapeTask.js";
import { PagintaionScrapeTask } from "./scrape/PagintaionScrapeTask.js";
import { ScrapeTask } from "./scrape/ScrapeTask.js";
import { TaskTypes } from "./Types.js";

export class ScrapeTaskFactory implements IScrapeTaskFactory {

  /**
  * Creates a scrape task instance based on the provided type
  * @param {string} type - The type of scrape task to create
  * @returns {Promise<ScrapeTask>} A Promise resolving to the created ScrapeTask instance
  * @throws {Error} Throws an error if an invalid task type is provided
  */
  public async createTask(type:string): Promise<ScrapeTask> {
    switch (type) {
      case TaskTypes.PAGINATION:
        return container.resolve(PagintaionScrapeTask);;
      case TaskTypes.LIST:
        return container.resolve(ListScrapeTask);;
      case TaskTypes.PAGE:
        return container.resolve(PageScrapeTask);;
      default:
        throw new Error(`Invalid task type: ${type}`);
    }
  }
}

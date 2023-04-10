/**
 * Interface for a scrape task service.
 * @interface
 */
export interface IScrapeTaskService{
    /**
     * Processes a scrape task
     * @param {string} taskId The ID of the scrape task to be processed.
     * @throws Error If the scrape task is not found..
     */
    process(taskId:string):Promise<void>;
}
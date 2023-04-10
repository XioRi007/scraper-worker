import { autoInjectable, inject } from "tsyringe";
import { TaskRepository } from "../../../db/repositories/TaskRepository.js";
import { ITask } from "../../../db/shemas/Task.js";
import { IScrapeTaskFactory } from "../IScrapeTaskFactory.js";
import { IScrapeTaskService } from "./IScrapeTaskService.js";

@autoInjectable()
export class CheerioScrapeTaskService implements IScrapeTaskService{
    constructor(private taskRepository:TaskRepository, @inject('IScrapeTaskFactory') private taskFactory:IScrapeTaskFactory){}

    /**
     * Processes a scrape task by first setting the status to "processing", creating an instance of the appropriate ScrapeTask,
     * and calling its scrape() method to perform the actual scraping. If an error is encountered during scraping, the task's
     * "tries" count is incremented and its status is set to "finished_with_error", unless the number of tries has already
     * exceeded 5, in which case the task's status is set to "error" and the function returns without throwing an error, to
     * allow the task to be deleted from the queue.
     *
     * @param {string} taskId The ID of the scrape task to be processed.
     *
     * @throws Error If the scrape task is not found..
     */
    public async process(taskId:string):Promise<void> {
        const task:ITask | null = await this.taskRepository.findById(taskId);
        if(task == null || task._id == undefined){
            throw new Error('Task not found');
        }else{
            try{
                await this.taskRepository.setStatusWorker(task._id.toString(), 'processing');       
                const scrapeTask = await this.taskFactory.createTask(task.type);
                await scrapeTask.process(task);
                await this.taskRepository.setStatusWorker(task._id.toString(), 'finished'); 
            }
            catch(error:any){
                if(task.tries == undefined || task.tries<5){
                    await this.taskRepository.setStatusWorker(task._id.toString(), 'finished_with_error'); 
                    await this.taskRepository.incrementTries(task._id.toString());  
                    throw error;                 
                }
                else{
                    await this.taskRepository.setStatusWorker(task._id.toString(), 'error');
                    await this.taskRepository.incrementTries(task._id.toString());  
                    return;//not throw error to delete task from queue
                }
            }
        }
    };
}
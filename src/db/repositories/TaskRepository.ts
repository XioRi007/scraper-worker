import os from 'os';
import { Repository } from "./Repository.js";
import {ITask, Task} from '../shemas/Task.js'
import { autoInjectable } from 'tsyringe';
import { Types } from 'mongoose';

@autoInjectable()
export class TaskRepository extends Repository<ITask> {
  constructor() {
    super(Task);
  }  

  /**
   * Set the status, worker, and optionally tries for a given task.
   * @async
   * @param {string} _id - The id of the task to update.
   * @param {string} status - The new status for the task.
   * @param {string} [worker] - The new worker for the task.
   * @returns {Promise<void>} - A Promise that resolves when the task is updated.
   * @throws {Error} - If the task was not updated.
   */
  public async setStatusWorker (_id:string, status:string, worker:string=os.hostname()): Promise<void> {
    let obj:{status:string, worker:string, tries?:number} = {status, worker};
    const res = await this.update(_id, obj);
    if(!res)
      throw new Error('Task was not updated');
  }  

  /**
   * Increments the "tries" field of a document with the given id by 1.
   * @async
   * @param {string} id The id of the document to update.
   * @returns A Promise that resolves when the update is complete.
   */
  async incrementTries(id: string): Promise<void> {
    await this.model.findByIdAndUpdate(id, { $inc: { tries: 1 } });
  }

  /**
   * Creates a new task with the provided information and returns the id of the created task.
   * @async
   * @param {Types.ObjectId} scrape_id - The id of the scrape associated with the task.
   * @param {string} url - The url of the page to be scraped.
   * @param {string} type - The type of task to be performed.
   * @returns {Promise<string>} The id of the created task.
   * @throws {Error} If the task was not created successfully.
   */
  public async add (scrape_id: Types.ObjectId, url: string, type: string):Promise<string> {
    const task:ITask = {      
      scrape_id,
      url,
      status: "created",
      type
    }
    const res = await this.create(task);
    if (!res) {
      throw new Error('Task was not created');
    }
    return res;
  }
}
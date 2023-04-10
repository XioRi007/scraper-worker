import { Repository } from "./Repository.js";
import { IJob, Job } from "../shemas/Job.js";
import { autoInjectable, injectable } from "tsyringe";
import { Types } from "mongoose";

@autoInjectable()
export class JobRepository extends Repository<IJob> {
  constructor() {
    super(Job);
  }

/**
 * Returns the item page link selector from the task with the specified ID.
 * @async
 * @param {string} _id - The ID of the task.
 * @returns {Promise<string>} - The item page link selector.
 */
  public async getItemPageSelector (_id:Types.ObjectId): Promise<string> {
    const res: any = await this.findOneField(_id, 'params.item_page_link_selector');
    return res.params.item_page_link_selector;
  }

/**
 * Returns the next page selector from the task with the specified ID.
 * @async
 * @param {Types.ObjectId} _id - The ID of the task.
 * @returns {Promise<string>} - The next page link selector.
 */
  public async getNextPageSelector (_id:Types.ObjectId): Promise<string> {
    const res: any = await this.findOneField(_id, 'params.next_page_selector');
    return res.params.next_page_selector;
  }

/**
 * Returns the item selectors from the task with the specified ID.
 * @async
 * @param {Types.ObjectId} _id - The ID of the task.
 * @returns {Promise<any>} - The item selectors.
 */
  public async getItemSelectors (_id:Types.ObjectId): Promise<any> {
    const res: any = await this.findOneField(_id, 'params.params');
    return res.params.params;
  }
}
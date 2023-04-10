import { Types } from "mongoose";
import { ITask } from "../../../db/shemas/Task.js";
import { ScrapeTask } from "./ScrapeTask.js";

export class PagintaionScrapeTask extends ScrapeTask{
    
    async getSelector(_id:Types.ObjectId):Promise<any>{
        const selector = await this.jobRepository.getNextPageSelector(_id);
        return selector;
    }
    
    async process(task:ITask):Promise<void> {
      const $ = await this.loadPage(task.url);
      const _selector = await this.getSelector(task.scrape_id);
      const selector = this.formatSelector(_selector);
      const link2 = this.scrapeDataBySelector(selector, $);
      //if this is not the last page
      if(link2 != undefined){
        const _link = this.linkExtractor(link2, task.url);
        const newPaginateTaskId = await this.taskRepository.add(task.scrape_id, _link, 'pagination');
        await this.queueService.sendMessage(newPaginateTaskId.toString());
      }
      const newListTaskId = await this.taskRepository.add(task.scrape_id, task.url, 'list');
      await this.queueService.sendMessage(newListTaskId.toString());
      if(this.browser){
          await this.browser.close();
      }
    }
}
import { ITask } from "../../../db/shemas/Task.js";
import { ScrapeTask } from "./ScrapeTask.js";
import { IItem } from "../../../db/shemas/Item.js";
import { Types } from "mongoose";

export class PageScrapeTask extends ScrapeTask{

    async getSelector(_id:Types.ObjectId):Promise<any>{
        const selector = await this.jobRepository.getItemSelectors(_id);
        return selector;
    }
    
    async process(task:ITask):Promise<void> {
      const $ = await this.loadPage(task.url);
      const params:[{name:string, selector:string}] = await this.getSelector(task.scrape_id);
      
      let item:IItem = {
        scrape_id:task.scrape_id
      };
     for(let itemParam of params){
        const selector = this.formatSelector(itemParam.selector);
        
        const value = this.scrapeDataBySelector(selector, $);
        item = {...item, [itemParam.name]:value};
     }
     
    await this.itemRepository.create(item); 
      if(this.browser){
          await this.browser.close();
      }    
    }
}
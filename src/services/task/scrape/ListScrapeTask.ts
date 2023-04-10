import { ITask } from "../../../db/shemas/Task.js";
import { ScrapeTask } from "./ScrapeTask.js";
import * as cheerio from'cheerio';
import { Types } from "mongoose";

export class ListScrapeTask extends ScrapeTask{

    async getSelector(_id:Types.ObjectId):Promise<any>{
        const selector = await this.jobRepository.getItemPageSelector(_id);
        return selector;
    }
    
    async process(task:ITask):Promise<void> {
      const $ = await this.loadPage(task.url);
      const _selector = await this.getSelector(task.scrape_id);
      const selector = this.formatSelector(_selector);
      const booksDetailsPage = $(selector.selectors) as unknown as cheerio.Element[];
      
      if(booksDetailsPage == undefined){
          throw new Error('Error while scraping the detail links');
      }
      const booksDetailLinks = booksDetailsPage[0];

    //   for(let booksDetailLinks of booksDetailsPage){
          const bookLink = this.linkExtractor(booksDetailLinks.attribs['href'], task.url);
          const newTaskId = await this.taskRepository.add(task.scrape_id, bookLink, 'page');
          await this.queueService.sendMessage(newTaskId.toString());
    //   }   
      if(this.browser){
          await this.browser.close();
      }   
    }
}
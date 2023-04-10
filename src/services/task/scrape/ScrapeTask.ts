import puppeteer from 'puppeteer';
import * as cheerio from'cheerio';
import { ITask } from '../../../db/shemas/Task.js';
import { JobRepository } from '../../../db/repositories/JobRepository.js';
import { IQueueService } from '../../queue/IQueueService.js';
import { TaskRepository } from '../../../db/repositories/TaskRepository.js';
import { ItemRepository } from '../../../db/repositories/ItemRepostory.js';
import { autoInjectable, inject } from 'tsyringe';
import { Types } from 'mongoose';

type ISelectors = {
  selectors:string,
  attr:string
}
@autoInjectable()
export class ScrapeTask {
  protected browser:puppeteer.Browser | undefined;
  constructor(@inject('IQueueService') protected queueService: IQueueService, protected jobRepository:JobRepository, protected taskRepository:TaskRepository, protected itemRepository: ItemRepository ) {}

  /**
   * Extracts the absolute URL of a link, based on the given base URL
   * @param link - The relative or absolute URL of the link to extract
   * @param url - The base URL to use for extracting the absolute URL
   * @returns The absolute URL of the link
   */
  protected linkExtractor (link:string, url:string):string{ 
      if(link == undefined)
          return link;
      const url_object = new URL(link, url);
      const url_string = url_object.href;
      return url_string;
  }
  
  /**
   * Formats a selector string into an object containing the selector and attribute.
   * @param str - The selector string to format.
   * @returns An object containing the selector and attribute.
   */
  protected formatSelector(str:string):ISelectors{
    const i = str.lastIndexOf(' ');
    const attr = str.substring(i+1);
    const selectors = str.substring(0, i);
    return {
        selectors,
        attr
    }
  }

  /**
   * Extracts data from the specified selector in the Cheerio document.
   * 
   * @param selector - The selector object containing the selector and attribute.
   * @param $ - The Cheerio document.
   * @returns The extracted data.
   */
  protected scrapeDataBySelector(selector:ISelectors, $:cheerio.CheerioAPI):any{
    const _value = $(selector.selectors);
    switch(selector.attr){
        case 'text':{}
            return _value.text().trim();
        case 'value':
            return _value.val();
        default:
            return _value.attr(selector.attr);
    }
  }

  /**
   * Get selector for a job by its ID
   * @param {Types.ObjectId} _id - ID of the job
   * @returns {Promise<any>} - Promise that resolves to the selector object
   */
  async getSelector(_id:Types.ObjectId):Promise<any>{}

  /**
   * Load a web page using Puppeteer and Cheerio.
   * @param url - The URL of the web page to load.
   * @returns A Promise that resolves to a CheerioAPI object representing the loaded page.
   */
  async loadPage(url:string):Promise<cheerio.CheerioAPI>{    
    const browser = await puppeteer.launch({args: ['--no-sandbox'], ignoreDefaultArgs: ['--disable-extensions']})
    this.browser = browser;
    const page = await browser.newPage();
    await page.goto(url);
    const html = await page.content();
    const $ = cheerio.load(html);
    return $;
  }

  /**
   * Process the given task.
   * @param {ITask} task - The task to process.
   * @returns Promise that resolves once the scraping is complete.
   */
  async process(task:ITask):Promise<void> {}
}
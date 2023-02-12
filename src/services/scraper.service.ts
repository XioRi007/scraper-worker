
import * as dotenv from 'dotenv';
dotenv.config();
// import { processes } from './processes.js';
// import { getDb } from '../../db/mongo.db.js';
import os from 'os';
import * as cheerio from'cheerio';
import axios from 'axios';
import { HeaderGenerator, HeaderGeneratorOptions, PRESETS } from 'header-generator';
import { DB } from '../db/mongo.db.js';
import { Queue } from './queue.service.js';
import { JobType } from '../types.js';
import { ObjectId } from 'mongodb';
import { autoInjectable } from 'tsyringe';


@autoInjectable()
export class ScraperService {
    private dbService: DB;
    private queueService: Queue;
    constructor(dbService: DB, queueService: Queue){
        this.dbService = dbService;
        this.queueService = queueService;
    }
    public pagination = async ({scrape_id, url}:JobType) => {        
        const jobs_queue_collection = await this.dbService.getJobsQueueCollection();
        const jobs_collection = await this.dbService.getJobsCollection();
        const current_page_link = url;
    
        //get selector
        const meta = await jobs_collection.findOne({_id:new ObjectId(scrape_id)}, {projection:{'params.next_page_selector':1, _id:0}});
        console.log('meta', meta);
        
        
        let headerGenerator = new HeaderGenerator(PRESETS.MODERN_WINDOWS_CHROME as Partial<HeaderGeneratorOptions>);
        const headers = headerGenerator.getHeaders();
        const html = await axios.get(current_page_link, headers);
        const $ = cheerio.load(html.data);
    
        //get next_page_link 
        const link = this.scrape ($, meta.params.next_page_selector);
        const _link = this.linkExtractor(link, current_page_link);
        if(_link != undefined){
            //add new job with 'pagination' type
            const paginate_job = {
                scrape_id,
                url: _link,
                status: "created",
                type: "pagination",
                worker: os.hostname()
            };
            const paginate_job_id = await jobs_queue_collection.insertOne(paginate_job);

            await this.queueService.sendMessage(paginate_job_id.insertedId.toString());
        }

        //add current_page_link to the queue with 'list' type and if next_page_link exists, add it with 'paginate type'
        
        const list_job = {
            scrape_id,
            url: url,
            status: "created",
            type: "list",
            worker: os.hostname()
        };
        const list_job_id = await jobs_queue_collection.insertOne(list_job);

        await this.queueService.sendMessage(list_job_id.insertedId.toString());
    }

    public list = async ({scrape_id, url}:JobType) => {
        const jobs_queue_collection = await this.dbService.getJobsQueueCollection();
        const jobs_collection = await this.dbService.getJobsCollection();
        //add all items_link to the queue with params and 'page' type
        
        //get selector
        const meta = await jobs_collection.findOne({_id:new ObjectId(scrape_id)}, {projection:{'params.item_page_link_selector':1, _id:0}});
    
        //load page
        let headerGenerator = new HeaderGenerator(PRESETS.MODERN_WINDOWS_CHROME as Partial<HeaderGeneratorOptions>);
        const html = await axios.get(url, headerGenerator.getHeaders());
        // console.log(html);
        const $ = cheerio.load(html.data);
        
        //get all needed links (<a> tags)
        let books_detail = this.scrape($, meta.params.item_page_link_selector, false);
        if(books_detail == undefined){
            throw new Error('Error while scraping the detail links');
        }
        // console.log(books_detail);
        books_detail = [books_detail[0]];
        
        for(let books_detail_links of books_detail){
            const book_link = this.linkExtractor(books_detail_links.attribs['href'], url);
            const page_job = {
                scrape_id,
                url: book_link,
                status: "created",
                type: "page",
                worker: os.hostname()
            }
            const page_job_id = await jobs_queue_collection.insertOne(page_job);
            
            await this.queueService.sendMessage(page_job_id.insertedId.toString());
        }    

    }
    public page = async ({scrape_id, url}:JobType) => {
        const items_collection = await this.dbService.getItemsCollection();
        const jobs_collection = await this.dbService.getJobsCollection();
        //scrape item's data and add it to the db
    
        let headerGenerator = new HeaderGenerator(PRESETS.MODERN_WINDOWS_CHROME as Partial<HeaderGeneratorOptions>);
        const html = await axios.get(url, headerGenerator.getHeaders());
        const $ = cheerio.load(html.data);
    
        let item:any = {
            scrape_id
        };
        const meta = await jobs_collection.findOne({_id:new ObjectId(scrape_id)}, {projection:{'params.params':1, _id:0}});
        for(let item_param of meta.params.params){
            const value = this.scrape($, item_param.selector);
            item[item_param.name] = value;
        }
        await items_collection.insertOne(item);
    }

    private parseSelector = (str:string) =>{
        const i = str.lastIndexOf(' ');
        const attr = str.substring(i+1);
        const selectors = str.substring(0, i);
        return {
            selectors,
            attr
        }
    }

    private scrape = ($:cheerio.CheerioAPI, selector_string:string, withAttribs:boolean=true):any => {  
        const selector = this.parseSelector(selector_string);
        const _value = $(selector.selectors);
        if(!withAttribs) return _value;
        switch(selector.attr){
            case 'text':{}
                return _value.text().trim();
            case 'value':
                return _value.val();
            default:
                return _value.attr(selector.attr);
        }
    }
    private linkExtractor = (_link:any, _url:string) => 
    { 
        if(_link == undefined)
            return _link;
        const url_object = new URL(_link, _url);
        const url_string = url_object.href;
        return url_string;
    }
}
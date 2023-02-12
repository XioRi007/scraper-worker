import * as dotenv from 'dotenv';
dotenv.config();
// import { processes } from './processes.js';
// import { getDb } from '../../db/mongo.db.js';
import os from 'os';
import { autoInjectable } from 'tsyringe';
import { DB } from '../db/mongo.db.js';
import { JobType } from '../types.js';
import { ScraperService } from './scraper.service.js';

@autoInjectable()
export class JobService{
    private scraperService:ScraperService;
    private dbService:DB;
    constructor(scraperService: ScraperService, dbService: DB){
        this.scraperService = scraperService;
        this.dbService = dbService;
    }
    public process = async (job:JobType) => {//////////////////job schema
        const jobs_queue_collection = await this.dbService.getJobsQueueCollection();
        try{      
            await jobs_queue_collection.updateOne({_id:job._id}, {$set:{status:"processing", worker:os.hostname()}});
            switch(job.type){
                case 'pagination':
                    await this.scraperService.pagination(job);
                    break;
                
                case 'list':
                    await this.scraperService.list(job);
                    break;
            
                case 'page':
                    await this.scraperService.page(job);
                    break;
                default:
                    throw new Error(`Uknown job type: '${job.type}'`);                            
            }
            await jobs_queue_collection.updateOne({_id:job._id}, {$set:{status:"finished", worker:os.hostname()}});
        }  
        catch(err){
            if(job.error_count != null && job.error_count > 3){//that was the last try
                await jobs_queue_collection.updateOne({_id:job._id}, {$set:{status:"finished_with_error"}, $inc:{error_count:1}});
                return;
            }
            else{            
                await jobs_queue_collection.updateOne({_id:job._id}, {$set:{status:"error"}, $inc:{error_count:1}});
            }
            throw err;
        }
    }
}
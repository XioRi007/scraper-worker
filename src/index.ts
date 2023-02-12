import * as dotenv from 'dotenv';
// import { _logger } from './config/logger.js';
dotenv.config();
import "reflect-metadata";
import {DB} from './db/mongo.db.js';
import os from 'os';
import 'winston-mongodb';
import { Queue } from './services/queue.service.js';
import { ObjectId } from 'mongodb';
import { JobService } from './services/job.service.js';
import axios from 'axios';
import { container, autoInjectable } from 'tsyringe';

function between(min:number, max:number):number {  
  return Math.floor(Math.random() * (max - min) + min);
}
@autoInjectable()
class Main{
//loggerservice
  constructor(public db: DB, public queue:Queue, public jobService:JobService){}
  public main = async () => {
    try{
      ////////////////////////////////////////////
      /////repostitory
      console.log('here');
      const _id = new ObjectId(process.env.SCRAPE_ID || "");
      await this.db.connect();
      const jobs_collection = await this.db.getJobsCollection();
      const jobs_queue_collection = await this.db.getJobsQueueCollection();
      const name = os.hostname();
  
      const prev_state = await jobs_collection.findOne({_id, 'pods.name':os.hostname()});
      if(prev_state == null){
        await jobs_collection.updateOne({_id}, {$set:{status:"processing"}, $push:{"pods":{name, status:'processing'}}});
      }else{
        await jobs_collection.updateOne({_id, 'pods.name':name}, {$set:{status:"processing", 'pods.$[t].status':"processing"}}, { arrayFilters: [ { 't.name':os.hostname()} ]});
      }
  
      while(true){
        const isEmpty = await this.queue.isEmpty(); 
        if(isEmpty){
          break;
        }
        const msg = await this.queue.getMessage(); 
        if(msg.id == null)  continue;
        const msg_id = msg.id;
        try{
          console.log("Message received.", msg.message);
          const job = await jobs_queue_collection.findOne({_id:new ObjectId(msg.message)});
          console.log(job);
          
          await this.jobService.process(job);
          await this.queue.deleteMessage(msg_id);
          console.log("Message deleted.", msg.message); 
        }catch(err){        
          console.log("message error: ", err);      
          // logger.error(`${os.hostname()}: message error: ${err.message}`); 
          //return message to the queue
          await this.queue.changeMessageVisibility(msg_id, 0);
        }
        await new Promise(resolve => setTimeout(resolve, between(10000, 20000)));      
      }
      console.log('Queue is empty');
      await jobs_collection.updateOne({_id, 'pods.name':name}, {$set:{'pods.$[t].status':"finished"}}, { arrayFilters: [ { 't.name':os.hostname()} ]});
      const res = await axios.put('http://scraper-laravel/api/end', {scrape_id:_id});  
      console.log(res.data);      
      await this.db.close();
      console.log('closing'); 
      process.exit(0);  
    }
    catch(err: any){
        console.log('Fatal error:', err); 
        const _id = process.env.SCRAPE_ID || "";
        const jobs_collection = await this.db.getJobsCollection();
        const _j = await jobs_collection.find({_id, 'pods':{$elemMatch:{name:os.hostname()}}}, {projection:{"pods.$":1}});
        const j = await _j.toArray();
        const pod = j[0].pods[0];
        console.log(pod);
        
        if(pod.error_count == undefined || pod.error_count < 3){
          await jobs_collection.updateOne({_id, 'pods.name':os.hostname()}, {$set:{'pods.$[t].status':"fatal_error"}, $inc:{"pods.$[t].error_count":1}}, { arrayFilters: [ { 't.name':os.hostname()} ]});
        }else{          
          await jobs_collection.updateOne({_id, 'pods.name':os.hostname()}, {$set:{'pods.$[t].status':"finished"}}, { arrayFilters: [ { 't.name':os.hostname()} ]});  
          const res = await axios.put('http://scraper-laravel/api/end', {scrape_id:_id});  
          console.log(res.data);          
        }        
        // logger.error(`${os.hostname()}: fatal error: ${err.message}`);
        process.exit(1); 
    }
  }
}

container.register("queueName", {useValue: process.env.SCRAPE_ID});
const main = container.resolve(Main);
main.main();
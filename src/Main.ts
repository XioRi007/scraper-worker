
import { IConnection } from './db/connections/IConnection.js';
import { autoInjectable, inject } from 'tsyringe';
import { IQueueService } from './services/queue/IQueueService.js';
import { IScrapeTaskService } from './services/task/service/IScrapeTaskService.js';


@autoInjectable()
export class Main{    
  constructor(@inject('IQueueService') private queueService: IQueueService, 
  @inject('IConnection') private connection:IConnection, 
  @inject('IScrapeTaskService') private taskService:IScrapeTaskService){}

  /**
   * Main function that connects to the database, polls the queue for messages, and processes them.
   * @async
   * @returns void
   */
  public async main () {    
    try{
      await this.connection.connect();
      console.log('Connected to the DB');
      while(true){
        const isEmpty = await this.queueService.isEmpty(); 
        if(isEmpty){
          break;
        }
        const msg = await this.queueService.getMessage(); 
          if(msg.id == null)  
            continue;
          const msgId = msg.id;
          console.log("Message received: ", msg.message);          
          //Block for catching message errors
          try{
            await this.queueService.changeMessageVisibility(msgId, 10000);
            await this.taskService.process(msg.message);
            await this.queueService.deleteMessage(msgId);
            console.log("Message deleted."); 
          }catch(error){
            console.log("message error: ", error);      
            //return message to the queue
            await this.queueService.changeMessageVisibility(msgId, 0);
            console.log("Message has returned to the queue."); 
          }           
        
        await new Promise(resolve => setTimeout(resolve, this.between(10000, 20000)));      
      }
      
      process.exit(0);
    }catch(error){
      console.log(error);      
    }
    console.log('Queue is empty');  
    process.exit(1); 
  }

  /**
   * Returns a random integer between the given min and max values (inclusive).
   * @param {number} min - The minimum value.
   * @param {number} max - The maximum value.
   * @returns A random integer between min and max.
   */
  private between(min:number, max:number):number {  
    return Math.floor(Math.random() * (max - min) + min);
  }  
}

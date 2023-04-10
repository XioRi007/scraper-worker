import RedisSMQ, { QueueMessage } from "rsmq";
import { inject, autoInjectable } from "tsyringe";
import { IQueueService } from "./IQueueService.js";

@autoInjectable()
export class RSMQueueService implements IQueueService {
    private rsmq : RedisSMQ;
    private qname: string;

    constructor(@inject("QUEUE_NAME") name: string, @inject("REDIS_HOST") host: string, @inject("REDIS_PORT") port: number){
        this.qname = name;
        this.rsmq = new RedisSMQ( {host, port, ns: "rsmq"} );
    }
    
    public isEmpty = async (): Promise<boolean> =>{
        const qa = await this.rsmq.getQueueAttributesAsync({ qname:this.qname });
        return ((qa.hiddenmsgs == 0) && (qa.msgs == 0));
    }
    public getMessage = async (): Promise<QueueMessage> =>{    
        const msg = await this.rsmq.receiveMessageAsync({ qname:this.qname, vt:300 }) as QueueMessage;
        return msg;
    }
    public sendMessage = async (message:string): Promise<string> =>{    
        const msg = await this.rsmq.sendMessageAsync({ qname:this.qname, message});
        return msg;
    }
    public deleteMessage = async (id:string):Promise <void>  =>{    
        const res = await this.rsmq.deleteMessageAsync({ qname:this.qname, id });
        if(res == 0){
            throw new Error('Error while deleting message '+id );
        }
    }

    public changeMessageVisibility = async (id:string, vt:number) =>{    
        const res = await this.rsmq.changeMessageVisibilityAsync({qname:this.qname, vt, id});
        if(res == 0){
            throw new Error('Error while deleting message '+id );
        }
    }

    public deleteQueue = async () =>{  
        this.rsmq.deleteQueue({ qname:this.qname }, (err, response)=>{
            if(err){
              console.log("Error while deleting the queue", err.message);
            }
            console.log("Queue was deleted"); 
          })
    }
}
import * as dotenv from 'dotenv';
dotenv.config();
import mongodb, { Collection, Db, MongoClient } from "mongodb";
import { singleton } from 'tsyringe';
@singleton()
export class DB {
    private static instance:DB;
    private client!: MongoClient;
    private db!: Db | undefined;
    static client: mongodb.MongoClient;

    public connect = async() => {
        const client = await MongoClient.connect( process.env.MONGODB_CONNECTION_STRING!,  
            { useNewUrlParser: true, useUnifiedTopology: true });    
        this.client = client;
        this.db = client.db(process.env.MONGO_DATABASE);
    }


    public getJobsCollection = async(): Promise<Collection> => {
        if( this.db != undefined){
            return this.db.collection(process.env.MONGO_JOBS_COLECTION!);
        }
        else{
            throw new Error('Database is not connected');
        }
    }
    public getJobsQueueCollection = async(): Promise<Collection> => {
        if( this.db != undefined){
            return this.db.collection(process.env.MONGO_JOBS_QUEUE_COLECTION!);
        }
        else{
            throw new Error('Database is not connected');
        }
    }
    public getItemsCollection = async(): Promise<Collection> => {
        if( this.db != undefined){
            return this.db.collection(process.env.MONGO_ITEMS_COLECTION!);
        }
        else{
            throw new Error('Database is not connected');
        }
    }
    public close = async() => {
        await this.client?.close();
    }
}
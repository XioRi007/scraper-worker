import { ObjectId } from 'mongoose';
export interface JobType{
    _id:ObjectId
    scrape_id:string,
    url:string,
    status: string,
    type: string,
    worker: string,
    error_count?:number
}
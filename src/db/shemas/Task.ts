import { Schema, model, Types } from 'mongoose';
import os from 'os';
import * as dotenv from 'dotenv';
dotenv.config();

interface ITask {
  _id?: Types.ObjectId,
  scrape_id: Types.ObjectId,
  url: string,
  status: string,
  type: string,
  worker?: string,
  tries?: number
}

const taskSchema = new Schema<ITask>(
  {
    _id: { type: Types.ObjectId,  required: false },
    scrape_id: { type: Schema.Types.ObjectId, ref: 'Job', required: true },
    url: { type: String, required: true },
    status: { type: String, required: true, default:'created' },
    type: { type: String, required: true },
    worker: { type: String, required: true, default:os.hostname() },
    tries: { type: Number, required: false}
  },
  { 
    collection: process.env.MONGO_JOBS_QUEUE_COLECTION 
  }
);
const Task = model<ITask>('Task', taskSchema);
export {ITask, Task}

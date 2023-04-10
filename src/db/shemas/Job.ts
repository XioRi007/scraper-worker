import { Schema, model, Types } from 'mongoose';
import * as dotenv from 'dotenv';
dotenv.config();

interface IJob {
  _id?: Types.ObjectId,
  params: Object
}

const jobSchema = new Schema<IJob>(
    {
        params: { type: Object, required: true }
    },
    { 
        collection: process.env.MONGO_JOBS_COLECTION,
        strict: false
    }
);
const Job = model<IJob>('Job', jobSchema);
export {IJob, Job}

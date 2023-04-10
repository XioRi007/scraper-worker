import { Schema, model, Types } from 'mongoose';
import * as dotenv from 'dotenv';
dotenv.config();

interface IItem {
  _id?: Types.ObjectId,
  scrape_id: Types.ObjectId
}

const itemSchema = new Schema<IItem>(
    {
        _id: { type: Types.ObjectId,  required: false },
        scrape_id: { type: Schema.Types.ObjectId, ref: 'Job', required: true }
    },
    { 
        collection: process.env.MONGO_ITEMS_COLECTION,
        strict: false
    }
);
const Item = model<IItem>('Item', itemSchema);
export {IItem, Item}

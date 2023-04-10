import mongoose from 'mongoose';
import { singleton } from 'tsyringe';
import * as dotenv from 'dotenv';
import { IConnection } from './IConnection.js';
dotenv.config();
const url = process.env.MONGODB_CONNECTION_STRING || '';

@singleton()
export class MongoConnection implements IConnection{

  public constructor() {}

  /**
   * Connects to the database
   * @async
   */
  public async connect(){      
    mongoose.set('strictQuery', false);
    await mongoose.connect(url);
  }
}

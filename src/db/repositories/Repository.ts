import { Model, Types } from 'mongoose';
interface IEntity {
    _id?: Types.ObjectId;
  }
export abstract class Repository<T extends IEntity> {
  constructor(protected model: Model<T>) {}

  /**
   * Finds a document by its ID in the collection.
   * @param {string} id - The ID of the document to find.
   * @returns {Promise<T | null>} A promise that resolves with the found document, or null if not found. 
   */
  async findById(id: string): Promise<T | null> {
    const result = await this.model.findById(id);
    return result ?? null;
  }

  /**
   * Find all entities
   * @returns {Promise<T[]>} Array of entities
   */
  async findAll(): Promise<T[]> {
    const result = await this.model.find();
    return result;
  }

  /**
   * Create a new entity
   * @param {T} entity The entity to create
   * @returns {Promise<string>} The id of the created entity
   */
  async create(entity: T): Promise<string> {
    entity._id = new Types.ObjectId();
    const result = await this.model.create(entity);    
    return result._id.toString();
  }

  /**
   * Update an existing entity
   * @param {string} id The id of the entity to update
   * @param {any} entity The entity with updated values
   * @returns {Promise<boolean>} True if the entity was updated, false otherwise
   */
  async update(id: string, entity: any): Promise<boolean> {
    const result = await this.model.updateOne({ _id: new Types.ObjectId(id) }, entity);
    return result.modifiedCount === 1;
  }

  /**
   * Deletes a document with the given ID from the database.
   * @param {string} id The ID of the document to delete.
   * @returns True if the document was deleted, false otherwise.
   */
  async delete(id: string): Promise<boolean> {
    const result = await this.model.deleteOne({ _id: new Types.ObjectId(id) });
    return result.deletedCount === 1;
  }

  /**
   * Finds a single field of a document by its ID.
   * @param {Types.ObjectId} _id The ID of the document to search.
   * @param {string} field The name of the field to retrieve.
   * @returns The value of the requested field, or null if the document was not found.
   */
  async findOneField(_id: Types.ObjectId, field:string): Promise<any> {
    const result = await this.model.findOne({_id}).select(field);
    return result;
  }
}

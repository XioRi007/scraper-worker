
export interface IQueueService {
    /**
     * Checks if the queue is empty.
     * @returns {Promise<boolean>} A Promise that resolves to a boolean indicating if the queue is empty. 
    */
    isEmpty(): Promise<boolean>;

    /**
     * Retrieves a message from the queue.
     * @returns {Promise<any>} A Promise that resolves to a QueueMessage object.
     */
    getMessage(): Promise<any>;

    /**
    * Sends a message to the queue.
    * @param {string} message - A string with the message to send.
    * @returns {Promise<string>} A Promise that resolves to the ID of the sent message.
    */
    sendMessage(message: string): Promise<string>;

    /**
    * Deletes a message from the queue.
    * @param {string} id - A string with the ID of the message to delete.
    * @returns {Promise<void>} A Promise that resolves when the message is deleted.
    */
    deleteMessage(id: string): Promise<void>;

    /**
    * Changes the visibility timeout of a message.
    * @param {string} id - A string with the ID of the message to update.
    * @param {number} vt - A number with the new visibility timeout value.
    * @returns {Promise<void>} A Promise that resolves when the message's visibility timeout is updated.
    */
    changeMessageVisibility(id: string, vt: number): Promise<void>;

    /**
    * Deletes the entire queue.
    * @returns {Promise<void>} A Promise that resolves when the queue is deleted.
    */
    deleteQueue(): Promise<void>;      
}

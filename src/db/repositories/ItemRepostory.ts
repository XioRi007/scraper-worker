import { autoInjectable, injectable } from "tsyringe";
import { IItem, Item } from "../shemas/Item.js";
import { Repository } from "./Repository.js";

@autoInjectable()
export class ItemRepository extends Repository<IItem> {
  constructor() {
    super(Item);
  }
}
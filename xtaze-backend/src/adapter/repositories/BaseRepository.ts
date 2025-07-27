import { Model } from "mongoose";
import { IBaseRepository } from "../../domain/repositories/IBaseRepository";

export class BaseRepository<T> implements IBaseRepository<T> {
  protected model: Model<any>; // Not Model<T>, to avoid conflicts

  constructor(model: Model<any>) {
    this.model = model;
  }

  async findById(id: string): Promise<T | null> {
    const doc = await this.model.findById(id).lean();
    return doc as T;
  }

  async findAll(): Promise<T[]> {
    const docs = await this.model.find().lean();
    return docs as T[];
  }

  async create(data: Partial<T>): Promise<T> {
    const doc = await this.model.create(data);
    return doc.toObject() as T;
  }

  async update(id: string, data: Partial<T>): Promise<T | null> {
    const updated = await this.model.findByIdAndUpdate(id, data, { new: true }).lean();
    return updated as T;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.model.findByIdAndDelete(id);
    return !!result;
  }
}

import { Request, Response } from "express";
import { RegisterUser } from "../../core/usecases/RegisterUser";
import { MongoUserRepository } from "../../infrastructure/repositories/MongoUserRepository";

const userRepo = new MongoUserRepository();
const registerUser = new RegisterUser(userRepo);

export const registerUserController = async (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  const user = await registerUser.execute(name, email, password);
  res.status(201).json(user);
};

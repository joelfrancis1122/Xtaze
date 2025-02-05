// src/presentation/controllers/UserController.ts
import { Request, Response } from "express";
import { RegisterUser } from "../../core/usecases/RegisterUser";
import { MongoUserRepository } from "../../infrastructure/repositories/MongoUserRepository";

// Initialize MongoUserRepository and RegisterUser use case
const userRepository = new MongoUserRepository();
const registerUser = new RegisterUser(userRepository);

// Register a new user
export const registerUserController = async (req: Request, res: Response): Promise<void> => {
  console.log("Signup request for", req.body);

  const { username, country, gender, year, phone, email, password } = req.body;
 

  // Basic validation checks (e.g., phone number, email)
  if (typeof username !== 'string' || typeof country !== 'string' || typeof gender !== 'string') {
    res.status(400).json({
      success: false,
      message: 'Invalid data type for username, country, or gender.',
    });
    return
  }
  const validGenders = ['male', 'female', 'other'];  // Add more options if needed
  if (!validGenders.includes(gender.toLowerCase())) {
    res.status(400).json({
      success: false,
      message: 'Gender must be either "male", "female", or "other".',
    });
    return 
  }

  const phoneNumber = Number(phone);
  if (isNaN(phoneNumber)) {
    res.status(400).json({
      success: false,
      message: 'Phone number must be a valid number.',
    });
    return
  }

  // Validate email format
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email)) {
    res.status(400).json({
      success: false,
      message: 'Invalid email format.',
    });
    return
  }

  // Validate password length
  if (password.length < 3) {
    res.status(400).json({
      success: false,
      message: 'Password must be at least 6 characters long.',
    });
    return
  }


  try {
    const user = await registerUser.execute(username, country, gender, year, phoneNumber, email, password);
    res.status(201).json({ message: "User registered successfully", user });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

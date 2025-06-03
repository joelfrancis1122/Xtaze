import bcrypt from 'bcryptjs';


const saltRounds =10

export default class PasswordService {

  async hashPassword(password: string): Promise<string> {
    console.log("password",password);
    
    const jero=bcrypt.hash(password, saltRounds);
    return jero
  }
  async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    const jovi=await bcrypt.compare(password, hashedPassword);
    
    return jovi
  }
}

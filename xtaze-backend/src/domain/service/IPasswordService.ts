
export default interface IPasswordService {
    hashPassword(password: string): Promise<string>
    comparePassword(password: string, hashedPassword: string): Promise<boolean>
}
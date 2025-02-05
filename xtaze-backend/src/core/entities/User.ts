
export class User {
  id: string; // Assuming `id` is a string, can be ObjectId if using MongoDB
  username: string;
  country: string;
  gender: string;
  year: number;
  phone: number;
  email: string;
  password: string;
  premium: boolean;

  constructor(id: string, username: string, country: string, gender: string, year: number, phone: number, email: string, password: string, premium: boolean) {
    this.id = id;
    this.username = username;
    this.country = country;
    this.gender = gender;
    this.year = year;
    this.phone = phone;
    this.email = email;
    this.password = password;
    this.premium = premium;
  }
}

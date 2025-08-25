
// const TYPES = {

//     UserUseCase: Symbol.for("UserUseCase"),
//     UserRepository: Symbol.for("UserRepository"),

//     ArtistUseCase: Symbol.for("ArtistUseCase"),
//     ArtistRepository: Symbol.for("ArtistRepository"),
    
//     GenreUseCase: Symbol.for("GenreUseCase"),
//     GenreRepository: Symbol.for("GenreRepository"),

//     EmailService: Symbol.for("EmailService"),
//     OtpService: Symbol.for("OtpService"),
//     PasswordService: Symbol.for("PasswordService"),
// };

// export default TYPES;
const TYPES = {
  // repos
  UserRepository: Symbol.for("UserRepository"),
  GenreRepository: Symbol.for("GenreRepository"),
  ArtistRepository: Symbol.for("ArtistRepository"),
  AdminRepository: Symbol.for("AdminRepository"),

  // services
  EmailService: Symbol.for("EmailService"),
  OtpService: Symbol.for("OtpService"),
  PasswordService: Symbol.for("PasswordService"),

  // usecases
  UserUseCase: Symbol.for("UserUseCase"),
  GenreUseCase: Symbol.for("GenreUseCase"),
  ArtistUseCase: Symbol.for("ArtistUseCase"),
  AdminUseCase: Symbol.for("AdminUseCase"),

  // controllers
  UserController: Symbol.for("UserController"),
  GenreController: Symbol.for("GenreController"),
  ArtistController: Symbol.for("ArtistController"),
  AdminController: Symbol.for("AdminController"),
};

export default TYPES;


// import { Container } from "inversify";
// import TYPES from "./types";
// import { GenreRepository } from "../../infrastructure/repositories/genre.repository";
// import UserRepository from "../../infrastructure/repositories/user.repository";
// import EmailService from "../../infrastructure/service/email.service";
// import OtpService from "../../infrastructure/service/otp.service";
// import PasswordService from "../../infrastructure/service/password.service";
// import UserUseCase from "../../Application/usecases/user.usecase";
// import { GenreUseCase } from "../../Application/usecases/genre.usecase";
// import GenreController from "../../presentation/controller/genre.controller";
// import UserController from "../../presentation/controller/user.controller";
// import ArtistRepository from "../../infrastructure/repositories/artist.repository";
// import ArtistUseCase from "../../Application/usecases/artist.usecase";
// import ArtistController from "../../presentation/controller/artist.controller";


// const container = new Container();

// // repositories
// container.bind<GenreRepository>(TYPES.GenreRepository).to(GenreRepository);
// container.bind<UserRepository>(TYPES.UserRepository).to(UserRepository);
// container.bind<ArtistRepository>(TYPES.ArtistRepository).to(ArtistRepository)

// // services
// container.bind<EmailService>(TYPES.EmailService).to(EmailService);
// container.bind<OtpService>(TYPES.OtpService).to(OtpService);
// container.bind<PasswordService>(TYPES.PasswordService).to(PasswordService);
// // usecases
// container.bind<GenreUseCase>(TYPES.GenreUseCase).to(GenreUseCase);
// container.bind<UserUseCase>(TYPES.UserUseCase).to(UserUseCase);
// container.bind<ArtistUseCase>(TYPES.ArtistUseCase).to(ArtistUseCase)

// // controllers
// container.bind<GenreController>(GenreController).toSelf();
// container.bind<UserController>(UserController).toSelf();
// container.bind<ArtistController>(ArtistController).toSelf();

// export default container;

import { Container } from "inversify";
import TYPES from "./types";

// repositories
import { GenreRepository } from "../../infrastructure/repositories/genre.repository";
import UserRepository from "../../infrastructure/repositories/user.repository";
import AdminRepository from "../../infrastructure/repositories/admin.repository";

// services
import EmailService from "../../infrastructure/service/email.service";
import OtpService from "../../infrastructure/service/otp.service";
import PasswordService from "../../infrastructure/service/password.service";

// usecases
import UserUseCase from "../../Application/usecases/user.usecase";
import { GenreUseCase } from "../../Application/usecases/genre.usecase";
import ArtistUseCase from "../../Application/usecases/artist.usecase";
import AdminUseCase from "../../Application/usecases/admin.uscase";

// controllers
import GenreController from "../../presentation/controller/genre.controller";
import UserController from "../../presentation/controller/user.controller";
import ArtistController from "../../presentation/controller/artist.controller";
import AdminController from "../../presentation/controller/admin.controller"; // make sure you have this
import ITrackUseCase from "../usecase/ITrackUsecase";
import { TrackUseCase } from "../../Application/usecases/track.usecase";
import { ITrackRepository } from "../repositories/ITrackRepository";
import { TrackRepository } from "../../infrastructure/repositories/track.repository";
import TrackController from "../../presentation/controller/track.controller";
import { ArtistRepository } from "../../infrastructure/repositories/artist.repository";

const container = new Container();

// ------------------ Repositories ------------------
container.bind<GenreRepository>(TYPES.GenreRepository).to(GenreRepository);
container.bind<UserRepository>(TYPES.UserRepository).to(UserRepository);
container.bind<ArtistRepository>(TYPES.ArtistRepository).to(ArtistRepository);
container.bind<AdminRepository>(TYPES.AdminRepository).to(AdminRepository);
container.bind<ITrackRepository>(TYPES.TrackRepository).to(TrackRepository);


// ------------------ Services ------------------
container.bind<EmailService>(TYPES.EmailService).to(EmailService);
container.bind<OtpService>(TYPES.OtpService).to(OtpService);
container.bind<PasswordService>(TYPES.PasswordService).to(PasswordService);

// ------------------ UseCases ------------------
container.bind<GenreUseCase>(TYPES.GenreUseCase).to(GenreUseCase);
container.bind<UserUseCase>(TYPES.UserUseCase).to(UserUseCase);
container.bind<ArtistUseCase>(TYPES.ArtistUseCase).to(ArtistUseCase);
container.bind<AdminUseCase>(TYPES.AdminUseCase).to(AdminUseCase);
container.bind<ITrackUseCase>(TYPES.TrackUseCase).to(TrackUseCase);

// ------------------ Controllers ------------------
container.bind<GenreController>(GenreController).toSelf();
container.bind<UserController>(UserController).toSelf();
container.bind<ArtistController>(ArtistController).toSelf();
container.bind<AdminController>(AdminController).toSelf();
container.bind<TrackController>(TrackController).toSelf();

export default container;



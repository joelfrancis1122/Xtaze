import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import IUser from '../../domain/entities/IUser';
import IEmailService from '../../domain/service/IEmailService';
import IOtpService from '../../domain/service/IOtpService'
import IPasswordService from '../../domain/service/IPasswordService';
import Stripe from "stripe";
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { uploadImageToCloud, uploadProfileCloud } from '../../infrastructure/service/cloudinary.service';
import { OAuth2Client } from "google-auth-library";
import { IPlaylist } from '../../domain/entities/IPlaylist';
import { SubscriptionHistory } from '../../domain/entities/ISubscriptionHistory';
import { MESSAGES } from '../../domain/constants/messages';
import { IAlbum } from '../../domain/entities/IAlbum';
import { injectable } from "inversify";
import { inject } from "inversify";
import TYPES from "../../domain/constants/types";
import { IArtist } from "../../domain/entities/IArtist";
import { ArtistMapper } from "../mappers/ArtistMapper";
import { UserMapper } from "../mappers/UserMapper";
import { TrackMapper } from "../mappers/TrackMapper";
import { AlbumDTO } from "../dtos/AlbumDTO";
import { PlaylistMapper } from "../mappers/PlaylistMapper";
import { PlaylistDTO } from "../dtos/PlaylistDTO";
import { AlbumMapper } from "../mappers/AlbumMapper";
import mongoose from "mongoose";

dotenv.config();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2023-08-16" });

@injectable()
export default class UserUseCase {
  private _userRepository: IUserRepository;
  private _passwordService: IPasswordService;
  private _otpService: IOtpService;
  private _emailService: IEmailService;
  private _stripe: Stripe;

  constructor(
    @inject(TYPES.UserRepository) userRepository: IUserRepository,
    @inject(TYPES.PasswordService) passwordService: IPasswordService,
    @inject(TYPES.OtpService) otpService: IOtpService,
    @inject(TYPES.EmailService) emailService: IEmailService
  ) {
    this._userRepository = userRepository;
    this._passwordService = passwordService;
    this._otpService = otpService;
    this._emailService = emailService;
    this._stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2023-08-16",
    });
  }

  async increment(trackId: string, id: string) {

    return await this._userRepository.increment(trackId, id);

  }
  async registerUser(
    username: string,
    country: string,
    gender: string,
    year: number,
    phone: number,
    email: string,
    password: string
  ) {
    const existingUser = await this._userRepository.findByEmail(email);
    if (existingUser) throw new Error(MESSAGES.USER_ALREADY_EXISTS);

    const hashedPassword = await this._passwordService.hashPassword(password);

    const user: IUser = {
      username,
      country,
      gender,
      year,
      phone,
      email,
      password: hashedPassword,
      toObject: function () { return { ...this }; }
    };

    const savedUser = await this._userRepository.add(user);
    return UserMapper.toDTO(savedUser);
  }

  async sendOTP(email: string) {

    const findEmail = await this._userRepository.findByEmail(email)

    if (findEmail) {
      return "403"
    }
    return this._otpService.sendOTP(email);
  }



  async checkUnique(username: string) {
    const user = await this._userRepository.findByUsername(username);
    return user === null;
  }

  async forgotPassword(email: string) {
    const user = await this._userRepository.findByEmail(email);
    if (!user) {
      throw new Error(MESSAGES.USER_NOT_FOUND);
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET!, {
      expiresIn: "1h",
    });

    await this._emailService.sendEmail(email, MESSAGES.PASSWORD_RESET_SUCCESS, token);

    return { success: true, message: MESSAGES.RESET_LINK_SENT };
  }

  async resetPassword(token: string, password: string) {

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
      if (!decoded) {
      }
      const user = await this._userRepository.findById(decoded.userId);
      if (!user) {
        throw new Error(MESSAGES.USER_NOT_FOUND);
      }

      const hashedPassword = await this._passwordService.hashPassword(password);

      user.password = hashedPassword;
      await this._userRepository.updatePassword(user);

      return {
        success: true,
        message: MESSAGES.PASSWORD_RESET_SUCCESS
      };
    } catch (error) {
      throw error;
    }
  }


  async verifyOTP(otp: string) {
    const isStore = await this._otpService.isEmpty()
    if (isStore) {
      return { success: false, message: MESSAGES.OTP_EXPIRED };
    }
    const data = await this._otpService.verifyOTP(otp);
    if (data) {
      return { success: true, message: MESSAGES.OTP_VERIFIED };
    } else {
      return { success: false, message: MESSAGES.OTP_INVALID };
    }

  }

  async listArtists(page: number, limit: number) {
    const { data, total } = await this._userRepository.getAllArtistsP(page, limit);
    return {
      data: UserMapper.toDTOs(data),
      pagination: { total, page, limit, totalpages: Math.ceil(total / limit) }
    };
  }

  async listArtistReleases(userId: string, page: number, limit: number) {
    const { data, total } = await this._userRepository.getAllTracksByArtist(userId, page, limit)
    return {
      data: TrackMapper.toDTOs(data),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    }
  }

  async login(email: string, password: string) {
    const user = await this._userRepository.findByEmail(email);
    if (!user) return { success: false, message: MESSAGES.USER_NOT_FOUND };
    if (user.role === MESSAGES.ADMIN || user.role === MESSAGES.ARTIST)
      return { success: false, message: MESSAGES.USER_LOGIN_ONLY };
    if (user.isActive === false) return { success: false, message: MESSAGES.ACCOUNT_SUSPENDED };

    const isPasswordValid = await this._passwordService.comparePassword(password, user.password);
    if (!isPasswordValid) throw new Error(MESSAGES.LOGIN_FAILED);

    const token = jwt.sign(
      { userId: user._id, email: user.email, role: "user" },
      process.env.JWT_SECRET!,
      { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: "7d" }
    );

    return {
      success: true,
      message: MESSAGES.LOGIN_SUCCESS,
      token,
      refreshToken,
      user: UserMapper.toDTO(user)
    };
  }

  async googleLogin(Token: string) {
    try {
      const ticket = await client.verifyIdToken({
        idToken: Token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      if (!payload) throw new Error(MESSAGES.GOOGLE_INVALID);

      const { email, name, picture } = payload;
      if (!email || !name) throw new Error(MESSAGES.GOOGLE_LOGIN_FAILED);

      let user = await this._userRepository.findByEmail(email);

      if (user?.isActive === false) return { success: false, message: MESSAGES.ACCOUNT_SUSPENDED };

      if (!user) {
        const newUser: IUser = {
          username: name,
          email,
          password: MESSAGES.RANDOMPASS,
          profilePic: picture || "",
          role: "user",
          isGoogleUser: true,
          country: "USA",
          gender: "male",
          year: 20,
          phone: 1234567890,
          toObject: function () { return { ...this }; }
        };
        user = await this._userRepository.add(newUser);
      }

      const token = jwt.sign(
        { userId: user._id!.toString(), email: user.email, role: "user" },
        process.env.JWT_SECRET!,
        { expiresIn: "15m" }
      );
      const refreshToken = jwt.sign(
        { userId: user._id!.toString() },
        process.env.JWT_REFRESH_SECRET!,
        { expiresIn: "7d" }
      );

      return {
        success: true,
        message: MESSAGES.LOGIN_SUCCESS,
        token,
        refreshToken,
        user: UserMapper.toDTO(user)
      };
    } catch (error) {
      return { success: false, message: MESSAGES.GOOGLE_LOGIN_FAILED };
    }
  }

  async refresh(refreshToken: string) {
    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as { userId: string };
      const user = await this._userRepository.findById(decoded.userId);
      if (!user) return { success: false, message: MESSAGES.USER_NOT_FOUND };
      if (user.isActive === false) return { success: false, message: MESSAGES.ACCOUNT_SUSPENDED };

      const newToken = jwt.sign(
        { userId: user._id, email: user.email, role: "user" },
        process.env.JWT_SECRET!,
        { expiresIn: "15m" }
      );
      const newRefreshToken = jwt.sign(
        { userId: user._id },
        process.env.JWT_REFRESH_SECRET!,
        { expiresIn: "7d" }
      );

      return {
        success: true,
        message: MESSAGES.TOKEN_REFRESHED,
        token: newToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      console.error("Refresh Token Error:", error);
      return { success: false, message: MESSAGES.INVALID_REFRESH_TOKEN };
    }
  }

  async uploadProfile(userId: string, file: Express.Multer.File) {
    try {
      const cloudinaryResponse = await uploadProfileCloud(file);
      const profilePicUrl = cloudinaryResponse.secure_url;
      const updatedUser = await this._userRepository.updateProfile(userId, profilePicUrl);
      if (!updatedUser) return { success: false, message: MESSAGES.PROFILE_UPDATE_FAILED };
      return { success: true, message: MESSAGES.PROFILE_UPDATE_SUCCESS, user: UserMapper.toDTO(updatedUser) };
    } catch {
      return { success: false, message: MESSAGES.ERROR_UPDATING_PROFILE };
    }
  }

  async uploadBanner(userId: string, file: Express.Multer.File, isVideo: boolean) {
    try {
      const cloudinaryResponse = await uploadProfileCloud(file);
      const BannerPicUrl = cloudinaryResponse.secure_url;
      const updatedUser = await this._userRepository.uploadBanner(userId, BannerPicUrl);
      if (!updatedUser) return { success: false, message: MESSAGES.BANNER_UPDATE_FAILED };
      return { success: true, message: MESSAGES.BANNER_UPDATE_SUCCESS, user: UserMapper.toDTO(updatedUser), isVideo };
    } catch {
      return { success: false, message: MESSAGES.ERROR_UPDATING_PROFILE };
    }
  }

  async updateBio(userId: string, bio: string) {
    try {
      const updated = await this._userRepository.updateBio(userId, bio);
      if (!updated) return { success: false, message: MESSAGES.ERROR_UPDATING_PROFILE };
      return { success: true, message: MESSAGES.PROFILE_UPDATE_SUCCESS, user: UserMapper.toDTO(updated) };
    } catch {
      return { success: false, message: MESSAGES.ERROR_UPDATING_PROFILE };
    }
  }

  async updateImagePlaylist(id: string, file: Express.Multer.File) {
    try {
      const cloudinaryResponse = await uploadImageToCloud(file);

      const coverpage = cloudinaryResponse.secure_url;
      const updatedData = await this._userRepository.updateImagePlaylist(id, coverpage);
      if (!updatedData) {
        return { success: false, message: MESSAGES.ERROR_UPDATING_PROFILE };
      }

      return { success: true, message: MESSAGES.BANNER_UPDATE_SUCCESS, data: updatedData };
    } catch (error) {
      return { success: false, message: MESSAGES.ERROR_UPDATING_PROFILE };
    }

  }



  async allAlbums(): Promise<AlbumDTO[]> {
    const albums = await this._userRepository.allAlbums() as IAlbum[];
    return AlbumMapper.toDTOs(albums);
  }
  async albumView(albumId: string): Promise<AlbumDTO | null> {
    const album = await this._userRepository.albumView(albumId) as IAlbum;
    return album ? AlbumMapper.toDTO(album) : null;
  }

  async usernameUpdate(userId: string, username: string) {
    try {
      const updated = await this._userRepository.usernameUpdate(userId, username);

      if (!updated) {
        return null;
      }

      return UserMapper.toDTO(updated);

    } catch (error) {
      console.error(MESSAGES.ERROR_UPDATING_PROFILE, error);
      return null;
    }
  }


  async getliked(songIds: string, userId: string) {
    try {
      const liked = await this._userRepository.getliked(songIds, userId);

      if (!liked) return null;
      return TrackMapper.toDTOs(liked);
    } catch (error) {
      console.log(error);
      return null;
    }
  }


  async addToLiked(userId: string, trackId: string) {
    const user = await this._userRepository.addToLiked(userId, trackId);
    return user ? UserMapper.toDTO(user) : null;
  }

  async addToPlaylist(userId: string, playlistId: string, trackId: string) {
    try {
      const user = await this._userRepository.addToPlaylist(userId, trackId, playlistId);
      if (!user) {
        return null;
      }

      return user;
    } catch (error) {
      console.error(MESSAGES.ERROR_UPDATING_PROFILE, error);
      throw new Error(MESSAGES.ERROR_UPDATING_PROFILE);
    }
  }

  async createPlaylist(_id: string, newplaylist: IPlaylist): Promise<PlaylistDTO | null> {
    const playlist = await this._userRepository.createPlaylist(_id, newplaylist);
    return playlist ? PlaylistMapper.toDTO(playlist) : null;
  }

  async getAllPlaylist(userId: string) {
    const playlists = await this._userRepository.findByCreator(userId);
    return playlists ? PlaylistMapper.toDTOs(playlists) : [];
  }
  async getPlaylist(
    id: string,
    pageNum: number,
    limitNum: number,
    skip: number
  ): Promise<PlaylistDTO | null> {
    const playlist = await this._userRepository.getPlaylist(id, pageNum, limitNum, skip);
    return playlist ? PlaylistMapper.toDTO(playlist as any) : null;
  }



  async deletePlaylist(id: string) {
    try {
      const playlist = await this._userRepository.deletePlaylist(id);
      if (!playlist) {
        return null
      }
      return playlist

    } catch (error) {
      console.error(MESSAGES.ERROR_DELETING_PLAYLIST, error);
      throw new Error(MESSAGES.ERROR_DELETING_PLAYLIST);
    }
  }
  async updateNamePlaylist(id: string, playlistName: string) {
    try {
      const playlist = await this._userRepository.updateNamePlaylist(id, playlistName);
      if (!playlist) {
        return null
      }
      return playlist

    } catch (error) {
      console.error(MESSAGES.ERROR_UPDATING_PROFILE, error);
      throw new Error(MESSAGES.ERROR_UPDATING_PROFILE);
    }
  }

  async getAllTracks() {
    try {
      const tracks = await this._userRepository.getAllTracks();
      if (!tracks) {
        return null
      }
    return TrackMapper.toDTOs(tracks);

    } catch (error) {
      console.error(MESSAGES.ERROR_UPDATING_PROFILE, error);
      throw new Error(MESSAGES.ERROR_UPDATING_PROFILE);
    }
  }
  async fetchGenreTracks(GenreName: string) {
    try {
      const tracks = await this._userRepository.fetchGenreTracks(GenreName);
      if (!tracks) {
        return null
      }
      return TrackMapper.toDTOs(tracks)

    } catch (error) {
      console.error(MESSAGES.ERROR_UPDATING_PROFILE, error);
      throw new Error(MESSAGES.ERROR_UPDATING_PROFILE);
    }
  }
  async resetPaymentStatus() {
    try {
      await this._userRepository.resetPaymentStatus();

    } catch (error) {
      console.error(MESSAGES.ERROR_UPDATING_PROFILE, error);
      throw new Error(MESSAGES.ERROR_UPDATING_PROFILE);
    }
  }


  async getUpdatedArtist(artistId: string) {
    const artist = await this._userRepository.getupdatedArtist(artistId);

    if (!artist) return null;

    return ArtistMapper.toDTO(artist as IArtist);
  }

  async execute(userId: string, priceId: string, couponCode?: string) {
    try {
      const user = await this._userRepository.findById(userId);
      if (!user) throw new Error(MESSAGES.USER_NOT_FOUND);

      const price = await this._stripe.prices.retrieve(priceId);
      const product = await this._stripe.products.retrieve(price.product as string);
      const planName = product.name;

      const sessionConfig: Stripe.Checkout.SessionCreateParams = {
        payment_method_types: ["card", "link"],
        line_items: [{ price: priceId, quantity: 1 }],
        mode: "subscription",
        success_url: MESSAGES.SUCCESS_URL,
        cancel_url: MESSAGES.CANCEL_URL,
        metadata: { userId, couponCode: couponCode || "", planName }
      };

      if (couponCode) {
        const coupon = await this._userRepository.findCouponByCode(couponCode);
        if (!coupon) throw new Error(MESSAGES.COUPON_NOT_FOUND);

        const currentUses = coupon.uses ?? 0;
        const usedUsers = coupon.users ?? [];

        if (coupon.status !== MESSAGES.ACTIVE || currentUses >= coupon.maxUses || new Date(coupon.expires) < new Date()) {
          throw new Error(MESSAGES.COUPON_EXPIRED);
        }

        const isCouponUsed = await this._userRepository.checkCouponisUsed(couponCode, userId);
        if (isCouponUsed) throw new Error(MESSAGES.COUPON_ALREADY_USED);

        const stripeCoupon = await this._stripe.coupons.create({
          percent_off: coupon.discountAmount,
          duration: "once",
          name: `Coupon_${couponCode}`
        });

        sessionConfig.discounts = [{ coupon: stripeCoupon.id }];
      }

      const session = await this._stripe.checkout.sessions.create(sessionConfig);
      return session;
      
    } catch (error) {
      throw error;
    }
  }


  async confirmPayment(rawBody: Buffer, signature: string) {
    try {
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET as string;

      const event = this._stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);

      if (event.type === "checkout.session.completed") {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        const couponCode = session.metadata?.couponCode;
        const planName = session.metadata?.planName;

        if (!userId || !planName) {
          throw new Error(MESSAGES.MISSING_METADATA);
        }

        // Update user subscription
        const updatedUser = await this._userRepository.updateUserSubscription(userId, planName);
        if (!updatedUser) {
          throw new Error(MESSAGES.SUBSCRIPTION_FAILED);
        }
        if (couponCode) {
          const coupon = await this._userRepository.findCouponByCode(couponCode);
          if (coupon) {
            const currentUses = coupon.uses ?? 0;
            const usedUsers = coupon.users ?? [];
            await this._userRepository.updateCouponByCode(couponCode, {
              uses: currentUses + 1,
              users: [...usedUsers, userId],
            });
          }
        }

      }
    } catch (error) {
      throw error;
    }
  }


  async checkAndUpdateCouponStatus() {
    try {
      const coupons = await this._userRepository.getCoupons();
      const currentDate = new Date();
      if (coupons)
        for (const coupon of coupons) {
          const expirationDate = new Date(coupon.expires);
          if (expirationDate < currentDate && coupon.status === MESSAGES.ACTIVE) {
            await this._userRepository.updateCouponByCode(coupon.code, {
              status: MESSAGES.EXPIRED,
            });
          }
        }
    } catch (error) {
      throw error;
    }
  }

  async getAllBanners() {
    const banners = await this._userRepository.getAllBanners()
    return banners;

  }
  async becomeArtist(userId: string) {
    const updatedUser = await this._userRepository.becomeArtist(userId);
    return updatedUser ? UserMapper.toDTO(updatedUser) : null;
  }

async getSubscriptionHistoryFromStripe() {
  try {
    const sessions = await this._stripe.checkout.sessions.list({
      limit: 50,
      expand: ["data.customer"],
    });

    const completedSessions = sessions.data.filter(
      (session) => session.status === "complete"
    );

    const history: SubscriptionHistory[] = await Promise.all(
      completedSessions.map(async (session) => {
        const userId = session.metadata?.userId || "unknown";
        const planName = session.metadata?.planName || "Unknown Plan";
        const price = (session.amount_total || 0) / 100;
        const purchaseDate = new Date(session.created * 1000).toISOString();

        let email = (session.customer as Stripe.Customer)?.email || "N/A";

        // ✅ Only try DB lookup if userId is valid ObjectId
        if ((!email || email === "N/A") && mongoose.Types.ObjectId.isValid(userId)) {
          const user = await this._userRepository.findById(userId);
          email = user?.email || "N/A";
        }

        return {
          userId,
          email,
          planName,
          price,
          purchaseDate,
        };
      })
    );

    return history.sort(
      (a, b) =>
        new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime()
    );
  } catch (error) {
    console.error("Error fetching subscription history:", error);
    throw error;
  }
}

  async getArtistByName(username: string) {

    const users = await this._userRepository.getArtistByName(username)
    return users

  }
}


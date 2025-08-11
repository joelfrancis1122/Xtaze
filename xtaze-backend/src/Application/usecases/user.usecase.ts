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
import { ITrack } from '../../domain/entities/ITrack';
import { IBanner } from '../../domain/entities/IBanner';
import { SubscriptionHistory } from '../../domain/entities/ISubscriptionHistory';
import { MESSAGES } from '../../domain/constants/messages';
import { IAlbum } from '../../domain/entities/IAlbum';
dotenv.config();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2023-08-16" });

  interface useCaseDependencies {
  repository: {
    userRepository: IUserRepository
  },
  service: {
    PasswordService: IPasswordService,
    OtpService: IOtpService;
    EmailService: IEmailService;
  }
}

export default class UserUseCase {
  private _userRepository: IUserRepository //space for storage box 
  private _passwordService: IPasswordService // space for painting brush 
  private _otpService: IOtpService; // space for another tool
  private _emailService: IEmailService;
  private _stripe: Stripe;

  constructor(dependencies: useCaseDependencies) { // boss giving the toys here 
    this._userRepository = dependencies.repository.userRepository // got the storage box 
    this._passwordService = dependencies.service.PasswordService // got the paint brush 
    this._otpService = dependencies.service.OtpService;
    this._emailService = dependencies.service.EmailService;
    this._stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2023-08-16",
    });
  }

  async registerUser(username: string, country: string, gender: string, year: number, phone: number, email: string, password: string): Promise<IUser> {

    const [existingUserByEmail] = await Promise.all([
      this._userRepository.findByEmail(email),
    ]);

    if (existingUserByEmail) {

      throw new Error(MESSAGES.USER_ALREADY_EXISTS);
    }

    const hashedPassword = await this._passwordService.hashPassword(password);

    const user = {
      username,
      country,
      gender,
      year,
      phone,
      email,
      password: hashedPassword,
      toObject: function () { return { ...this }; }
    };

    const userData = await this._userRepository.add(user);

    return userData;
  }

  async sendOTP(email: string): Promise<string> {

    const findEmail = await this._userRepository.findByEmail(email) //using the storage 

    if (findEmail) {
      return "403"
    }
    return this._otpService.sendOTP(email);
  }



  async checkUnique(username: string): Promise<boolean> {
    const user = await this._userRepository.findByUsername(username);
    return user === null;
  }

  async forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
    const user = await this._userRepository.findByEmail(email);
    if (!user) {
      throw new Error(MESSAGES.USER_NOT_FOUND);
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET!, {
      expiresIn: "1h",
    });

    await this._emailService.sendEmail(email,MESSAGES.PASSWORD_RESET_SUCCESS, token);

    return { success: true, message: MESSAGES.RESET_LINK_SENT };
  }

  async resetPassword(token: string, password: string): Promise<{ success: boolean; message: string }> {
    // Create an instance of PasswordService

    try {
      // Verify JWT token
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
      if (!decoded) {
      }
      // Find user
      const user = await this._userRepository.findById(decoded.userId);
      if (!user) {
        throw new Error(MESSAGES.USER_NOT_FOUND);
      }

      // Use PasswordService to hash the new password
      const hashedPassword = await this._passwordService.hashPassword(password);

      // Update user's password
      user.password = hashedPassword;
      await this._userRepository.updatePassword(user);

      return {
        success: true,
        message: MESSAGES.PASSWORD_RESET_SUCCESS
      };
    } catch (error) {
      throw error; // You might want to handle this more specifically based on your needs
    }
  }


  async verifyOTP(otp: string): Promise<{ success: boolean; message: string }> {
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

  async login(email: string, password: string): Promise<{ success: boolean; message: string; token?: string; refreshToken?: string; user?: IUser }> {
    const user = await this._userRepository.findByEmail(email);
    if (!user) return { success: false, message: MESSAGES.USER_NOT_FOUND };
    if (user.role === MESSAGES.ADMIN || user.role === MESSAGES.ARTIST) return { success: false, message: MESSAGES.USER_LOGIN_ONLY };
    if (user.isActive === false) return { success: false, message: MESSAGES.ACCOUNT_SUSPENDED };

    const isPasswordValid = await this._passwordService.comparePassword(password, user.password);
    if (!isPasswordValid) throw new Error(MESSAGES.LOGIN_FAILED);

    const token = jwt.sign(
      { userId: user._id, email: user.email, role: MESSAGES.USER },
      process.env.JWT_SECRET!,
      { expiresIn: "15m" } // Short-lived access token
    );
    const refreshToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: "7d" } // Long-lived refresh token
    );

    return {
      success: true,
      message: MESSAGES.LOGIN_SUCCESS,
      token,
      refreshToken,
      user,
    };
  }

  async googleLogin(Token: string): Promise<{ success: boolean; message: string; token?: string; refreshToken?: string; user?: IUser | null }> {
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

      if (user?.isActive === false) {
        return { success: false, message: MESSAGES.ACCOUNT_SUSPENDED };
      }

      if (!user) {
        // Split name
        const [firstName, ...rest] = name.split(" ");
        const lastName = rest.join(" ");

        const newUser: IUser = {
          username: name,
          email,
          password: MESSAGES.RANDOMPASS,
          profilePic: picture || "",
          role: "user",
          isGoogleUser: true, // optionally mark Google signup
          country: "USA", gender: "male", year: 20, phone: 1234567890,
          toObject: function (): IUser {
            throw new Error(MESSAGES.GOOGLE_LOGIN_FAILED);
          }
        };

        user = await this._userRepository.add(newUser);
      }

      const userObj: IUser = { ...(typeof user.toObject === "function" ? user.toObject() : user), _id: user._id!.toString() };

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
        user: userObj,
      };
    } catch (error) {
      return { success: false, message: MESSAGES.GOOGLE_LOGIN_FAILED };
    }
  }


  async refresh(refreshToken: string): Promise<{ success: boolean; message: string; token?: string; refreshToken?: string }> {
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


  async uploadProfile(userId: string, file: Express.Multer.File): Promise<{ success: boolean; message: string, user?: IUser }> {
    try {
      const cloudinaryResponse = await uploadProfileCloud(file);

      const profilePicUrl = cloudinaryResponse.secure_url;

      // Update the user profile with the new image URL
      const updatedUser = await this._userRepository.updateProfile(userId, profilePicUrl);

      if (!updatedUser) {
        return { success: false, message: MESSAGES.PROFILE_UPDATE_FAILED };
      }

      return { success: true, message: MESSAGES.PROFILE_UPDATE_SUCCESS, user: updatedUser };
    } catch (error) {
      return { success: false, message: MESSAGES.ERROR_UPDATING_PROFILE };
    }

  }
  async uploadBanner(userId: string, file: Express.Multer.File, isVideo: boolean): Promise<{ success: boolean; message: string, user?: IUser, isVideo?: boolean }> {
    try {
      const cloudinaryResponse = await uploadProfileCloud(file);

      const BannerPicUrl = cloudinaryResponse.secure_url;
      const updatedUser = await this._userRepository.uploadBanner(userId, BannerPicUrl);
      if (!updatedUser) {
        return { success: false, message: MESSAGES.BANNER_UPDATE_FAILED };
      }

      return { success: true, message: MESSAGES.BANNER_UPDATE_SUCCESS, user: updatedUser, isVideo: isVideo };
    } catch (error) {
      return { success: false, message: MESSAGES.ERROR_UPDATING_PROFILE };
    }

  }
  async updateImagePlaylist(id: string, file: Express.Multer.File): Promise<{ success: boolean; message: string, data?: IPlaylist }> {
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
  async updateBio(userId: string, bio: string): Promise<{ success: boolean; message: string, user?: IUser }> {
    try {
      const updated = await this._userRepository.updateBio(userId, bio);
      if (!updated) {
        return { success: false, message: MESSAGES.ERROR_UPDATING_PROFILE };
      }
      return { success: true, message: MESSAGES.PROFILE_UPDATE_SUCCESS, user: updated };
    } catch (error) {
      console.error(error);
      return { success: false, message: MESSAGES.ERROR_UPDATING_PROFILE };
    }
  }

  async allAlbums(): Promise<IAlbum[] | null> {
    const albums = await this._userRepository.allAlbums() as IAlbum[];
    return albums;
  }
  async albumView(albumId: string): Promise<IAlbum | null> {
    const albums = await this._userRepository.albumView(albumId) as IAlbum;
    return albums;
  }


  async usernameUpdate(userId: string, username: string): Promise<IUser | null> {
    try {
      const updated = await this._userRepository.usernameUpdate(userId, username);

      if (!updated) {
        return null;
      }

      return updated;

    } catch (error) {
      console.error(MESSAGES.ERROR_UPDATING_PROFILE, error);
      return null;
    }
  }


  async getliked(songIds: string, userId: string): Promise<ITrack[] | null> {
    try {
      const liked = await this._userRepository.getliked(songIds, userId)
      return liked
    } catch (error) {
      console.log(error)
      return null
    }
  }



  async addToLiked(userId: string, trackId: string): Promise<IUser | null> {
    try {
      const user = await this._userRepository.addToLiked(userId, trackId);

      if (!user) {
        return null;
      }

      return user; 
    } catch (error) {
      console.error(MESSAGES.ERROR_UPDATING_PROFILE, error);
      throw new Error(MESSAGES.ERROR_UPDATING_PROFILE);
    }
  }

  async addToPlaylist(userId: string, playlistId: string, trackId: string): Promise<IPlaylist | null> {
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


  async createPlaylist(_id: string, newplaylist: IPlaylist): Promise<IPlaylist | null> {
    try {
      const playlist = await this._userRepository.createPlaylist(_id, newplaylist);

      if (!playlist) {
        return null;
      }

      return playlist; 
    } catch (error) {
      console.error(MESSAGES.ERROR_UPDATING_PROFILE, error);
      throw new Error(MESSAGES.ERROR_UPDATING_PROFILE);
    }
  }
  async getAllPlaylist(userId: string): Promise<IPlaylist[] | null> {
    try {
      const playlist = await this._userRepository.findByCreator(userId);

      if (!playlist) {
        return null;
      }

      return playlist;
    } catch (error) {
      console.error(MESSAGES.ERROR_UPDATING_PROFILE, error);
      throw new Error(MESSAGES.ERROR_UPDATING_PROFILE);
    }
  }
  async getPlaylist(id: string, pageNum: number, limitNum: number, skip: number): Promise<{ tracks: ITrack[]; total: number } | null> {
    try {
      const playlist = await this._userRepository.getPlaylist(id, pageNum, limitNum, skip);

      if (!playlist) {
        return null;
      }

      return playlist;
    } catch (error) {
      console.error(MESSAGES.ERROR_UPDATING_PROFILE, error);
      throw new Error(MESSAGES.ERROR_UPDATING_PROFILE);
    }
  }
  async deletePlaylist(id: string): Promise<IPlaylist | null> {
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
  async updateNamePlaylist(id: string, playlistName: string): Promise<IPlaylist | null> {
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
  async getAllTracks(): Promise<ITrack[] | null> {
    try {
      const tracks = await this._userRepository.getAllTracks();
      if (!tracks) {
        return null
      }
      return tracks

    } catch (error) {
      console.error(MESSAGES.ERROR_UPDATING_PROFILE, error);
      throw new Error(MESSAGES.ERROR_UPDATING_PROFILE);
    }
  }
  async fetchGenreTracks(GenreName: string): Promise<ITrack[] | null> {
    try {
      const tracks = await this._userRepository.fetchGenreTracks(GenreName);
      if (!tracks) {
        return null
      }
      return tracks

    } catch (error) {
      console.error(MESSAGES.ERROR_UPDATING_PROFILE, error);
      throw new Error(MESSAGES.ERROR_UPDATING_PROFILE);
    }
  }
  async resetPaymentStatus(): Promise<void> {
    try {
      await this._userRepository.resetPaymentStatus();

    } catch (error) {
      console.error(MESSAGES.ERROR_UPDATING_PROFILE, error);
      throw new Error(MESSAGES.ERROR_UPDATING_PROFILE);
    }
  }


  async getUpdatedArtist(artistId: string): Promise<IUser | null> {
    return await this._userRepository.getupdatedArtist(artistId);
  }
  async execute(userId: string, priceId: string, couponCode?: string): Promise<Stripe.Checkout.Session> {
    try {
      const user = await this._userRepository.findById(userId);
      if (!user) {
        throw new Error(MESSAGES.USER_NOT_FOUND);
      }

      // Retrieve price and product
      const price = await this._stripe.prices.retrieve(priceId);
      const product = await this._stripe.products.retrieve(price.product as string);
      const planName = product.name;

      // Base session configuration
      const sessionConfig: Stripe.Checkout.SessionCreateParams = {
        payment_method_types: ["card", "link"],
        line_items: [{ price: priceId, quantity: 1 }],
        mode: "subscription",
        success_url: MESSAGES.SUCCESS_URL,
        cancel_url: MESSAGES.CANCEL_URL,
        metadata: {
          userId,
          couponCode: couponCode || "",
          planName, // Store planName for webhook
        },
      };

      if (couponCode) {
        const coupon = await this._userRepository.findCouponByCode(couponCode);
        if (!coupon) throw new Error(MESSAGES.COUPON_NOT_FOUND);

        const currentUses = coupon.uses ?? 0;
        const usedUsers = coupon.users ?? [];

        if (
          coupon.status !== MESSAGES.ACTIVE||
          currentUses >= coupon.maxUses ||
          new Date(coupon.expires) < new Date()
        ) {
          throw new Error(MESSAGES.COUPON_EXPIRED);
        }

        const isCouponUsed = await this._userRepository.checkCouponisUsed(couponCode, userId);
        if (isCouponUsed) {
          throw new Error(MESSAGES.COUPON_ALREADY_USED);
        }

        const stripeCoupon = await this._stripe.coupons.create({
          percent_off: coupon.discountAmount,
          duration: "once",
          name: `Coupon_${couponCode}`,
        });

        sessionConfig.discounts = [{ coupon: stripeCoupon.id }];
      }

      const session = await this._stripe.checkout.sessions.create(sessionConfig);
      return session;
    } catch (error) {
      throw error;
    }
  }



  async confirmPayment(rawBody: Buffer, signature: string): Promise<void> {
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


  async checkAndUpdateCouponStatus(): Promise<void> {
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

  async getAllBanners(): Promise<IBanner[] | null> {
    const banners = await this._userRepository.getAllBanners()
    return banners;

  }
  async becomeArtist(id: string): Promise<IUser | null> {
    return await this._userRepository.becomeArtist(id)
  }


   async getSubscriptionHistoryFromStripe(): Promise<SubscriptionHistory[]> {
    try {
      const sessions = await this._stripe.checkout.sessions.list({
        limit: 50, // Max 100, adjust as needed
        expand: ["data.customer"], // Expand customer for email
      });

      const completedSessions = sessions.data.filter(
        (session) => session.status === "complete"
      );

      const history: SubscriptionHistory[] = await Promise.all(
        completedSessions.map(async (session) => {
          const userId = session.metadata?.userId || MESSAGES.MY_NAME;
          const planName = session.metadata?.planName || "Unknown Plan";
          const price = (session.amount_total || 0) / 100; 
          const purchaseDate = new Date(session.created * 1000).toISOString(); 

          let email = (session.customer as Stripe.Customer)?.email || "N/A";
          if (!email || email === "N/A") {
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

      return history.sort((a, b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime());
    } catch (error) {
      throw error;
    }
  }


  async getArtistByName(username: string): Promise<IUser | null> {

    const users = await this._userRepository.getArtistByName(username)
    return users

  }
}


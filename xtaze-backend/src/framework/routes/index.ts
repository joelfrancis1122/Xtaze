import { Router } from "express"
import userRoutes from "./route/user.route";
import musicRoutes from "./route/music.route";
import trackRoutes from './route/track.route';
import adminRoutes from './route/admin.route'
import artistRoutes from './route/artist.route'
const router = Router()

router.use("/api/songs", musicRoutes);
router.use("/user", userRoutes);
router.use("/admin", adminRoutes);
router.use("/artist", artistRoutes);


router.use('/provider', trackRoutes);

export default router
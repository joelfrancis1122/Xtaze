// cron/cronJobs.ts
import cron from "node-cron";
import UserController from "../../../adapter/controller/user.controller";
import userDependencies from "../../dependencies/user.dependencies";

export function setupCronJobs() {
  const userController = new UserController(userDependencies); // Pass full dependencies object


  cron.schedule("0 0 * * * *", async () => {
    console.log("Cron job: Running coupon status check at midnight...");
    try {
      await userController.checkCouponStatus();
    } catch (error) {
      console.error("Cron job failed:", error);
    }
  }, {
    timezone: "UTC" 
  });

  console.log("Cron jobs scheduled");
}
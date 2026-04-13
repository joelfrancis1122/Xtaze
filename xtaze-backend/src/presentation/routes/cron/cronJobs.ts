// cron/cronJobs.ts
import cron from "node-cron";
import UserController from "../../../presentation/controller/user.controller";
import container from "../../../domain/constants/inversify.config";

export function setupCronJobs() {

  const userController = container.get<UserController>(UserController)

  cron.schedule("0 0 * * * *", async () => {
    try {
      await userController.checkCouponStatus();
    } catch (error) {
      console.error("Cron job failed:", error);
    }
  }, {
    timezone: "UTC" 
  });



  cron.schedule("0 0 1 * *", async () => {
      try {
        await userController.resetPaymentStatus()
      } catch (error) {
        console.error("Second cron job failed:", error);
      }
    },
    { timezone: "UTC" }
  );

  console.log("Cron jobs scheduled");

}


 
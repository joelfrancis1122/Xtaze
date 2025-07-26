// cron/cronJobs.ts
import cron from "node-cron";
import UserController from "../../../adapter/controller/user.controller";
import userDependencies from "../../dependencies/user.dependencies";

export function setupCronJobs() {
  const userController = new UserController(userDependencies); // Pass full dependencies object


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


 
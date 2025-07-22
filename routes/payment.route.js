import express from "express";
import { makeDummyPayment } from "../controllers/payment.controller.js";
import authUser from "../middlewares/authUser.middleware.js";

const router = express.Router();

router.post("/dummy", authUser, makeDummyPayment);

export default router;

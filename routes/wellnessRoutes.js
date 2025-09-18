import express from "express";
import { createCheckIn } from "../controllers/checkInController.js";

const router = express.Router();
router.post("/checkin", createCheckIn);

export default router;

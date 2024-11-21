import express from "express";
import {
  uploadProfilePic,
  getProfilePic,
  deleteProfilePic,
} from "../controllers/profilePicController.js";
import { authenticateBasicAuth } from "../middleware/middlewareAuthentication.js";
import logger from "../utils/logger.js";

const profilePicRoutes = express.Router();

profilePicRoutes.post("/pic", authenticateBasicAuth, async (req, res, next) => {
  try {
    await uploadProfilePic(req, res);
  } catch (error) {
    logger.error("Error uploading profile picture:", error);
    next(error);
  }
});

profilePicRoutes.get("/pic", authenticateBasicAuth, async (req, res, next) => {
  try {
    await getProfilePic(req, res);
  } catch (error) {
    logger.error("Error retrieving profile picture:", error);
    next(error);
  }
});

profilePicRoutes.delete("/pic", authenticateBasicAuth, async (req, res, next) => {
  try {
    await deleteProfilePic(req, res);
  } catch (error) {
    logger.error("Error deleting profile picture:", error);
    next(error);
  }
});

export default profilePicRoutes;

import multer from "multer";
import logger from "../utils/logger.js";
import {
  uploadProfilePicService,
  getProfilePicService,
  deleteProfilePicService,
} from "../services/profilePicService.js";

const upload = multer({ storage: multer.memoryStorage() }).single("profilePic");

export const uploadProfilePic = async (req, res, next) => {
  try {
    await uploadProfilePicService(req);
    res.status(201).send();
  } catch (error) {
    logger.error("Error uploading profile picture:", error);
    next(error);
  }
};

export const getProfilePic = async (req, res, next) => {
  try {
    const profilePic = await getProfilePicService(req.user.id);
    res.status(200).json(profilePic);
  } catch (error) {
    logger.error("Error retrieving profile picture:", error);
    next(error);
  }
};

export const deleteProfilePic = async (req, res, next) => {
  try {
    await deleteProfilePicService(req.user.id);
    logger.info(`Profile picture deleted for user ID: ${req.user.id}`);
    res.status(204).end();
  } catch (error) {
    if (error.message === "Profile picture not found") {
      logger.warn(`No profile picture for user ID: ${req.user.id}`);
      res.status(404).json({ message: "Profile picture not found" });
    } else {
      logger.error(`Error deleting profile picture for user ID ${req.user.id}`);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
};

export default {
  uploadProfilePic,
  getProfilePic,
  deleteProfilePic
};

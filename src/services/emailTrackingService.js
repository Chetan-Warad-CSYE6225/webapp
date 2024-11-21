import EmailTracking from "../models/EmailTracking.js";
import { getUserByEmail } from "./userServices.js";
 
 
export const getEmailTrackingByToken = async (token) => {
    const user = await EmailTracking.findOne({ where: { token: token } });
    return await user;
}
 
export const setVerification = async (email) => {
    const user = await getUserByEmail(email);
    user.is_verified = true;
    await user.save();
    return await user;
}
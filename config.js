import dotenv from "dotenv";
dotenv.config();

const config = {
  JWT_USER_PASSWORD: process.env.JWT_USER_PASSWORD,
  JWT_ADMIN_PASSWORD: process.env.JWT_ADMIN_PASSWORD,
  RAZORPAY_SECRET_KEY: process.env.RAZORPAY_SECRET_KEY,
  RAZORPAY_ID_KEY: process.env.RAZORPAY_ID_KEY
};

export default config;


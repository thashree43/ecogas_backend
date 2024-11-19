import { IRedisRepository } from "../../domain";
import Redis, { Redis as RedisClient } from "ioredis";
require("dotenv").config();

export class RedisOtpRepository implements IRedisRepository {
  private client: RedisClient;

  constructor() {
    this.client = new Redis({
      host: process.env.REDIS_HOST,
      port: Number(process.env.REDIS_PORT),
      password: process.env.REDIS_PASSWORD,
    });

    this.client.on("connect", () => {
      console.log("Redis has connected");
    });

    this.client.on("error", (err) => {
      console.error("Redis encountered an error", err);
    });
  }

  async store(email: string, otp: string, ttlseconds: number): Promise<void> {
     ttlseconds = 60;
    try {
      console.log(`Storing OTP: ${otp} for email: ${email},ttlseconds be that :${ttlseconds}`);
      await this.client.setex(email, ttlseconds, otp);
    } catch (error) {
      console.error("Error storing OTP in Redis:", error);
      throw new Error("Error in DB");
    }
  }

  async get(email: string): Promise<string | null> {
    try {
      console.log(`Retrieving OTP for email: ${email}`);
      const result = await this.client.get(email);
      if (!result) {
        console.warn(`No OTP found in Redis for email: ${email}`);
      }
      return result;
    } catch (error) {
      console.error("Error retrieving OTP from Redis:", error);
      return null;
    }
  }

  async delete(email: string): Promise<void> {
    try {
      console.log(`Deleting OTP for email: ${email}`);
      await this.client.del(email);
    } catch (error) {
      console.error("Error deleting OTP from Redis:", error);
    }
  }
}

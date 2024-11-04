import mongoose, { Schema, model } from "mongoose";
import { IChatData } from "../../../domain";

const chatModel = new Schema<IChatData>({
    chatname: { type: String, required: true },
    admin: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    user: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    latestmessage: [{ type: Schema.Types.ObjectId, ref: 'Message' }]
}, {
    timestamps: true
});

export const ChatModel = model<IChatData>('Chat', chatModel);
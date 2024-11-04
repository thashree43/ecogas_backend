import { Types } from "mongoose";

export interface IChatData {
    _id: Types.ObjectId;
    chatname: string;
    admin: Types.ObjectId[];
    user: Types.ObjectId[];
    latestmessage: Types.ObjectId[]; // Changed from latestmessages to latestmessage
    createdAt?: Date;
    updatedAt?: Date;
}

export class chat {
    _id: Types.ObjectId;
    chatname: string;
    admin: Types.ObjectId[];
    user: Types.ObjectId[];
    latestmessage: Types.ObjectId[]; // Changed from latestmessages to latestmessage
    createdAt?: Date;
    updatedAt?: Date;

    constructor(data: Partial<IChatData>) {
        this._id = data._id || new Types.ObjectId();
        this.chatname = data.chatname || '';
        this.admin = data.admin || [];
        this.user = data.user || [];
        this.latestmessage = data.latestmessage || []; // Changed from latestmessages to latestmessage
        this.createdAt = data.createdAt;
        this.updatedAt = data.updatedAt;
    }
}
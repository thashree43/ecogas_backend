import { Schema, model, Document, Types } from "mongoose";

// export interface IMessageData extends Document{
//     _id:Types.ObjectId
//     reciever:Types.ObjectId[]
//     sender:Types.ObjectId[]
//     content:string;
//     chat:Types.ObjectId[]
//     image?:string | null;
// }
export interface IMessageData extends Document {
    _id: Types.ObjectId;
    reciever: Types.ObjectId[];  // Note: keeping your spelling of "reciever"
    sender: Types.ObjectId[];
    content: string;
    chat: Types.ObjectId[];
    image?: string | null;
}
const messageSchema = new Schema<IMessageData>({
    reciever: [{ type: Schema.Types.ObjectId, ref: "User" }],
    sender: [{ type: Schema.Types.ObjectId, ref: "User" }],
    content: { type: String, trim: true },  // Remove required: true since we might have image-only messages
    chat: [{ type: Schema.Types.ObjectId, ref: "Chats" }],
    image: { type: String } 
  }, { timestamps: true });

export default model<IMessageData>("Message",messageSchema)
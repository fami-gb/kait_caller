import express, { Application, Request, Response } from 'express';
import { load } from 'ts-dotenv';
import { getUsers, createUser } from './userService';
import sqlite from 'sqlite3';
import {
  ClientConfig,
  Client,
  middleware,
  MiddlewareConfig,
  WebhookEvent,
  TextMessage,
  MessageAPIResponseBase,
} from '@line/bot-sdk';

const env = load({
  CHANNEL_ACCESS_TOKEN: String,
  CHANNEL_SECRET: String,
  PORT: Number,
});
const config = {
  channelAccessToken: env.CHANNEL_ACCESS_TOKEN || '',
  channelSecret: env.CHANNEL_SECRET || '',
};
const PORT = env.PORT || 3000;

const clientConfig: ClientConfig = config;
const middlewareConfig: MiddlewareConfig = config;
const client = new Client(clientConfig);

const app: Application = express();

// メッセージ受信時の処理
const textEventHandler = async (
  event: WebhookEvent
): Promise<MessageAPIResponseBase | undefined> => {
  if (event.type !== 'message' || event.message.type !== 'text') {
    return;
  }
  const { replyToken } = event;
  const { text } = event.message;
  const LineUserId = event.source.userId || "";
  // DBにユーザ名とステータス情報を送る
  await createUser(text, 'wait', LineUserId);
  const response: TextMessage = {
    type: 'text',
    text: '名前の登録が完了いたしました。\n順番になったらお知らせします。',
  };
  await client.replyMessage(replyToken, response);
};


app.post(
  '/webhook',
  middleware(middlewareConfig),
  async (req: Request, res: Response): Promise<void> => {
    const events: WebhookEvent[] = req.body.events;
    await Promise.all(
      events.map(async (event: WebhookEvent) => {
        try {
          await textEventHandler(event);
        } catch (err: unknown) {
          if (err instanceof Error) {
            console.error(err);
          }
          res.status(500);
        }
      })
    );
    res.status(200);
  }
);

app.use(express.json());

app.get("/users", async (_req, res) => {
  const users = await getUsers();
  res.json(users);
});


app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}/users`);
});

import PusherServer from "pusher";

export function getPusherServer() {
  const appId = process.env.PUSHER_APP_ID;
  const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
  const secret = process.env.PUSHER_SECRET;
  const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;

  if (!appId || !key || !secret || !cluster) return null;

  return new PusherServer({
    appId,
    key,
    secret,
    cluster,
    useTLS: true
  });
}

export async function broadcast(channel: string, event: string, payload: unknown) {
  const pusher = getPusherServer();
  if (!pusher) return;
  await pusher.trigger(channel, event, payload);
}

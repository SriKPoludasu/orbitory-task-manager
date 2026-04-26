"use client";

import Pusher from "pusher-js";
import { useEffect } from "react";

export function useRealtime(channelName: string, eventName: string, onEvent: () => void) {
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
    const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;
    if (!key || !cluster) return;

    const pusher = new Pusher(key, { cluster });
    const channel = pusher.subscribe(channelName);
    channel.bind(eventName, onEvent);

    return () => {
      channel.unbind(eventName, onEvent);
      pusher.unsubscribe(channelName);
      pusher.disconnect();
    };
  }, [channelName, eventName, onEvent]);
}

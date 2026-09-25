import { useEffect, useRef, useState } from 'react';
import { supabase } from '../config/supabase';

/**
 * Custom React Hook for Supabase Realtime Multiplayer Quiz Session
 * Listens for server broadcasts & synchronizes presence.
 */
export function useQuizRealtime(sessionId, callbacks = {}, currentParticipant = null) {
  const [isConnected, setIsConnected] = useState(false);
  const [onlineParticipants, setOnlineParticipants] = useState([]);
  const channelRef = useRef(null);

  // Store latest callbacks in ref to avoid re-subscribing on each render
  const callbacksRef = useRef(callbacks);
  callbacksRef.current = callbacks;

  useEffect(() => {
    if (!sessionId) return;

    const channelName = `quiz:${sessionId}`;
    const channel = supabase.channel(channelName, {
      config: {
        broadcast: { ack: true },
        presence: { key: currentParticipant?.id || `anon-${Math.random().toString(36).substring(7)}` },
      },
    });

    channelRef.current = channel;

    // Listen for Broadcast Events
    channel
      .on('broadcast', { event: 'PLAYER_JOINED' }, (payload) => {
        callbacksRef.current.onPlayerJoined?.(payload.payload);
      })
      .on('broadcast', { event: 'PLAYER_LEFT' }, (payload) => {
        callbacksRef.current.onPlayerLeft?.(payload.payload);
      })
      .on('broadcast', { event: 'GAME_STARTED' }, (payload) => {
        callbacksRef.current.onGameStarted?.(payload.payload);
      })
      .on('broadcast', { event: 'QUESTION_STARTED' }, (payload) => {
        callbacksRef.current.onQuestionStarted?.(payload.payload);
      })
      .on('broadcast', { event: 'ANSWER_SUBMITTED' }, (payload) => {
        callbacksRef.current.onAnswerSubmitted?.(payload.payload);
      })
      .on('broadcast', { event: 'QUESTION_ENDED' }, (payload) => {
        callbacksRef.current.onQuestionEnded?.(payload.payload);
      })
      .on('broadcast', { event: 'LEADERBOARD_UPDATED' }, (payload) => {
        callbacksRef.current.onLeaderboardUpdated?.(payload.payload);
      })
      .on('broadcast', { event: 'GAME_FINISHED' }, (payload) => {
        callbacksRef.current.onGameFinished?.(payload.payload);
      });

    // Listen for Presence sync
    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const active = Object.values(state).flat();
        setOnlineParticipants(active);
      })
      .on('presence', { event: 'join' }, ({ newPresences }) => {
        callbacksRef.current.onPresenceJoin?.(newPresences);
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }) => {
        callbacksRef.current.onPresenceLeave?.(leftPresences);
      });

    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        setIsConnected(true);
        if (currentParticipant) {
          await channel.track({
            id: currentParticipant.id,
            nickname: currentParticipant.nickname,
            avatar: currentParticipant.avatar,
            onlineAt: new Date().toISOString(),
          });
        }
      } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
        setIsConnected(false);
      }
    });

    return () => {
      channel.unsubscribe();
      supabase.removeChannel(channel);
      setIsConnected(false);
    };
  }, [sessionId, currentParticipant?.id]);

  return {
    isConnected,
    onlineParticipants,
    channel: channelRef.current,
  };
}

export default useQuizRealtime;

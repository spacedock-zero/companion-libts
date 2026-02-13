import type { ICompanionClient } from "../core";

export const TwitchModerationAction = {
	Ban: 'ban',
	Unban: 'unban',
	Timeout: 'timeout',
	DeleteMessage: 'delete_message',
	ClearChat: 'clear_chat',
	Announce: 'announce',
	Shoutout: 'shoutout',
	ShieldModeOn: 'shield_mode_on',
	ShieldModeOff: 'shield_mode_off',
	Slow: 'slow',
	SlowOff: 'slow_off',
	Followers: 'followers',
	FollowersOff: 'followers_off',
	Subscribers: 'subscribers',
	SubscribersOff: 'subscribers_off',
	EmoteOnly: 'emote_only',
	EmoteOnlyOff: 'emote_only_off',
	UniqueChat: 'unique_chat',
	UniqueChatOff: 'unique_chat_off',
	Mod: 'mod',
	Unmod: 'unmod',
	Vip: 'vip',
	Unvip: 'unvip'
} as const;
export type TwitchModerationAction = (typeof TwitchModerationAction)[keyof typeof TwitchModerationAction];

export const TwitchChannelAction = {
	UpdateInfo: 'update_info',
	CreateClip: 'create_clip',
	StartRaid: 'start_raid',
	CancelRaid: 'cancel_raid',
	StartCommercial: 'start_commercial',
	CreateMarker: 'create_marker'
} as const;
export type TwitchChannelAction = (typeof TwitchChannelAction)[keyof typeof TwitchChannelAction];

export const TwitchInteractionAction = {
	CreatePoll: 'create_poll',
	EndPoll: 'end_poll',
	CreatePrediction: 'create_prediction',
	EndPrediction: 'end_prediction',
	LockPrediction: 'lock_prediction'
} as const;
export type TwitchInteractionAction = (typeof TwitchInteractionAction)[keyof typeof TwitchInteractionAction];

// Discriminated Unions for Payloads

export type TwitchModerationPayload =
	| { action: 'ban'; target: string; reason?: string; duration?: number }
	| { action: 'unban'; target: string }
	| { action: 'timeout'; target: string; reason?: string; duration: number }
	| { action: 'delete_message'; target: string } // target is message_id
	| { action: 'clear_chat' }
	| { action: 'announce'; message: string; color?: string } // Changed target to message for clarity
	| { action: 'shoutout'; target: string } // target is user_id
	| { action: 'shield_mode_on' }
	| { action: 'shield_mode_off' }
	| { action: 'slow'; duration?: number }
	| { action: 'slow_off' }
	| { action: 'followers'; duration?: number }
	| { action: 'followers_off' }
	| { action: 'subscribers' }
	| { action: 'subscribers_off' }
	| { action: 'emote_only' }
	| { action: 'emote_only_off' }
	| { action: 'unique_chat' }
	| { action: 'unique_chat_off' }
	| { action: 'mod'; target: string }
	| { action: 'unmod'; target: string }
	| { action: 'vip'; target: string }
	| { action: 'unvip'; target: string };

export type TwitchChannelPayload =
	| { action: 'update_info'; title?: string; game_id?: string; language?: string }
	| { action: 'create_clip'; has_delay?: boolean }
	| { action: 'start_raid'; target: string } // target is user_id
	| { action: 'cancel_raid' }
	| { action: 'start_commercial'; length: 30 | 60 | 90 | 120 | 150 | 180 }
	| { action: 'create_marker'; description?: string };

export type TwitchInteractionPayload =
	| { action: 'create_poll'; title: string; options: string[]; duration: number; bits_per_vote?: number; channel_points_per_vote?: number }
	| { action: 'end_poll'; id: string; status: 'TERMINATED' | 'ARCHIVED' }
	| { action: 'create_prediction'; title: string; outcomes: string[]; duration: number }
	| { action: 'end_prediction'; id: string; status: 'RESOLVED' | 'CANCELED' | 'LOCKED'; winning_outcome_id?: string }
	| { action: 'lock_prediction'; id: string }; // Helper for 'LOCKED' status

export class TwitchModule {
	private client: ICompanionClient;

	constructor(client: ICompanionClient) {
		this.client = client;
	}

	// --- Moderation ---

	banUser(target: string, reason?: string, duration?: number) {
		this.client.send('twitch_moderation', { action: TwitchModerationAction.Ban, target, reason, duration });
	}

	unbanUser(target: string) {
		this.client.send('twitch_moderation', { action: TwitchModerationAction.Unban, target });
	}

	timeoutUser(target: string, duration: number, reason?: string) {
		this.client.send('twitch_moderation', { action: TwitchModerationAction.Timeout, target, duration, reason });
	}

	deleteMessage(messageId: string) {
		this.client.send('twitch_moderation', { action: TwitchModerationAction.DeleteMessage, target: messageId });
	}

	clearChat() {
		this.client.send('twitch_moderation', { action: TwitchModerationAction.ClearChat });
	}

	announce(message: string, color?: string) {
		this.client.send('twitch_moderation', { action: TwitchModerationAction.Announce, message, color });
	}

	shoutout(targetId: string) {
		this.client.send('twitch_moderation', { action: TwitchModerationAction.Shoutout, target: targetId });
	}

	setShieldMode(active: boolean) {
		this.client.send('twitch_moderation', { action: active ? TwitchModerationAction.ShieldModeOn : TwitchModerationAction.ShieldModeOff });
	}

	// Helper for generic execution if needed by nodes, but specific methods are preferred
	executeModeration(payload: TwitchModerationPayload) {
		this.client.send('twitch_moderation', payload);
	}


	// --- Channel ---

	updateChannelInfo(info: { title?: string; gameID?: string; language?: string }) {
		this.client.send('twitch_channel', {
			action: TwitchChannelAction.UpdateInfo,
			title: info.title,
			game_id: info.gameID,
			language: info.language
		});
	}

	createClip(hasDelay: boolean = false) {
		this.client.send('twitch_channel', { action: TwitchChannelAction.CreateClip, has_delay: hasDelay });
	}

	startRaid(targetId: string) {
		this.client.send('twitch_channel', { action: TwitchChannelAction.StartRaid, target: targetId });
	}

	cancelRaid() {
		this.client.send('twitch_channel', { action: TwitchChannelAction.CancelRaid });
	}

	startCommercial(length: 30 | 60 | 90 | 120 | 150 | 180) {
		this.client.send('twitch_channel', { action: TwitchChannelAction.StartCommercial, length });
	}

	createMarker(description?: string) {
		this.client.send('twitch_channel', { action: TwitchChannelAction.CreateMarker, description });
	}

	executeChannel(payload: TwitchChannelPayload) {
		this.client.send('twitch_channel', payload);
	}


	// --- Interaction ---

	createPoll(title: string, options: string[], duration: number, bitsPerVote?: number, pointsPerVote?: number) {
		this.client.send('twitch_interaction', {
			action: TwitchInteractionAction.CreatePoll,
			title,
			options,
			duration,
			bits_per_vote: bitsPerVote,
			channel_points_per_vote: pointsPerVote
		});
	}

	endPoll(id: string, isArchived: boolean = false) {
		this.client.send('twitch_interaction', {
			action: TwitchInteractionAction.EndPoll,
			id,
			status: isArchived ? 'ARCHIVED' : 'TERMINATED'
		});
	}

	createPrediction(title: string, outcomes: string[], duration: number) {
		this.client.send('twitch_interaction', {
			action: TwitchInteractionAction.CreatePrediction,
			title,
			outcomes,
			duration
		});
	}

	endPrediction(id: string, status: 'RESOLVED' | 'CANCELED' | 'LOCKED', winningOutcomeId?: string) {
		this.client.send('twitch_interaction', {
			action: TwitchInteractionAction.EndPrediction,
			id,
			status,
			winning_outcome_id: winningOutcomeId
		});
	}

	executeInteraction(payload: TwitchInteractionPayload) {
		this.client.send('twitch_interaction', payload);
	}

	/* Listeners */
	onChatMessage(cb: Function) { this.client.on('twitch_chat_message', cb); }
	onFollow(cb: Function) { this.client.on('twitch_follow', cb); }
	onSubscribe(cb: Function) { this.client.on('twitch_subscribe', cb); }
	onRaid(cb: Function) { this.client.on('twitch_raid', cb); }
	onChannelUpdate(cb: Function) { this.client.on('twitch_channel_update', cb); }
	onStreamOnline(cb: Function) { this.client.on('twitch_stream_online', cb); }
	onStreamOffline(cb: Function) { this.client.on('twitch_stream_offline', cb); }
	onPollBegin(cb: Function) { this.client.on('twitch_poll_begin', cb); }
	onPollProgress(cb: Function) { this.client.on('twitch_poll_progress', cb); }
	onPollEnd(cb: Function) { this.client.on('twitch_poll_end', cb); }
	onPredictionBegin(cb: Function) { this.client.on('twitch_prediction_begin', cb); }
	onPredictionProgress(cb: Function) { this.client.on('twitch_prediction_progress', cb); }
	onPredictionEnd(cb: Function) { this.client.on('twitch_prediction_end', cb); }
	onHypeTrainBegin(cb: Function) { this.client.on('twitch_hype_train_begin', cb); }
	onHypeTrainProgress(cb: Function) { this.client.on('twitch_hype_train_progress', cb); }
	onHypeTrainEnd(cb: Function) { this.client.on('twitch_hype_train_end', cb); }
	onRedemption(cb: Function) { this.client.on('twitch_redemption', cb); }
}

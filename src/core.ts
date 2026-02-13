
import { TwitchModerationAction, TwitchChannelAction, TwitchInteractionAction } from "./modules/twitch";

export type CompanionPacket =
	| { version: 1, type: 'twitch_moderation', body: TwitchModerationAction }
	| { version: 1, type: 'twitch_channel', body: TwitchChannelAction }
	| { version: 1, type: 'twitch_interaction', body: TwitchInteractionAction }
	| { version: number, type: string, body: any };


export interface ICompanionClient {
	ws: WebSocket | null;
	modules: Map<string, any>;
	listeners: Map<string, Function[]>;
	connect(url: string): void;
	send(type: string, body: any): void;
	on(event: string, callback: Function): void;
	off(event: string, callback: Function): void;
}

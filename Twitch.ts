import axios from "axios";
import twitchCreds from "./twitch_creds.json";

interface AccessTokenResponse {
    access_token: string;
    expires_in: number;
    token_type: string;
}

interface StreamerInformation {
    id: string;
    login: string;
    display_name: string;
    type: string;
    broadcaster_type: string;
    description: string;
    profile_image_url: string;
    offline_image_url: string;
    view_count: number;
    email: string;
    created_at: Date;
}

interface StreamInformation {
    id: string;
    user_id: string;
    user_login: string;
    user_name: string;
    game_id: string;
    game_name: string;
    type: string;
    title: string;
    viewer_count: number;
    started_at: Date;
    language: string;
    thumbnail_url: string;
    tag_ids: string[];
    is_mature: boolean;
}


export const GenerateTwitchAccessToken = async (): Promise<string> => {
    const { data } = await axios.postForm<AccessTokenResponse>("https://id.twitch.tv/oauth2/token", {
        ...twitchCreds
    });
    return data.access_token;
}

export class Twitch {

    private _token: string;

    constructor(token: string) {
        this._token = token;
    }

    private GetRequestHeaders = () => ({
        "Authorization": `Bearer ${this._token}`,
        "Client-Id": twitchCreds.client_id,
    })

    public GetStreamerInformation = async(user: string[]): Promise<StreamerInformation[]> => {
        const params = user.map((name) => `login=${name}`);
        const { data } = await axios.get<{data: StreamerInformation[]}>(`https://api.twitch.tv/helix/users?${params.join("&")}`, {
            headers: this.GetRequestHeaders()
        });
        return data.data;
    }

    public GetStreamInformation = async(user: string[]): Promise<StreamInformation[]> => {
        const params = user.map((name) => `user_login=${name}`);
        const { data } = await axios.get<{data: StreamInformation[]}>(`https://api.twitch.tv/helix/streams?${params.join("&")}`, {
            headers: this.GetRequestHeaders()
        });
        return data.data;
    }
}
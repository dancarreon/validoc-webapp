import {StatusType} from "./user-types.ts";

export interface TrackType {
    id: number;
    name: string;
    status: StatusType;
}

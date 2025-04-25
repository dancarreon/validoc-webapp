import {StatusType} from "./status-type.ts";

export interface TrackType {
    id: number;
    name: string;
    status: StatusType;
}

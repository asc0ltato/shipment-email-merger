export interface ISummary {
    summaryId: string;
    emailGroupId: string;
    aiAnalysis: ShipmentRequest;
    summary: string;
    status: 'pending' | 'processing' | 'approved' | 'rejected' | 'failed';
    createdAt: Date;
    updatedAt: Date;
}

export type ShipmentRequest = {
    name: string;
    is_ai_generated: boolean;
    upload_id: string;
    pre_shipments: ShipmentPreShipment[];
    modes: ShipmentMode[];
    for_carriers?: string;
};

export type ShipmentPreShipment = {
    shipping_date_from: string | null;
    shipping_date_to: string | null;
    shipping_time_from: string | null;
    shipping_time_to: string | null;
    arrival_date_from: string | null;
    arrival_date_to: string | null;
    arrival_time_from: string | null;
    arrival_time_to: string | null;
    address_from: ShipmentAddress;
    address_dest: ShipmentAddress;
    contents: ShipmentContent[];
};

export type ShipmentAddress = {
    id: number;
    country: string | null;
    city: string | null;
    zipcode: string | null;
    address: string | null;
    date_from: string | null;
    date_to: string | null;
    time_from: string | null;
    time_to: string | null;
};

export type ShipmentContent = {
    type: {
        id: number;
        name: string;
        width: number;
        length: number;
        height: number;
        height_edit: boolean;
        width_edit: boolean;
        length_edit: boolean;
        dimension_unit: boolean;
        shortname: boolean;
        is_container: boolean;
    };
    quantity: number;
};

export type ShipmentMode = {
    id: number;
    name: string;
};
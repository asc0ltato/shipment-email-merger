import { IEmailGroup } from '@/types/email-group.types';
import { ShipmentContent, ShipmentMode } from '@/types/summary.types';

interface AIAnalysisViewProps {
    emailGroup: IEmailGroup;
}

export function AIAnalysisView({ emailGroup }: AIAnalysisViewProps) {
    const { summary } = emailGroup;
    const shipmentData = summary?.shipment_data;

    if (!shipmentData || !shipmentData.shipment_details || shipmentData.shipment_details.length === 0) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-8 text-slate-500 min-h-[100px]">
                <p className="text-sm">No summary data available</p>
            </div>
        );
    }

    const shipment = shipmentData.shipment_details[0];

    const hasShippingDates = shipment.shipping_date_from || shipment.shipping_date_to || 
                             shipment.shipping_time_from || shipment.shipping_time_to;
    const hasArrivalDates = shipment.arrival_date_from || shipment.arrival_date_to || 
                            shipment.arrival_time_from || shipment.arrival_time_to;
    const hasFromAddress = shipment.address_from.address || shipment.address_from.city || shipment.address_from.country || shipment.address_from.zipcode;
    const hasDestAddress = shipment.address_dest.address || shipment.address_dest.city || shipment.address_dest.country || shipment.address_dest.zipcode;
    const hasContents = shipment.contents && shipment.contents.length > 0 && shipment.contents.some(content => content.name && content.name !== "Unknown");
    const hasModes = shipmentData.modes && shipmentData.modes.length > 0 && shipmentData.modes.some(mode => mode.name && mode.name !== "Unknown");
    const hasCarrierInfo = shipmentData.for_carriers && shipmentData.for_carriers !== "информация для перевозчиков";

    if (!hasShippingDates && !hasArrivalDates && !hasFromAddress && !hasDestAddress && !hasContents && !hasModes && !hasCarrierInfo) {
        return (
             <div className="flex-1 flex flex-col items-center justify-center text-center py-8 text-slate-500 min-h-[200px] mt-8">
                <p className="text-sm">AI analysis completed but no structured information was found in the emails</p>
                <p className="text-xs mt-1">The AI couldn't extract specific shipment details from the email content.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {hasShippingDates && (
                    <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                        <h4 className="font-semibold text-slate-800 text-sm mb-2 flex items-center gap-2">
                            <svg className="w-3 h-3 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                            </svg>
                            Shipping dates
                        </h4>
                        <div className="space-y-1 text-xs">
                            {(shipment.shipping_date_from || shipment.shipping_time_from) && (
                                <div className="flex justify-between">
                                    <span className="text-slate-600">From:</span>
                                    <span className="font-medium text-slate-800">
                                        {shipment.shipping_date_from 
                                            ? (shipment.shipping_time_from ? `${shipment.shipping_date_from} ${shipment.shipping_time_from}` : shipment.shipping_date_from)
                                            : shipment.shipping_time_from}
                                    </span>
                                </div>
                            )}
                            {(shipment.shipping_date_to || shipment.shipping_time_to) && (
                                <div className="flex justify-between">
                                    <span className="text-slate-600">To:</span>
                                    <span className="font-medium text-slate-800">
                                        {shipment.shipping_date_to 
                                            ? (shipment.shipping_time_to ? `${shipment.shipping_date_to} ${shipment.shipping_time_to}` : shipment.shipping_date_to)
                                            : shipment.shipping_time_to}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {hasArrivalDates && (
                    <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                        <h4 className="font-semibold text-slate-800 text-sm mb-2 flex items-center gap-2">
                            <svg className="w-3 h-3 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                            </svg>
                            Arrival dates
                        </h4>
                        <div className="space-y-1 text-xs">
                            {(shipment.arrival_date_from || shipment.arrival_time_from) && (
                                <div className="flex justify-between">
                                    <span className="text-slate-600">From:</span>
                                    <span className="font-medium text-slate-800">
                                        {shipment.arrival_date_from 
                                            ? (shipment.arrival_time_from ? `${shipment.arrival_date_from} ${shipment.arrival_time_from}` : shipment.arrival_date_from)
                                            : shipment.arrival_time_from}
                                    </span>
                                </div>
                            )}
                            {(shipment.arrival_date_to || shipment.arrival_time_to) && (
                                <div className="flex justify-between">
                                    <span className="text-slate-600">To:</span>
                                    <span className="font-medium text-slate-800">
                                        {shipment.arrival_date_to 
                                            ? (shipment.arrival_time_to ? `${shipment.arrival_date_to} ${shipment.arrival_time_to}` : shipment.arrival_date_to)
                                            : shipment.arrival_time_to}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {(hasFromAddress || hasDestAddress) && (
                    <div className="bg-slate-50 rounded-lg p-3 border border-slate-200 md:col-span-2">
                        <h4 className="font-semibold text-slate-800 text-sm mb-2 flex items-center gap-2">
                            <svg className="w-3 h-3 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                            </svg>
                            Route information
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {hasFromAddress && (
                                <div>
                                    <h5 className="text-xs font-medium text-slate-700 mb-1">From address</h5>
                                    <div className="text-xs text-slate-600 space-y-0.5">
                                        {shipment.address_from.address && <div>{shipment.address_from.address}</div>}
                                        {shipment.address_from.city && <div>{shipment.address_from.city}</div>}
                                        {shipment.address_from.zipcode && <div>{shipment.address_from.zipcode}</div>}
                                        {shipment.address_from.country && <div>{shipment.address_from.country}</div>}
                                        {!shipment.address_from.address && !shipment.address_from.city && !shipment.address_from.country && !shipment.address_from.zipcode && (
                                            <div className="text-slate-400">No address information</div>
                                        )}
                                    </div>
                                </div>
                            )}
                            {hasDestAddress && (
                                <div>
                                    <h5 className="text-xs font-medium text-slate-700 mb-1">Destination address</h5>
                                    <div className="text-xs text-slate-600 space-y-0.5">
                                        {shipment.address_dest.address && <div>{shipment.address_dest.address}</div>}
                                        {shipment.address_dest.city && <div>{shipment.address_dest.city}</div>}
                                        {shipment.address_dest.zipcode && <div>{shipment.address_dest.zipcode}</div>}
                                        {shipment.address_dest.country && <div>{shipment.address_dest.country}</div>}
                                        {!shipment.address_dest.address && !shipment.address_dest.city && !shipment.address_dest.country && !shipment.address_dest.zipcode && (
                                            <div className="text-slate-400">No address information</div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {hasContents && (
                    <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                        <h4 className="font-semibold text-slate-800 text-sm mb-2 flex items-center gap-2">
                            <svg className="w-3 h-3 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                            </svg>
                            Contents
                        </h4>
                        <div className="space-y-2 text-xs">
                            {shipment.contents
                                .filter((content: ShipmentContent) => content.name && content.name !== "Unknown")
                                .map((content: ShipmentContent, index: number) => {
                                    return (
                                        <div key={index} className="space-y-1">
                                            <div className="flex justify-between items-center">
                                                <span className="text-slate-600 font-medium">{content.name}</span>
                                                <span className="font-medium text-slate-800">x{content.quantity}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                        </div>
                    </div>
                )}

                {hasModes && (
                    <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                        <h4 className="font-semibold text-slate-800 text-sm mb-2 flex items-center gap-2">
                            <svg className="w-3 h-3 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path>
                            </svg>
                            Transport modes
                        </h4>
                        <div className="space-y-1 text-xs">
                            {shipmentData.modes
                                .filter((mode: ShipmentMode) => mode.name && mode.name !== "Unknown")
                                .map((mode: ShipmentMode, index: number) => (
                                    <div key={index} className="text-slate-800 font-medium">
                                        {mode.name}
                                    </div>
                                ))}
                        </div>
                    </div>
                )}
            </div>

            {hasCarrierInfo && (
                <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                    <h4 className="font-semibold text-blue-800 text-sm mb-1 flex items-center gap-2">
                        <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        Information for carriers
                    </h4>
                    <p className="text-xs text-blue-700">{shipmentData.for_carriers}</p>
                </div>
            )}
        </div>
    );
}
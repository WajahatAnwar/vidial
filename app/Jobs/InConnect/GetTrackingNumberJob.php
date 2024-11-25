<?php

namespace App\Jobs\InConnect;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use App\Traits\InConnect\VendorTrait;

class GetTrackingNumberJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels, VendorTrait;

    public $timeout = 600;
    public $tries = 2;

    /**
     * Create a new job instance.
     *
     * @return void
     */
    public $order = null;
    public function __construct($order)
    {
        $this->onQueue('que_free');
        $this->order = $order;
    }

    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle()
    {
        if ($this->order->is_archived)
            return;

        $trackingNumbers = [];
        $shipDates = [];

        $poNumber = $this->order->purchase_order_no;
        if ($poNumber) {

            $response = $this->getOrderShipmentNotification($poNumber, $this->order->vendor);
            // logger("VIP: " . json_encode($response));
            if (isset($response->errorMessage) || !isset($response->OrderShipmentNotificationArray)) {
                logger("ERROR: " . @$response->errorMessage->description);
                return true;
            }

            $SalesOrder = $response->OrderShipmentNotificationArray->OrderShipmentNotification->SalesOrderArray->SalesOrder;
            if (is_array($SalesOrder)) {
                foreach ($SalesOrder as $key => $SalesOrderPart) {
                    $ShipmentLocation = @$SalesOrderPart->ShipmentLocationArray->ShipmentLocation;
                    if ($ShipmentLocation == null)
                        $ShipmentLocation = @$SalesOrderPart->ShipmentArray->Shipment;

                    if ($ShipmentLocation) {
                        if (is_array($ShipmentLocation)) {
                            foreach ($ShipmentLocation as $key => $ShipmentLocationPart) {
                                $Package = $ShipmentLocationPart->PackageArray->Package;
                                if (is_array($Package)) {
                                    foreach ($Package as $key => $PackagePart) {
                                        array_push($trackingNumbers, $PackagePart->trackingNumber);
                                        array_push($shipDates, $PackagePart->shipmentDate);
                                    }
                                } else if (is_object($Package)) {
                                    array_push($trackingNumbers, $Package->trackingNumber);
                                    array_push($shipDates, $Package->shipmentDate);
                                }
                            }
                        } else if (is_object($ShipmentLocation)) {
                            $Package = $ShipmentLocation->PackageArray->Package;
                            if (is_array($Package)) {
                                foreach ($Package as $key => $PackagePart) {
                                    array_push($trackingNumbers, $PackagePart->trackingNumber);
                                    array_push($shipDates, $PackagePart->shipmentDate);
                                }
                            } else if (is_object($Package)) {
                                array_push($trackingNumbers, $Package->trackingNumber);
                                array_push($shipDates, $Package->shipmentDate);
                            }
                        }
                    }
                }
            } else if (is_object($SalesOrder)) {
                $ShipmentLocation = @$SalesOrder->ShipmentLocationArray->ShipmentLocation;
                if ($ShipmentLocation == null)
                    $ShipmentLocation = @$SalesOrder->ShipmentArray->Shipment;

                if ($ShipmentLocation) {
                    if (is_array($ShipmentLocation)) {
                        if (is_array($ShipmentLocation)) {
                            foreach ($ShipmentLocation as $key => $ShipmentLocationPart) {
                                $Package = $ShipmentLocationPart->PackageArray->Package;
                                if (is_array($Package)) {
                                    foreach ($Package as $key => $PackagePart) {
                                        array_push($trackingNumbers, $PackagePart->trackingNumber);
                                        array_push($shipDates, $PackagePart->shipmentDate);
                                    }
                                } else if (is_object($Package)) {
                                    array_push($trackingNumbers, $Package->trackingNumber);
                                    array_push($shipDates, $Package->shipmentDate);
                                }
                            }
                        } else if (is_object($ShipmentLocation)) {
                            $Package = $ShipmentLocation->PackageArray->Package;
                            if (is_array($Package)) {
                                foreach ($Package as $key => $PackagePart) {
                                    array_push($trackingNumbers, $PackagePart->trackingNumber);
                                    array_push($shipDates, $PackagePart->shipmentDate);
                                }
                            } else if (is_object($Package)) {
                                array_push($trackingNumbers, $Package->trackingNumber);
                                array_push($shipDates, $Package->shipmentDate);
                            }
                        }
                    } else if (is_object($ShipmentLocation)) {
                        $Package = $ShipmentLocation->PackageArray->Package;
                        if (is_array($Package)) {
                            foreach ($Package as $key => $PackagePart) {
                                array_push($trackingNumbers, $PackagePart->trackingNumber);
                                array_push($shipDates, $PackagePart->shipmentDate);
                            };
                        } else if (is_object($Package)) {
                            array_push($trackingNumbers, $Package->trackingNumber);
                            array_push($shipDates, $Package->shipmentDate);
                        }
                    }
                }
            }

            // logger("TRACKINGS FOUND: " . json_encode($trackingNumbers) . " " . json_encode($shipDates));
            $this->order->tracking_number = implode(",", $trackingNumbers);
            $this->order->ship_dates = implode(",", $shipDates);
            $this->order->save();
        } else {
            // logger()->info('PO NOT FOUND: ' . $this->order->po_number);
        }

        return true;
    }
}

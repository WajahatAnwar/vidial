<?php

namespace App\Traits\InConnect;

use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;
use App\Models\InConnect\StichingList;
use App\Models\InConnect\StichingListDetail;
trait ScreenProTrait
{
    public function getSPAccessToken()
    {
        $password = env('SCREENPRO_PASSWORD');
        $username = env('SCREENPRO_USERNAME');
        $json = <<<JSON
        {
            "password": "$password",
            "username": "$username"
        }
        JSON;
        $response = Http::withHeaders([
            'Content-Type' => 'application/json',
            'Accept' => 'application/json',
        ])->post('https://manageordersapi.com/onsite/signin', json_decode($json, true));
        $data = $response->json();

        return $data['id_token'];
    }

    public function calculateSPPrice($quantity, $stitchCount, $decorator)
    {
        $stichingList = StichingList::where('decorator_id', $decorator->id)->where('min', '<=', $stitchCount)
            ->where('max', '>=', $stitchCount)
            ->first();
        if (!$stichingList) {
            return "Invalid quantity";
        }
        $stichingListDetail = StichingListDetail::where('from', '<=', $quantity)
            ->where('to', '>=', $quantity)
            ->where('stiching_list_id', $stichingList->id)
            ->first();
        if (!$stichingListDetail) {
            return "Invalid quantity";
        }
        return $stichingListDetail->price;
    }
}

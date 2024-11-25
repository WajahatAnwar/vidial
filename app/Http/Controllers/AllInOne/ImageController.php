<?php

namespace App\Http\Controllers\AllInOne;

use App\Http\Controllers\Controller;
use Illuminate\Http\Client\Response;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ImageController extends Controller
{
    public function getImages(Request $request)
    {
        $path = public_path($request->image);
        if (!file_exists($path)) {
            abort(404);
        }
        return response()->download($path);
    }
}

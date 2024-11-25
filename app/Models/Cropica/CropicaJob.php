<?php

namespace App\Models\Cropica;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\AllInOne\Job;
use App\Models\AllInOne\User;
use Illuminate\Support\Facades\DB;

class CropicaJob extends Model
{
    use HasFactory;

    protected $connection = 'cropica_conn';

    protected $fillable = [
        'uuid',
        'store_name',
        'store_id',
        'type',
        'status',
        'total_products',
        'total_images',
        'processed_images'
    ];

    public function getStoreNameAttribute($value)
    {
        return str_replace('.myshopify.com', '', $value);
    }

    public function jobs()
    {
        return $this->belongsToMany(Job::class, DB::connection('cropica_conn')->getDatabaseName() . '.cropica_sub_job', 'cropica_job_id', 'job_id')->using(CropicaSubJob::class)->withTimestamps();
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'store_id', 'id');
    }

    public function logs()
    {
        return $this->morphMany(CropicaLog::class, 'loggable');
    }

    public function failed_products()
    {
        return $this->hasMany(CropicaJobFailedProduct::class, 'cropica_job_id', 'id');
    }
}

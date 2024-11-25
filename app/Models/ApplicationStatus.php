<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\Pivot;

class ApplicationStatus extends Pivot
{
    use HasFactory;



    public $table = 'application_statuses';

    protected $fillable = [
        'user_id', 'application_id'
    ];

    public function application()
    {
        return $this->belongsTo(Application::class, 'application_id', 'id');
    }

    public function inconnect()
    {
        return $this->hasMany(InconnectApplicationStatus::class, 'application_status_id', 'id');
    }

    public function punchout()
    {
        return $this->hasMany(PunchoutApplicationStatus::class, 'application_status_id', 'id');
    }
}

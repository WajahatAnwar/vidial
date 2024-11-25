<?php

namespace App\Models;

use AjCastro\EagerLoadPivotRelations\EagerLoadPivotTrait;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Application extends Model
{
    use HasFactory, EagerLoadPivotTrait;



    public function users()
    {
        return $this->belongsToMany(User::class, 'application_statuses', 'application_id', 'user_id')->using(ApplicationStatus::class)->withTimestamps();
    }

    public function statuses()
    {
        return $this->hasMany(ApplicationStatus::class, 'application_id', 'id');
    }
}

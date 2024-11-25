<?php

namespace App\Models\Racoon;

use App\Models\AllInOne\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Restriction extends Model
{
    use HasFactory;

    protected $connection = 'racoon_conn';

    public function __construct(array $attributes = [])
    {
        parent::__construct($attributes);

        $this->table = \DB::connection('racoon_conn')->getDatabaseName() . '.restrictions';
    }

    protected $fillable = [
        'name',
        'user_id',
        'notification_email',
        'notifications_enabled',
        'auto_cancel',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function emails()
    {
        return $this->hasMany(RestrictionEmail::class);
    }

    public function tags()
    {
        return $this->hasMany(RestrictionTag::class);
    }

    public function collections()
    {
        return $this->hasMany(RestrictionCollection::class);
    }
}

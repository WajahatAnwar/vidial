<?php

namespace App\Models\InConnect;

use AjCastro\EagerLoadPivotRelations\EagerLoadPivotTrait;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Decorator extends Model
{
    use HasFactory, EagerLoadPivotTrait;

    protected $connection = 'in_connect_conn';

    protected $casts = [
        'created_at' => 'date:m-d-Y',
    ];

    protected $fillable = [
        'name',
        'po_prefix',
        'so_prefix',
        'intact_vendor_id',
        'notes',
        'username',
        'password',
        'client_id',
        'client_secret',
        'intact_location_id',
        'intact_department_id',
        'excluded_dates',
        'sat_sun_exclude',
        'vendor_stock_status',
    ];

    public function address()
    {
        return $this->morphOne(Address::class, 'addressable');
    }

    public function intactVendor()
    {
        return $this->belongsTo(IntactVendor::class);
    }

    public function intactLocation()
    {
        return $this->belongsTo(IntactLocation::class);
    }

    public function intactDepartment()
    {
        return $this->belongsTo(IntactDepartment::class);
    }

    public function services()
    {
        return $this->hasMany(DecoratorService::class);
    }

    public function locations()
    {
        return $this->hasMany(DecoratorLocation::class);
    }

    public function logoPhrases()
    {
        return $this->hasMany(DecoratorLogoPhrase::class);
    }

    public function secondLogoPhrases()
    {
        return $this->hasMany(DecoratorSecondLogoPhrase::class);
    }

    public function logoLocationPhrases()
    {
        return $this->hasMany(DecoratorLogoLocationPhrase::class);
    }

    public function secondLogoLocationPhrases()
    {
        return $this->hasMany(DecoratorSecondLogoLocationPhrase::class);
    }

    public function decorations()
    {
        return $this->hasMany(DecoratorDecoration::class);
    }

    public function customDecorations()
    {
        return $this->hasMany(DecoratorCustomDecoration::class);
    }

    public function personalizationInputs()
    {
        return $this->hasMany(DecoratorPersonalizationInput::class);
    }

    public function sizes()
    {
        return $this->hasMany(DecoratorSize::class);
    }

    public function inconnectOrders()
    {
        return $this->hasMany(InconnectOrder::class);
    }

    public function logs()
    {
        return $this->morphMany(InconnectLog::class, 'loggable');
    }

    public function vendor_stocks()
    {
        return $this->hasMany(DecoratorStockVendor::class, 'decorator_id');
    }

    public function stichList()
    {
        return $this->hasMany(StichingList::class, 'decorator_id');
    }  
}

<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Osiset\ShopifyApp\Contracts\ShopModel as IShopModel;
use Osiset\ShopifyApp\Traits\ShopModel;

class User extends Authenticatable implements IShopModel
{
    use HasApiTokens, HasFactory, Notifiable, ShopModel;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'ugc_video_count',
        'ugc_email_count',
        'init_flag',
        'remaining_email',
        'remaining_videos',
        'store_handle',
        'gd_access_token',
        'star_credit',
        'store_id',
        'mantle_token',
        'customer_api_token',
        'uuid'
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'shopify_offline_refresh_token',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
    ];

    public function prev_orders()
    {
        return $this->hasMany(Order::class, 'user_id', 'id');
    }

    public function products()
    {
        return $this->hasMany(Product::class, 'user_id', 'id');
    }

    public function collections()
    {
        return $this->hasMany(Collection::class, 'user_id', 'id');
    }

    /*** Good Authentic Relationships  ***/
    public function settings()
    {
        return $this->hasOne(Setting::class);
    }

    public function orders()
    {
        return $this->hasMany(Orders::class);
    }

    public function videos()
    {
        return $this->hasMany(Video::class);
    }

    public function videos_count()
    {
        return $this->hasMany(Video::class)->where('status', 'Approved');
    }

    public function emailsSent()
    {
        return $this->hasMany(Log::class)->where('type', 'EMAIL');
    }

    public function emailCreds()
    {
        return $this->hasOne(EmailCredentials::class);
    }

    public function googleDriveCreds()
    {
        return $this->hasOne(GoogleDriveCred::class);
    }

    public function klavio()
    {
        return $this->hasOne(KlavioCredential::class);
    }

    /**** Accessors ***/

    public function getFormattedCreatedAtAttribute()
    {
        return $this->created_at->format(config('constants.date_format')); // Customize the format as needed
    }

    public function customers()
    {
        return $this->hasMany(Customer::class);
    }



}

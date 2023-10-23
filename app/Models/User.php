<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Osiset\ShopifyApp\Contracts\ShopModel as IShopModel;
use Osiset\ShopifyApp\Traits\ShopModel;
use Illuminate\Database\Eloquent\SoftDeletes;

class User extends Authenticatable implements IShopModel
{
    use HasApiTokens, HasFactory, Notifiable, ShopModel,SoftDeletes;

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
        'star_credit'
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
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

    /*** Relationships  ***/

    public function settings()
    {
        return $this->hasOne(Setting::class);
    }
    public function orders(){
        return $this->hasMany(Orders::class);
    }
    public function videos(){
        return $this->hasMany(Video::class);
    }

    public function videos_count()
    {
        return $this->hasMany(Video::class)->where('status',config('constants.video_approved'));
    }

    public function mail_count()
    {
        return $this->hasMany(Log::class)->where('type', 'EMAIL');
    }

    public function emailCreds(){
        return $this->hasOne(EmailCredentials::class);
    }

    public function googleDriveCreds(){
        return $this->hasOne(GoogleDriveCred::class);
    }

    public function klavio(){
        return $this->hasOne(KlavioCredential::class);
    }

    /**** Accessors ***/
    
    public function getFormattedCreatedAtAttribute()
    {
        return $this->created_at->format(config('constants.date_format')); // Customize the format as needed
    }



}

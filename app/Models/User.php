<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;

use App\Models\Racoon\Restriction;
use App\Models\InConnect\InconnectAccount;
use App\Models\InConnect\InconnectLog;
use App\Models\Punchout\PomwGatewayClient;
use App\Models\PurchaseOrder\POSetting;
use App\Models\Filter\FilterSet;
use App\Models\PurchaseOrder\POShippingRule;
use App\Models\PurchaseOrder\POStoreRule;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\DB;
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
        'email_verified_at',
        'password',
        'remember_token',
        'role_id',
        'store_name',
        'direct_approve',
        'show_discount_field',
        'icons_color',
        'store_emails',
        'p_o_shipping_rule_id',
        'order_sync',
        'product_sync',
        'collection_sync',
        'user_picture',
        'access_token',
        'created_at',
        'updated_at',
        'shopify_grandfathered',
        'shopify_namespace',
        'shopify_freemium',
        'plan_id',
        'password_updated_at',
        'old_user_id',
        'access_level_id',
        'account_id',
        'status_id',
        'lastname',
        'username',
        'quick_login_code',
        'hash',
        'last_login',
        'last_known_ip',
        'auto_login_token',
        'password_recovery_token',
        'uuid',
        'hashid',
        'phone',
        'hr_parent_id',
        'hr_parent_index',
        'hr_department_id',
        'hr_area_id',
        'hr_status',
        'hr_all_access',
        'is_terminated',
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

    public function al_orders()
    {
        return $this->hasMany(Order::class, 'user_id', 'id');
    }

    public function applications()
    {
        return $this->belongsToMany(Application::class, 'application_statuses', 'user_id', 'application_id')->using(ApplicationStatus::class)->withPivot(['id', 'status', 'read_access', 'write_access'])->withTimestamps();
    }

    // REAL PIVOT TABLE
    // public function colors()
    // {
    //     return $this->belongsToMany(Color::class, 'user_colors', 'user_id', 'color_id')->using(UserColor::class)->withTimestamps();
    // }

    public function store_rule()
    {
        return $this->hasOne(POStoreRule::class, 'user_id', 'id');
    }

    public function button_setting()
    {
        return $this->hasOne(POSetting::class, 'user_id', 'id');
    }

    public function rule_rel()
    {
        return $this->belongsTo(POShippingRule::class, 'p_o_shipping_rule_id');
    }

    public function inconnect_account()
    {
        return $this->hasOne(InconnectAccount::class, 'user_id', 'id');
    }

    public function inconnect_logs()
    {
        return $this->hasMany(InconnectLog::class, 'user_id', 'id');
    }

    public function orders()
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

    public function restrictions()
    {
        return $this->hasMany(Restriction::class, 'user_id', 'id');
    }

    public function getFirstNameAttribute()
    {
        return @explode(' ', $this->name)[0];
    }

    public function getLastNameAttribute()
    {
        return @explode(' ', $this->name)[1];
    }

    public function pomw_gateway_clients()
    {
        return $this->hasMany(PomwGatewayClient::class, 'uuid', 'uuid');
    }

    public function filter_set()
    {
        return $this->belongsTo(FilterSet::class, 'default_filter_set_id', 'id');
    }

    public function access_level()
    {
        return $this->belongsTo(AccessLevel::class, 'access_level_id', 'id');
    }
}

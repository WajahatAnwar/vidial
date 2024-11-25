<?php

namespace App\Models\InConnect;

use App\Models\AllInOne\User;
use App\Models\InConnect\InconnectFraudStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class InconnectAccount extends Model
{
    use HasFactory;

    protected $connection = 'in_connect_conn';

    public function __construct(array $attributes = [])
    {
        parent::__construct($attributes);

        $this->table = DB::connection('in_connect_conn')->getDatabaseName() . '.inconnect_accounts';
    }

    protected $fillable = [
        'user_id'
    ];

    public function shop()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function store_type()
    {
        return $this->belongsTo(StoreType::class, 'store_type_id');
    }

    public function decorators()
    {
        return $this->belongsToMany(Decorator::class, 'inconnect_decorators', 'inconnect_account_id', 'decorator_id')->using(InconnectDecorator::class)->withTimestamps()->withPivot(['id', 'sync', 'due_date_days', 'location_to_logo', 'vip_customers', 'poly_bag', 'no_data_product_type_status']);
    }

    public function ignored_vendors()
    {
        return $this->belongsToMany(Vendor::class, 'inconnect_ignored_vendors', 'inconnect_account_id', 'vendor_id')->using(InconnectIgnoredVendors::class)->withTimestamps();
    }

    public function direct_vendors()
    {
        return $this->belongsToMany(Vendor::class, 'inconnect_direct_vendors', 'inconnect_account_id', 'vendor_id')->using(InconnectDirectVendor::class)->withTimestamps();
    }

    public function statuses()
    {
        return $this->hasOne(InconnectStatus::class, 'inconnect_account_id');
    }

    public function fraud_statuses()
    {
        return $this->hasOne(InconnectFraudStatus::class, 'inconnect_account_id');
    }

    public function mapping()
    {
        return $this->hasMany(InconnectIntactField::class, 'inconnect_account_id');
    }

    public function ignored_products()
    {
        return $this->hasMany(InconnectIgnoredProduct::class, 'inconnect_account_id');
    }

    public function intact_customer()
    {
        return $this->belongsTo(IntactCustomer::class, 'intact_customer_id');
    }

    public function logs()
    {
        return $this->morphMany(InconnectLog::class, 'loggable');
    }

    public function intact_payment_term()
    {
        return $this->belongsTo(IntactPaymentTerm::class, 'intact_payment_term_id');
    }
    public function intact_transaction_status()
    {
        return $this->belongsTo(IntactTransactionStatus::class, 'intact_transaction_status_id');
    }
    public function intact_department()
    {
        return $this->belongsTo(IntactDepartment::class, 'intact_department_id');
    }
    public function intact_class()
    {
        return $this->belongsTo(IntactClass::class, 'intact_class_id');
    }

    public function ignored_product_types()
    {
        return $this->belongsToMany(ProductType::class, 'inconnect_ignored_product_type', 'inconnect_account_id', 'product_type_id')->using(InconnectIgnoredProductType::class)->withTimestamps();
    }
}

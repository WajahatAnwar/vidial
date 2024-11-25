<?php

namespace App\Models\Punchout;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PomwProcurementNetwork extends Model
{
    use HasFactory;

    protected $connection = 'punchout_conn';
    public function catalogs(){
        return $this->hasMany(PomwCatalog::class, 'network_id', 'id');
    }
    public function isAriba()
    {
        return $this->uri === 'ariba';
    }
    public function isUnimarket()
    {
        return $this->uri === 'unimarket';
    }
}

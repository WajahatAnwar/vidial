<?php

namespace App\Models\Punchout;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PomwCatalogType extends Model
{
    use HasFactory;
    protected $connection = 'punchout_conn';

    public function catalogs(){
        return $this->hasMany(PomwCatalog::class, 'type_id', 'id');
    }

}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EmailTemplate extends Model
{
    use HasFactory;

    protected $guarded = [];

    public function user(){
        return $this->belongsTo(User::class);
    }

    public function getLogoAttribute($value){
        if($value){
            return url('emails_logo/' . $value);
        }

    
       //return  url('emails_logo/default.png');
      
    }
}

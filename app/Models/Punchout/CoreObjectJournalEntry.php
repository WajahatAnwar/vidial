<?php

namespace App\Models\Punchout;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CoreObjectJournalEntry extends Model
{
    use HasFactory;

    protected $connection = 'punchout_conn';

    public function journal(){
        return $this->belongsTo(CoreObjectJournal::class, 'journal_id', 'id');
    }
}

<?php

namespace App\Models\Punchout;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CoreObjectJournal extends Model
{
    use HasFactory;

    protected $connection = 'punchout_conn';

    public function entries(){
        return $this->hasMany(CoreObjectJournalEntry::class, 'journal_id', 'id');
    }

    public function setParentKey($key)
    {
        $this->object_key = $key;
        $this->save();
    }

    public function setObjectClassName($className)
    {
        $this->object_class = $className;
        $this->save();
    }

    public function setObjectId($object_id)
    {
        $this->object_id = $object_id;
        $this->save();
    }

    public function addEntry($data, $type = 'info', $key = '')
    {
        $entry = new CoreObjectJournalEntry();
        $entry->journal_id = $this->id;
        $entry->data = $data;
        $entry->key = $key;
        $entry->type = $type;
        $entry->save();

        return $entry;
    }
    public function getEntries()
    {
        return $this->entries;
    }
}

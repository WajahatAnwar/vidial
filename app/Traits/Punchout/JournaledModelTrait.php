<?php
namespace App\Traits\Punchout;

use App\Models\Punchout\CoreObjectJournal;

trait JournaledModelTrait
{
    public function addSuccessToJournal($message)
    {
        $this->addJournalEntry($message, 'success', 'success');
    }
    public function addErrorToJournal($message)
    {
        $this->addJournalEntry($message, 'error', 'error');
    }

    public function addJournalEntry($data, $type = "", $key = "")
    {
        $this->getJournal()->addEntry($data, $type, $key);
    }

    public function getJournal()
    {
        if (!empty($this->journal_id)) {
            return CoreObjectJournal::find($this->journal_id);
        }

        $journal = new CoreObjectJournal();
        $journal->setParentKey(get_class($this) . '_' . $this->id);
        $journal->setObjectClassName(get_class($this));
        $journal->setObjectId($this->id);
        $journal->type = "JournaledActiveRecordModel\\Auto";
        $journal->save();

        $this->journal_id = $journal->id;
        $this->save();

        return $journal;
    }
}

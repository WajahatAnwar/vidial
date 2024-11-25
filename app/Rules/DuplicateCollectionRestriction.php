<?php

namespace App\Rules;

use App\Models\Racoon\Restriction;
use Illuminate\Contracts\Validation\Rule;

class DuplicateCollectionRestriction implements Rule
{
    protected $user_id;
    protected $restriction_id;
    protected $duplicate_collection;

    /**
     * Create a new rule instance.
     *
     * @param  mixed  $user_id
     * @return void
     */
    public function __construct($user_id, $restriction_id)
    {
        $this->user_id = $user_id;
        $this->restriction_id = $restriction_id;
        $this->duplicate_collection = '';
    }

    /**
     * Determine if the validation rule passes.
     *
     * @param  string  $attribute
     * @param  mixed  $value
     * @return bool
     */
    public function passes($attribute, $value)
    {
        $restrictions = Restriction::where('user_id', $this->user_id)
        ->when($this->restriction_id, function ($query) {
            return $query->where('id', '!=', $this->restriction_id);
        })
        ->with('collections')
        ->get();
    
        foreach ($restrictions as $restriction) {
            foreach ($value as $collection) {
                if($restriction->collections()->where('handle', $collection['value'])->exists()){
                    $this->duplicate_collection = $collection['label'];
                    return false;
                }
            }
        }

        return true;
    }

    /**
     * Get the validation error message.
     *
     * @return string
     */
    public function message()
    {
        return "Restriction already exists for collection: $this->duplicate_collection";
    }
}
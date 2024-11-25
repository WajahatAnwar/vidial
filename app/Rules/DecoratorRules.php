<?php

namespace App\Rules;

use Illuminate\Contracts\Validation\Rule;
use Illuminate\Support\Facades\Log;

class DecoratorRules implements Rule
{
    protected $customMessage; // Define the property to hold the custom message

    public function passes($attribute, $values)
    {
        $selected_decorator = "";

        $first_check = false;
        foreach ($values as $value) {
            if ($value['temp_sync']) {
                $selected_decorator = $value;
                $first_check = true;
                break;
            }
        }
        if (!$first_check) {
            $this->setMessage('At least one decorator must be enabled.');
            return false;
        }

        $selected_decorator;

        if (!$selected_decorator['temp_due_date_days']) {
            $this->setMessage('Due date days cannot be null.');
            return false;
        }

        if (!$selected_decorator['temp_location_to_logo']) {
            $this->setMessage('Kindly select Yes or No for Location Number.');
            return false;
        }

        if (!$selected_decorator['temp_location_to_logo']) {
            $this->setMessage('Kindly select Yes or No for Location Number.');
            return false;
        }

        if (!$selected_decorator['temp_location_to_logo']) {
            $this->setMessage('Kindly select Yes or No for Location Number.');
            return false;
        }

        foreach ((array) $selected_decorator['shippingMapping'] as $key => $value) {
            if (!$value['selected_shipping']) {
                $this->setMessage('Shipping must be selected for each shipping.');
                return false;
            }

            if ($value['three_p_account_number'] == "") {
                $this->setMessage('3P Account number must be entered for shipping.');
                return false;
            }

            // if ($value['carrier_id'] == "") {
            //     $this->setMessage('Carrier ID must be entered for shipping.');
            //     return false;
            // }

            // if ($value['method_id'] == "") {
            //     $this->setMessage('Method ID must be entered for shipping.');
            //     return false;
            // }
        }

        return true;
    }

    public function message()
    {
        return $this->customMessage ?? 'The :attribute is invalid.';
    }

    // Helper method to set a custom error message
    protected function setMessage($message)
    {
        $this->customMessage = $message;
    }
}

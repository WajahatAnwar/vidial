<?php

namespace App\Models\Punchout;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PomwGatewayClientRequest extends Model
{
    use HasFactory;

    protected $connection = 'punchout_conn';

    public static function genTable($requests)
{
    // Initialize the factory
    $factory = new TableElementsFactory();
    $factory->setLink('#popup', 'id', 'View');

    // Create the table instance
    $table = new Quantum\Table($factory);

    // Define headers for the table
    $table->addHeaders(['', 'Type', 'Uri', 'Date']);

    // Add model data to the table, formatting the created_at date
    $table->addModelData($requests, [
        'id',
        'type',
        'uri',
        'created_at|datetime_to_utc', // Ensure this transformation method exists
    ]);

    return $table;
}
}

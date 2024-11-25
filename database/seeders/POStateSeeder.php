<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class POStateSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $query = "insert into p_o_u_s_a_states (code,name) values ('AL','Alabama'),('AK','Alaska'),('AS','American Samoa'),('AZ','Arizona'),('AR','Arkansas'),('CA','California'),('CO','Colorado'),('CT','Connecticut'),('DE','Delaware'),('DC','District of Columbia'),('FM','Federated States of Micronesia'),('FL','Florida'),('GA','Georgia'),('GU','Guam'),('HI','Hawai'),('ID','Idaho'),('IL','Illinois'),('IN','Indiana'),('IA','Iowa'),('KS','Kansas'),('KY','Kentucky'),('LA','Louisiana'),('ME','Maine'),('MH','Marshall Islands'),('MD','Maryland'),('MA','Massachusetts'),('MI','Michigan'),('MN','Minnesota'),('MS','Mississippi'),('MO','Missouri'),('MT','Montana'),('NE','Nebraska'),('NV','Nevada'),('NH','New Hampshire'),('NJ','New Jersey'),('NM','New Mexico'),('NY','New York'),('NC','North Carolina'),('ND','North Dakota'),('MP','Northern Mariana Islands'),('OH','Ohio'),('OK','Oklahoma'),('OR','Oregon'),('PW','Palau'),('PA','Pennsylvania'),('PR','Puerto Rico'),('RI','Rhode Island'),('SC','South Carolina'),('SD','South Dakota'),('TN','Tennessee'),('TX','Texas'),('UT','Utah'),('VT','Vermont'),('VI','Virgin Islands'),('VA','Virginia'),('WA','Washington'),('WV','West Virginia'),('WI','Wisconsin'),('WY','Wyoming');";
        DB::connection('purchase_order_conn')->statement($query);
    }
}

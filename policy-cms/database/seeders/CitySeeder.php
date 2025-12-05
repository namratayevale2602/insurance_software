<?php

namespace Database\Seeders;

use App\Models\City;
use Illuminate\Database\Seeder;

class CitySeeder extends Seeder
{
    public function run()
    {
        $cities = [
            ['city_name' => 'Mumbai', 'pincode' => '400001', 'state' => 'Maharashtra'],
            ['city_name' => 'Delhi', 'pincode' => '110001', 'state' => 'Delhi'],
            ['city_name' => 'Bangalore', 'pincode' => '560001', 'state' => 'Karnataka'],
            ['city_name' => 'Chennai', 'pincode' => '600001', 'state' => 'Tamil Nadu'],
            ['city_name' => 'Kolkata', 'pincode' => '700001', 'state' => 'West Bengal'],
        ];

        foreach ($cities as $city) {
            City::create($city);
        }
    }
}
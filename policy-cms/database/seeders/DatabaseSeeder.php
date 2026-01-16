<?php



// namespace Database\Seeders;

// use Illuminate\Database\Seeder;
// use App\Models\Client;
// use App\Models\GicEntry;
// use App\Models\LicEntry;
// use App\Models\RtoEntry;
// use App\Models\BmdsEntry;
// use App\Models\MfEntry;
// use Faker\Factory as Faker;
// use Illuminate\Support\Facades\DB;
// use Carbon\Carbon;

// class DatabaseSeeder extends Seeder
// {
//     public function run()
//     {
//         $faker = Faker::create('en_IN');
        
//         // Clear existing data in correct order (child tables first)
//         DB::statement('SET FOREIGN_KEY_CHECKS=0');
        
//         GicEntry::truncate();
//         LicEntry::truncate();
//         RtoEntry::truncate();
//         BmdsEntry::truncate();
//         MfEntry::truncate();
//         Client::truncate();
//         DB::table('cities')->truncate();
//         DB::table('dropdown_options')->truncate();
        
//         DB::statement('SET FOREIGN_KEY_CHECKS=1');
        
//         // Seed cities first
//         $this->seedCities();
        
//         // Seed dropdown options
//         $this->seedDropdownOptions();
        
//         // Seed Clients (100 rows)
//         $this->seedClients($faker);
        
//         // Seed GIC Entries (70-80 rows)
//         $this->seedGicEntries($faker);
        
//         // Seed LIC Entries (70-80 rows)
//         $this->seedLicEntries($faker);
        
//         // Seed RTO Entries (70-80 rows)
//         $this->seedRtoEntries($faker);
        
//         // Seed BMDS Entries (70-80 rows)
//         $this->seedBmdsEntries($faker);
        
//         // Seed MF Entries (70-80 rows)
//         $this->seedMfEntries($faker);
//     }
    
//     private function seedCities()
//     {
//         $maharastraCities = [
//             ['city_name' => 'Mumbai', 'pincode' => '400001', 'state' => 'Maharashtra', 'country' => 'India'],
//             ['city_name' => 'Pune', 'pincode' => '411001', 'state' => 'Maharashtra', 'country' => 'India'],
//             ['city_name' => 'Nagpur', 'pincode' => '440001', 'state' => 'Maharashtra', 'country' => 'India'],
//             ['city_name' => 'Nashik', 'pincode' => '422001', 'state' => 'Maharashtra', 'country' => 'India'],
//             ['city_name' => 'Aurangabad', 'pincode' => '431001', 'state' => 'Maharashtra', 'country' => 'India'],
//             ['city_name' => 'Solapur', 'pincode' => '413001', 'state' => 'Maharashtra', 'country' => 'India'],
//             ['city_name' => 'Kolhapur', 'pincode' => '416001', 'state' => 'Maharashtra', 'country' => 'India'],
//             ['city_name' => 'Thane', 'pincode' => '400601', 'state' => 'Maharashtra', 'country' => 'India'],
//             ['city_name' => 'Navi Mumbai', 'pincode' => '400703', 'state' => 'Maharashtra', 'country' => 'India'],
//             ['city_name' => 'Kalyan', 'pincode' => '421301', 'state' => 'Maharashtra', 'country' => 'India'],
//         ];
        
//         // Other major Indian cities
//         $otherCities = [
//             ['city_name' => 'Delhi', 'pincode' => '110001', 'state' => 'Delhi', 'country' => 'India'],
//             ['city_name' => 'Bangalore', 'pincode' => '560001', 'state' => 'Karnataka', 'country' => 'India'],
//             ['city_name' => 'Hyderabad', 'pincode' => '500001', 'state' => 'Telangana', 'country' => 'India'],
//             ['city_name' => 'Chennai', 'pincode' => '600001', 'state' => 'Tamil Nadu', 'country' => 'India'],
//             ['city_name' => 'Kolkata', 'pincode' => '700001', 'state' => 'West Bengal', 'country' => 'India'],
//             ['city_name' => 'Ahmedabad', 'pincode' => '380001', 'state' => 'Gujarat', 'country' => 'India'],
//             ['city_name' => 'Jaipur', 'pincode' => '302001', 'state' => 'Rajasthan', 'country' => 'India'],
//             ['city_name' => 'Lucknow', 'pincode' => '226001', 'state' => 'Uttar Pradesh', 'country' => 'India'],
//             ['city_name' => 'Chandigarh', 'pincode' => '160001', 'state' => 'Chandigarh', 'country' => 'India'],
//             ['city_name' => 'Bhopal', 'pincode' => '462001', 'state' => 'Madhya Pradesh', 'country' => 'India'],
//         ];
        
//         $allCities = array_merge($maharastraCities, $otherCities);
        
//         foreach ($allCities as $city) {
//             DB::table('cities')->insertOrIgnore([
//                 'city_name' => $city['city_name'],
//                 'pincode' => $city['pincode'],
//                 'state' => $city['state'],
//                 'country' => $city['country'],
//                 'is_active' => true,
//                 'created_at' => now(),
//                 'updated_at' => now()
//             ]);
//         }
        
//         $this->command->info(count($allCities) . ' cities seeded successfully!');
//     }
    
//     private function seedDropdownOptions()
//     {
//         $displayOrder = 1;
        
//         $dropdownOptions = [
//             // Insurance query types (inquery_for)
//             ['category' => 'inquery_for', 'value' => 'Motor Insurance', 'description' => 'Vehicle insurance', 'display_order' => $displayOrder++],
//             ['category' => 'inquery_for', 'value' => 'Health Insurance', 'description' => 'Medical insurance', 'display_order' => $displayOrder++],
//             ['category' => 'inquery_for', 'value' => 'Life Insurance', 'description' => 'Life insurance policies', 'display_order' => $displayOrder++],
//             ['category' => 'inquery_for', 'value' => 'Property Insurance', 'description' => 'Home/property insurance', 'display_order' => $displayOrder++],
//             ['category' => 'inquery_for', 'value' => 'Travel Insurance', 'description' => 'Travel insurance', 'display_order' => $displayOrder++],
            
//             // Vehicle types
//             ['category' => 'vehicle_type', 'value' => 'Car', 'description' => 'Passenger car', 'display_order' => $displayOrder++],
//             ['category' => 'vehicle_type', 'value' => 'Bike', 'description' => 'Two-wheeler', 'display_order' => $displayOrder++],
//             ['category' => 'vehicle_type', 'value' => 'Commercial Vehicle', 'description' => 'Commercial vehicle', 'display_order' => $displayOrder++],
//             ['category' => 'vehicle_type', 'value' => 'Truck', 'description' => 'Goods carrier', 'display_order' => $displayOrder++],
//             ['category' => 'vehicle_type', 'value' => 'Bus', 'description' => 'Passenger bus', 'display_order' => $displayOrder++],
            
//             // Vehicle models (vehicle_id)
//             ['category' => 'vehicle_id', 'value' => 'Maruti Suzuki Swift', 'description' => '', 'display_order' => $displayOrder++],
//             ['category' => 'vehicle_id', 'value' => 'Hyundai i20', 'description' => '', 'display_order' => $displayOrder++],
//             ['category' => 'vehicle_id', 'value' => 'Honda City', 'description' => '', 'display_order' => $displayOrder++],
//             ['category' => 'vehicle_id', 'value' => 'Hero Splendor', 'description' => '', 'display_order' => $displayOrder++],
//             ['category' => 'vehicle_id', 'value' => 'Bajaj Pulsar', 'description' => '', 'display_order' => $displayOrder++],
//             ['category' => 'vehicle_id', 'value' => 'Toyota Innova', 'description' => '', 'display_order' => $displayOrder++],
//             ['category' => 'vehicle_id', 'value' => 'Mahindra Scorpio', 'description' => '', 'display_order' => $displayOrder++],
            
//             // Non-motor policy types
//             ['category' => 'nonmotor_policy_type_id', 'value' => 'Health Insurance', 'description' => '', 'display_order' => $displayOrder++],
//             ['category' => 'nonmotor_policy_type_id', 'value' => 'Travel Insurance', 'description' => '', 'display_order' => $displayOrder++],
//             ['category' => 'nonmotor_policy_type_id', 'value' => 'Home Insurance', 'description' => '', 'display_order' => $displayOrder++],
//             ['category' => 'nonmotor_policy_type_id', 'value' => 'Fire Insurance', 'description' => '', 'display_order' => $displayOrder++],
            
//             // Non-motor policy subtypes
//             ['category' => 'nonmotor_policy_subtype_id', 'value' => 'Individual Health', 'description' => '', 'display_order' => $displayOrder++],
//             ['category' => 'nonmotor_policy_subtype_id', 'value' => 'Family Floater', 'description' => '', 'display_order' => $displayOrder++],
//             ['category' => 'nonmotor_policy_subtype_id', 'value' => 'Senior Citizen', 'description' => '', 'display_order' => $displayOrder++],
//             ['category' => 'nonmotor_policy_subtype_id', 'value' => 'Critical Illness', 'description' => '', 'display_order' => $displayOrder++],
            
//             // Insurance companies
//             ['category' => 'insurance_company_id', 'value' => 'HDFC Ergo', 'description' => '', 'display_order' => $displayOrder++],
//             ['category' => 'insurance_company_id', 'value' => 'ICICI Lombard', 'description' => '', 'display_order' => $displayOrder++],
//             ['category' => 'insurance_company_id', 'value' => 'Bajaj Allianz', 'description' => '', 'display_order' => $displayOrder++],
//             ['category' => 'insurance_company_id', 'value' => 'New India Assurance', 'description' => '', 'display_order' => $displayOrder++],
//             ['category' => 'insurance_company_id', 'value' => 'TATA AIG', 'description' => '', 'display_order' => $displayOrder++],
//             ['category' => 'insurance_company_id', 'value' => 'SBI General', 'description' => '', 'display_order' => $displayOrder++],
//             ['category' => 'insurance_company_id', 'value' => 'Reliance General', 'description' => '', 'display_order' => $displayOrder++],
//             ['category' => 'insurance_company_id', 'value' => 'United India Insurance', 'description' => '', 'display_order' => $displayOrder++],
            
//             // Adviser names
//             ['category' => 'adviser_name_id', 'value' => 'Rajesh Kumar', 'description' => '', 'display_order' => $displayOrder++],
//             ['category' => 'adviser_name_id', 'value' => 'Priya Sharma', 'description' => '', 'display_order' => $displayOrder++],
//             ['category' => 'adviser_name_id', 'value' => 'Amit Patel', 'description' => '', 'display_order' => $displayOrder++],
//             ['category' => 'adviser_name_id', 'value' => 'Sneha Desai', 'description' => '', 'display_order' => $displayOrder++],
//             ['category' => 'adviser_name_id', 'value' => 'Vikram Singh', 'description' => '', 'display_order' => $displayOrder++],
//             ['category' => 'adviser_name_id', 'value' => 'Rohan Mehta', 'description' => '', 'display_order' => $displayOrder++],
            
//             // Banks
//             ['category' => 'bank_name_id', 'value' => 'State Bank of India', 'description' => '', 'display_order' => $displayOrder++],
//             ['category' => 'bank_name_id', 'value' => 'HDFC Bank', 'description' => '', 'display_order' => $displayOrder++],
//             ['category' => 'bank_name_id', 'value' => 'ICICI Bank', 'description' => '', 'display_order' => $displayOrder++],
//             ['category' => 'bank_name_id', 'value' => 'Axis Bank', 'description' => '', 'display_order' => $displayOrder++],
//             ['category' => 'bank_name_id', 'value' => 'Bank of Baroda', 'description' => '', 'display_order' => $displayOrder++],
//             ['category' => 'bank_name_id', 'value' => 'Punjab National Bank', 'description' => '', 'display_order' => $displayOrder++],
            
//             // Bank branches (Mumbai)
//             ['category' => 'branch_name_id', 'value' => 'Fort Branch, Mumbai', 'description' => '', 'display_order' => $displayOrder++],
//             ['category' => 'branch_name_id', 'value' => 'Andheri Branch, Mumbai', 'description' => '', 'display_order' => $displayOrder++],
//             ['category' => 'branch_name_id', 'value' => 'Bandra Branch, Mumbai', 'description' => '', 'display_order' => $displayOrder++],
//             ['category' => 'branch_name_id', 'value' => 'Churchgate Branch, Mumbai', 'description' => '', 'display_order' => $displayOrder++],
//             ['category' => 'branch_name_id', 'value' => 'Dadar Branch, Mumbai', 'description' => '', 'display_order' => $displayOrder++],
            
//             // Agency names
//             ['category' => 'agency_id', 'value' => 'LIC Agency - Mumbai Central', 'description' => '', 'display_order' => $displayOrder++],
//             ['category' => 'agency_id', 'value' => 'LIC Agency - Pune', 'description' => '', 'display_order' => $displayOrder++],
//             ['category' => 'agency_id', 'value' => 'Max Life Agency', 'description' => '', 'display_order' => $displayOrder++],
//             ['category' => 'agency_id', 'value' => 'HDFC Life Agency', 'description' => '', 'display_order' => $displayOrder++],
//             ['category' => 'agency_id', 'value' => 'SBI Life Agency', 'description' => '', 'display_order' => $displayOrder++],
            
//             // Collection job types
//             ['category' => 'collection_job_type_id', 'value' => 'Premium Collection', 'description' => '', 'display_order' => $displayOrder++],
//             ['category' => 'collection_job_type_id', 'value' => 'Renewal Premium', 'description' => '', 'display_order' => $displayOrder++],
//             ['category' => 'collection_job_type_id', 'value' => 'New Policy Payment', 'description' => '', 'display_order' => $displayOrder++],
            
//             // Servicing job types
//             ['category' => 'servicing_type_job_id', 'value' => 'Policy Change', 'description' => '', 'display_order' => $displayOrder++],
//             ['category' => 'servicing_type_job_id', 'value' => 'Nomination Change', 'description' => '', 'display_order' => $displayOrder++],
//             ['category' => 'servicing_type_job_id', 'value' => 'Address Change', 'description' => '', 'display_order' => $displayOrder++],
//             ['category' => 'servicing_type_job_id', 'value' => 'Loan Against Policy', 'description' => '', 'display_order' => $displayOrder++],
//             ['category' => 'servicing_type_job_id', 'value' => 'Maturity Claim', 'description' => '', 'display_order' => $displayOrder++],
            
//             // RTO - NT Type Work
//             ['category' => 'nt_type_work_id', 'value' => 'New Registration', 'description' => '', 'display_order' => $displayOrder++],
//             ['category' => 'nt_type_work_id', 'value' => 'Transfer of Ownership', 'description' => '', 'display_order' => $displayOrder++],
//             ['category' => 'nt_type_work_id', 'value' => 'Duplicate RC', 'description' => '', 'display_order' => $displayOrder++],
//             ['category' => 'nt_type_work_id', 'value' => 'Hypothecation', 'description' => '', 'display_order' => $displayOrder++],
            
//             // RTO - TR Type Work
//             ['category' => 'tr_type_work_id', 'value' => 'New Tax Payment', 'description' => '', 'display_order' => $displayOrder++],
//             ['category' => 'tr_type_work_id', 'value' => 'Tax Renewal', 'description' => '', 'display_order' => $displayOrder++],
//             ['category' => 'tr_type_work_id', 'value' => 'Tax Refund', 'description' => '', 'display_order' => $displayOrder++],
            
//             // RTO - DL Type Work
//             ['category' => 'dl_type_work_id', 'value' => 'New Driving License', 'description' => '', 'display_order' => $displayOrder++],
//             ['category' => 'dl_type_work_id', 'value' => 'License Renewal', 'description' => '', 'display_order' => $displayOrder++],
//             ['category' => 'dl_type_work_id', 'value' => 'Duplicate DL', 'description' => '', 'display_order' => $displayOrder++],
//             ['category' => 'dl_type_work_id', 'value' => 'International Driving Permit', 'description' => '', 'display_order' => $displayOrder++],
            
//             // Vehicle classes
//             ['category' => 'vehicle_class_id', 'value' => 'LMV (Car)', 'description' => 'Light Motor Vehicle', 'display_order' => $displayOrder++],
//             ['category' => 'vehicle_class_id', 'value' => 'MCWG (Bike)', 'description' => 'Motor Cycle With Gear', 'display_order' => $displayOrder++],
//             ['category' => 'vehicle_class_id', 'value' => 'HMV', 'description' => 'Heavy Motor Vehicle', 'display_order' => $displayOrder++],
//             ['category' => 'vehicle_class_id', 'value' => 'LMV-NT', 'description' => 'Light Motor Vehicle for Non-Transport', 'display_order' => $displayOrder++],
            
//             // BMDS - Test Places
//             ['category' => 'test_place_id', 'value' => 'Andheri RTO', 'description' => '', 'display_order' => $displayOrder++],
//             ['category' => 'test_place_id', 'value' => 'Wadala RTO', 'description' => '', 'display_order' => $displayOrder++],
//             ['category' => 'test_place_id', 'value' => 'Tardeo RTO', 'description' => '', 'display_order' => $displayOrder++],
//             ['category' => 'test_place_id', 'value' => 'Borivali RTO', 'description' => '', 'display_order' => $displayOrder++],
            
//             // BMDS - Class of Vehicle
//             ['category' => 'class_of_vehicle_id', 'value' => 'LMV', 'description' => 'Light Motor Vehicle', 'display_order' => $displayOrder++],
//             ['category' => 'class_of_vehicle_id', 'value' => 'MCWG', 'description' => 'Motor Cycle With Gear', 'display_order' => $displayOrder++],
//             ['category' => 'class_of_vehicle_id', 'value' => 'MCWOG', 'description' => 'Motor Cycle Without Gear', 'display_order' => $displayOrder++],
//             ['category' => 'class_of_vehicle_id', 'value' => 'HGMV', 'description' => 'Heavy Goods Motor Vehicle', 'display_order' => $displayOrder++],
            
//             // BMDS - ADM Car Type
//             ['category' => 'adm_car_type_id', 'value' => 'Maruti Swift', 'description' => '', 'display_order' => $displayOrder++],
//             ['category' => 'adm_car_type_id', 'value' => 'Hyundai i10', 'description' => '', 'display_order' => $displayOrder++],
//             ['category' => 'adm_car_type_id', 'value' => 'Tata Indica', 'description' => '', 'display_order' => $displayOrder++],
//             ['category' => 'adm_car_type_id', 'value' => 'Mahindra Verito', 'description' => '', 'display_order' => $displayOrder++],
//         ];
        
//         foreach ($dropdownOptions as $option) {
//             DB::table('dropdown_options')->insertOrIgnore([
//                 'category' => $option['category'],
//                 'value' => $option['value'],
//                 'description' => $option['description'] ?? null,
//                 'display_order' => $option['display_order'],
//                 'is_active' => true,
//                 'created_at' => now(),
//                 'updated_at' => now()
//             ]);
//         }
        
//         $this->command->info(count($dropdownOptions) . ' dropdown options seeded successfully!');
//     }
    
//     private function seedClients($faker)
//     {
//         $clientTypes = ['INDIVIDUAL', 'CORPORATE'];
//         $tags = ['A', 'B', 'C'];
        
//         // Get IDs for foreign keys
//         $cityIds = DB::table('cities')->pluck('id')->toArray();
//         $inquiryOptionIds = DB::table('dropdown_options')
//             ->where('category', 'inquery_for')
//             ->pluck('id')
//             ->toArray();
        
//         for ($i = 1; $i <= 100; $i++) {
//             $clientType = $faker->randomElement($clientTypes);
//             $birthDate = $faker->optional(0.8)->date('Y-m-d', '-20 years');
//             $age = $birthDate ? Carbon::parse($birthDate)->age : null;
            
//             Client::create([
//                 'sr_no' => $i,
//                 'date' => $faker->dateTimeBetween('-1 year', 'now')->format('Y-m-d'),
//                 'time' => $faker->time('H:i:s'),
//                 'contact' => '9' . $faker->numerify('##########'),
//                 'alt_contact' => $faker->optional(0.5)->numerify('022########'),
//                 'client_type' => $clientType,
//                 'client_name' => $clientType === 'CORPORATE' 
//                     ? $faker->company 
//                     : $faker->name(),
//                 'tag' => $faker->randomElement($tags),
//                 'city_id' => $faker->randomElement($cityIds),
//                 'inquery_for' => $faker->randomElement($inquiryOptionIds),
//                 'birth_date' => $birthDate,
//                 'age' => $age,
//                 'anniversary_dt' => $faker->optional(0.3)->date('Y-m-d'),
//                 'aadhar_no' => $faker->optional(0.7)->numerify('############'),
//                 'pan_no' => $faker->optional(0.6)->regexify('[A-Z]{5}[0-9]{4}[A-Z]{1}'),
//                 'gst_no' => $clientType === 'CORPORATE' 
//                     ? $faker->optional(0.8)->regexify('\\d{2}[A-Z]{5}\\d{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}') 
//                     : null,
//                 'email' => $faker->optional(0.8)->email(),
//                 'reference' => $faker->optional(0.4)->name(),
//                 'created_at' => now(),
//                 'updated_at' => now()
//             ]);
//         }
        
//         $this->command->info('100 clients seeded successfully!');
//     }
    
//     private function seedGicEntries($faker)
//     {
//         $clientIds = Client::pluck('id')->toArray();
//         $policyTypes = ['MOTOR', 'NONMOTOR'];
//         $motorSubtypes = ['A', 'B', 'SAOD', 'ENDST'];
//         $policyDurations = ['1YR', 'LONG', 'SHORT'];
//         $paymentModes = ['CASH', 'CHEQUE', 'PAYMENT LINK', 'ONLINE', 'RTGS/NEFT'];
//         $formStatuses = ['PENDING', 'COMPLETE', 'CDA', 'CANCELLED', 'OTHER'];
        
//         // Get IDs for foreign keys
//         $vehicleTypeIds = DB::table('dropdown_options')
//             ->where('category', 'vehicle_type')
//             ->pluck('id')
//             ->toArray();
            
//         $vehicleModelIds = DB::table('dropdown_options')
//             ->where('category', 'vehicle_id')
//             ->pluck('id')
//             ->toArray();
            
//         $nonMotorTypeIds = DB::table('dropdown_options')
//             ->where('category', 'nonmotor_policy_type_id')
//             ->pluck('id')
//             ->toArray();
            
//         $nonMotorSubtypeIds = DB::table('dropdown_options')
//             ->where('category', 'nonmotor_policy_subtype_id')
//             ->pluck('id')
//             ->toArray();
            
//         $adviserIds = DB::table('dropdown_options')
//             ->where('category', 'adviser_name_id')
//             ->pluck('id')
//             ->toArray();
            
//         $companyIds = DB::table('dropdown_options')
//             ->where('category', 'insurance_company_id')
//             ->pluck('id')
//             ->toArray();
            
//         $bankIds = DB::table('dropdown_options')
//             ->where('category', 'bank_name_id')
//             ->pluck('id')
//             ->toArray();
            
//         $branchIds = DB::table('dropdown_options')
//             ->where('category', 'branch_name_id')
//             ->pluck('id')
//             ->toArray();
        
//         $currentYear = date('Y');
//         $startDate = Carbon::create($currentYear - 1, 4, 1);
//         $endDate = Carbon::create($currentYear, 3, 31);
        
//         $regNumCounter = 1;
        
//         for ($i = 0; $i < 75; $i++) {
//             $date = $faker->dateTimeBetween($startDate, $endDate);
//             $startDatePolicy = $date;
//             $endDatePolicy = Carbon::instance($date)->addYear();
            
//             $premiumAmt = $faker->randomFloat(2, 2000, 50000);
//             $advAmt = $faker->randomFloat(2, 500, $premiumAmt);
//             $balAmt = $premiumAmt - $advAmt;
//             $recovAmt = $faker->optional(0.6)->randomFloat(2, 0, $balAmt);
            
//             GicEntry::create([
//                 'reg_num' => $regNumCounter++,
//                 'client_id' => $faker->randomElement($clientIds),
//                 'time' => $faker->time('H:i:s'),
//                 'date' => $date->format('Y-m-d'),
//                 'policy_type' => $policyType = $faker->randomElement($policyTypes),
//                 'motor_subtype' => $policyType === 'MOTOR' ? $faker->randomElement($motorSubtypes) : null,
//                 'mv_num' => $policyType === 'MOTOR' ? $faker->regexify('[A-Z]{2}[0-9]{2}[A-Z]{2}[0-9]{4}') : null,
//                 'vehicle_type_id' => $policyType === 'MOTOR' ? $faker->randomElement($vehicleTypeIds) : null,
//                 'vehicle_id' => $policyType === 'MOTOR' ? $faker->randomElement($vehicleModelIds) : null,
//                 'nonmotor_policy_type_id' => $policyType === 'NONMOTOR' ? $faker->randomElement($nonMotorTypeIds) : null,
//                 'nonmotor_policy_subtype_id' => $policyType === 'NONMOTOR' ? $faker->randomElement($nonMotorSubtypeIds) : null,
//                 'premium_amt' => $premiumAmt,
//                 'adv_amt' => $advAmt,
//                 'bal_amt' => $balAmt,
//                 'recov_amt' => $recovAmt ?? 0,
//                 'adviser_name_id' => $faker->randomElement($adviserIds),
//                 'policy_num' => $faker->regexify('POL/[0-9]{6}/[0-9]{4}'),
//                 'insurance_company_id' => $faker->randomElement($companyIds),
//                 'policy_duration' => $faker->randomElement($policyDurations),
//                 'start_dt' => $startDatePolicy->format('Y-m-d'),
//                 'end_dt' => $endDatePolicy->format('Y-m-d'),
//                 'pay_mode' => $payMode = $faker->randomElement($paymentModes),
//                 'cheque_num' => $payMode === 'CHEQUE' ? $faker->numerify('##########') : null,
//                 'bank_name_id' => $payMode === 'CHEQUE' ? $faker->randomElement($bankIds) : null,
//                 'branch_name_id' => $payMode === 'CHEQUE' ? $faker->randomElement($branchIds) : null,
//                 'cheque_dt' => $payMode === 'CHEQUE' ? $faker->dateTimeBetween('-1 month', '+1 month')->format('Y-m-d') : null,
//                 'responsibility' => $faker->optional(0.7)->sentence(),
//                 'remark' => $faker->optional(0.5)->text(100),
//                 'form_status' => $faker->randomElement($formStatuses),
//                 'created_at' => now(),
//                 'updated_at' => now()
//             ]);
//         }
        
//         $this->command->info('75 GIC entries seeded successfully!');
//     }
    
//     private function seedLicEntries($faker)
//     {
//         $clientIds = Client::pluck('id')->toArray();
//         $jobTypes = ['COLLECTION', 'SERVICING_TASK'];
//         $paymentModes = ['CASH', 'CHEQUE', 'PAYMENT LINK', 'ONLINE', 'RTGS/NEFT'];
//         $formStatuses = ['PENDING', 'COMPLETE', 'CDA', 'CANCELLED', 'OTHER'];
        
//         // Get IDs for foreign keys
//         $agencyIds = DB::table('dropdown_options')
//             ->where('category', 'agency_id')
//             ->pluck('id')
//             ->toArray();
            
//         $collectionJobIds = DB::table('dropdown_options')
//             ->where('category', 'collection_job_type_id')
//             ->pluck('id')
//             ->toArray();
            
//         $servicingJobIds = DB::table('dropdown_options')
//             ->where('category', 'servicing_type_job_id')
//             ->pluck('id')
//             ->toArray();
            
//         $bankIds = DB::table('dropdown_options')
//             ->where('category', 'bank_name_id')
//             ->pluck('id')
//             ->toArray();
            
//         $branchIds = DB::table('dropdown_options')
//             ->where('category', 'branch_name_id')
//             ->pluck('id')
//             ->toArray();
        
//         $regNumCounter = 1;
        
//         for ($i = 0; $i < 80; $i++) {
//             $jobType = $faker->randomElement($jobTypes);
//             $policyNums = [];
//             $numPolicies = $faker->numberBetween(1, 3);
            
//             for ($j = 0; $j < $numPolicies; $j++) {
//                 $policyNums[] = $faker->regexify('LIC/[0-9]{8}/[0-9]{4}');
//             }
            
//             LicEntry::create([
//                 'reg_num' => $regNumCounter++,
//                 'client_id' => $faker->randomElement($clientIds),
//                 'date' => $faker->dateTimeBetween('-1 year', 'now')->format('Y-m-d'),
//                 'time' => $faker->time('H:i:s'),
//                 'job_type' => $jobType,
//                 'agency_id' => $faker->randomElement($agencyIds),
//                 'collection_job_type_id' => $jobType === 'COLLECTION' ? $faker->randomElement($collectionJobIds) : null,
//                 'no_of_policy' => $jobType === 'COLLECTION' ? $numPolicies : 0,
//                 'policy_num' => $jobType === 'COLLECTION' ? json_encode($policyNums) : null,
//                 'premium_amt' => $faker->randomFloat(2, 5000, 100000),
//                 'pay_mode' => $payMode = $faker->randomElement($paymentModes),
//                 'cheque_num' => $payMode === 'CHEQUE' ? $faker->numerify('##########') : null,
//                 'bank_name_id' => $payMode === 'CHEQUE' ? $faker->randomElement($bankIds) : null,
//                 'branch_name_id' => $payMode === 'CHEQUE' ? $faker->randomElement($branchIds) : null,
//                 'cheque_dt' => $payMode === 'CHEQUE' ? $faker->dateTimeBetween('-1 month', '+1 month')->format('Y-m-d') : null,
//                 'servicing_type_job_id' => $jobType === 'SERVICING_TASK' ? $faker->randomElement($servicingJobIds) : null,
//                 'servicing_policy_no' => $jobType === 'SERVICING_TASK' ? $faker->regexify('LIC/[0-9]{8}/[0-9]{4}') : null,
//                 'remark' => $faker->optional(0.6)->text(100),
//                 'form_status' => $faker->randomElement($formStatuses),
//                 'created_at' => now(),
//                 'updated_at' => now()
//             ]);
//         }
        
//         $this->command->info('80 LIC entries seeded successfully!');
//     }
    
//     private function seedRtoEntries($faker)
//     {
//         $clientIds = Client::pluck('id')->toArray();
//         $categories = ['NT', 'TR', 'DL'];
//         $formStatuses = ['PENDING', 'COMPLETE'];
        
//         // Get IDs for foreign keys
//         $ntTypeIds = DB::table('dropdown_options')
//             ->where('category', 'nt_type_work_id')
//             ->pluck('id')
//             ->toArray();
            
//         $trTypeIds = DB::table('dropdown_options')
//             ->where('category', 'tr_type_work_id')
//             ->pluck('id')
//             ->toArray();
            
//         $dlTypeIds = DB::table('dropdown_options')
//             ->where('category', 'dl_type_work_id')
//             ->pluck('id')
//             ->toArray();
            
//         $vehicleClassIds = DB::table('dropdown_options')
//             ->where('category', 'vehicle_class_id')
//             ->pluck('id')
//             ->toArray();
        
//         $regNumCounter = 1;
        
//         for ($i = 0; $i < 70; $i++) {
//             $category = $faker->randomElement($categories);
            
//             $premiumAmt = $faker->randomFloat(2, 1000, 20000);
//             $advAmt = $faker->randomFloat(2, 500, $premiumAmt);
//             $recovAmt = $faker->randomFloat(2, $advAmt, $premiumAmt);
//             $govFee = $faker->randomFloat(2, 500, 5000);
//             $expenseAmt = $faker->randomFloat(2, 100, 2000);
//             $newAmt = $premiumAmt + $govFee + $expenseAmt - $recovAmt;
            
//             RtoEntry::create([
//                 'reg_num' => $regNumCounter++,
//                 'client_id' => $faker->randomElement($clientIds),
//                 'date' => $faker->dateTimeBetween('-6 months', 'now')->format('Y-m-d'),
//                 'time' => $faker->time('H:i:s'),
//                 'category' => $category,
//                 'nt_type_work_id' => $category === 'NT' ? $faker->randomElement($ntTypeIds) : null,
//                 'tr_type_work_id' => $category === 'TR' ? $faker->randomElement($trTypeIds) : null,
//                 'dl_type_work_id' => $category === 'DL' ? $faker->randomElement($dlTypeIds) : null,
//                 'mv_num' => $category !== 'DL' ? $faker->regexify('[A-Z]{2}[0-9]{2}[A-Z]{2}[0-9]{4}') : null,
//                 'vehicle_class_id' => $category !== 'DL' ? $faker->randomElement($vehicleClassIds) : null,
//                 'premium_amt' => $premiumAmt,
//                 'adv_amt' => $advAmt,
//                 'recov_amt' => $recovAmt,
//                 'gov_fee' => $govFee,
//                 'cash_in_hand' => $faker->randomFloat(2, 0, 10000),
//                 'expense_amt' => $expenseAmt,
//                 'new_amt' => $newAmt,
//                 'adviser_name' => $faker->optional(0.7)->name(),
//                 'responsibility' => $faker->optional(0.8)->sentence(),
//                 'remark' => $faker->optional(0.5)->text(100),
//                 'form_status' => $faker->randomElement($formStatuses),
//                 'created_at' => now(),
//                 'updated_at' => now()
//             ]);
//         }
        
//         $this->command->info('70 RTO entries seeded successfully!');
//     }
    
//     private function seedBmdsEntries($faker)
//     {
//         $clientIds = Client::pluck('id')->toArray();
//         $bmdsTypes = ['LLR', 'DL', 'ADM'];
//         $llrSubTypes = ['FRESH', 'EXEMPTED'];
//         $dlSubTypes = ['FRESH', 'ENDST', 'REVALID'];
//         $formStatuses = ['PENDING', 'COMPLETE'];
        
//         // Get IDs for foreign keys
//         $testPlaceIds = DB::table('dropdown_options')
//             ->where('category', 'test_place_id')
//             ->pluck('id')
//             ->toArray();
            
//         $vehicleClassIds = DB::table('dropdown_options')
//             ->where('category', 'class_of_vehicle_id')
//             ->pluck('id')
//             ->toArray();
            
//         $admCarTypeIds = DB::table('dropdown_options')
//             ->where('category', 'adm_car_type_id')
//             ->pluck('id')
//             ->toArray();
        
//         $regNumCounter = 1;
        
//         for ($i = 0; $i < 75; $i++) {
//             $bmdsType = $faker->randomElement($bmdsTypes);
            
//             $quotationAmt = $faker->randomFloat(2, 1000, 15000);
//             $advAmt = $faker->randomFloat(2, 500, $quotationAmt);
//             $excessAmt = $faker->optional(0.3)->randomFloat(2, 0, 2000);
//             $recovAmt = $faker->randomFloat(2, $advAmt, $quotationAmt + ($excessAmt ?? 0));
            
//             BmdsEntry::create([
//                 'reg_num' => $regNumCounter++,
//                 'client_id' => $faker->randomElement($clientIds),
//                 'date' => $faker->dateTimeBetween('-1 year', 'now')->format('Y-m-d'),
//                 'time' => $faker->time('H:i:s'),
//                 'bmds_type' => $bmdsType,
//                 'llr_sub_type' => $bmdsType === 'LLR' ? $faker->randomElement($llrSubTypes) : null,
//                 'dl_sub_type' => $bmdsType === 'DL' ? $faker->randomElement($dlSubTypes) : null,
//                 'test_place_id' => $faker->randomElement($testPlaceIds),
//                 'sr_num' => $faker->optional(0.8)->numerify('SR####'),
//                 'test_date' => $faker->dateTimeBetween('+1 week', '+1 month')->format('Y-m-d'),
//                 'class_of_vehicle_id' => $bmdsType !== 'ADM' ? $faker->randomElement($vehicleClassIds) : null,
//                 'no_of_class' => $bmdsType === 'DL' ? $faker->randomElement(['1', '2', '3']) : null,
//                 'start_time' => $faker->optional(0.7)->time('H:i'),
//                 'end_time' => $faker->optional(0.7)->time('H:i'),
//                 'start_dt' => $faker->optional(0.6)->dateTimeBetween('+1 week', '+2 weeks')->format('Y-m-d'),
//                 'end_dt' => $faker->optional(0.6)->dateTimeBetween('+3 weeks', '+1 month')->format('Y-m-d'),
//                 'adm_car_type_id' => $bmdsType === 'ADM' ? $faker->randomElement($admCarTypeIds) : null,
//                 'km_ride' => $bmdsType === 'ADM' ? $faker->randomElement(['5KM', '10KM']) : null,
//                 'quotation_amt' => $quotationAmt,
//                 'adv_amt' => $advAmt,
//                 'excess_amt' => $excessAmt ?? 0,
//                 'recov_amt' => $recovAmt,
//                 'responsibility' => $faker->optional(0.8)->sentence(),
//                 'remark' => $faker->optional(0.5)->text(100),
//                 'form_status' => $faker->randomElement($formStatuses),
//                 'created_at' => now(),
//                 'updated_at' => now()
//             ]);
//         }
        
//         $this->command->info('75 BMDS entries seeded successfully!');
//     }
    
//     private function seedMfEntries($faker)
//     {
//         $clientIds = Client::pluck('id')->toArray();
//         $mfTypes = ['MF', 'INSURANCE'];
//         $mfOptions = ['SIP', 'SWP', 'LUMSUM'];
//         $insuranceOptions = ['LIC', 'GIC'];
//         $formStatuses = ['PENDING', 'COMPLETE'];
        
//         $regNumCounter = 1;
        
//         for ($i = 0; $i < 70; $i++) {
//             $mfType = $faker->randomElement($mfTypes);
            
//             MfEntry::create([
//                 'reg_num' => $regNumCounter++,
//                 'client_id' => $faker->randomElement($clientIds),
//                 'date' => $faker->dateTimeBetween('-1 year', 'now')->format('Y-m-d'),
//                 'time' => $faker->time('H:i:s'),
//                 'mf_type' => $mfType,
//                 'mf_option' => $mfType === 'MF' ? $faker->randomElement($mfOptions) : null,
//                 'insurance_option' => $mfType === 'INSURANCE' ? $faker->randomElement($insuranceOptions) : null,
//                 'amt' => $faker->randomFloat(2, 5000, 500000),
//                 'day_of_month' => $faker->optional(0.6)->numberBetween(1, 28),
//                 'deadline' => $faker->optional(0.7)->dateTimeBetween('+1 week', '+1 month')->format('Y-m-d'),
//                 'referance' => $faker->optional(0.4)->name(),
//                 'remark' => $faker->optional(0.5)->text(100),
//                 'form_status' => $faker->randomElement($formStatuses),
//                 'created_at' => now(),
//                 'updated_at' => now()
//             ]);
//         }
        
//         $this->command->info('70 MF entries seeded successfully!');
//     }
// }


namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Client;
use App\Models\GicEntry;
use App\Models\LicEntry;
use App\Models\RtoEntry;
use App\Models\BmdsEntry;
use App\Models\MfEntry;
use Faker\Factory as Faker;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DatabaseSeeder extends Seeder
{
    public function run()
    {
        $faker = Faker::create('en_IN');
        
        // Clear existing data in correct order (child tables first)
        DB::statement('SET FOREIGN_KEY_CHECKS=0');
        
        GicEntry::truncate();
        LicEntry::truncate();
        RtoEntry::truncate();
        BmdsEntry::truncate();
        MfEntry::truncate();
        Client::truncate();
        DB::table('cities')->truncate();
        DB::table('dropdown_options')->truncate();
        
        DB::statement('SET FOREIGN_KEY_CHECKS=1');
        
        // Seed cities first
        $this->seedCities();
        
        // Seed dropdown options
        $this->seedDropdownOptions();
        
        // Seed Clients (100 rows)
        $this->seedClients($faker);
        
        // Seed GIC Entries (70-80 rows)
        $this->seedGicEntries($faker);
        
        // Seed LIC Entries (70-80 rows)
        $this->seedLicEntries($faker);
        
        // Seed RTO Entries (70-80 rows)
        $this->seedRtoEntries($faker);
        
        // Seed BMDS Entries (70-80 rows)
        $this->seedBmdsEntries($faker);
        
        // Seed MF Entries (70-80 rows)
        $this->seedMfEntries($faker);
    }
    
    private function seedCities()
    {
        $maharastraCities = [
            ['city_name' => 'Mumbai', 'pincode' => '400001', 'state' => 'Maharashtra', 'country' => 'India'],
            ['city_name' => 'Pune', 'pincode' => '411001', 'state' => 'Maharashtra', 'country' => 'India'],
            ['city_name' => 'Nagpur', 'pincode' => '440001', 'state' => 'Maharashtra', 'country' => 'India'],
            ['city_name' => 'Nashik', 'pincode' => '422001', 'state' => 'Maharashtra', 'country' => 'India'],
            ['city_name' => 'Aurangabad', 'pincode' => '431001', 'state' => 'Maharashtra', 'country' => 'India'],
            ['city_name' => 'Solapur', 'pincode' => '413001', 'state' => 'Maharashtra', 'country' => 'India'],
            ['city_name' => 'Kolhapur', 'pincode' => '416001', 'state' => 'Maharashtra', 'country' => 'India'],
            ['city_name' => 'Thane', 'pincode' => '400601', 'state' => 'Maharashtra', 'country' => 'India'],
            ['city_name' => 'Navi Mumbai', 'pincode' => '400703', 'state' => 'Maharashtra', 'country' => 'India'],
            ['city_name' => 'Kalyan', 'pincode' => '421301', 'state' => 'Maharashtra', 'country' => 'India'],
        ];
        
        // Other major Indian cities
        $otherCities = [
            ['city_name' => 'Delhi', 'pincode' => '110001', 'state' => 'Delhi', 'country' => 'India'],
            ['city_name' => 'Bangalore', 'pincode' => '560001', 'state' => 'Karnataka', 'country' => 'India'],
            ['city_name' => 'Hyderabad', 'pincode' => '500001', 'state' => 'Telangana', 'country' => 'India'],
            ['city_name' => 'Chennai', 'pincode' => '600001', 'state' => 'Tamil Nadu', 'country' => 'India'],
            ['city_name' => 'Kolkata', 'pincode' => '700001', 'state' => 'West Bengal', 'country' => 'India'],
            ['city_name' => 'Ahmedabad', 'pincode' => '380001', 'state' => 'Gujarat', 'country' => 'India'],
            ['city_name' => 'Jaipur', 'pincode' => '302001', 'state' => 'Rajasthan', 'country' => 'India'],
            ['city_name' => 'Lucknow', 'pincode' => '226001', 'state' => 'Uttar Pradesh', 'country' => 'India'],
            ['city_name' => 'Chandigarh', 'pincode' => '160001', 'state' => 'Chandigarh', 'country' => 'India'],
            ['city_name' => 'Bhopal', 'pincode' => '462001', 'state' => 'Madhya Pradesh', 'country' => 'India'],
        ];
        
        $allCities = array_merge($maharastraCities, $otherCities);
        
        foreach ($allCities as $city) {
            DB::table('cities')->insertOrIgnore([
                'city_name' => $city['city_name'],
                'pincode' => $city['pincode'],
                'state' => $city['state'],
                'country' => $city['country'],
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now()
            ]);
        }
        
        $this->command->info(count($allCities) . ' cities seeded successfully!');
    }
    
    private function seedDropdownOptions()
    {
        $displayOrder = 1;
        
        $dropdownOptions = [
            // Insurance query types (inquery_for)
            ['category' => 'inquery_for', 'value' => 'Motor Insurance', 'description' => 'Vehicle insurance', 'display_order' => $displayOrder++],
            ['category' => 'inquery_for', 'value' => 'Health Insurance', 'description' => 'Medical insurance', 'display_order' => $displayOrder++],
            ['category' => 'inquery_for', 'value' => 'Life Insurance', 'description' => 'Life insurance policies', 'display_order' => $displayOrder++],
            ['category' => 'inquery_for', 'value' => 'Property Insurance', 'description' => 'Home/property insurance', 'display_order' => $displayOrder++],
            ['category' => 'inquery_for', 'value' => 'Travel Insurance', 'description' => 'Travel insurance', 'display_order' => $displayOrder++],
            
            // Vehicle types
            ['category' => 'vehicle_type', 'value' => 'Car', 'description' => 'Passenger car', 'display_order' => $displayOrder++],
            ['category' => 'vehicle_type', 'value' => 'Bike', 'description' => 'Two-wheeler', 'display_order' => $displayOrder++],
            ['category' => 'vehicle_type', 'value' => 'Commercial Vehicle', 'description' => 'Commercial vehicle', 'display_order' => $displayOrder++],
            ['category' => 'vehicle_type', 'value' => 'Truck', 'description' => 'Goods carrier', 'display_order' => $displayOrder++],
            ['category' => 'vehicle_type', 'value' => 'Bus', 'description' => 'Passenger bus', 'display_order' => $displayOrder++],
            
            // Vehicle models (vehicle_id)
            ['category' => 'vehicle_id', 'value' => 'Maruti Suzuki Swift', 'description' => '', 'display_order' => $displayOrder++],
            ['category' => 'vehicle_id', 'value' => 'Hyundai i20', 'description' => '', 'display_order' => $displayOrder++],
            ['category' => 'vehicle_id', 'value' => 'Honda City', 'description' => '', 'display_order' => $displayOrder++],
            ['category' => 'vehicle_id', 'value' => 'Hero Splendor', 'description' => '', 'display_order' => $displayOrder++],
            ['category' => 'vehicle_id', 'value' => 'Bajaj Pulsar', 'description' => '', 'display_order' => $displayOrder++],
            ['category' => 'vehicle_id', 'value' => 'Toyota Innova', 'description' => '', 'display_order' => $displayOrder++],
            ['category' => 'vehicle_id', 'value' => 'Mahindra Scorpio', 'description' => '', 'display_order' => $displayOrder++],
            
            // Non-motor policy types
            ['category' => 'nonmotor_policy_type_id', 'value' => 'Health Insurance', 'description' => '', 'display_order' => $displayOrder++],
            ['category' => 'nonmotor_policy_type_id', 'value' => 'Travel Insurance', 'description' => '', 'display_order' => $displayOrder++],
            ['category' => 'nonmotor_policy_type_id', 'value' => 'Home Insurance', 'description' => '', 'display_order' => $displayOrder++],
            ['category' => 'nonmotor_policy_type_id', 'value' => 'Fire Insurance', 'description' => '', 'display_order' => $displayOrder++],
            
            // Non-motor policy subtypes
            ['category' => 'nonmotor_policy_subtype_id', 'value' => 'Individual Health', 'description' => '', 'display_order' => $displayOrder++],
            ['category' => 'nonmotor_policy_subtype_id', 'value' => 'Family Floater', 'description' => '', 'display_order' => $displayOrder++],
            ['category' => 'nonmotor_policy_subtype_id', 'value' => 'Senior Citizen', 'description' => '', 'display_order' => $displayOrder++],
            ['category' => 'nonmotor_policy_subtype_id', 'value' => 'Critical Illness', 'description' => '', 'display_order' => $displayOrder++],
            
            // Insurance companies
            ['category' => 'insurance_company_id', 'value' => 'HDFC Ergo', 'description' => '', 'display_order' => $displayOrder++],
            ['category' => 'insurance_company_id', 'value' => 'ICICI Lombard', 'description' => '', 'display_order' => $displayOrder++],
            ['category' => 'insurance_company_id', 'value' => 'Bajaj Allianz', 'description' => '', 'display_order' => $displayOrder++],
            ['category' => 'insurance_company_id', 'value' => 'New India Assurance', 'description' => '', 'display_order' => $displayOrder++],
            ['category' => 'insurance_company_id', 'value' => 'TATA AIG', 'description' => '', 'display_order' => $displayOrder++],
            ['category' => 'insurance_company_id', 'value' => 'SBI General', 'description' => '', 'display_order' => $displayOrder++],
            ['category' => 'insurance_company_id', 'value' => 'Reliance General', 'description' => '', 'display_order' => $displayOrder++],
            ['category' => 'insurance_company_id', 'value' => 'United India Insurance', 'description' => '', 'display_order' => $displayOrder++],
            
            // Adviser names
            ['category' => 'adviser_name_id', 'value' => 'Rajesh Kumar', 'description' => '', 'display_order' => $displayOrder++],
            ['category' => 'adviser_name_id', 'value' => 'Priya Sharma', 'description' => '', 'display_order' => $displayOrder++],
            ['category' => 'adviser_name_id', 'value' => 'Amit Patel', 'description' => '', 'display_order' => $displayOrder++],
            ['category' => 'adviser_name_id', 'value' => 'Sneha Desai', 'description' => '', 'display_order' => $displayOrder++],
            ['category' => 'adviser_name_id', 'value' => 'Vikram Singh', 'description' => '', 'display_order' => $displayOrder++],
            ['category' => 'adviser_name_id', 'value' => 'Rohan Mehta', 'description' => '', 'display_order' => $displayOrder++],
            
            // Banks
            ['category' => 'bank_name_id', 'value' => 'State Bank of India', 'description' => '', 'display_order' => $displayOrder++],
            ['category' => 'bank_name_id', 'value' => 'HDFC Bank', 'description' => '', 'display_order' => $displayOrder++],
            ['category' => 'bank_name_id', 'value' => 'ICICI Bank', 'description' => '', 'display_order' => $displayOrder++],
            ['category' => 'bank_name_id', 'value' => 'Axis Bank', 'description' => '', 'display_order' => $displayOrder++],
            ['category' => 'bank_name_id', 'value' => 'Bank of Baroda', 'description' => '', 'display_order' => $displayOrder++],
            ['category' => 'bank_name_id', 'value' => 'Punjab National Bank', 'description' => '', 'display_order' => $displayOrder++],
            
            // Bank branches (Mumbai)
            ['category' => 'branch_name_id', 'value' => 'Fort Branch, Mumbai', 'description' => '', 'display_order' => $displayOrder++],
            ['category' => 'branch_name_id', 'value' => 'Andheri Branch, Mumbai', 'description' => '', 'display_order' => $displayOrder++],
            ['category' => 'branch_name_id', 'value' => 'Bandra Branch, Mumbai', 'description' => '', 'display_order' => $displayOrder++],
            ['category' => 'branch_name_id', 'value' => 'Churchgate Branch, Mumbai', 'description' => '', 'display_order' => $displayOrder++],
            ['category' => 'branch_name_id', 'value' => 'Dadar Branch, Mumbai', 'description' => '', 'display_order' => $displayOrder++],
            
            // Agency names
            ['category' => 'agency_id', 'value' => 'LIC Agency - Mumbai Central', 'description' => '', 'display_order' => $displayOrder++],
            ['category' => 'agency_id', 'value' => 'LIC Agency - Pune', 'description' => '', 'display_order' => $displayOrder++],
            ['category' => 'agency_id', 'value' => 'Max Life Agency', 'description' => '', 'display_order' => $displayOrder++],
            ['category' => 'agency_id', 'value' => 'HDFC Life Agency', 'description' => '', 'display_order' => $displayOrder++],
            ['category' => 'agency_id', 'value' => 'SBI Life Agency', 'description' => '', 'display_order' => $displayOrder++],
            
            // Collection job types
            ['category' => 'collection_job_type_id', 'value' => 'Premium Collection', 'description' => '', 'display_order' => $displayOrder++],
            ['category' => 'collection_job_type_id', 'value' => 'Renewal Premium', 'description' => '', 'display_order' => $displayOrder++],
            ['category' => 'collection_job_type_id', 'value' => 'New Policy Payment', 'description' => '', 'display_order' => $displayOrder++],
            
            // Servicing job types
            ['category' => 'servicing_type_job_id', 'value' => 'Policy Change', 'description' => '', 'display_order' => $displayOrder++],
            ['category' => 'servicing_type_job_id', 'value' => 'Nomination Change', 'description' => '', 'display_order' => $displayOrder++],
            ['category' => 'servicing_type_job_id', 'value' => 'Address Change', 'description' => '', 'display_order' => $displayOrder++],
            ['category' => 'servicing_type_job_id', 'value' => 'Loan Against Policy', 'description' => '', 'display_order' => $displayOrder++],
            ['category' => 'servicing_type_job_id', 'value' => 'Maturity Claim', 'description' => '', 'display_order' => $displayOrder++],
            
            // RTO - NT Type Work
            ['category' => 'nt_type_work_id', 'value' => 'New Registration', 'description' => '', 'display_order' => $displayOrder++],
            ['category' => 'nt_type_work_id', 'value' => 'Transfer of Ownership', 'description' => '', 'display_order' => $displayOrder++],
            ['category' => 'nt_type_work_id', 'value' => 'Duplicate RC', 'description' => '', 'display_order' => $displayOrder++],
            ['category' => 'nt_type_work_id', 'value' => 'Hypothecation', 'description' => '', 'display_order' => $displayOrder++],
            
            // RTO - TR Type Work
            ['category' => 'tr_type_work_id', 'value' => 'New Tax Payment', 'description' => '', 'display_order' => $displayOrder++],
            ['category' => 'tr_type_work_id', 'value' => 'Tax Renewal', 'description' => '', 'display_order' => $displayOrder++],
            ['category' => 'tr_type_work_id', 'value' => 'Tax Refund', 'description' => '', 'display_order' => $displayOrder++],
            
            // RTO - DL Type Work
            ['category' => 'dl_type_work_id', 'value' => 'New Driving License', 'description' => '', 'display_order' => $displayOrder++],
            ['category' => 'dl_type_work_id', 'value' => 'License Renewal', 'description' => '', 'display_order' => $displayOrder++],
            ['category' => 'dl_type_work_id', 'value' => 'Duplicate DL', 'description' => '', 'display_order' => $displayOrder++],
            ['category' => 'dl_type_work_id', 'value' => 'International Driving Permit', 'description' => '', 'display_order' => $displayOrder++],
            
            // Vehicle classes
            ['category' => 'vehicle_class_id', 'value' => 'LMV (Car)', 'description' => 'Light Motor Vehicle', 'display_order' => $displayOrder++],
            ['category' => 'vehicle_class_id', 'value' => 'MCWG (Bike)', 'description' => 'Motor Cycle With Gear', 'display_order' => $displayOrder++],
            ['category' => 'vehicle_class_id', 'value' => 'HMV', 'description' => 'Heavy Motor Vehicle', 'display_order' => $displayOrder++],
            ['category' => 'vehicle_class_id', 'value' => 'LMV-NT', 'description' => 'Light Motor Vehicle for Non-Transport', 'display_order' => $displayOrder++],
            
            // BMDS - Test Places
            ['category' => 'test_place_id', 'value' => 'Andheri RTO', 'description' => '', 'display_order' => $displayOrder++],
            ['category' => 'test_place_id', 'value' => 'Wadala RTO', 'description' => '', 'display_order' => $displayOrder++],
            ['category' => 'test_place_id', 'value' => 'Tardeo RTO', 'description' => '', 'display_order' => $displayOrder++],
            ['category' => 'test_place_id', 'value' => 'Borivali RTO', 'description' => '', 'display_order' => $displayOrder++],
            
            // BMDS - Class of Vehicle
            ['category' => 'class_of_vehicle_id', 'value' => 'LMV', 'description' => 'Light Motor Vehicle', 'display_order' => $displayOrder++],
            ['category' => 'class_of_vehicle_id', 'value' => 'MCWG', 'description' => 'Motor Cycle With Gear', 'display_order' => $displayOrder++],
            ['category' => 'class_of_vehicle_id', 'value' => 'MCWOG', 'description' => 'Motor Cycle Without Gear', 'display_order' => $displayOrder++],
            ['category' => 'class_of_vehicle_id', 'value' => 'HGMV', 'description' => 'Heavy Goods Motor Vehicle', 'display_order' => $displayOrder++],
            
            // BMDS - ADM Car Type
            ['category' => 'adm_car_type_id', 'value' => 'Maruti Swift', 'description' => '', 'display_order' => $displayOrder++],
            ['category' => 'adm_car_type_id', 'value' => 'Hyundai i10', 'description' => '', 'display_order' => $displayOrder++],
            ['category' => 'adm_car_type_id', 'value' => 'Tata Indica', 'description' => '', 'display_order' => $displayOrder++],
            ['category' => 'adm_car_type_id', 'value' => 'Mahindra Verito', 'description' => '', 'display_order' => $displayOrder++],
        ];
        
        foreach ($dropdownOptions as $option) {
            DB::table('dropdown_options')->insertOrIgnore([
                'category' => $option['category'],
                'value' => $option['value'],
                'description' => $option['description'] ?? null,
                'display_order' => $option['display_order'],
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now()
            ]);
        }
        
        $this->command->info(count($dropdownOptions) . ' dropdown options seeded successfully!');
    }
    
    private function seedClients($faker)
    {
        $clientTypes = ['INDIVIDUAL', 'CORPORATE'];
        $tags = ['A', 'B', 'C'];
        
        // Get IDs for foreign keys
        $cityIds = DB::table('cities')->pluck('id')->toArray();
        $inquiryOptionIds = DB::table('dropdown_options')
            ->where('category', 'inquery_for')
            ->pluck('id')
            ->toArray();
        
        for ($i = 1; $i <= 100; $i++) {
            $clientType = $faker->randomElement($clientTypes);
            $birthDate = $faker->optional(0.8)->date('Y-m-d', '-20 years');
            $age = $birthDate ? Carbon::parse($birthDate)->age : null;
            
            Client::create([
                'sr_no' => $i,
                'date' => $faker->dateTimeBetween('-1 year', 'now')->format('Y-m-d'),
                'time' => $faker->time('H:i:s'),
                'contact' => '9' . $faker->numerify('##########'),
                'alt_contact' => $faker->optional(0.5)->numerify('022########'),
                'client_type' => $clientType,
                'client_name' => $clientType === 'CORPORATE' 
                    ? $faker->company 
                    : $faker->name(),
                'tag' => $faker->randomElement($tags),
                'city_id' => $faker->randomElement($cityIds),
                'inquery_for' => $faker->randomElement($inquiryOptionIds),
                'birth_date' => $birthDate,
                'age' => $age,
                'anniversary_dt' => $faker->optional(0.3)->date('Y-m-d'),
                'aadhar_no' => $faker->optional(0.7)->numerify('############'),
                'pan_no' => $faker->optional(0.6)->regexify('[A-Z]{5}[0-9]{4}[A-Z]{1}'),
                'gst_no' => $clientType === 'CORPORATE' 
                    ? $faker->optional(0.8)->regexify('\\d{2}[A-Z]{5}\\d{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}') 
                    : null,
                'email' => $faker->optional(0.8)->email(),
                'reference' => $faker->optional(0.4)->name(),
                'created_at' => now(),
                'updated_at' => now()
            ]);
        }
        
        $this->command->info('100 clients seeded successfully!');
    }
    
    private function seedGicEntries($faker)
    {
        $clientIds = Client::pluck('id')->toArray();
        $policyTypes = ['MOTOR', 'NONMOTOR'];
        $motorSubtypes = ['A', 'B', 'SAOD', 'ENDST'];
        $policyDurations = ['1YR', 'LONG', 'SHORT'];
        $paymentModes = ['CASH', 'CHEQUE', 'PAYMENT LINK', 'ONLINE', 'RTGS/NEFT'];
        $formStatuses = ['PENDING', 'COMPLETE', 'CDA', 'CANCELLED', 'OTHER'];
        
        // Get IDs for foreign keys
        $vehicleTypeIds = DB::table('dropdown_options')
            ->where('category', 'vehicle_type')
            ->pluck('id')
            ->toArray();
            
        $vehicleModelIds = DB::table('dropdown_options')
            ->where('category', 'vehicle_id')
            ->pluck('id')
            ->toArray();
            
        $nonMotorTypeIds = DB::table('dropdown_options')
            ->where('category', 'nonmotor_policy_type_id')
            ->pluck('id')
            ->toArray();
            
        $nonMotorSubtypeIds = DB::table('dropdown_options')
            ->where('category', 'nonmotor_policy_subtype_id')
            ->pluck('id')
            ->toArray();
            
        $adviserIds = DB::table('dropdown_options')
            ->where('category', 'adviser_name_id')
            ->pluck('id')
            ->toArray();
            
        $companyIds = DB::table('dropdown_options')
            ->where('category', 'insurance_company_id')
            ->pluck('id')
            ->toArray();
            
        $bankIds = DB::table('dropdown_options')
            ->where('category', 'bank_name_id')
            ->pluck('id')
            ->toArray();
            
        $branchIds = DB::table('dropdown_options')
            ->where('category', 'branch_name_id')
            ->pluck('id')
            ->toArray();
        
        $currentYear = date('Y');
        $startDate = Carbon::create($currentYear - 1, 4, 1);
        $endDate = Carbon::create($currentYear, 3, 31);
        
        $regNumCounter = 1;
        
        for ($i = 0; $i < 75; $i++) {
            $date = $faker->dateTimeBetween($startDate, $endDate);
            $startDatePolicy = $date;
            $endDatePolicy = Carbon::instance($date)->addYear();
            
            $premiumAmt = $faker->randomFloat(2, 2000, 50000);
            $advAmt = $faker->randomFloat(2, 500, $premiumAmt);
            $balAmt = $premiumAmt - $advAmt;
            $recovAmt = $faker->optional(0.6)->randomFloat(2, 0, $balAmt);
            
            GicEntry::create([
                'reg_num' => $regNumCounter++,
                'client_id' => $faker->randomElement($clientIds),
                'time' => $faker->time('H:i:s'),
                'date' => $date->format('Y-m-d'),
                'policy_type' => $policyType = $faker->randomElement($policyTypes),
                'motor_subtype' => $policyType === 'MOTOR' ? $faker->randomElement($motorSubtypes) : null,
                'mv_num' => $policyType === 'MOTOR' ? $faker->regexify('[A-Z]{2}[0-9]{2}[A-Z]{2}[0-9]{4}') : null,
                'vehicle_type_id' => $policyType === 'MOTOR' ? $faker->randomElement($vehicleTypeIds) : null,
                'vehicle_id' => $policyType === 'MOTOR' ? $faker->randomElement($vehicleModelIds) : null,
                'nonmotor_policy_type_id' => $policyType === 'NONMOTOR' ? $faker->randomElement($nonMotorTypeIds) : null,
                'nonmotor_policy_subtype_id' => $policyType === 'NONMOTOR' ? $faker->randomElement($nonMotorSubtypeIds) : null,
                'premium_amt' => $premiumAmt,
                'adv_amt' => $advAmt,
                'bal_amt' => $balAmt,
                'recov_amt' => $recovAmt ?? 0,
                'adviser_name_id' => $faker->randomElement($adviserIds),
                'policy_num' => $faker->regexify('POL/[0-9]{6}/[0-9]{4}'),
                'insurance_company_id' => $faker->randomElement($companyIds),
                'policy_duration' => $faker->randomElement($policyDurations),
                'start_dt' => $startDatePolicy->format('Y-m-d'),
                'end_dt' => $endDatePolicy->format('Y-m-d'),
                'pay_mode' => $payMode = $faker->randomElement($paymentModes),
                'cheque_num' => $payMode === 'CHEQUE' ? $faker->numerify('##########') : null,
                'bank_name_id' => $payMode === 'CHEQUE' ? $faker->randomElement($bankIds) : null,
                'branch_name_id' => $payMode === 'CHEQUE' ? $faker->randomElement($branchIds) : null,
                'cheque_dt' => $payMode === 'CHEQUE' ? $faker->dateTimeBetween('-1 month', '+1 month')->format('Y-m-d') : null,
                'responsibility' => $faker->optional(0.7)->sentence(),
                'remark' => $faker->optional(0.5)->text(100),
                'form_status' => $faker->randomElement($formStatuses),
                'created_at' => now(),
                'updated_at' => now()
            ]);
        }
        
        $this->command->info('75 GIC entries seeded successfully!');
    }
    
    private function seedLicEntries($faker)
    {
        $clientIds = Client::pluck('id')->toArray();
        $jobTypes = ['COLLECTION', 'SERVICING_TASK'];
        $paymentModes = ['CASH', 'CHEQUE', 'PAYMENT LINK', 'ONLINE', 'RTGS/NEFT'];
        $formStatuses = ['PENDING', 'COMPLETE', 'CDA', 'CANCELLED', 'OTHER'];
        
        // Get IDs for foreign keys
        $agencyIds = DB::table('dropdown_options')
            ->where('category', 'agency_id')
            ->pluck('id')
            ->toArray();
            
        $collectionJobIds = DB::table('dropdown_options')
            ->where('category', 'collection_job_type_id')
            ->pluck('id')
            ->toArray();
            
        $servicingJobIds = DB::table('dropdown_options')
            ->where('category', 'servicing_type_job_id')
            ->pluck('id')
            ->toArray();
            
        $bankIds = DB::table('dropdown_options')
            ->where('category', 'bank_name_id')
            ->pluck('id')
            ->toArray();
            
        $branchIds = DB::table('dropdown_options')
            ->where('category', 'branch_name_id')
            ->pluck('id')
            ->toArray();
        
        $regNumCounter = 1;
        
        for ($i = 0; $i < 80; $i++) {
            $jobType = $faker->randomElement($jobTypes);
            $policyNums = [];
            $numPolicies = $faker->numberBetween(1, 3);
            
            for ($j = 0; $j < $numPolicies; $j++) {
                $policyNums[] = $faker->regexify('LIC/[0-9]{8}/[0-9]{4}');
            }
            
            LicEntry::create([
                'reg_num' => $regNumCounter++,
                'client_id' => $faker->randomElement($clientIds),
                'date' => $faker->dateTimeBetween('-1 year', 'now')->format('Y-m-d'),
                'time' => $faker->time('H:i:s'),
                'job_type' => $jobType,
                'agency_id' => $faker->randomElement($agencyIds),
                'collection_job_type_id' => $jobType === 'COLLECTION' ? $faker->randomElement($collectionJobIds) : null,
                'no_of_policy' => $jobType === 'COLLECTION' ? $numPolicies : 0,
                'policy_num' => $jobType === 'COLLECTION' ? json_encode($policyNums) : null,
                'premium_amt' => $faker->randomFloat(2, 5000, 100000),
                'pay_mode' => $payMode = $faker->randomElement($paymentModes),
                'cheque_num' => $payMode === 'CHEQUE' ? $faker->numerify('##########') : null,
                'bank_name_id' => $payMode === 'CHEQUE' ? $faker->randomElement($bankIds) : null,
                'branch_name_id' => $payMode === 'CHEQUE' ? $faker->randomElement($branchIds) : null,
                'cheque_dt' => $payMode === 'CHEQUE' ? $faker->dateTimeBetween('-1 month', '+1 month')->format('Y-m-d') : null,
                'servicing_type_job_id' => $jobType === 'SERVICING_TASK' ? $faker->randomElement($servicingJobIds) : null,
                'servicing_policy_no' => $jobType === 'SERVICING_TASK' ? $faker->regexify('LIC/[0-9]{8}/[0-9]{4}') : null,
                'remark' => $faker->optional(0.6)->text(100),
                'form_status' => $faker->randomElement($formStatuses),
                'created_at' => now(),
                'updated_at' => now()
            ]);
        }
        
        $this->command->info('80 LIC entries seeded successfully!');
    }
    
    private function seedRtoEntries($faker)
    {
        $clientIds = Client::pluck('id')->toArray();
        $categories = ['NT', 'TR', 'DL'];
        $formStatuses = ['PENDING', 'COMPLETE'];
        
        // Get IDs for foreign keys
        $ntTypeIds = DB::table('dropdown_options')
            ->where('category', 'nt_type_work_id')
            ->pluck('id')
            ->toArray();
            
        $trTypeIds = DB::table('dropdown_options')
            ->where('category', 'tr_type_work_id')
            ->pluck('id')
            ->toArray();
            
        $dlTypeIds = DB::table('dropdown_options')
            ->where('category', 'dl_type_work_id')
            ->pluck('id')
            ->toArray();
            
        $vehicleClassIds = DB::table('dropdown_options')
            ->where('category', 'vehicle_class_id')
            ->pluck('id')
            ->toArray();
        
        $regNumCounter = 1;
        
        for ($i = 0; $i < 70; $i++) {
            $category = $faker->randomElement($categories);
            
            $premiumAmt = $faker->randomFloat(2, 1000, 20000);
            $advAmt = $faker->randomFloat(2, 500, $premiumAmt);
            $recovAmt = $faker->randomFloat(2, $advAmt, $premiumAmt);
            $govFee = $faker->randomFloat(2, 500, 5000);
            $expenseAmt = $faker->randomFloat(2, 100, 2000);
            $newAmt = $premiumAmt + $govFee + $expenseAmt - $recovAmt;
            
            RtoEntry::create([
                'reg_num' => $regNumCounter++,
                'client_id' => $faker->randomElement($clientIds),
                'date' => $faker->dateTimeBetween('-6 months', 'now')->format('Y-m-d'),
                'time' => $faker->time('H:i:s'),
                'category' => $category,
                'nt_type_work_id' => $category === 'NT' ? $faker->randomElement($ntTypeIds) : null,
                'tr_type_work_id' => $category === 'TR' ? $faker->randomElement($trTypeIds) : null,
                'dl_type_work_id' => $category === 'DL' ? $faker->randomElement($dlTypeIds) : null,
                'mv_num' => $category !== 'DL' ? $faker->regexify('[A-Z]{2}[0-9]{2}[A-Z]{2}[0-9]{4}') : null,
                'vehicle_class_id' => $category !== 'DL' ? $faker->randomElement($vehicleClassIds) : null,
                'premium_amt' => $premiumAmt,
                'adv_amt' => $advAmt,
                'recov_amt' => $recovAmt,
                'gov_fee' => $govFee,
                'cash_in_hand' => $faker->randomFloat(2, 0, 10000),
                'expense_amt' => $expenseAmt,
                'new_amt' => $newAmt,
                'adviser_name' => $faker->optional(0.7)->name(),
                'responsibility' => $faker->optional(0.8)->sentence(),
                'remark' => $faker->optional(0.5)->text(100),
                'form_status' => $faker->randomElement($formStatuses),
                'created_at' => now(),
                'updated_at' => now()
            ]);
        }
        
        $this->command->info('70 RTO entries seeded successfully!');
    }
    
    private function seedBmdsEntries($faker)
    {
        $clientIds = Client::pluck('id')->toArray();
        $bmdsTypes = ['LLR', 'DL', 'ADM'];
        $llrSubTypes = ['FRESH', 'EXEMPTED'];
        $dlSubTypes = ['FRESH', 'ENDST', 'REVALID'];
        $formStatuses = ['PENDING', 'COMPLETE'];
        
        // Get IDs for foreign keys
        $testPlaceIds = DB::table('dropdown_options')
            ->where('category', 'test_place_id')
            ->pluck('id')
            ->toArray();
            
        $vehicleClassIds = DB::table('dropdown_options')
            ->where('category', 'class_of_vehicle_id')
            ->pluck('id')
            ->toArray();
            
        $admCarTypeIds = DB::table('dropdown_options')
            ->where('category', 'adm_car_type_id')
            ->pluck('id')
            ->toArray();
        
        $regNumCounter = 1;
        
        for ($i = 0; $i < 75; $i++) {
            $bmdsType = $faker->randomElement($bmdsTypes);
            
            $quotationAmt = $faker->randomFloat(2, 1000, 15000);
            $advAmt = $faker->randomFloat(2, 500, $quotationAmt);
            $excessAmt = $faker->optional(0.3)->randomFloat(2, 0, 2000);
            $recovAmt = $faker->randomFloat(2, $advAmt, $quotationAmt + ($excessAmt ?? 0));
            
            // Generate optional dates with null check
            $startDt = $faker->optional(0.6)->dateTimeBetween('+1 week', '+2 weeks');
            $endDt = $faker->optional(0.6)->dateTimeBetween('+3 weeks', '+1 month');
            
            BmdsEntry::create([
                'reg_num' => $regNumCounter++,
                'client_id' => $faker->randomElement($clientIds),
                'date' => $faker->dateTimeBetween('-1 year', 'now')->format('Y-m-d'),
                'time' => $faker->time('H:i:s'),
                'bmds_type' => $bmdsType,
                'llr_sub_type' => $bmdsType === 'LLR' ? $faker->randomElement($llrSubTypes) : null,
                'dl_sub_type' => $bmdsType === 'DL' ? $faker->randomElement($dlSubTypes) : null,
                'test_place_id' => $faker->randomElement($testPlaceIds),
                'sr_num' => $faker->optional(0.8)->numerify('SR####'),
                'test_date' => $faker->dateTimeBetween('+1 week', '+1 month')->format('Y-m-d'),
                'class_of_vehicle_id' => $bmdsType !== 'ADM' ? $faker->randomElement($vehicleClassIds) : null,
                'no_of_class' => $bmdsType === 'DL' ? $faker->randomElement(['1', '2', '3']) : null,
                'start_time' => $faker->optional(0.7)->time('H:i'),
                'end_time' => $faker->optional(0.7)->time('H:i'),
                'start_dt' => $startDt ? $startDt->format('Y-m-d') : null,
                'end_dt' => $endDt ? $endDt->format('Y-m-d') : null,
                'adm_car_type_id' => $bmdsType === 'ADM' ? $faker->randomElement($admCarTypeIds) : null,
                'km_ride' => $bmdsType === 'ADM' ? $faker->randomElement(['5KM', '10KM']) : null,
                'quotation_amt' => $quotationAmt,
                'adv_amt' => $advAmt,
                'excess_amt' => $excessAmt ?? 0,
                'recov_amt' => $recovAmt,
                'responsibility' => $faker->optional(0.8)->sentence(),
                'remark' => $faker->optional(0.5)->text(100),
                'form_status' => $faker->randomElement($formStatuses),
                'created_at' => now(),
                'updated_at' => now()
            ]);
        }
        
        $this->command->info('75 BMDS entries seeded successfully!');
    }
    
    private function seedMfEntries($faker)
    {
        $clientIds = Client::pluck('id')->toArray();
        $mfTypes = ['MF', 'INSURANCE'];
        $mfOptions = ['SIP', 'SWP', 'LUMSUM'];
        $insuranceOptions = ['LIC', 'GIC'];
        $formStatuses = ['PENDING', 'COMPLETE'];
        
        $regNumCounter = 1;
        
        for ($i = 0; $i < 70; $i++) {
            $mfType = $faker->randomElement($mfTypes);
            
            // Generate optional deadline with null check
            $deadline = $faker->optional(0.7)->dateTimeBetween('+1 week', '+1 month');
            
            MfEntry::create([
                'reg_num' => $regNumCounter++,
                'client_id' => $faker->randomElement($clientIds),
                'date' => $faker->dateTimeBetween('-1 year', 'now')->format('Y-m-d'),
                'time' => $faker->time('H:i:s'),
                'mf_type' => $mfType,
                'mf_option' => $mfType === 'MF' ? $faker->randomElement($mfOptions) : null,
                'insurance_option' => $mfType === 'INSURANCE' ? $faker->randomElement($insuranceOptions) : null,
                'amt' => $faker->randomFloat(2, 5000, 500000),
                'day_of_month' => $faker->optional(0.6)->numberBetween(1, 28),
                'deadline' => $deadline ? $deadline->format('Y-m-d') : null,
                'referance' => $faker->optional(0.4)->name(),
                'remark' => $faker->optional(0.5)->text(100),
                'form_status' => $faker->randomElement($formStatuses),
                'created_at' => now(),
                'updated_at' => now()
            ]);
        }
        
        $this->command->info('70 MF entries seeded successfully!');
    }
}

// namespace Database\Seeders;

// use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
// use Illuminate\Database\Seeder;

// class DatabaseSeeder extends Seeder
// {
//     /**
//      * Seed the application's database.
//      */
//     public function run(): void
//     {
//         $this->call([
//             // CLinet table seeder 
//             CitySeeder::class,
//             DropdownOptionsSeeder::class,
//         ]);
//     }
// }

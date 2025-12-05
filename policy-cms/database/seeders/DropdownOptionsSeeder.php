<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DropdownOptionsSeeder extends Seeder
{
    public function run(): void
    {
        $dropdownData = [
            // Client related
            'cities' => [
                ['value' => 'Mumbai', 'display_order' => 1],
                ['value' => 'Pune', 'display_order' => 2],
                ['value' => 'Thane', 'display_order' => 3],
                ['value' => 'Nashik', 'display_order' => 4],
                ['value' => 'Nagpur', 'display_order' => 5],
                ['value' => 'Aurangabad', 'display_order' => 6],
            ],

            'inqueries' => [
                ['value' => 'New Policy', 'display_order' => 1],
                ['value' => 'Policy Renewal', 'display_order' => 2],
                ['value' => 'Claim Assistance', 'display_order' => 3],
                ['value' => 'Policy Modification', 'display_order' => 4],
                ['value' => 'Vehicle Transfer', 'display_order' => 5],
                ['value' => 'Other Inquiry', 'display_order' => 6],
            ],

            // GIC related
            'vehicle_types' => [
                ['value' => 'Two Wheeler', 'display_order' => 1],
                ['value' => 'Private Car', 'display_order' => 2],
                ['value' => 'Commercial Vehicle', 'display_order' => 3],
                ['value' => 'Taxi', 'display_order' => 4],
                ['value' => 'Auto Rickshaw', 'display_order' => 5],
                ['value' => 'Bus', 'display_order' => 6],
            ],

            'nonmotor_policy_types' => [
                ['value' => 'Health Insurance', 'display_order' => 1],
                ['value' => 'Life Insurance', 'display_order' => 2],
                ['value' => 'Home Insurance', 'display_order' => 3],
                ['value' => 'Travel Insurance', 'display_order' => 4],
                ['value' => 'Business Insurance', 'display_order' => 5],
                ['value' => 'Fire Insurance', 'display_order' => 6],
            ],

            'advisers' => [
                ['value' => 'Rajesh Kumar', 'display_order' => 1],
                ['value' => 'Priya Sharma', 'display_order' => 2],
                ['value' => 'Amit Patel', 'display_order' => 3],
                ['value' => 'Sneha Desai', 'display_order' => 4],
                ['value' => 'Vikram Singh', 'display_order' => 5],
            ],

            'nonmotor_policy_subtypes' => [
                ['value' => 'Individual Health', 'display_order' => 1],
                ['value' => 'Family Floater', 'display_order' => 2],
                ['value' => 'Critical Illness', 'display_order' => 3],
                ['value' => 'Personal Accident', 'display_order' => 4],
                ['value' => 'Term Life', 'display_order' => 5],
                ['value' => 'Endowment Plan', 'display_order' => 6],
            ],

            'bank' => [
                ['value' => 'State Bank of India', 'display_order' => 1, 'metadata' => ['ifsc_prefix' => 'SBIN']],
                ['value' => 'HDFC Bank', 'display_order' => 2, 'metadata' => ['ifsc_prefix' => 'HDFC']],
                ['value' => 'ICICI Bank', 'display_order' => 3, 'metadata' => ['ifsc_prefix' => 'ICIC']],
                ['value' => 'Axis Bank', 'display_order' => 4, 'metadata' => ['ifsc_prefix' => 'UTIB']],
                ['value' => 'Bank of Baroda', 'display_order' => 5, 'metadata' => ['ifsc_prefix' => 'BARB']],
                ['value' => 'Punjab National Bank', 'display_order' => 6, 'metadata' => ['ifsc_prefix' => 'PUNB']],
            ],

            'insurance_companies' => [
                ['value' => 'Bajaj Allianz', 'display_order' => 1],
                ['value' => 'ICICI Lombard', 'display_order' => 2],
                ['value' => 'HDFC Ergo', 'display_order' => 3],
                ['value' => 'New India Assurance', 'display_order' => 4],
                ['value' => 'United India Insurance', 'display_order' => 5],
                ['value' => 'National Insurance', 'display_order' => 6],
                ['value' => 'Oriental Insurance', 'display_order' => 7],
                ['value' => 'Tata AIG', 'display_order' => 8],
            ],

            'vehicles' => [
                ['value' => 'Maruti Suzuki Swift', 'display_order' => 1],
                ['value' => 'Hyundai i20', 'display_order' => 2],
                ['value' => 'Honda City', 'display_order' => 3],
                ['value' => 'Toyota Innova', 'display_order' => 4],
                ['value' => 'Mahindra Scorpio', 'display_order' => 5],
                ['value' => 'Tata Nexon', 'display_order' => 6],
                ['value' => 'Hero Splendor', 'display_order' => 7],
                ['value' => 'Bajaj Pulsar', 'display_order' => 8],
            ],

            // LIC related
            'agencies' => [
                ['value' => 'LIC Main Branch', 'display_order' => 1],
                ['value' => 'LIC City Center', 'display_order' => 2],
                ['value' => 'LIC Regional Office', 'display_order' => 3],
                ['value' => 'LIC Divisional Office', 'display_order' => 4],
            ],

            'collection_job_types' => [
                ['value' => 'Premium Collection', 'display_order' => 1],
                ['value' => 'Loan Recovery', 'display_order' => 2],
                ['value' => 'Policy Revival', 'display_order' => 3],
                ['value' => 'Installment Collection', 'display_order' => 4],
            ],

            'servicing_job_types' => [
                ['value' => 'Address Change', 'display_order' => 1],
                ['value' => 'Nomination Change', 'display_order' => 2],
                ['value' => 'Policy Surrender', 'display_order' => 3],
                ['value' => 'Loan Application', 'display_order' => 4],
                ['value' => 'Maturity Claim', 'display_order' => 5],
                ['value' => 'Death Claim', 'display_order' => 6],
            ],

            // RTO related
            'nt_type_work' => [
                ['value' => 'New Registration', 'display_order' => 1],
                ['value' => 'Transfer of Ownership', 'display_order' => 2],
                ['value' => 'Address Change', 'display_order' => 3],
                ['value' => 'Duplicate RC', 'display_order' => 4],
                ['value' => 'Hypothecation', 'display_order' => 5],
            ],

            'tr_type_work' => [
                ['value' => 'New Permit', 'display_order' => 1],
                ['value' => 'Renewal of Permit', 'display_order' => 2],
                ['value' => 'Transfer of Permit', 'display_order' => 3],
                ['value' => 'Duplicate Permit', 'display_order' => 4],
            ],

            'dl_type_work' => [
                ['value' => 'New License', 'display_order' => 1],
                ['value' => 'Renewal of License', 'display_order' => 2],
                ['value' => 'Duplicate License', 'display_order' => 3],
                ['value' => 'Address Change', 'display_order' => 4],
                ['value' => 'International License', 'display_order' => 5],
            ],

            'vehicle_cls' => [
                ['value' => 'LMV', 'display_order' => 1, 'description' => 'Light Motor Vehicle'],
                ['value' => 'MCWG', 'display_order' => 2, 'description' => 'Motor Cycle With Gear'],
                ['value' => 'MCWOG', 'display_order' => 3, 'description' => 'Motor Cycle Without Gear'],
                ['value' => 'HMV', 'display_order' => 4, 'description' => 'Heavy Motor Vehicle'],
                ['value' => 'TRACTOR', 'display_order' => 5, 'description' => 'Tractor'],
                ['value' => 'AUTO', 'display_order' => 6, 'description' => 'Auto Rickshaw'],
            ],

            // BMDS related
            'test_places' => [
                ['value' => 'RTO Andheri', 'display_order' => 1],
                ['value' => 'RTO Wadala', 'display_order' => 2],
                ['value' => 'RTO Tardeo', 'display_order' => 3],
                ['value' => 'RTO Borivali', 'display_order' => 4],
                ['value' => 'RTO Thane', 'display_order' => 5],
            ],

            'class_of_vehicle' => [
                ['value' => 'LMV-NT', 'display_order' => 1],
                ['value' => 'LMV-T', 'display_order' => 2],
                ['value' => 'MCWG', 'display_order' => 3],
                ['value' => 'MCWOG', 'display_order' => 4],
                ['value' => 'HMV', 'display_order' => 5],
                ['value' => 'TRACTOR', 'display_order' => 6],
            ],

            'adm_car_types' => [
                ['value' => 'Hatchback', 'display_order' => 1],
                ['value' => 'Sedan', 'display_order' => 2],
                ['value' => 'SUV', 'display_order' => 3],
                ['value' => 'Compact SUV', 'display_order' => 4],
            ],

            // TODO related
            'task_assign_to' => [
                ['value' => 'Rajesh Kumar', 'display_order' => 1],
                ['value' => 'Priya Sharma', 'display_order' => 2],
                ['value' => 'Amit Patel', 'display_order' => 3],
                ['value' => 'Sneha Desai', 'display_order' => 4],
                ['value' => 'Vikram Singh', 'display_order' => 5],
                ['value' => 'Anjali Mehta', 'display_order' => 6],
            ],

            'task_assign_by' => [
                ['value' => 'Manager', 'display_order' => 1],
                ['value' => 'Supervisor', 'display_order' => 2],
                ['value' => 'Team Lead', 'display_order' => 3],
                ['value' => 'Senior Advisor', 'display_order' => 4],
            ],

            // Expense related
            'expense_types' => [
                ['value' => 'Fuel', 'display_order' => 1],
                ['value' => 'Salary', 'display_order' => 2],
                ['value' => 'Office Rent', 'display_order' => 3],
                ['value' => 'Electricity Bill', 'display_order' => 4],
                ['value' => 'Internet Bill', 'display_order' => 5],
                ['value' => 'Telephone Bill', 'display_order' => 6],
                ['value' => 'Stationery', 'display_order' => 7],
                ['value' => 'Travel Expenses', 'display_order' => 8],
                ['value' => 'Maintenance', 'display_order' => 9],
                ['value' => 'Advertising', 'display_order' => 10],
            ],

            'mv_numbers' => [
                ['value' => 'MH-01-AB-1234', 'display_order' => 1],
                ['value' => 'MH-02-CD-5678', 'display_order' => 2],
                ['value' => 'MH-03-EF-9012', 'display_order' => 3],
                ['value' => 'MH-04-GH-3456', 'display_order' => 4],
                ['value' => 'MH-05-IJ-7890', 'display_order' => 5],
            ],

            'internet_providers' => [
                ['value' => 'Airtel', 'display_order' => 1],
                ['value' => 'Jio', 'display_order' => 2],
                ['value' => 'Hathway', 'display_order' => 3],
                ['value' => 'Tata Play', 'display_order' => 4],
                ['value' => 'You Broadband', 'display_order' => 5],
            ],

            'mseb_consumers' => [
                ['value' => 'CON123456789', 'display_order' => 1],
                ['value' => 'CON987654321', 'display_order' => 2],
                ['value' => 'CON456789123', 'display_order' => 3],
                ['value' => 'CON789123456', 'display_order' => 4],
            ],

            'telephone_numbers' => [
                ['value' => '022-12345678', 'display_order' => 1],
                ['value' => '022-87654321', 'display_order' => 2],
                ['value' => '022-23456789', 'display_order' => 3],
                ['value' => '022-98765432', 'display_order' => 4],
            ],
        ];

        foreach ($dropdownData as $category => $options) {
            foreach ($options as $option) {
                DB::table('dropdown_options')->insert([
                    'category' => $category,
                    'value' => $option['value'],
                    'description' => $option['description'] ?? null,
                    'display_order' => $option['display_order'],
                    'is_active' => true,
                    'metadata' => isset($option['metadata']) ? json_encode($option['metadata']) : null,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }

        $this->command->info('Dropdown options seeded successfully!');
        $this->command->info('Total categories: ' . count($dropdownData));
        
        $totalOptions = array_sum(array_map('count', $dropdownData));
        $this->command->info('Total options: ' . $totalOptions);
    }
}
## Version

    Laravel Framework 12.28.1
    PHP Version 8.2.28
    Filament 4.x

## 1. Create New Project (if starting fresh)

    composer create-project --prefer-dist laravel/laravel policy-cms

    cd policy-cms

## 2. Generate Application Key

    php artisan key:generate

## 3. Install Filament for Laravel 12

Install the latest Filament version compatible with Laravel 12

    composer require filament/filament:"^4.0" -W

## Install Filament panel

    php artisan filament:install --panels

## Create admin user

    php artisan make:filament-user

## 4. Setup Database

    Edit your .env file with database credentials:

    DB_CONNECTION=mysql
    DB_HOST=127.0.0.1
    DB_PORT=3306
    DB_DATABASE=policy_cms
    DB_USERNAME=root
    DB_PASSWORD=

## 5. Run Migrations

    php artisan migrate

## 6. Serve the Application

    php artisan serve

## 7. Access Your Application

    Visit: http://127.0.0.1:8000/admin/login

## 8. Table creation

    php artisan make:migration create_multilingual_contents_table

username : policy@gmail.com
password : policy@123

# Integrate login authenticaion

## Installation

You may install Laravel Sanctum via the install:api Artisan command:

    php artisan install:api

# Database Tables

    Client Table

        Client Dropdown

            cities
            inqueries

    GIC Table

        GIC Dropdown

            vehicle_types
            nonmotor_policy_types
            advisers
            nonmotor_policy_subtypes
            bank
            insurance_companies
            vehicles

    LIC Table

        LIC Dropdown

            agencies
            collection_job_types
            servicing_job_types

    RTO Table

        RTO Dropdown

            nt_type_work
            tr_type_work
            dl_type_work
            vehicle_cls

    BMDS Table

        BMDS Dropdown

            test_places
            class_of_vehicle
            adm_car_types

    MF Table

    TODO Table

        TODO Dropdown

            task_assign_to
            task_assign_by

    Expense Table

        Expense Dropdown

            expense_types
            mv_numbers
            internet_providers
            mseb_consumers
            telephone_numbers

    Table Set_goal

    Table thought

    Table bills

### Run backend on localhost domain

    php artisan serve --host=localhost --port=8000

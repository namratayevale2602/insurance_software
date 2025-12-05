<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
      public function up(): void
    {
        Schema::create('bmds_entries', function (Blueprint $table) {
            $table->id();
            
            // Registration number (resets each month)
            $table->integer('reg_num');
            
            // Client relationship
            $table->foreignId('client_id')->constrained('client')->onDelete('cascade');
            
            // Date and time
            $table->date('date');
            $table->time('time');
            
            
            // BMDS type and subtypes
            $table->enum('bmds_type', ['LLR', 'DL', 'ADM']);
            $table->enum('llr_sub_type', ['FRESH', 'EXEMPTED'])->nullable();
            $table->enum('dl_sub_type', ['FRESH', 'ENDST', 'REVALID'])->nullable();
            
            // Test details
            $table->foreignId('test_place_id')->nullable()->constrained('dropdown_options')->onDelete('restrict');
            $table->string('sr_num')->nullable();
            $table->date('test_date')->nullable();
            $table->foreignId('class_of_vehicle_id')->nullable()->constrained('dropdown_options')->onDelete('restrict');
            $table->enum('no_of_class', ['1', '2', '3'])->nullable();
            
            // Time and date ranges
            $table->time('start_time')->nullable();
            $table->time('end_time')->nullable();
            $table->date('start_dt')->nullable();
            $table->date('end_dt')->nullable();
            
            // ADM car details
            $table->foreignId('adm_car_type_id')->nullable()->constrained('dropdown_options')->onDelete('restrict');
            $table->enum('km_ride', ['5KM', '10KM'])->nullable();
            
            // Financial details
            $table->decimal('quotation_amt', 10, 2)->default(0);
            $table->decimal('adv_amt', 10, 2)->default(0);
            $table->decimal('excess_amt', 10, 2)->default(0);
            $table->decimal('recov_amt', 10, 2)->default(0);
            
            // Responsibility and remarks
            $table->string('responsibility')->nullable();
            $table->text('remark')->nullable();
            $table->enum('form_status', ['PENDING', 'COMPLETE'])->default('PENDING');
            // Soft deletes
            $table->softDeletes();
            $table->timestamps();
            
            // Indexes for better performance
            $table->index('reg_num');
            $table->index('client_id');
            $table->index('date');
            $table->index('bmds_type');
            $table->index('form_status');
            $table->index(['date', 'bmds_type']);
            $table->index('deleted_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bmds_entries');
    }
};

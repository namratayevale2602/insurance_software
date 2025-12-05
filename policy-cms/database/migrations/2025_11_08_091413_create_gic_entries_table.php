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
    Schema::create('gic_entries', function (Blueprint $table) {
        $table->id();
        
        // Registration number (starts from 1 each financial year)
        $table->integer('reg_num');
        
        // Link to client table
        $table->foreignId('client_id')->constrained('client')->onDelete('restrict');
        
        $table->time('time');
        $table->date('date');
        
        // Policy type and subtypes
        $table->enum('policy_type', ['MOTOR', 'NONMOTOR']);
        $table->enum('motor_subtype', ['A', 'B', 'SAOD', 'ENDST'])->nullable();
        $table->string('mv_num')->nullable();
        
        // Vehicle details (linked to separate tables)
        $table->foreignId('vehicle_type_id')->nullable()->constrained('dropdown_options')->onDelete('restrict');
        $table->foreignId('vehicle_id')->nullable()->constrained('dropdown_options')->onDelete('restrict');
        
        // Non-motor policy details (linked to separate tables)
        $table->foreignId('nonmotor_policy_type_id')->nullable()->constrained('dropdown_options')->onDelete('restrict');
        $table->foreignId('nonmotor_policy_subtype_id')->nullable()->constrained('dropdown_options')->onDelete('restrict');
        
        // Financial details
        $table->decimal('premium_amt', 10, 2);
        $table->decimal('adv_amt', 10, 2);
        $table->decimal('bal_amt', 10, 2);
        $table->decimal('recov_amt', 10, 2);
        
        // Adviser and company details
        $table->foreignId('adviser_name_id')->constrained('dropdown_options')->onDelete('restrict');
        $table->string('policy_num');
        $table->foreignId('insurance_company_id')->constrained('dropdown_options')->onDelete('restrict');
        
        // Policy duration and dates
        $table->enum('policy_duration', ['1YR', 'LONG', 'SHORT']);
        $table->date('start_dt');
        $table->date('end_dt');
        
        // Payment details
        $table->enum('pay_mode', ['CASH', 'CHEQUE', 'PAYMENT LINK', 'ONLINE', 'RTGS/NEFT']);
        $table->string('cheque_num')->nullable();
        $table->foreignId('bank_name_id')->nullable()->constrained('dropdown_options')->onDelete('restrict');
        $table->foreignId('branch_name_id')->nullable()->constrained('dropdown_options')->onDelete('restrict');
        $table->date('cheque_dt')->nullable();
        
        // Additional information
        $table->text('responsibility')->nullable();
        $table->text('remark')->nullable();
        $table->enum('form_status', ['PENDING', 'COMPLETE', 'CDA', 'CANCELLED', 'OTHER']);
         // Soft deletes
            $table->softDeletes();
        $table->timestamps();
        
        // Indexes for better performance
        $table->index('reg_num');
        $table->index('client_id');
        $table->index('policy_type');
        $table->index('policy_num');
        $table->index('form_status');
        $table->index(['date', 'client_id']);
        $table->index('insurance_company_id');
        $table->index('deleted_at');
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('gic_entries');
    }
};

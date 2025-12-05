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
        Schema::create('lic_entries', function (Blueprint $table) {
            $table->id();
            
            // Registration number (resets each financial year)
            $table->integer('reg_num');
            
            // Client relationship
            $table->foreignId('client_id')->constrained('client')->onDelete('cascade');
            
            // Date and time
            $table->date('date');
            $table->time('time');
                        
            // Job type
            $table->enum('job_type', ['COLLECTION', 'SERVICING_TASK']);
            
            // Agency information
            $table->foreignId('agency_id')->constrained('dropdown_options')->onDelete('restrict');
            
            // Collection job details
            $table->foreignId('collection_job_type_id')->nullable()->constrained('dropdown_options')->onDelete('restrict');
            $table->integer('no_of_policy');
            $table->json('policy_num')->nullable(); // Store multiple policy numbers as JSON array
            
            // Premium and payment details
            $table->decimal('premium_amt', 10, 2);
            $table->enum('pay_mode', ['CASH', 'CHEQUE', 'PAYMENT LINK', 'ONLINE', 'RTGS/NEFT']);
            $table->string('cheque_num')->nullable();
            $table->foreignId('bank_name_id')->nullable()->constrained('dropdown_options')->onDelete('restrict');
            $table->foreignId('branch_name_id')->nullable()->constrained('dropdown_options')->onDelete('restrict');
            $table->date('cheque_dt')->nullable();
            
            // Servicing job details
            $table->foreignId('servicing_type_job_id')->nullable()->constrained('dropdown_options')->onDelete('restrict');
            $table->string('servicing_policy_no')->nullable();
            
            // Remarks and status
            $table->text('remark')->nullable();
            $table->enum('form_status', ['PENDING', 'COMPLETE', 'CDA', 'CANCELLED', 'OTHER'])->default('pending');
              // Soft deletes
            $table->softDeletes();
            $table->timestamps();
            
            // Indexes for better performance
            $table->index('reg_num');
            $table->index('client_id');
            $table->index('date');
            $table->index('job_type');
            $table->index('form_status');
            $table->index(['date', 'job_type']);
            $table->index('deleted_at');
            
           
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('lic_entries');
    }
};

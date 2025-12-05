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
        Schema::create('rto_entries', function (Blueprint $table) {
            $table->id();
            
            // Registration number (resets each month)
            $table->integer('reg_num');
            
            // Client relationship
            $table->foreignId('client_id')->constrained('client')->onDelete('cascade');
            
            // Date and time
            $table->date('date');
            $table->time('time');
        
            
            // Category and type work
            $table->enum('category', ['NT', 'TR', 'DL']);
            $table->foreignId('nt_type_work_id')->nullable()->constrained('dropdown_options')->onDelete('restrict');
            $table->foreignId('tr_type_work_id')->nullable()->constrained('dropdown_options')->onDelete('restrict');
            $table->foreignId('dl_type_work_id')->nullable()->constrained('dropdown_options')->onDelete('restrict');
            
            // Vehicle details
            $table->string('mv_num')->nullable();
            $table->foreignId('vehicle_class_id')->nullable()->constrained('dropdown_options')->onDelete('restrict');
            
            // Financial details
            $table->decimal('premium_amt', 10, 2)->default(0);
            $table->decimal('adv_amt', 10, 2)->default(0);
            $table->decimal('recov_amt', 10, 2)->default(0);
            $table->decimal('gov_fee', 10, 2)->default(0);
            $table->decimal('cash_in_hand', 10, 2)->default(0);
            $table->decimal('expense_amt', 10, 2)->default(0);
            $table->decimal('new_amt', 10, 2)->default(0);
            
            // Adviser and responsibility
            $table->string('adviser_name')->nullable();
            $table->string('responsibility')->nullable();
            
            // Remarks and status
            $table->text('remark')->nullable();
            $table->enum('form_status', ['PENDING', 'COMPLETE'])->default('PENDING');
             // Soft deletes
            $table->softDeletes();
            $table->timestamps();
            
            // Indexes for better performance
            $table->index('reg_num');
            $table->index('client_id');
            $table->index('date');
            $table->index('category');
            $table->index('form_status');
            $table->index(['date', 'category']);
            $table->index('deleted_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rto_entries');
    }
};

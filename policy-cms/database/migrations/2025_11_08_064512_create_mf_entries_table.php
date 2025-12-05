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
        Schema::create('mf_entries', function (Blueprint $table) {
            $table->id();
            
            // Registration number (resets each financial year)
            $table->integer('reg_num');
            
            // Client relationship
            $table->foreignId('client_id')->constrained('client')->onDelete('cascade');
            
            // Date and time
            $table->date('date');
            $table->time('time');
            
            // MF type and options
            $table->enum('mf_type', ['MF', 'INSURANCE']);
            $table->enum('mf_option', ['SIP', 'SWP', 'LUMSUM'])->nullable();
            $table->enum('insurance_option', ['LIC', 'GIC'])->nullable();
            
            // Investment details
            $table->decimal('amt', 10, 2)->default(0);
            $table->integer('day_of_month')->nullable();
            $table->date('deadline')->nullable();
            $table->string('referance')->nullable();
            
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
            $table->index('mf_type');
            $table->index('form_status');
            $table->index(['date', 'mf_type']);
             $table->index('deleted_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('mf_entries');
    }
};

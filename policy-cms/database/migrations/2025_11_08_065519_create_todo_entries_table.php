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
        Schema::create('todo_entries', function (Blueprint $table) {
            $table->id();
            
            // Date and time
            $table->date('date');
            $table->time('time');
            
            // Task assignment
            $table->foreignId('task_assign_to_id')->constrained('dropdown_options')->onDelete('restrict');
            $table->string('contact', 15);
            $table->foreignId('task_assign_by_id')->constrained('dropdown_options')->onDelete('restrict');
            
            // Task details
            $table->text('task_to_complete');
            $table->enum('task_type', ['DAILY', 'WEEKLY', 'MONTHLY', 'QUATERLY', 'YEARLY']);
            $table->string('contact_to')->nullable();
            $table->string('mobile_no', 15)->nullable();
            $table->enum('priority', ['HIGH', 'MEDIUM', 'LOW']);
            $table->string('report_to')->nullable();
            $table->date('reshedule_task')->nullable();
            
            $table->timestamps();
            
            // Indexes
            $table->index('date');
            $table->index('task_assign_to_id');
            $table->index('task_type');
            $table->index('priority');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('todo_entries');
    }
};
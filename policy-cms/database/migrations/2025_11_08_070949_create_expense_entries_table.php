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
        Schema::create('expense_entries', function (Blueprint $table) {
            $table->id();
            
            // Basic expense info
            $table->integer('reg_num');
            $table->date('date');
            $table->time('time');
            $table->decimal('amount', 10, 2);
            $table->enum('pay_mode', ['CASH', 'CHEQUE', 'PAYMENT LINK', 'ONLINE', 'RTGS/NEFT']);
            $table->string('cheque_num')->nullable();
            $table->foreignId('bank_name_id')->nullable()->constrained('dropdown_options')->onDelete('restrict');
            $table->foreignId('branch_name_id')->nullable()->constrained('dropdown_options')->onDelete('restrict');
            $table->date('cheque_dt')->nullable();
            
            // Expense classification
            $table->enum('expense_status', ['GENRAL', 'FIX']);
            $table->date('reminder_date')->nullable();
            $table->foreignId('expense_type_id')->constrained('dropdown_options')->onDelete('restrict');
            
            // ===== FUEL SPECIFIC FIELDS =====
            $table->foreignId('mv_num_id')->nullable()->constrained('dropdown_options')->onDelete('restrict');
            $table->string('vehicle_type')->nullable();
            $table->integer('km')->nullable();
            $table->string('user_name')->nullable();
            $table->enum('fuel_type', ['PETROL', 'DISEL', 'CNG'])->nullable();
            $table->decimal('liter', 8, 2)->nullable();
            
            // ===== SALARY SPECIFIC FIELDS =====
            $table->string('salary_month_year')->nullable();
            $table->string('person_name')->nullable();
            
            // ===== MSEB SPECIFIC FIELDS =====
            $table->string('mseb_month_year')->nullable();
            $table->string('consumer_number')->nullable();
            
            // ===== TELEPHONE SPECIFIC FIELDS =====
            $table->string('telephone_month_year')->nullable();
            $table->string('telephone_number')->nullable();
            
            // ===== INTERNET SPECIFIC FIELDS =====
            $table->string('internet_month_year')->nullable();
            $table->foreignId('internet_provider_id')->nullable()->constrained('dropdown_options')->onDelete('restrict');
            $table->string('internet_consumer_num')->nullable();
            $table->string('internet_referance')->nullable();
            
            // Common field
            $table->text('remark')->nullable();
            // Soft deletes
            $table->softDeletes();
            $table->timestamps();
            
            // Indexes
            $table->index('reg_num');
            $table->index('date');
            $table->index('expense_type_id');
            $table->index('expense_status');
            $table->index('deleted_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('expense_entries');
    }
};
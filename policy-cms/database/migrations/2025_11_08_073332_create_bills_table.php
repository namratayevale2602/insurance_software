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
        Schema::create('bills', function (Blueprint $table) {
            $table->id();
            
            // Client information
            $table->foreignId('client_id')->constrained('client')->onDelete('cascade');
            
            // Bill items (stored as JSON for multiple items)
            $table->json('items')->nullable();
            
            // Bill summary
            $table->decimal('subtotal', 12, 2)->default(0);
            $table->decimal('tax', 12, 2)->default(0);
            $table->decimal('tax_rate', 5, 2)->default(0);
            $table->decimal('total', 12, 2)->default(0);
            
            // Bill date and numbering
            $table->string('bill_number')->unique();
            $table->date('bill_date');
            $table->date('due_date')->nullable();
            
            // Payment status
            $table->enum('payment_status', ['PENDING', 'PAID', 'PARTIAL', 'OVERDUE'])->default('PENDING');
            $table->enum('payment_method', ['CASH', 'CHEQUE', 'ONLINE', 'CARD', 'UPI'])->nullable();
            
            // Additional fields
            $table->text('notes')->nullable();
            $table->text('terms_conditions')->nullable();
            // Soft deletes
            $table->softDeletes();
            $table->timestamps();
            
            // Indexes for better performance
            $table->index('client_id');
            $table->index('bill_number');
            $table->index('bill_date');
            $table->index('payment_status');
            $table->index(['bill_date', 'payment_status']);
            $table->index('deleted_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bills');
    }
};
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    // Migration: create_dropdown_options_table
    public function up(): void
    {
        Schema::create('dropdown_options', function (Blueprint $table) {
            $table->id();
            $table->string('category', 50); // 'cities', 'vehicle_types', 'advisers', etc.
            $table->string('value'); // The actual dropdown value
            $table->text('description')->nullable();
            $table->integer('display_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->json('metadata')->nullable(); // For additional data like bank IFSC, etc.
            $table->timestamps();

            // Indexes for performance
            $table->index(['category', 'is_active']);
            $table->index('display_order');
            $table->index('category');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('dropdown_options');
    }
};

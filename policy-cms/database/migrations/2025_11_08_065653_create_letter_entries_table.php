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
        Schema::create('letter_entries', function (Blueprint $table) {
            $table->id();
            
            // From details
            $table->string('from_name');
            $table->text('from_address');
            
            // To details
            $table->string('to_name');
            $table->text('to_address');
            
            // Letter content
            $table->string('subject');
            $table->string('referance')->nullable();
            $table->text('message');
            $table->text('text')->nullable(); // Additional text field
            
            $table->timestamps();
            
            // Indexes
            $table->index('from_name');
            $table->index('to_name');
            $table->index('subject');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('letter_entries');
    }
};
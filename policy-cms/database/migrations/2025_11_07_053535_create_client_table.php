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
        Schema::create('client', function (Blueprint $table) {
            $table->id();
            $table->integer('sr_no');
            $table->date('date');
            $table->time('time');
            $table->string('contact', 15);
            $table->string('alt_contact', 15)->nullable();
            $table->enum('client_type', ['INDIVIDUAL','CORPORATE']);
            $table->string('client_name');
            $table->enum('tag', ['A', 'B', 'C']);
            $table->foreignId('city_id')->constrained('cities')->onDelete('restrict');
            $table->foreignId('inquery_for')->constrained('dropdown_options')->onDelete('restrict');
            $table->date('birth_date')->nullable();
            $table->integer('age')->nullable();
            $table->date('anniversary_dt')->nullable();
            $table->string('aadhar_no', 12)->nullable();
            $table->string('pan_no', 10)->nullable();
            $table->string('gst_no', 15)->nullable();
            $table->string('email')->nullable();
            $table->string('reference')->nullable();
            $table->timestamps();
            
            // Indexes for better performance
            $table->index(['client_type', 'tag']);
            $table->index('contact');
            $table->index('email');
            $table->index('city_id');
            $table->index('inquery_for');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('client');
    }
};

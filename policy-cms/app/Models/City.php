<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class City extends Model
{
    use HasFactory;

    protected $fillable = [
        'city_name', 
        'pincode', 
        'state', 
        'country', 
        'is_active'
    ];

    protected $casts = [
        'is_active' => 'boolean'
    ];

    // Relationships
    public function clients()
    {
        return $this->hasMany(Client::class);
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeByPincode($query, $pincode)
    {
        return $query->where('pincode', $pincode);
    }

    public function scopeByCityName($query, $cityName)
    {
        return $query->where('city_name', 'like', "%{$cityName}%");
    }
}
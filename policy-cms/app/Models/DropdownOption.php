<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DropdownOption extends Model
{
    use HasFactory;

    protected $table = 'dropdown_options';

    protected $fillable = [
        'category',
        'value',
        'description',
        'display_order',
        'is_active',
        'metadata'
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'metadata' => 'array',
        'display_order' => 'integer'
    ];

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeByCategory($query, $category)
    {
        return $query->where('category', $category);
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('display_order')->orderBy('value');
    }

    // Static methods for common categories
    public static function getVehicleTypes()
    {
        return self::byCategory('vehicle_types')->active()->ordered()->get();
    }

    public static function getVehicles()
    {
        return self::byCategory('vehicles')->active()->ordered()->get();
    }

    public static function getNonmotorPolicyTypes()
    {
        return self::byCategory('nonmotor_policy_types')->active()->ordered()->get();
    }

    public static function getNonmotorPolicySubtypes()
    {
        return self::byCategory('nonmotor_policy_subtypes')->active()->ordered()->get();
    }

    public static function getAdvisers()
    {
        return self::byCategory('advisers')->active()->ordered()->get();
    }

    public static function getInsuranceCompanies()
    {
        return self::byCategory('insurance_companies')->active()->ordered()->get();
    }

    public static function getBanks()
    {
        return self::byCategory('banks')->active()->ordered()->get();
    }

    public static function getBranches()
    {
        return self::byCategory('branches')->active()->ordered()->get();
    }

    public static function getCities()
    {
        return self::byCategory('cities')->active()->ordered()->get();
    }

    // Accessors
    public function getFormattedValueAttribute()
    {
        return $this->value . ($this->description ? ' - ' . $this->description : '');
    }
}
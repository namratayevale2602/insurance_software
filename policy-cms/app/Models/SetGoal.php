<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SetGoal extends Model
{
    use HasFactory;

    protected $table = 'set_goal';

    protected $fillable = [
        'service_type',
        'goal'
    ];

    // Scopes
    public function scopeByServiceType($query, $serviceType)
    {
        return $query->where('service_type', $serviceType);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    // Accessors
    public function getFormattedGoalAttribute()
    {
        return ucfirst($this->goal);
    }

    public function getFormattedServiceTypeAttribute()
    {
        return strtoupper($this->service_type);
    }

    // Mutators
    public function setServiceTypeAttribute($value)
    {
        $this->attributes['service_type'] = strtoupper($value);
    }

    public function setGoalAttribute($value)
    {
        $this->attributes['goal'] = ucfirst($value);
    }
}
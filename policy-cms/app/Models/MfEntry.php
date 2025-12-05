<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class MfEntry extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'mf_entries';

    protected $fillable = [
        'reg_num',
        'client_id',
        'date',
        'time',
        'mf_type',
        'mf_option',
        'insurance_option',
        'amt',
        'day_of_month',
        'deadline',
        'referance',
        'remark',
        'form_status'
    ];

    protected $casts = [
        'date' => 'date',
        'deadline' => 'date',
        'amt' => 'decimal:2',
        'deleted_at' => 'datetime',
    ];

    // Boot method for auto-generating reg_num and handling conditional data
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($mfEntry) {
            if (empty($mfEntry->reg_num)) {
                $financialYear = self::getCurrentFinancialYear();
                $lastEntry = static::whereYear('date', $financialYear['year'])
                    ->whereMonth('date', '>=', 4)
                    ->orWhere(function($query) use ($financialYear) {
                        $query->whereYear('date', $financialYear['year'] + 1)
                            ->whereMonth('date', '<', 4);
                    })
                    ->orderBy('reg_num', 'desc')
                    ->first();

                $mfEntry->reg_num = $lastEntry ? $lastEntry->reg_num + 1 : 1;
            }

            // Ensure only relevant fields are set based on mf_type
            $mfEntry->cleanupFieldsBasedOnMfType();
        });

        static::updating(function ($mfEntry) {
            // Ensure only relevant fields are set based on mf_type
            $mfEntry->cleanupFieldsBasedOnMfType();
        });
    }

    // Clean up fields based on mf_type
    protected function cleanupFieldsBasedOnMfType()
    {
        if ($this->mf_type === 'MF') {
            // Nullify INSURANCE fields
            $this->insurance_option = null;
        } else if ($this->mf_type === 'INSURANCE') {
            // Nullify MF fields
            $this->mf_option = null;
        }
    }

    // Get current financial year (April to March)
    private static function getCurrentFinancialYear()
    {
        $currentMonth = date('n');
        $currentYear = date('Y');
        
        if ($currentMonth >= 4) {
            return ['year' => $currentYear, 'next_year' => $currentYear + 1];
        } else {
            return ['year' => $currentYear - 1, 'next_year' => $currentYear];
        }
    }

    // Relationships
    public function client()
    {
        return $this->belongsTo(Client::class);
    }

    // Scopes
    public function scopeMf($query)
    {
        return $query->where('mf_type', 'MF');
    }

    public function scopeInsurance($query)
    {
        return $query->where('mf_type', 'INSURANCE');
    }

    public function scopePending($query)
    {
        return $query->where('form_status', 'PENDING');
    }

    public function scopeComplete($query)
    {
        return $query->where('form_status', 'COMPLETE');
    }

    public function scopeByRegNum($query, $regNum)
    {
        return $query->where('reg_num', $regNum);
    }

    public function scopeByFinancialYear($query, $year)
    {
        return $query->where(function($q) use ($year) {
            $q->whereYear('date', $year)->whereMonth('date', '>=', 4)
              ->orWhere(function($q2) use ($year) {
                  $q2->whereYear('date', $year + 1)->whereMonth('date', '<', 4);
              });
        });
    }

    // Include trashed records in queries
    public function scopeWithTrashed($query)
    {
        return $query->whereNotNull('deleted_at');
    }

    public function scopeOnlyTrashed($query)
    {
        return $query->whereNotNull('deleted_at');
    }

    // Accessors
    public function getFinancialYearAttribute()
    {
        $month = $this->date->month;
        $year = $this->date->year;
        
        if ($month >= 4) {
            return $year . '-' . ($year + 1);
        } else {
            return ($year - 1) . '-' . $year;
        }
    }

    public function getIsDeletedAttribute()
    {
        return !is_null($this->deleted_at);
    }

    // Convenience accessors to get client data through relationship
    public function getClientNameAttribute()
    {
        return $this->client ? $this->client->client_name : null;
    }

    public function getContactAttribute()
    {
        return $this->client ? $this->client->contact : null;
    }

    public function getCityAttribute()
    {
        return $this->client && $this->client->city ? $this->client->city->city_name : null;
    }

    // Mutators
    public function setReferanceAttribute($value)
    {
        $this->attributes['referance'] = strtoupper($value);
    }

    public function setRemarkAttribute($value)
    {
        $this->attributes['remark'] = ucfirst($value);
    }
}
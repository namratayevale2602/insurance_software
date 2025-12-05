<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class BmdsEntry extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'bmds_entries';

    protected $fillable = [
        'reg_num',
        'client_id',
        'date',
        'time',
        'bmds_type',
        'llr_sub_type',
        'dl_sub_type',
        'test_place_id',
        'sr_num',
        'test_date',
        'class_of_vehicle_id',
        'no_of_class',
        'start_time',
        'end_time',
        'start_dt',
        'end_dt',
        'adm_car_type_id',
        'km_ride',
        'quotation_amt',
        'adv_amt',
        'excess_amt',
        'recov_amt',
        'responsibility',
        'remark',
        'form_status'
    ];

    protected $casts = [
        'date' => 'date',
        'test_date' => 'date',
        'start_dt' => 'date',
        'end_dt' => 'date',
        'quotation_amt' => 'decimal:2',
        'adv_amt' => 'decimal:2',
        'excess_amt' => 'decimal:2',
        'recov_amt' => 'decimal:2',
        'deleted_at' => 'datetime',
    ];

    // Boot method for auto-generating reg_num and handling conditional data
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($bmdsEntry) {
            if (empty($bmdsEntry->reg_num)) {
                $currentMonth = date('n');
                $currentYear = date('Y');
                
                $lastEntry = static::whereYear('date', $currentYear)
                    ->whereMonth('date', $currentMonth)
                    ->orderBy('reg_num', 'desc')
                    ->first();

                $bmdsEntry->reg_num = $lastEntry ? $lastEntry->reg_num + 1 : 1;
            }

            // Ensure only relevant fields are set based on bmds_type
            $bmdsEntry->cleanupFieldsBasedOnBmdsType();
        });

        static::updating(function ($bmdsEntry) {
            // Ensure only relevant fields are set based on bmds_type
            $bmdsEntry->cleanupFieldsBasedOnBmdsType();
        });
    }

    // Clean up fields based on bmds_type
    protected function cleanupFieldsBasedOnBmdsType()
    {
        if ($this->bmds_type === 'LLR') {
            // Nullify DL and ADM fields
            $this->dl_sub_type = null;
            $this->start_time = null;
            $this->end_time = null;
            $this->start_dt = null;
            $this->end_dt = null;
            $this->adm_car_type_id = null;
            $this->km_ride = null;
        } else if ($this->bmds_type === 'DL') {
            // Nullify LLR and ADM fields
            $this->llr_sub_type = null;
            $this->start_time = null;
            $this->end_time = null;
            $this->start_dt = null;
            $this->end_dt = null;
            $this->adm_car_type_id = null;
            $this->km_ride = null;
        } else if ($this->bmds_type === 'ADM') {
            // Nullify LLR and DL fields
            $this->llr_sub_type = null;
            $this->dl_sub_type = null;
            $this->test_place_id = null;
            $this->sr_num = null;
            $this->test_date = null;
            $this->class_of_vehicle_id = null;
            $this->no_of_class = null;
        }
    }

    // Relationships
    public function client()
    {
        return $this->belongsTo(Client::class);
    }

    public function testPlace()
    {
        return $this->belongsTo(DropdownOption::class, 'test_place_id');
    }

    public function classOfVehicle()
    {
        return $this->belongsTo(DropdownOption::class, 'class_of_vehicle_id');
    }

    public function admCarType()
    {
        return $this->belongsTo(DropdownOption::class, 'adm_car_type_id');
    }

    // Scopes
    public function scopeLlr($query)
    {
        return $query->where('bmds_type', 'LLR');
    }

    public function scopeDl($query)
    {
        return $query->where('bmds_type', 'DL');
    }

    public function scopeAdm($query)
    {
        return $query->where('bmds_type', 'ADM');
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

    public function scopeByMonth($query, $year, $month)
    {
        return $query->whereYear('date', $year)
                    ->whereMonth('date', $month);
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
    public function getFinancialMonthAttribute()
    {
        return $this->date->format('Y-m');
    }

    public function getIsDeletedAttribute()
    {
        return !is_null($this->deleted_at);
    }

    public function getTotalAmountAttribute()
    {
        return $this->quotation_amt + $this->adv_amt + $this->excess_amt + $this->recov_amt;
    }

    public function getNetAmountAttribute()
    {
        return $this->total_amount - $this->excess_amt;
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
    public function setSrNumAttribute($value)
    {
        $this->attributes['sr_num'] = strtoupper($value);
    }

    public function setResponsibilityAttribute($value)
    {
        $this->attributes['responsibility'] = strtoupper($value);
    }
}
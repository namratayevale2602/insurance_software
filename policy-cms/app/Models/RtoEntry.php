<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class RtoEntry extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'rto_entries';

    protected $fillable = [
        'reg_num',
        'client_id',
        'date',
        'time',
        'category',
        'nt_type_work_id',
        'tr_type_work_id',
        'dl_type_work_id',
        'mv_num',
        'vehicle_class_id',
        'premium_amt',
        'adv_amt',
        'recov_amt',
        'gov_fee',
        'cash_in_hand',
        'expense_amt',
        'new_amt',
        'adviser_name',
        'responsibility',
        'remark',
        'form_status'
    ];

    protected $casts = [
        'date' => 'date',
        'premium_amt' => 'decimal:2',
        'adv_amt' => 'decimal:2',
        'recov_amt' => 'decimal:2',
        'gov_fee' => 'decimal:2',
        'cash_in_hand' => 'decimal:2',
        'expense_amt' => 'decimal:2',
        'new_amt' => 'decimal:2',
        'deleted_at' => 'datetime',
    ];

    // Boot method for auto-generating reg_num and handling conditional data
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($rtoEntry) {
            if (empty($rtoEntry->reg_num)) {
                $currentMonth = date('n');
                $currentYear = date('Y');
                
                $lastEntry = static::whereYear('date', $currentYear)
                    ->whereMonth('date', $currentMonth)
                    ->orderBy('reg_num', 'desc')
                    ->first();

                $rtoEntry->reg_num = $lastEntry ? $lastEntry->reg_num + 1 : 1;
            }

            // Ensure only relevant fields are set based on category
            $rtoEntry->cleanupFieldsBasedOnCategory();
        });

        static::updating(function ($rtoEntry) {
            // Ensure only relevant fields are set based on category
            $rtoEntry->cleanupFieldsBasedOnCategory();
        });
    }

    // Clean up fields based on category
    protected function cleanupFieldsBasedOnCategory()
    {
        if ($this->category === 'NT') {
            // Nullify TR and DL fields
            $this->tr_type_work_id = null;
            $this->dl_type_work_id = null;
        } else if ($this->category === 'TR') {
            // Nullify NT and DL fields
            $this->nt_type_work_id = null;
            $this->dl_type_work_id = null;
        } else if ($this->category === 'DL') {
            // Nullify NT and TR fields
            $this->nt_type_work_id = null;
            $this->tr_type_work_id = null;
        }
    }

    // Relationships
    public function client()
    {
        return $this->belongsTo(Client::class);
    }

    public function ntTypeWork()
    {
        return $this->belongsTo(DropdownOption::class, 'nt_type_work_id');
    }

    public function trTypeWork()
    {
        return $this->belongsTo(DropdownOption::class, 'tr_type_work_id');
    }

    public function dlTypeWork()
    {
        return $this->belongsTo(DropdownOption::class, 'dl_type_work_id');
    }

    public function vehicleClass()
    {
        return $this->belongsTo(DropdownOption::class, 'vehicle_class_id');
    }

    // Scopes
    public function scopeNt($query)
    {
        return $query->where('category', 'NT');
    }

    public function scopeTr($query)
    {
        return $query->where('category', 'TR');
    }

    public function scopeDl($query)
    {
        return $query->where('category', 'DL');
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
        return $this->premium_amt + $this->adv_amt + $this->recov_amt + $this->gov_fee;
    }

    public function getNetAmountAttribute()
    {
        return $this->total_amount - $this->expense_amt;
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
    public function setMvNumAttribute($value)
    {
        $this->attributes['mv_num'] = strtoupper($value);
    }

    public function setAdviserNameAttribute($value)
    {
        $this->attributes['adviser_name'] = strtoupper($value);
    }

    public function setResponsibilityAttribute($value)
    {
        $this->attributes['responsibility'] = strtoupper($value);
    }
}
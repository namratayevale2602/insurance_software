<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ExpenseEntry extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'expense_entries';

    protected $fillable = [
        'reg_num',
        'date',
        'time',
        'amount',
        'pay_mode',
        'cheque_num',
        'bank_name_id',
        'branch_name_id',
        'cheque_dt',
        'expense_status',
        'reminder_date',
        'expense_type_id',
        // Fuel specific
        'mv_num_id',
        'vehicle_type',
        'km',
        'user_name',
        'fuel_type',
        'liter',
        // Salary specific
        'salary_month_year',
        'person_name',
        // MSEB specific
        'mseb_month_year',
        'consumer_number',
        // Telephone specific
        'telephone_month_year',
        'telephone_number',
        // Internet specific
        'internet_month_year',
        'internet_provider_id',
        'internet_consumer_num',
        'internet_referance',
        'remark'
    ];

    protected $casts = [
        'date' => 'date',
        'cheque_dt' => 'date',
        'reminder_date' => 'date',
        'amount' => 'decimal:2',
        'liter' => 'decimal:2',
        'deleted_at' => 'datetime',
    ];

    // Boot method for auto-generating reg_num
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($expenseEntry) {
            if (empty($expenseEntry->reg_num)) {
                $currentYear = date('Y');
                $lastEntry = static::whereYear('date', $currentYear)
                    ->orderBy('reg_num', 'desc')
                    ->first();

                $expenseEntry->reg_num = $lastEntry ? $lastEntry->reg_num + 1 : 1;
            }

            // Ensure only relevant fields are set based on expense type
            $expenseEntry->cleanupFieldsBasedOnExpenseType();
        });

        static::updating(function ($expenseEntry) {
            // Ensure only relevant fields are set based on expense type
            $expenseEntry->cleanupFieldsBasedOnExpenseType();
        });
    }

    // Clean up fields based on expense type
    protected function cleanupFieldsBasedOnExpenseType()
    {
        // Get expense type name from relationship
        $expenseTypeName = $this->expenseType ? strtoupper($this->expenseType->option_name) : '';

        if (str_contains($expenseTypeName, 'FUEL')) {
            // Nullify other type fields
            $this->salary_month_year = null;
            $this->person_name = null;
            $this->mseb_month_year = null;
            $this->consumer_number = null;
            $this->telephone_month_year = null;
            $this->telephone_number = null;
            $this->internet_month_year = null;
            $this->internet_provider_id = null;
            $this->internet_consumer_num = null;
            $this->internet_referance = null;
        } else if (str_contains($expenseTypeName, 'SALARY')) {
            // Nullify other type fields
            $this->mv_num_id = null;
            $this->vehicle_type = null;
            $this->km = null;
            $this->user_name = null;
            $this->fuel_type = null;
            $this->liter = null;
            $this->mseb_month_year = null;
            $this->consumer_number = null;
            $this->telephone_month_year = null;
            $this->telephone_number = null;
            $this->internet_month_year = null;
            $this->internet_provider_id = null;
            $this->internet_consumer_num = null;
            $this->internet_referance = null;
        } else if (str_contains($expenseTypeName, 'MSEB') || str_contains($expenseTypeName, 'ELECTRICITY')) {
            // Nullify other type fields
            $this->mv_num_id = null;
            $this->vehicle_type = null;
            $this->km = null;
            $this->user_name = null;
            $this->fuel_type = null;
            $this->liter = null;
            $this->salary_month_year = null;
            $this->person_name = null;
            $this->telephone_month_year = null;
            $this->telephone_number = null;
            $this->internet_month_year = null;
            $this->internet_provider_id = null;
            $this->internet_consumer_num = null;
            $this->internet_referance = null;
        } else if (str_contains($expenseTypeName, 'TELEPHONE')) {
            // Nullify other type fields
            $this->mv_num_id = null;
            $this->vehicle_type = null;
            $this->km = null;
            $this->user_name = null;
            $this->fuel_type = null;
            $this->liter = null;
            $this->salary_month_year = null;
            $this->person_name = null;
            $this->mseb_month_year = null;
            $this->consumer_number = null;
            $this->internet_month_year = null;
            $this->internet_provider_id = null;
            $this->internet_consumer_num = null;
            $this->internet_referance = null;
        } else if (str_contains($expenseTypeName, 'INTERNET')) {
            // Nullify other type fields
            $this->mv_num_id = null;
            $this->vehicle_type = null;
            $this->km = null;
            $this->user_name = null;
            $this->fuel_type = null;
            $this->liter = null;
            $this->salary_month_year = null;
            $this->person_name = null;
            $this->mseb_month_year = null;
            $this->consumer_number = null;
            $this->telephone_month_year = null;
            $this->telephone_number = null;
        } else {
            // For general expenses, nullify all specific fields
            $this->mv_num_id = null;
            $this->vehicle_type = null;
            $this->km = null;
            $this->user_name = null;
            $this->fuel_type = null;
            $this->liter = null;
            $this->salary_month_year = null;
            $this->person_name = null;
            $this->mseb_month_year = null;
            $this->consumer_number = null;
            $this->telephone_month_year = null;
            $this->telephone_number = null;
            $this->internet_month_year = null;
            $this->internet_provider_id = null;
            $this->internet_consumer_num = null;
            $this->internet_referance = null;
        }
    }

    // Relationships
    public function expenseType()
    {
        return $this->belongsTo(DropdownOption::class, 'expense_type_id');
    }

    public function bank()
    {
        return $this->belongsTo(DropdownOption::class, 'bank_name_id');
    }

    public function branch()
    {
        return $this->belongsTo(DropdownOption::class, 'branch_name_id');
    }

    public function mvNum()
    {
        return $this->belongsTo(DropdownOption::class, 'mv_num_id');
    }

    public function internetProvider()
    {
        return $this->belongsTo(DropdownOption::class, 'internet_provider_id');
    }

    // Scopes
    public function scopeGeneral($query)
    {
        return $query->where('expense_status', 'GENRAL');
    }

    public function scopeFix($query)
    {
        return $query->where('expense_status', 'FIX');
    }

    public function scopeByExpenseType($query, $expenseTypeId)
    {
        return $query->where('expense_type_id', $expenseTypeId);
    }

    public function scopeByRegNum($query, $regNum)
    {
        return $query->where('reg_num', $regNum);
    }

    public function scopeByYear($query, $year)
    {
        return $query->whereYear('date', $year);
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
    public function getIsDeletedAttribute()
    {
        return !is_null($this->deleted_at);
    }

    public function getFinancialYearAttribute()
    {
        return $this->date->format('Y');
    }

    public function getFormattedAmountAttribute()
    {
        return '₹' . number_format($this->amount, 2);
    }

    // Mutators
    public function setVehicleTypeAttribute($value)
    {
        $this->attributes['vehicle_type'] = strtoupper($value);
    }

    public function setUserNameAttribute($value)
    {
        $this->attributes['user_name'] = strtoupper($value);
    }

    public function setPersonNameAttribute($value)
    {
        $this->attributes['person_name'] = strtoupper($value);
    }

    public function setConsumerNumberAttribute($value)
    {
        $this->attributes['consumer_number'] = strtoupper($value);
    }

    public function setTelephoneNumberAttribute($value)
    {
        $this->attributes['telephone_number'] = strtoupper($value);
    }

    public function setInternetConsumerNumAttribute($value)
    {
        $this->attributes['internet_consumer_num'] = strtoupper($value);
    }

    public function setInternetReferanceAttribute($value)
    {
        $this->attributes['internet_referance'] = strtoupper($value);
    }

    public function setRemarkAttribute($value)
    {
        $this->attributes['remark'] = ucfirst($value);
    }
}
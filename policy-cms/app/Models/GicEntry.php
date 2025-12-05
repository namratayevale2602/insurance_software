<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class GicEntry extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'gic_entries';

    protected $fillable = [
        'reg_num',
        'client_id',
        'time',
        'date',
        'policy_type',
        'motor_subtype',
        'mv_num',
        'vehicle_type_id',
        'vehicle_id',
        'nonmotor_policy_type_id',
        'nonmotor_policy_subtype_id',
        'premium_amt',
        'adv_amt',
        'bal_amt',
        'recov_amt',
        'adviser_name_id',
        'policy_num',
        'insurance_company_id',
        'policy_duration',
        'start_dt',
        'end_dt',
        'pay_mode',
        'cheque_num',
        'bank_name_id',
        'branch_name_id',
        'cheque_dt',
        'responsibility',
        'remark',
        'form_status'
    ];

    protected $casts = [
        'date' => 'date',
        'start_dt' => 'date',
        'end_dt' => 'date',
        'cheque_dt' => 'date',
        'premium_amt' => 'decimal:2',
        'adv_amt' => 'decimal:2',
        'bal_amt' => 'decimal:2',
        'recov_amt' => 'decimal:2',
        'deleted_at' => 'datetime',
    ];

    // Boot method for auto-generating reg_num
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($gicEntry) {
            if (empty($gicEntry->reg_num)) {
                $financialYear = self::getCurrentFinancialYear();
                $lastEntry = static::withTrashed()
                    ->whereYear('date', $financialYear['year'])
                    ->whereMonth('date', '>=', 4)
                    ->orWhere(function($query) use ($financialYear) {
                        $query->whereYear('date', $financialYear['year'] + 1)
                            ->whereMonth('date', '<', 4);
                    })
                    ->orderBy('reg_num', 'desc')
                    ->first();

                $gicEntry->reg_num = $lastEntry ? $lastEntry->reg_num + 1 : 1;
            }
        });

        // Prevent duplicate reg numbers when restoring
        static::restoring(function ($gicEntry) {
            $financialYear = self::getCurrentFinancialYear();
            $existingEntry = static::withTrashed()
                ->where('reg_num', $gicEntry->reg_num)
                ->where('id', '!=', $gicEntry->id)
                ->where(function($query) use ($financialYear) {
                    $query->whereYear('date', $financialYear['year'])
                        ->whereMonth('date', '>=', 4)
                        ->orWhere(function($q2) use ($financialYear) {
                            $q2->whereYear('date', $financialYear['year'] + 1)
                                ->whereMonth('date', '<', 4);
                        });
                })
                ->first();
            
            if ($existingEntry) {
                $lastEntry = static::withTrashed()
                    ->whereYear('date', $financialYear['year'])
                    ->whereMonth('date', '>=', 4)
                    ->orWhere(function($query) use ($financialYear) {
                        $query->whereYear('date', $financialYear['year'] + 1)
                            ->whereMonth('date', '<', 4);
                    })
                    ->orderBy('reg_num', 'desc')
                    ->first();

                $gicEntry->reg_num = $lastEntry ? $lastEntry->reg_num + 1 : 1;
            }
        });
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

    // Updated Relationships to use DropdownOption
    public function client()
    {
        return $this->belongsTo(Client::class)->withTrashed();
    }

    public function vehicleType()
    {
        return $this->belongsTo(DropdownOption::class, 'vehicle_type_id');
    }

    public function vehicle()
    {
        return $this->belongsTo(DropdownOption::class, 'vehicle_id');
    }

    public function nonmotorPolicyType()
    {
        return $this->belongsTo(DropdownOption::class, 'nonmotor_policy_type_id');
    }

    public function nonmotorPolicySubtype()
    {
        return $this->belongsTo(DropdownOption::class, 'nonmotor_policy_subtype_id');
    }

    public function adviser()
    {
        return $this->belongsTo(DropdownOption::class, 'adviser_name_id');
    }

    public function insuranceCompany()
    {
        return $this->belongsTo(DropdownOption::class, 'insurance_company_id');
    }

    public function bank()
    {
        return $this->belongsTo(DropdownOption::class, 'bank_name_id');
    }

    public function branch()
    {
        return $this->belongsTo(DropdownOption::class, 'branch_name_id');
    }

    // Scopes
    public function scopeMotor($query)
    {
        return $query->where('policy_type', 'MOTOR');
    }

    public function scopeNonmotor($query)
    {
        return $query->where('policy_type', 'NONMOTOR');
    }

    public function scopePending($query)
    {
        return $query->where('form_status', 'PENDING');
    }

    public function scopeComplete($query)
    {
        return $query->where('form_status', 'COMPLETE');
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

    public function scopeByRegNum($query, $regNum)
    {
        return $query->where('reg_num', $regNum);
    }

    public function scopeByPolicyNum($query, $policyNum)
    {
        return $query->where('policy_num', 'like', "%{$policyNum}%");
    }

    public function scopeWithTrashedClients($query)
    {
        return $query->with(['client' => function($query) {
            $query->withTrashed();
        }]);
    }

    // Accessors
    public function getTotalAmountAttribute()
    {
        return $this->premium_amt + $this->adv_amt;
    }

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

    // Mutators
    public function setPolicyNumAttribute($value)
    {
        $this->attributes['policy_num'] = strtoupper($value);
    }

    public function setMvNumAttribute($value)
    {
        if ($value) {
            $this->attributes['mv_num'] = strtoupper($value);
        }
    }
}
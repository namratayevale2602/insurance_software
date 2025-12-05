<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class LicEntry extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'lic_entries';

    protected $fillable = [
        'reg_num',
        'client_id',
        'date',
        'time',
        // Job details
        'job_type',
        'agency_id',
        'collection_job_type_id',
        'no_of_policy',
        'policy_num',
        'premium_amt',
        'pay_mode',
        'cheque_num',
        'bank_name_id',
        'branch_name_id',
        'cheque_dt',
        'servicing_type_job_id',
        'servicing_policy_no',
        'remark',
        'form_status'
    ];

    protected $casts = [
        'date' => 'date',
        'cheque_dt' => 'date',
        'premium_amt' => 'decimal:2',
        'policy_num' => 'array', // Cast JSON to array
        'deleted_at' => 'datetime',
    ];

    // Boot method for auto-generating reg_num
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($licEntry) {
            if (empty($licEntry->reg_num)) {
                $financialYear = self::getCurrentFinancialYear();
                $lastEntry = static::whereYear('date', $financialYear['year'])
                    ->whereMonth('date', '>=', 4)
                    ->orWhere(function($query) use ($financialYear) {
                        $query->whereYear('date', $financialYear['year'] + 1)
                            ->whereMonth('date', '<', 4);
                    })
                    ->orderBy('reg_num', 'desc')
                    ->first();

                $licEntry->reg_num = $lastEntry ? $lastEntry->reg_num + 1 : 1;
            }

            // Clean up fields before saving
            $licEntry->cleanupFieldsBasedOnJobType();
        });

        static::updating(function ($licEntry) {
            // Clean up fields before updating
            $licEntry->cleanupFieldsBasedOnJobType();
        });
    }

    // Clean up fields based on job type
    protected function cleanupFieldsBasedOnJobType()
    {
        if ($this->job_type === 'COLLECTION') {
            // Ensure SERVICING fields are null
            $this->servicing_type_job_id = null;
            $this->servicing_policy_no = null;
            
            // Ensure COLLECTION fields have proper defaults
            if (empty($this->no_of_policy)) {
                $this->no_of_policy = 1;
            }
        } else if ($this->job_type === 'SERVICING_TASK') {
            // Ensure COLLECTION fields are null
            $this->collection_job_type_id = null;
            $this->no_of_policy = null;
            $this->policy_num = null;
            $this->premium_amt = null;
            $this->pay_mode = null;
            $this->cheque_num = null;
            $this->bank_name_id = null;
            $this->branch_name_id = null;
            $this->cheque_dt = null;
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

    public function agency()
    {
        return $this->belongsTo(DropdownOption::class, 'agency_id');
    }

    public function collectionJobType()
    {
        return $this->belongsTo(DropdownOption::class, 'collection_job_type_id');
    }

    public function servicingJobType()
    {
        return $this->belongsTo(DropdownOption::class, 'servicing_type_job_id');
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
    public function scopeCollection($query)
    {
        return $query->where('job_type', 'COLLECTION');
    }

    public function scopeServicing($query)
    {
        return $query->where('job_type', 'SERVICING_TASK');
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

    public function getBirthDtAttribute()
    {
        return $this->client ? $this->client->birth_date : null;
    }

    public function getFormattedContactAttribute()
    {
        $contact = $this->contact;
        return $contact ? preg_replace('/(\d{3})(\d{3})(\d{4})/', '$1-$2-$3', $contact) : null;
    }

    // Mutators
    public function setPolicyNumAttribute($value)
    {
        if (is_array($value)) {
            $this->attributes['policy_num'] = json_encode($value);
        } else {
            $this->attributes['policy_num'] = $value;
        }
    }
}
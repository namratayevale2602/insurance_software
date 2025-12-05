<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Client extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'client';

    protected $fillable = [
        'sr_no',
        'date',
        'time',
        'contact',
        'alt_contact',
        'client_type',
        'client_name',
        'tag',
        'city_id',
        'inquery_for',
        'birth_date',
        'age',
        'anniversary_dt',
        'aadhar_no',
        'pan_no',
        'gst_no',
        'email',
        'reference'
    ];

    protected $casts = [
        'date' => 'date',
        'birth_date' => 'date',
        'anniversary_dt' => 'date',
        'deleted_at' => 'datetime',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($client) {
            if (empty($client->sr_no)) {
                $lastClient = static::withTrashed()->orderBy('sr_no', 'desc')->first();
                $client->sr_no = $lastClient ? $lastClient->sr_no + 1 : 1001;
            }
        });

        // Prevent duplicate SR numbers when restoring
        static::restoring(function ($client) {
            $existingClient = static::withTrashed()
                ->where('sr_no', $client->sr_no)
                ->where('id', '!=', $client->id)
                ->first();
            
            if ($existingClient) {
                $lastClient = static::withTrashed()->orderBy('sr_no', 'desc')->first();
                $client->sr_no = $lastClient ? $lastClient->sr_no + 1 : 1001;
            }
        });
    }

    // Relationships with constraints
    public function city()
    {
        return $this->belongsTo(DropdownOption::class, 'city_id')
            ->where('category', 'cities');
    }

    public function inqueryFor()
    {
        return $this->belongsTo(DropdownOption::class, 'inquery_for')
            ->where('category', 'inqueries');
    }

    // Scopes
    public function scopeIndividual($query)
    {
        return $query->where('client_type', 'INDIVIDUAL');
    }

    public function scopeCorporate($query)
    {
        return $query->where('client_type', 'CORPORATE');
    }

    public function scopeByTag($query, $tag)
    {
        return $query->where('tag', $tag);
    }

    public function scopeBySrNo($query, $srNo)
    {
        return $query->where('sr_no', $srNo);
    }

    public function scopeByCity($query, $cityId)
    {
        return $query->where('city_id', $cityId);
    }

    public function scopeByInqueryFor($query, $inqueryForId)
    {
        return $query->where('inquery_for', $inqueryForId);
    }

    public function scopeSearch($query, $searchTerm)
    {
        return $query->where(function($q) use ($searchTerm) {
            $q->where('client_name', 'like', "%{$searchTerm}%")
              ->orWhere('contact', 'like', "%{$searchTerm}%")
              ->orWhere('email', 'like', "%{$searchTerm}%")
              ->orWhere('sr_no', 'like', "%{$searchTerm}%")
              ->orWhere('aadhar_no', 'like', "%{$searchTerm}%")
              ->orWhere('pan_no', 'like', "%{$searchTerm}%")
              ->orWhere('gst_no', 'like', "%{$searchTerm}%");
        });
    }

    // Accessors
    public function getFormattedContactAttribute()
    {
        return preg_replace('/(\d{3})(\d{3})(\d{4})/', '$1-$2-$3', $this->contact);
    }

    public function getFormattedAltContactAttribute()
    {
        return $this->alt_contact ? preg_replace('/(\d{3})(\d{3})(\d{4})/', '$1-$2-$3', $this->alt_contact) : null;
    }

    public function getCityNameAttribute()
    {
        return $this->city ? $this->city->value : null;
    }

    public function getInqueryForValueAttribute()
    {
        return $this->inqueryFor ? $this->inqueryFor->value : null;
    }

    public function getAgeFromBirthDateAttribute()
    {
        if ($this->birth_date) {
            return $this->birth_date->age;
        }
        return null;
    }

    public function getIsDeletedAttribute()
    {
        return !is_null($this->deleted_at);
    }

    // Mutators
    public function setContactAttribute($value)
    {
        $this->attributes['contact'] = preg_replace('/[^0-9]/', '', $value);
    }

    public function setAltContactAttribute($value)
    {
        if ($value) {
            $this->attributes['alt_contact'] = preg_replace('/[^0-9]/', '', $value);
        }
    }

    public function setGstNoAttribute($value)
    {
        if ($value) {
            $this->attributes['gst_no'] = strtoupper($value);
        }
    }

    public function setPanNoAttribute($value)
    {
        if ($value) {
            $this->attributes['pan_no'] = strtoupper($value);
        }
    }

    public function setAadharNoAttribute($value)
    {
        if ($value) {
            $this->attributes['aadhar_no'] = preg_replace('/[^0-9]/', '', $value);
        }
    }

    public function setClientNameAttribute($value)
    {
        $this->attributes['client_name'] = ucwords(strtolower($value));
    }
}
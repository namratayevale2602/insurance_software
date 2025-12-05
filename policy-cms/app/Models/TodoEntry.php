<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class TodoEntry extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'todo_entries';

    protected $fillable = [
        'date',
        'time',
        'task_assign_to_id',
        'contact',
        'task_assign_by_id',
        'task_to_complete',
        'task_type',
        'contact_to',
        'mobile_no',
        'priority',
        'report_to',
        'reshedule_task'
    ];

    protected $casts = [
        'date' => 'date',
        'reshedule_task' => 'date',
        'deleted_at' => 'datetime',
    ];

    // Boot method for auto-formatting
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($todoEntry) {
            $todoEntry->formatFields();
        });

        static::updating(function ($todoEntry) {
            $todoEntry->formatFields();
        });
    }

    // Format fields before saving
    protected function formatFields()
    {
        if ($this->contact_to) {
            $this->contact_to = strtoupper($this->contact_to);
        }
        if ($this->report_to) {
            $this->report_to = strtoupper($this->report_to);
        }
        if ($this->task_to_complete) {
            $this->task_to_complete = ucfirst($this->task_to_complete);
        }
    }

    // Relationships
    public function taskAssignTo()
    {
        return $this->belongsTo(DropdownOption::class, 'task_assign_to_id');
    }

    public function taskAssignBy()
    {
        return $this->belongsTo(DropdownOption::class, 'task_assign_by_id');
    }

    // Scopes
    public function scopeByDate($query, $date)
    {
        return $query->where('date', $date);
    }

    public function scopeByTaskType($query, $taskType)
    {
        return $query->where('task_type', $taskType);
    }

    public function scopeByPriority($query, $priority)
    {
        return $query->where('priority', $priority);
    }

    public function scopeByAssignTo($query, $assignToId)
    {
        return $query->where('task_assign_to_id', $assignToId);
    }

    public function scopeByAssignBy($query, $assignById)
    {
        return $query->where('task_assign_by_id', $assignById);
    }

    public function scopePending($query)
    {
        return $query->whereNull('reshedule_task')
                    ->orWhere('reshedule_task', '>=', now()->toDateString());
    }

    public function scopeOverdue($query)
    {
        return $query->where('reshedule_task', '<', now()->toDateString());
    }

    public function scopeToday($query)
    {
        return $query->where('date', now()->toDateString());
    }

    public function scopeThisWeek($query)
    {
        return $query->whereBetween('date', [
            now()->startOfWeek()->toDateString(),
            now()->endOfWeek()->toDateString()
        ]);
    }

    public function scopeThisMonth($query)
    {
        return $query->whereBetween('date', [
            now()->startOfMonth()->toDateString(),
            now()->endOfMonth()->toDateString()
        ]);
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

    public function getIsOverdueAttribute()
    {
        return $this->reshedule_task && $this->reshedule_task < now()->toDateString();
    }

    public function getIsCompletedAttribute()
    {
        return !$this->reshedule_task || $this->reshedule_task <= now()->toDateString();
    }

    public function getFormattedDateAttribute()
    {
        return $this->date->format('d/m/Y');
    }

    public function getFormattedTimeAttribute()
    {
        return date('h:i A', strtotime($this->time));
    }

    public function getFormattedRescheduleDateAttribute()
    {
        return $this->reshedule_task ? $this->reshedule_task->format('d/m/Y') : 'Not Scheduled';
    }

    public function getPriorityBadgeAttribute()
    {
        $badges = [
            'HIGH' => 'danger',
            'MEDIUM' => 'warning',
            'LOW' => 'success'
        ];

        return $badges[$this->priority] ?? 'secondary';
    }

    public function getTaskTypeBadgeAttribute()
    {
        $badges = [
            'DAILY' => 'primary',
            'WEEKLY' => 'info',
            'MONTHLY' => 'success',
            'QUATERLY' => 'warning',
            'YEARLY' => 'dark'
        ];

        return $badges[$this->task_type] ?? 'secondary';
    }

    public function getFormattedContactAttribute()
    {
        $contact = preg_replace('/[^0-9]/', '', $this->contact);
        return preg_replace('/(\d{3})(\d{3})(\d{4})/', '$1-$2-$3', $contact);
    }

    public function getFormattedMobileNoAttribute()
    {
        if (!$this->mobile_no) return null;
        
        $mobile = preg_replace('/[^0-9]/', '', $this->mobile_no);
        return preg_replace('/(\d{3})(\d{3})(\d{4})/', '$1-$2-$3', $mobile);
    }

    // Mutators
    public function setContactAttribute($value)
    {
        $this->attributes['contact'] = preg_replace('/[^0-9]/', '', $value);
    }

    public function setMobileNoAttribute($value)
    {
        if ($value) {
            $this->attributes['mobile_no'] = preg_replace('/[^0-9]/', '', $value);
        } else {
            $this->attributes['mobile_no'] = null;
        }
    }

    public function setTaskToCompleteAttribute($value)
    {
        $this->attributes['task_to_complete'] = ucfirst($value);
    }

    public function setContactToAttribute($value)
    {
        $this->attributes['contact_to'] = strtoupper($value);
    }

    public function setReportToAttribute($value)
    {
        $this->attributes['report_to'] = strtoupper($value);
    }

    // Business logic methods
    public function markAsCompleted()
    {
        $this->reshedule_task = now()->toDateString();
        $this->save();
    }

    public function reschedule($newDate)
    {
        $this->reshedule_task = $newDate;
        $this->save();
    }

    public function isAssignedTo($userId)
    {
        return $this->task_assign_to_id == $userId;
    }

    public function isAssignedBy($userId)
    {
        return $this->task_assign_by_id == $userId;
    }
}
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Bill extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'bills';

    protected $fillable = [
        'client_id',
        'items',
        'subtotal',
        'tax',
        'tax_rate',
        'total',
        'bill_number',
        'bill_date',
        'due_date',
        'payment_status',
        'payment_method',
        'notes',
        'terms_conditions'
    ];

    protected $casts = [
        'items' => 'array',
        'bill_date' => 'date',
        'due_date' => 'date',
        'subtotal' => 'decimal:2',
        'tax' => 'decimal:2',
        'tax_rate' => 'decimal:2',
        'total' => 'decimal:2',
        'deleted_at' => 'datetime',
    ];

    // Boot method for auto-generating bill number
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($bill) {
            if (empty($bill->bill_number)) {
                $bill->bill_number = static::generateBillNumber();
            }

            // Calculate totals if not set
            if (empty($bill->subtotal) && !empty($bill->items)) {
                $bill->calculateTotals();
            }
        });

        static::updating(function ($bill) {
            // Recalculate totals if items are updated
            if ($bill->isDirty('items')) {
                $bill->calculateTotals();
            }

            // Update payment status based on due date
            if ($bill->isDirty('due_date') || $bill->isDirty('payment_status')) {
                $bill->updatePaymentStatus();
            }
        });
    }

    // Generate unique bill number
    public static function generateBillNumber()
    {
        $prefix = 'BILL-' . date('Y') . '-';
        $lastBill = static::where('bill_number', 'like', $prefix . '%')
            ->orderBy('bill_number', 'desc')
            ->first();

        if ($lastBill) {
            $lastNumber = intval(str_replace($prefix, '', $lastBill->bill_number));
            $newNumber = $lastNumber + 1;
        } else {
            $newNumber = 1;
        }

        return $prefix . str_pad($newNumber, 4, '0', STR_PAD_LEFT);
    }

    // Calculate bill totals from items
    public function calculateTotals()
    {
        $subtotal = 0;
        
        if (!empty($this->items) && is_array($this->items)) {
            foreach ($this->items as $item) {
                $quantity = floatval($item['quantity'] ?? 0);
                $rate = floatval($item['rate'] ?? 0);
                $subtotal += $quantity * $rate;
            }
        }

        $this->subtotal = $subtotal;
        $this->tax = $subtotal * ($this->tax_rate / 100);
        $this->total = $subtotal + $this->tax;
    }

    // Update payment status based on due date
    public function updatePaymentStatus()
    {
        if ($this->payment_status === 'PAID') {
            return; // No need to update if already paid
        }

        if ($this->due_date && $this->due_date < now()->toDateString()) {
            $this->payment_status = 'OVERDUE';
        }
    }

    // Check if bill is overdue
    public function getIsOverdueAttribute()
    {
        return $this->due_date && 
               $this->due_date < now()->toDateString() && 
               $this->payment_status !== 'PAID';
    }

    // Get days until due (negative if overdue)
    public function getDaysUntilDueAttribute()
    {
        if (!$this->due_date) {
            return null;
        }

        return now()->diffInDays($this->due_date, false);
    }

    // Relationships
    public function client()
    {
        return $this->belongsTo(Client::class);
    }

    // Scopes
    public function scopePending($query)
    {
        return $query->where('payment_status', 'PENDING');
    }

    public function scopePaid($query)
    {
        return $query->where('payment_status', 'PAID');
    }

    public function scopeOverdue($query)
    {
        return $query->where('payment_status', 'OVERDUE');
    }

    public function scopePartial($query)
    {
        return $query->where('payment_status', 'PARTIAL');
    }

    public function scopeByClient($query, $clientId)
    {
        return $query->where('client_id', $clientId);
    }

    public function scopeByDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('bill_date', [$startDate, $endDate]);
    }

    public function scopeByYear($query, $year)
    {
        return $query->whereYear('bill_date', $year);
    }

    public function scopeByMonth($query, $year, $month)
    {
        return $query->whereYear('bill_date', $year)
                    ->whereMonth('bill_date', $month);
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

    public function getFormattedSubtotalAttribute()
    {
        return '₹' . number_format($this->subtotal, 2);
    }

    public function getFormattedTaxAttribute()
    {
        return '₹' . number_format($this->tax, 2);
    }

    public function getFormattedTotalAttribute()
    {
        return '₹' . number_format($this->total, 2);
    }

    public function getFormattedBillDateAttribute()
    {
        return $this->bill_date->format('d/m/Y');
    }

    public function getFormattedDueDateAttribute()
    {
        return $this->due_date ? $this->due_date->format('d/m/Y') : 'N/A';
    }

    public function getStatusBadgeAttribute()
    {
        $badges = [
            'PENDING' => 'warning',
            'PAID' => 'success',
            'PARTIAL' => 'info',
            'OVERDUE' => 'danger'
        ];

        return $badges[$this->payment_status] ?? 'secondary';
    }

    // Mutators
    public function setItemsAttribute($value)
    {
        if (is_string($value)) {
            $this->attributes['items'] = $value;
        } else {
            $this->attributes['items'] = json_encode($value);
        }
    }

    public function setTaxRateAttribute($value)
    {
        $this->attributes['tax_rate'] = floatval($value);
        // Recalculate tax and total if subtotal exists
        if ($this->subtotal > 0) {
            $this->tax = $this->subtotal * ($this->tax_rate / 100);
            $this->total = $this->subtotal + $this->tax;
        }
    }

    // Business logic methods
    public function markAsPaid($paymentMethod = null)
    {
        $this->payment_status = 'PAID';
        if ($paymentMethod) {
            $this->payment_method = $paymentMethod;
        }
        $this->save();
    }

    public function markAsPartial($paymentMethod = null)
    {
        $this->payment_status = 'PARTIAL';
        if ($paymentMethod) {
            $this->payment_method = $paymentMethod;
        }
        $this->save();
    }

    public function addItem($description, $quantity, $rate, $unit = null)
    {
        $items = $this->items ?? [];
        $items[] = [
            'description' => $description,
            'quantity' => floatval($quantity),
            'rate' => floatval($rate),
            'unit' => $unit,
            'amount' => floatval($quantity) * floatval($rate)
        ];
        
        $this->items = $items;
        $this->calculateTotals();
        $this->save();
    }

    public function removeItem($index)
    {
        $items = $this->items ?? [];
        if (isset($items[$index])) {
            unset($items[$index]);
            $this->items = array_values($items); // Reindex array
            $this->calculateTotals();
            $this->save();
        }
    }
}
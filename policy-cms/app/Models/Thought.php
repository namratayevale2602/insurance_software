<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Thought extends Model
{
    use HasFactory;

    protected $table = 'thought';

    protected $fillable = [
        'goodthought'
    ];

    // Scopes
    public function scopeSearch($query, $search)
    {
        return $query->where('goodthought', 'like', "%{$search}%");
    }

    // Accessors
    public function getFormattedThoughtAttribute()
    {
        return ucfirst($this->goodthought);
    }

    public function getExcerptAttribute()
    {
        return strlen($this->goodthought) > 100 
            ? substr($this->goodthought, 0, 100) . '...' 
            : $this->goodthought;
    }

    // Mutators
    public function setGoodthoughtAttribute($value)
    {
        $this->attributes['goodthought'] = ucfirst($value);
    }
}
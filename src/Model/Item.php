<?php
namespace Sprintboard\Model;

use Illuminate\Database\Eloquent\Model;

class Item extends Model
{
    protected $casts = [
      'is_done' => 'boolean'
    ];
}
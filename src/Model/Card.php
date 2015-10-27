<?php
namespace Sprintboard\Model;

use Illuminate\Database\Eloquent\Model;

class Card extends Model
{
    public function items()
    {
        return $this->hasMany('Sprintboard\Model\Item');
    }
}